"""Fast/resumable downloader for Biomni data_lake files.

This script downloads the files listed in biomni.env_desc.data_lake_dict from
the public Biomni S3 bucket. It supports:

- HTTP Range segmented downloads
- resumable .part files with sidecar JSON state
- automatic use of a local Clash proxy on 127.0.0.1:7890 when available
- skipping files that are already complete
"""

from __future__ import annotations

import argparse
import concurrent.futures as futures
import json
import os
import socket
import sys
import threading
import time
from dataclasses import dataclass
from pathlib import Path
from typing import Any
from urllib.parse import quote

import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

from biomni.env_desc import data_lake_dict


BASE_URL = "https://biomni-release.s3.amazonaws.com/data_lake/"
DEFAULT_PROXY = "http://127.0.0.1:7890"
MB = 1024 * 1024
SESSION_LOCAL = threading.local()
PRINT_LOCK = threading.Lock()


@dataclass(frozen=True)
class RemoteFile:
    name: str
    url: str
    size: int
    etag: str | None
    accept_ranges: bool


def log(message: str) -> None:
    with PRINT_LOCK:
        print(message, flush=True)


def format_bytes(num: float) -> str:
    units = ["B", "KB", "MB", "GB", "TB"]
    value = float(num)
    for unit in units:
        if value < 1024 or unit == units[-1]:
            if unit == "B":
                return f"{int(value)} {unit}"
            return f"{value:.2f} {unit}"
        value /= 1024
    return f"{value:.2f} TB"


def format_eta(seconds: float | None) -> str:
    if seconds is None or seconds < 0 or seconds == float("inf"):
        return "--:--"
    seconds = int(seconds)
    hours, rem = divmod(seconds, 3600)
    minutes, secs = divmod(rem, 60)
    if hours:
        return f"{hours:d}:{minutes:02d}:{secs:02d}"
    return f"{minutes:02d}:{secs:02d}"


def is_port_open(host: str, port: int, timeout: float = 0.7) -> bool:
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    sock.settimeout(timeout)
    try:
        sock.connect((host, port))
        return True
    except OSError:
        return False
    finally:
        sock.close()


def resolve_proxies(args: argparse.Namespace) -> dict[str, str] | None:
    if args.no_proxy:
        return None
    if args.proxy:
        proxy = args.proxy
        return {"http": proxy, "https": proxy}
    if is_port_open("127.0.0.1", 7890):
        return {"http": DEFAULT_PROXY, "https": DEFAULT_PROXY}
    return None


def make_session(proxies: dict[str, str] | None, pool_size: int) -> requests.Session:
    retry = Retry(
        total=3,
        connect=3,
        read=3,
        status=3,
        backoff_factor=0.8,
        status_forcelist=(429, 500, 502, 503, 504),
        allowed_methods=None,
    )
    adapter = HTTPAdapter(
        pool_connections=pool_size,
        pool_maxsize=pool_size,
        max_retries=retry,
    )
    session = requests.Session()
    session.mount("http://", adapter)
    session.mount("https://", adapter)
    session.headers.update({"User-Agent": "biomni-fast-datalake-downloader/1.0"})
    if proxies:
        session.proxies.update(proxies)
    return session


def get_session(proxies: dict[str, str] | None, pool_size: int) -> requests.Session:
    key = f"session_{pool_size}_{json.dumps(proxies, sort_keys=True)}"
    session = getattr(SESSION_LOCAL, key, None)
    if session is None:
        session = make_session(proxies, pool_size)
        setattr(SESSION_LOCAL, key, session)
    return session


def file_url(filename: str) -> str:
    return BASE_URL + quote(filename, safe="._-()")


def head_one(
    filename: str,
    proxies: dict[str, str] | None,
    pool_size: int,
    timeout: tuple[float, float],
    attempts: int,
) -> RemoteFile:
    url = file_url(filename)
    last_error: Exception | None = None
    for attempt in range(1, attempts + 1):
        try:
            session = get_session(proxies, pool_size)
            response = session.head(url, timeout=timeout, allow_redirects=True)
            response.raise_for_status()
            size_text = response.headers.get("content-length")
            if not size_text:
                raise RuntimeError("missing content-length")
            return RemoteFile(
                name=filename,
                url=url,
                size=int(size_text),
                etag=response.headers.get("etag"),
                accept_ranges=response.headers.get("accept-ranges", "").lower() == "bytes",
            )
        except Exception as exc:  # noqa: BLE001
            last_error = exc
            time.sleep(min(8, 0.7 * attempt))
    raise RuntimeError(f"HEAD failed for {filename}: {last_error}")


