# -*- coding: utf-8 -*-
"""Biomni local web workbench."""

from __future__ import annotations

import contextlib
import io
import os
import re
import sys
import threading
import time
import traceback
from pathlib import Path

from dotenv import load_dotenv
from flask import Flask, jsonify, render_template_string, request
from werkzeug.serving import WSGIRequestHandler


APP_DIR = Path(__file__).resolve().parent


def configure_stdio() -> None:
    os.environ.setdefault("PYTHONUTF8", "1")
    os.environ.setdefault("PYTHONIOENCODING", "utf-8")
    if sys.platform == "win32":
        try:
            import ctypes

            kernel32 = ctypes.windll.kernel32
            kernel32.SetConsoleOutputCP(65001)
            kernel32.SetConsoleCP(65001)
        except Exception:
            pass
    for name in ("stdin", "stdout", "stderr"):
        stream = getattr(sys, name, None)
        if hasattr(stream, "reconfigure"):
            with contextlib.suppress(Exception):
                stream.reconfigure(encoding="utf-8", errors="replace")


configure_stdio()
os.chdir(APP_DIR)
load_dotenv(APP_DIR / ".env")

app = Flask(__name__)
app.config["SEND_FILE_MAX_AGE_DEFAULT"] = 0
WSGIRequestHandler.wsgi_version = (1, 0)

biomni_agent = None
agent_lock = threading.Lock()
run_lock = threading.Lock()


