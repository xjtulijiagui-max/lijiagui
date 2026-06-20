# -*- coding: utf-8 -*-
"""Portable Biomni command-line starter for students.

Put this file in the Biomni project folder, next to `.env`.
It does not depend on any custom web UI.
"""

from __future__ import annotations

import argparse
import codecs
import os
import sys
from pathlib import Path


if sys.platform == "win32":
    sys.stdout = codecs.getwriter("utf-8")(sys.stdout.buffer, "strict")
    sys.stderr = codecs.getwriter("utf-8")(sys.stderr.buffer, "strict")


SCRIPT_DIR = Path(__file__).resolve().parent


def load_env_files() -> None:
    from dotenv import load_dotenv

    # Prefer the .env next to this script, then allow the current terminal
    # directory to provide overrides if the teacher intentionally uses one.
    load_dotenv(SCRIPT_DIR / ".env", override=False)
    load_dotenv(override=False)


def get_api_key() -> str | None:
    return os.getenv("ZHIPUAI_API_KEY") or os.getenv("BIOMNI_CUSTOM_API_KEY")


PASTE_COMMANDS = {"multi", "paste", ":paste"}
PASTE_END_MARKER = "END"


def read_multiline_prompt(end_marker: str = PASTE_END_MARKER) -> str:
    """Read a pasted multi-line prompt until a line equals END."""
    print(f"Paste your full prompt below. Type {end_marker} on its own line to run it.")
    lines: list[str] = []
    while True:
        try:
            line = input()
        except KeyboardInterrupt:
            print("\nMulti-line input cancelled.")
            return ""

        if line.strip() == end_marker:
            break

        lines.append(line)

    return "\n".join(lines).strip()


def read_question_file(file_path: str) -> str:
    """Read a prompt from a UTF-8 text or markdown file."""
    path = Path(file_path).expanduser()
    if not path.is_absolute():
        path = Path.cwd() / path

    return path.read_text(encoding="utf-8-sig").strip()


def print_check() -> int:
    print("Biomni 学员环境检查")
    print("=" * 60)
    print(f"Python: {sys.executable}")
    print(f"脚本目录: {SCRIPT_DIR}")
    print(f"当前目录: {Path.cwd()}")

    try:
        load_env_files()
        print(".env: 已尝试加载")
    except Exception as exc:
        print(f".env: 加载失败 - {exc}")
        return 1

    api_key = get_api_key()
    if api_key:
        print(f"API Key: 已配置，长度 {len(api_key)}，开头 {api_key[:6]}***")
    else:
        print("API Key: 未配置，请在 .env 中设置 ZHIPUAI_API_KEY")
        return 1

    checks = [
        ("biomni", "Biomni 主程序"),
        ("dotenv", "python-dotenv"),
        ("zhipuai", "智谱 SDK"),
    ]

    ok = True
    for module_name, label in checks:
        try:
            __import__(module_name)
            print(f"{label}: OK")
        except Exception as exc:
            ok = False
            print(f"{label}: 缺失或不可导入 - {exc}")

    print("=" * 60)
    if ok:
        print("检查通过。可以运行：python student_cli.py")
        return 0

    print("检查未通过。请先安装缺失依赖或确认 Python 环境。")
    return 1


def build_agent():
    from biomni.agent import A1

    load_env_files()
    api_key = get_api_key()
    if not api_key:
        raise RuntimeError("没有找到 API Key。请在 .env 中设置 ZHIPUAI_API_KEY=你的key")

    llm = os.getenv("BIOMNI_LLM", "glm-4-flash")
    source = os.getenv("BIOMNI_SOURCE", "Custom")
    base_url = os.getenv("BIOMNI_CUSTOM_BASE_URL", "https://open.bigmodel.cn/api/paas/v4")
    data_path = os.getenv("BIOMNI_DATA_PATH", str(SCRIPT_DIR / "data"))

    return A1(
        path=data_path,
        llm=llm,
        source=source,
        base_url=base_url,
        api_key=api_key,
        expected_data_lake_files=[],
    )


def run_one_question(question: str) -> int:
    print("正在启动 Biomni Agent...")
    agent = build_agent()
    print("\n问题：")
    print(question)
    print("-" * 60)
    agent.go(question)
    print("-" * 60)
    print("完成")
    return 0


def run_interactive() -> int:
    print("正在启动 Biomni Agent...")
    agent = build_agent()

    print("\nBiomni 交互模式已启动")
    print("输入问题开始分析；输入 quit 或 exit 退出。")
    print("For multi-line prompts, type multi, paste, or :paste. End with a line containing END.")
    print("示例：对比 EGFR 19 外显子缺失与 T790M 突变靶向药用药差异")
    print("=" * 60)

    while True:
        try:
            question = input("\n你的问题: ").strip()
        except KeyboardInterrupt:
            print("\n已退出")
            return 0

        if question.lower() in {"quit", "exit", "q", "退出"}:
            print("已退出")
            return 0

        if question.lower() in PASTE_COMMANDS:
            question = read_multiline_prompt()
            if not question:
                continue

        if not question:
            continue

        try:
            print("-" * 60)
            agent.go(question)
            print("-" * 60)
            print("完成")
        except Exception as exc:
            print(f"运行出错：{exc}")
            print("建议先运行：python student_cli.py --check")


def main() -> int:
    parser = argparse.ArgumentParser(description="Portable Biomni CLI for students")
    parser.add_argument("--check", action="store_true", help="check local environment only")
    parser.add_argument("-q", "--question", help="run one question and exit")
    parser.add_argument("--question-file", help="read a multi-line question from a UTF-8 txt/md file and exit")
    args = parser.parse_args()

    if args.check:
        return print_check()

    if args.question and args.question_file:
        parser.error("Use either --question or --question-file, not both")

    if args.question:
        return run_one_question(args.question)

    if args.question_file:
        question = read_question_file(args.question_file)
        if not question:
            parser.error(f"Question file is empty: {args.question_file}")
        return run_one_question(question)

    return run_interactive()


if __name__ == "__main__":
    raise SystemExit(main())