def build_manifest(
    names: list[str],
    proxies: dict[str, str] | None,
    args: argparse.Namespace,
) -> list[RemoteFile]:
    timeout = (args.connect_timeout, args.read_timeout)
    results: list[RemoteFile] = []
    errors: list[str] = []
    log(f"Fetching remote sizes for {len(names)} files...")
    started = time.time()
    with futures.ThreadPoolExecutor(max_workers=args.head_workers) as executor:
        future_map = {
            executor.submit(head_one, name, proxies, args.head_workers + 4, timeout, args.retries): name
            for name in names
        }
        completed = 0
        for future in futures.as_completed(future_map):
            name = future_map[future]
            completed += 1
            try:
                remote = future.result()
                results.append(remote)
                log(f"  [{completed:02d}/{len(names):02d}] {name}: {format_bytes(remote.size)}")
            except Exception as exc:  # noqa: BLE001
                errors.append(f"{name}: {exc}")
                log(f"  [{completed:02d}/{len(names):02d}] {name}: HEAD FAILED")
    if errors:
        raise RuntimeError("Could not fetch sizes:\n" + "\n".join(errors))
    ordered = {remote.name: remote for remote in results}
    log(f"Remote size check finished in {time.time() - started:.1f}s.")
    return [ordered[name] for name in names]


def chunk_ranges(size: int, segment_size: int) -> list[tuple[int, int, int]]:
    ranges: list[tuple[int, int, int]] = []
    index = 0
    start = 0
    while start < size:
        end = min(size - 1, start + segment_size - 1)
        ranges.append((index, start, end))
        index += 1
        start = end + 1
    return ranges


def state_paths(target: Path) -> tuple[Path, Path]:
    part_path = target.with_name(target.name + ".part")
    state_path = target.with_name(target.name + ".part.json")
    return part_path, state_path


def load_json(path: Path) -> dict[str, Any] | None:
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except FileNotFoundError:
        return None
    except Exception:
        return None


def save_json_atomic(path: Path, data: dict[str, Any]) -> None:
    tmp_path = path.with_name(path.name + ".tmp")
    tmp_path.write_text(json.dumps(data, indent=2, sort_keys=True), encoding="utf-8")
    os.replace(tmp_path, path)


def prepare_partial(
    remote: RemoteFile,
    target: Path,
    ranges: list[tuple[int, int, int]],
    segment_size: int,
) -> tuple[Path, Path, set[int]]:
    part_path, state_path = state_paths(target)
    target.parent.mkdir(parents=True, exist_ok=True)

    if target.exists():
        local_size = target.stat().st_size
        if local_size == remote.size:
            return part_path, state_path, set(range(len(ranges)))
        if local_size < remote.size and not part_path.exists():
            log(f"  Resuming from incomplete final file: {target.name} ({format_bytes(local_size)})")
            os.replace(target, part_path)
        else:
            backup = target.with_name(f"{target.name}.wrong-size.{int(time.time())}")
            log(f"  Moving wrong-size file aside: {backup.name}")
            os.replace(target, backup)

    state = load_json(state_path)
    completed: set[int] = set()
    if (
        state
        and state.get("name") == remote.name
        and state.get("size") == remote.size
        and state.get("segment_size") == segment_size
    ):
        completed = {int(item) for item in state.get("completed", [])}
    elif part_path.exists():
        part_size = part_path.stat().st_size
        completed = {idx for idx, _start, end in ranges if end < part_size}
        if completed:
            log(f"  Reusing prefix from old partial file: {len(completed)} chunks")
    else:
        completed = set()

    with part_path.open("a+b") as handle:
        handle.truncate(remote.size)

    save_json_atomic(
        state_path,
        {
            "name": remote.name,
            "url": remote.url,
            "size": remote.size,
            "etag": remote.etag,
            "segment_size": segment_size,
            "completed": sorted(completed),
            "updated_at": time.strftime("%Y-%m-%d %H:%M:%S"),
        },
    )
    return part_path, state_path, completed