HTML_TEMPLATE = r"""
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Biomni Prompt</title>
  <style>
    :root {
      --page: #f4f5f1;
      --surface: #fffefa;
      --ink: #191a16;
      --muted: #6b6d63;
      --line: #d8dacd;
      --strong-line: #24251f;
      --accent: #e5ef45;
      --accent-dark: #c8d629;
      --danger: #9f3d3d;
      --radius: 8px;
      --sans: "Microsoft YaHei", "Segoe UI", sans-serif;
      color-scheme: light;
    }

    * { box-sizing: border-box; }
    html, body { height: 100%; }
    body {
      margin: 0;
      background: var(--page);
      color: var(--ink);
      font-family: var(--sans);
      letter-spacing: 0;
    }

    button, textarea { font: inherit; }

    .app {
      height: 100vh;
      min-height: 0;
      display: grid;
      grid-template-rows: 64px minmax(0, 1fr) auto;
    }

    .topbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      padding: 0 28px;
      border-bottom: 1px solid var(--strong-line);
      background: var(--surface);
    }

    .brand {
      display: flex;
      align-items: baseline;
      gap: 12px;
      min-width: 0;
    }

    .brand strong {
      font-size: 18px;
      line-height: 1;
    }

    .brand span {
      color: var(--muted);
      font-size: 14px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .state {
      color: var(--muted);
      font-size: 14px;
      white-space: nowrap;
    }

    .feed {
      min-height: 0;
      overflow: auto;
      padding: 28px;
      display: flex;
      flex-direction: column;
      gap: 16px;
      scroll-behavior: smooth;
    }

    .feed-inner {
      width: min(920px, 100%);
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .message {
      max-width: min(760px, 100%);
      border: 1px solid var(--line);
      border-radius: var(--radius);
      padding: 16px 18px;
      background: var(--surface);
      line-height: 1.72;
      white-space: pre-wrap;
      overflow-wrap: anywhere;
    }

    .message.user {
      align-self: flex-end;
      background: #f0f1e9;
      border-color: transparent;
    }

    .message.answer {
      align-self: flex-start;
    }

    .message.error {
      align-self: flex-start;
      border-color: color-mix(in srgb, var(--danger), transparent 35%);
      color: var(--danger);
    }

    .empty {
      color: var(--muted);
    }

    .composer {
      border-top: 1px solid var(--strong-line);
      background: var(--surface);
      padding: 16px 28px 20px;
    }

    .composer form {
      width: min(920px, 100%);
      margin: 0 auto;
      display: grid;
      grid-template-columns: minmax(0, 1fr) 96px;
      gap: 12px;
      align-items: end;
    }

    textarea {
      width: 100%;
      min-height: 78px;
      max-height: 220px;
      resize: vertical;
      border: 1px solid var(--strong-line);
      border-radius: var(--radius);
      background: #fffdf4;
      color: var(--ink);
      padding: 14px 16px;
      line-height: 1.6;
      outline: none;
    }

    textarea:focus {
      border-color: var(--accent-dark);
      box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent), transparent 55%);
    }

    textarea::placeholder { color: #8a8c80; }

    .send {
      height: 52px;
      border: 1px solid var(--strong-line);
      border-radius: var(--radius);
      background: var(--accent);
      color: var(--ink);
      font-weight: 700;
      cursor: pointer;
    }

    .send:hover { background: var(--accent-dark); }
    .send:disabled {
      opacity: 0.65;
      cursor: wait;
    }

    @media (max-width: 720px) {
      .topbar { padding: 0 16px; }
      .brand span { display: none; }
      .feed { padding: 18px 14px; }
      .composer { padding: 12px 14px 14px; }
      .composer form { grid-template-columns: 1fr; }
      .send { width: 100%; }
    }
  </style>
</head>
<body>
  <div class="app">
    <header class="topbar">
      <div class="brand">
        <strong>Biomni</strong>
        <span>本地提示词工作台</span>
      </div>
      <div class="state" id="runState">Ready</div>
    </header>

    <main class="feed" id="feed">
      <div class="feed-inner" id="feedInner">
        <div class="message answer empty">等待你的提示词。</div>
      </div>
    </main>

    <section class="composer">
      <form id="queryForm">
        <textarea id="promptInput" name="question" placeholder="输入提示词..." required></textarea>
        <button class="send" id="runBtn" type="submit">发送</button>
      </form>
    </section>
  </div>

  <script>
    const form = document.getElementById('queryForm');
    const promptInput = document.getElementById('promptInput');
    const runBtn = document.getElementById('runBtn');
    const runState = document.getElementById('runState');
    const feed = document.getElementById('feed');
    const feedInner = document.getElementById('feedInner');

    function escapeHtml(value) {
      return String(value || '')
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
    }

    function addMessage(content, type = 'answer') {
      const empty = feedInner.querySelector('.empty');
      if (empty) empty.remove();
      const node = document.createElement('div');
      node.className = `message ${type}`;
      node.innerHTML = escapeHtml(content);
      feedInner.appendChild(node);
      feed.scrollTop = feed.scrollHeight;
      return node;
    }

    function setBusy(isBusy) {
      runBtn.disabled = isBusy;
      runBtn.textContent = isBusy ? '运行中' : '发送';
      promptInput.disabled = isBusy;
    }

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      const question = promptInput.value.trim();
      if (!question || runBtn.disabled) return;

      addMessage(question, 'user');
      setBusy(true);
      runState.textContent = 'Executing 0s';

      const startedAt = Date.now();
      const timer = window.setInterval(() => {
        const seconds = Math.max(1, Math.round((Date.now() - startedAt) / 1000));
        runState.textContent = seconds >= 30 ? `Executing ${seconds}s, still running` : `Executing ${seconds}s`;
      }, 1000);

      const body = new FormData();
      body.append('question', question);

      try {
        const response = await fetch('/query', { method: 'POST', body });
        const data = await response.json();
        if (!response.ok || !data.success) {
          throw new Error(data.error || `HTTP ${response.status}`);
        }
        addMessage(data.answer || 'Task completed.', 'answer');
        runState.textContent = data.duration ? `Completed in ${data.duration}s` : 'Completed';
        promptInput.value = '';
      } catch (error) {
        addMessage(error.message, 'error');
        runState.textContent = 'Failed';
      } finally {
        window.clearInterval(timer);
        setBusy(false);
        promptInput.focus();
      }
    });
  </script>
</body>
</html>
"""