def download_range(
    remote: RemoteFile,
    part_path: Path,
    range_item: tuple[int, int, int],
    proxies: dict[str, str] | None,
    pool_size: int,
    timeout: tuple[float, float],
    attempts: int,
    io_chunk_size: int,
) -> int:
    index, start, end = range_item
    expected = end - start + 1
    headers = {"Range": f"bytes={start}-{end}"}
    last_error: Exception | None = None

    for attempt in range(1, attempts + 1):
        received = 0
        try:
            session = get_session(proxies, pool_size)
            with session.get(remote.url, headers=headers, stream=True, timeout=timeout) as response:
                if response.status_code != 206:
                    raise RuntimeError(f"expected 206, got HTTP {response.status_code}")
                with part_path.open("r+b") as handle:
                    handle.seek(start)
                    for chunk in response.iter_content(chunk_size=io_chunk_size):
                        if not chunk:
                            continue
                        handle.write(chunk)
                        received += len(chunk)
            if received != expected:
                raise RuntimeError(f"range {start}-{end} got {received}, expected {expected}")
            return index
        except Exception as exc:  # noqa: BLE001
            last_error = exc
            time.sleep(min(12, 0.8 * attempt))

    raise RuntimeError(f"chunk {index} failed for {remote.name}: {last_error}")


def download_file(remote: RemoteFile, data_dir: Path, proxies: dict[str, str] | None, args: argparse.Namespace) -> bool:
    target = data_dir / remote.name
    if target.exists() and target.stat().st_size == remote.size:
        log(f"SKIP {remote.name} ({format_bytes(remote.size)})")
        return True

    if not remote.accept_ranges:
        raise RuntimeError(f"{remote.name} does not advertise range support")

    segment_size = args.segment_mb * MB
    ranges = chunk_ranges(remote.size, segment_size)
    part_path, state_path, completed = prepare_partial(remote, target, ranges, segment_size)
    if len(completed) == len(ranges):
        os.replace(part_path, target)
        if state_path.exists():
            state_path.unlink()
        log(f"DONE {remote.name} ({format_bytes(remote.size)})")
        return True

    pending = [item for item in ranges if item[0] not in completed]
    done_bytes = sum(end - start + 1 for idx, start, end in ranges if idx in completed)
    log(
        f"GET  {remote.name}: {format_bytes(done_bytes)} / {format_bytes(remote.size)} "
        f"({len(completed)}/{len(ranges)} chunks complete)"
    )

    started = time.time()
    timeout = (args.connect_timeout, args.read_timeout)
    failed = False
    pool_size = max(args.segments + 4, 16)

    with futures.ThreadPoolExecutor(max_workers=args.segments) as executor:
        future_map = {
            executor.submit(
                download_range,
                remote,
                part_path,
                range_item,
                proxies,
                pool_size,
                timeout,
                args.retries,
                args.io_chunk_mb * MB,
            ): range_item
            for range_item in pending
        }

        for future in futures.as_completed(future_map):
            try:
                chunk_index = future.result()
                completed.add(chunk_index)
                done_bytes = sum(end - start + 1 for idx, start, end in ranges if idx in completed)
                elapsed = max(time.time() - started, 0.001)
                rate = max((done_bytes - (remote.size - sum(end - start + 1 for idx, start, end in pending))) / elapsed, 0)
                remaining = remote.size - done_bytes
                eta = remaining / rate if rate > 0 else None
                save_json_atomic(
                    state_path,
                    {
                        "name": remote.name,
                        "url": remote.url,
                        "size": remote.size,
                        "etag": remote.etag,
                        "segment_size": segment_size,
                        "completed": sorted(completed),
                        "updated_at": time.strftime("%Y-%m-%d %H:%M:%S"),
                    },
                )
                log(
                    f"  {remote.name}: {format_bytes(done_bytes)} / {format_bytes(remote.size)} "
                    f"({len(completed)}/{len(ranges)}) "
                    f"rate {format_bytes(rate)}/s eta {format_eta(eta)}"
                )
            except Exception as exc:  # noqa: BLE001
                failed = True
                log(f"  ERROR {remote.name}: {exc}")

    if failed or len(completed) != len(ranges):
        log(f"PARTIAL {remote.name}; rerun this script to resume.")
        return False

    os.replace(part_path, target)
    if state_path.exists():
        state_path.unlink()
    elapsed = max(time.time() - started, 0.001)
    log(f"DONE {remote.name} in {format_eta(elapsed)} at {format_bytes(remote.size / elapsed)}/s")
    return True