def get_agent():
    global biomni_agent
    with agent_lock:
        if biomni_agent is None:
            if os.getenv("BIOMNI_WEB_MOCK") == "1":
                biomni_agent = MockAgent()
                return biomni_agent

            from biomni.agent import A1

            api_key = os.getenv("ZHIPUAI_API_KEY")
            if not api_key:
                raise RuntimeError("ZHIPUAI_API_KEY is not configured in .env")

            if "BIOMNI_RECURSION_LIMIT" not in os.environ:
                os.environ["BIOMNI_RECURSION_LIMIT"] = os.getenv("BIOMNI_WEB_RECURSION_LIMIT", "18")

            print("Creating Biomni Agent...")
            biomni_agent = A1(
                path=str(APP_DIR / "data"),
                llm=os.getenv("BIOMNI_WEB_LLM", "glm-4-flash"),
                source="Custom",
                base_url=os.getenv("BIOMNI_WEB_BASE_URL", "https://open.bigmodel.cn/api/paas/v4"),
                api_key=api_key,
                use_tool_retriever=os.getenv("BIOMNI_USE_TOOL_RETRIEVER", "false").lower() in {"1", "true", "yes"},
            )
            print("Agent created.")
    return biomni_agent


class MockAgent:
    def go(self, prompt: str):
        logs = [
            "================================ Human Message =================================\n\n" + prompt[:500],
            "================================== Ai Message ==================================\n\n<solution>Mock analysis complete.</solution>",
        ]
        return logs, "<solution>Mock analysis complete.</solution>"


def strip_solution_tags(text: str) -> str:
    if not text:
        return ""
    match = re.search(r"<solution>(.*?)</solution>", text, re.DOTALL | re.IGNORECASE)
    if match:
        return match.group(1).strip()
    text = re.sub(r"</?(execute|solution|observation|think)>", "", text, flags=re.IGNORECASE)
    return text.strip()


def should_use_direct_answer(question: str) -> bool:
    if os.getenv("BIOMNI_WEB_DIRECT_MODE", "1").lower() not in {"1", "true", "yes"}:
        return False
    normalized = re.sub(r"\s+", " ", question).strip()
    if len(normalized) > 300:
        return False
    direct_patterns = [
        r"^只回答\b",
        r"^直接回答\b",
        r"^输出\s*\d+\s*行",
        r"^请输出\s*\d+\s*行",
        r"^(复述|翻译|改写|润色)\b",
        r"^(hello|hi|test|测试|你好)\b",
    ]
    return any(re.search(pattern, normalized, flags=re.IGNORECASE) for pattern in direct_patterns)


def run_direct_answer(question: str) -> str:
    from openai import OpenAI

    api_key = os.getenv("ZHIPUAI_API_KEY")
    if not api_key:
        raise RuntimeError("ZHIPUAI_API_KEY is not configured in .env")

    client = OpenAI(
        api_key=api_key,
        base_url=os.getenv("BIOMNI_WEB_BASE_URL", "https://open.bigmodel.cn/api/paas/v4"),
        timeout=float(os.getenv("BIOMNI_WEB_DIRECT_TIMEOUT", "45")),
        max_retries=0,
    )
    response = client.chat.completions.create(
        model=os.getenv("BIOMNI_WEB_LLM", "glm-4-flash"),
        temperature=0.1,
        max_tokens=int(os.getenv("BIOMNI_WEB_DIRECT_MAX_TOKENS", "2048")),
        messages=[
            {
                "role": "system",
                "content": "你是 Biomni 本地网页的快速直答通道。严格遵循用户格式要求，直接给出答案，不要规划步骤，不要调用工具。",
            },
            {"role": "user", "content": question},
        ],
    )
    content = response.choices[0].message.content if response.choices else ""
    return str(content or "").strip()