def local_complete_bytes(manifest: list[RemoteFile], data_dir: Path) -> tuple[int, int, list[RemoteFile]]:
    complete = 0
    remaining = 0
    todo: list[RemoteFile] = []
    for remote in manifest:
        target = data_dir / remote.name
        if target.exists() and target.stat().st_size == remote.size:
            complete += remote.size
        else:
            part_path, _state_path = state_paths(target)
            if part_path.exists():
                remaining += max(remote.size - min(part_path.stat().st_size, remote.size), 0)
            else:
                remaining += remote.size
            todo.append(remote)
    return complete, remaining, todo


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Fast downloader for Biomni data_lake")
    parser.add_argument("--data-dir", default="./data/biomni_data/data_lake", help="local data_lake directory")
    parser.add_argument("--proxy", default=None, help="proxy URL, for example http://127.0.0.1:7890")
    parser.add_argument("--no-proxy", action="store_true", help="disable proxy auto-detection")
    parser.add_argument("--head-workers", type=int, default=12, help="parallel HEAD requests")
    parser.add_argument("--segments", type=int, default=12, help="parallel range requests per file")
    parser.add_argument("--segment-mb", type=int, default=16, help="range chunk size in MB")
    parser.add_argument("--io-chunk-mb", type=int, default=1, help="stream write chunk size in MB")
    parser.add_argument("--retries", type=int, default=5, help="retries per request")
    parser.add_argument("--connect-timeout", type=float, default=20.0)
    parser.add_argument("--read-timeout", type=float, default=180.0)
    parser.add_argument("--limit", type=int, default=0, help="download only the first N files, for testing")
    parser.add_argument("--dry-run", action="store_true", help="only check sizes and local completeness")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    data_dir = Path(args.data_dir).resolve()
    names = list(data_lake_dict.keys())
    if args.limit:
        names = names[: args.limit]

    proxies = resolve_proxies(args)
    if proxies:
        log(f"Proxy: {proxies['https']}")
    else:
        log("Proxy: disabled/not detected")
    log(f"Data dir: {data_dir}")
    log(f"Range workers per file: {args.segments}; segment size: {args.segment_mb} MB")

    try:
        manifest = build_manifest(names, proxies, args)
    except KeyboardInterrupt:
        log("Interrupted during remote size check.")
        return 130
    except Exception as exc:  # noqa: BLE001
        log(str(exc))
        return 1

    total_size = sum(item.size for item in manifest)
    complete, remaining, todo = local_complete_bytes(manifest, data_dir)
    log("=" * 72)
    log(f"Total remote data_lake size: {format_bytes(total_size)}")
    log(f"Already complete locally:   {format_bytes(complete)}")
    log(f"Remaining files:            {len(todo)}")
    log(f"Remaining bytes approx:     {format_bytes(total_size - complete)}")
    log("=" * 72)

    if args.dry_run:
        return 0

    ok = True
    started = time.time()
    for index, remote in enumerate(manifest, start=1):
        log(f"[{index:02d}/{len(manifest):02d}]")
        try:
            ok = download_file(remote, data_dir, proxies, args) and ok
        except KeyboardInterrupt:
            log("Interrupted. Rerun this script to resume.")
            return 130
        except Exception as exc:  # noqa: BLE001
            ok = False
            log(f"FAILED {remote.name}: {exc}")

    elapsed = max(time.time() - started, 0.001)
    complete_after, _remaining_after, todo_after = local_complete_bytes(manifest, data_dir)
    log("=" * 72)
    log(f"Finished pass in {format_eta(elapsed)}")
    log(f"Complete locally: {format_bytes(complete_after)} / {format_bytes(total_size)}")
    if todo_after:
        log(f"Still missing/incomplete: {len(todo_after)} files. Rerun to resume.")
        return 2
    log("All data_lake files are complete.")
    return 0 if ok else 2


if __name__ == "__main__":
    raise SystemExit(main())