def make_trace(output_text: str, logs) -> tuple[str, int]:
    parts = []
    if logs:
        parts.extend(str(item) for item in logs)
    if output_text.strip():
        parts.append(output_text)
    raw = "\n\n".join(parts)
    raw = raw[-20000:] if len(raw) > 20000 else raw
    count = raw.count("Message") + raw.count("<execute>") + raw.count("<observation>")
    return raw, max(count, 1 if raw else 0)


def needs_completion_contract(question: str) -> bool:
    markers = [
        "go/no-go",
        "conditional go",
        "conditional-go",
        "立项",
        "尽调",
        "商业判断",
        "分析框架",
        "竞争格局",
        "研发可行性",
        "最终判断",
    ]
    lower = question.lower()
    return any(marker in lower for marker in markers)


def build_web_agent_prompt(question: str) -> str:
    question = question.strip()
    if not needs_completion_contract(question):
        return question

    return f"""{question}

【Web工作台最终交付要求】
- 不要只输出分析框架、待办清单、检索关键词或计划。
- 必须走到可交付结论；如果证据不足，也要给出明确的 provisional 判断并标注证据限制。
- 若任务涉及立项/尽调/商业判断，最终答案必须包含：
  1. 最终判断：Go / No-Go / Conditional Go（三选一）
  2. 关键科学依据
  3. 关键临床与安全风险
  4. 竞争格局判断
  5. 50万-100万元人民币预算下必须做/不值得做的实验
  6. 下一步建议
- 最终答案必须能直接给决策人阅读。"""


@app.route("/")
def home():
    return render_template_string(HTML_TEMPLATE)


@app.route("/health")
def health():
    return jsonify({"ok": True, "mock": os.getenv("BIOMNI_WEB_MOCK") == "1"})


@app.route("/query", methods=["POST"])
def query():
    start = time.time()
    try:
        if request.content_type and request.content_type.startswith("application/json"):
            payload = request.get_json(silent=True) or {}
            question = str(payload.get("question", "")).strip().lstrip("\ufeff")
        else:
            question = request.form.get("question", "").strip().lstrip("\ufeff")

        if not question:
            return jsonify({"success": False, "error": "请输入提示词。"}), 400

        if should_use_direct_answer(question):
            answer = run_direct_answer(question)
            duration = time.time() - start
            raw_trace = "\n\n".join(
                [
                    "Direct single-pass model call",
                    "================================ Human Message =================================",
                    question,
                    "================================== Ai Message ==================================",
                    answer,
                ]
            )
            return jsonify(
                {
                    "success": True,
                    "answer": answer,
                    "raw_trace": raw_trace,
                    "duration": f"{duration:.1f}",
                    "trace_count": 1,
                    "mode": "direct",
                }
            )

        prompt = build_web_agent_prompt(question)
        agent = get_agent()

        captured = io.StringIO()
        with run_lock:
            with contextlib.redirect_stdout(captured), contextlib.redirect_stderr(captured):
                logs, final_message = agent.go(prompt)

        output_text = captured.getvalue()
        answer = strip_solution_tags(str(final_message))
        if not answer:
            answer = "分析已完成，但未捕获到最终答案。请查看 execution_trace。"
        raw_trace, trace_count = make_trace(output_text, logs)

        return jsonify(
            {
                "success": True,
                "answer": answer,
                "duration": f"{time.time() - start:.1f}",
                "raw_trace": raw_trace,
                "trace_count": trace_count,
            }
        )
    except Exception as exc:
        return (
            jsonify(
                {
                    "success": False,
                    "error": f"{exc}\n\n{traceback.format_exc()}",
                    "duration": f"{time.time() - start:.1f}",
                    "raw_trace": "",
                    "trace_count": 0,
                }
            ),
            500,
        )


def main():
    print("Starting Biomni local workbench")
    api_key = os.getenv("ZHIPUAI_API_KEY")
    if not api_key and os.getenv("BIOMNI_WEB_MOCK") != "1":
        print("ZHIPUAI_API_KEY is not configured in .env")
        return
    print("Open http://localhost:5000")
    app.run(host="127.0.0.1", port=5000, debug=False)


if __name__ == "__main__":
    main()
