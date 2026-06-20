"""
Biomni 交互式模式
像聊天一样使用 Biomni
"""
import ctypes
import os
import sys
from pathlib import Path

from dotenv import load_dotenv


TEXT_FILE_EXTENSIONS = {
    ".txt",
    ".md",
    ".csv",
    ".tsv",
    ".json",
    ".jsonl",
    ".py",
    ".r",
    ".html",
    ".htm",
    ".xml",
    ".yaml",
    ".yml",
}

APP_DIR = Path(__file__).resolve().parent


def configure_console_encoding():
    """Use UTF-8 for Windows console input/output when possible."""
    os.environ.setdefault("PYTHONUTF8", "1")
    os.environ.setdefault("PYTHONIOENCODING", "utf-8")

    if sys.platform == "win32":
        try:
            kernel32 = ctypes.windll.kernel32
            kernel32.SetConsoleOutputCP(65001)
            kernel32.SetConsoleCP(65001)
        except Exception:
            pass

    for stream_name in ("stdin", "stdout", "stderr"):
        stream = getattr(sys, stream_name, None)
        if hasattr(stream, "reconfigure"):
            try:
                stream.reconfigure(encoding="utf-8", errors="replace")
            except Exception:
                pass


configure_console_encoding()
os.chdir(APP_DIR)


def get_bool_env(name, default=False):
    value = os.getenv(name)
    if value is None:
        return default
    return value.strip().lower() in {"1", "true", "yes", "y", "on"}


def resolve_local_file_input(text):
    """Return a Path when the user input is exactly an existing local file path."""
    candidate = text.strip().strip('"').strip("'")
    if not candidate:
        return None

    candidates = [candidate]
    for source_encoding in ("gb18030", "gbk", "cp936"):
        try:
            repaired = candidate.encode(source_encoding).decode("utf-8")
        except UnicodeError:
            continue
        if repaired not in candidates:
            candidates.append(repaired)

    for item in candidates:
        expanded = os.path.expandvars(os.path.expanduser(item))
        path = Path(expanded)
        if path.exists() and path.is_file():
            return path
    return None


def read_text_file_safely(path):
    data = path.read_bytes()
    for encoding in ("utf-8-sig", "utf-8", "gb18030", "gbk", "cp936"):
        try:
            return data.decode(encoding), encoding
        except UnicodeDecodeError:
            continue
    return data.decode("utf-8", errors="replace"), "utf-8 (errors=replace)"


def prepare_question(question):
    """Inline local text file contents so the agent does not have to guess paths/encodings."""
    path = resolve_local_file_input(question)
    if path is None:
        return question

    if path.suffix.lower() not in TEXT_FILE_EXTENSIONS:
        return (
            f"用户提供了一个本地文件路径：{path}\n"
            "请基于这个文件处理用户需求。如果需要读取文件，请用 Python，并优先尝试 "
            "utf-8-sig、utf-8、gb18030、gbk 编码。"
        )

    content, encoding = read_text_file_safely(path)
    max_chars = int(os.getenv("BIOMNI_MAX_INLINE_FILE_CHARS", "60000"))
    truncated = ""
    if len(content) > max_chars:
        content = content[:max_chars]
        truncated = f"\n\n[文件较长，已截取前 {max_chars} 个字符。]"

    print(f"📄 已读取本地文件: {path} ({encoding})")
    return f"""用户提供了一个本地文本文件，请直接基于文件内容回答，不要再尝试打开这个路径。

文件路径: {path}
读取编码: {encoding}{truncated}

文件内容:
```text
{content}
```"""

def print_banner():
    """打印欢迎界面"""
    banner = """
    ╔═══════════════════════════════════════════════════════════════╗
    ║                                                               ║
    ║              🧬 Biomni AI 生物医学助手 🧬                   ║
    ║                                                               ║
    ║              通用生物医学 AI 智能体                           ║
    ║                                                               ║
    ╚═══════════════════════════════════════════════════════════════╝
    """
    print(banner)

def print_examples():
    """打印示例问题"""
    examples = [
        "💡 示例问题：",
        "",
        "1. 基因分析：",
        "   '分析 BRCA1 基因在乳腺癌中的作用'",
        "",
        "2. 实验设计：",
        "   '设计一个 CRISPR 筛选实验'",
        "",
        "3. 技术解释：",
        "   '解释什么是单细胞 RNA 测序'",
        "",
        "4. 药物设计：",
        "   '预测这个化合物的性质: CC(C)CC1=CC=C(C=C1)C(C)C(=O)O'",
        "",
        "5. 文献综述：",
        "   '总结免疫治疗的最新进展'",
        ""
    ]
    for line in examples:
        print(line)

def main():
    """主函数"""
    print_banner()

    # 加载环境变量
    print("🔧 正在加载配置...")
    load_dotenv()

    # 检查 API Key
    api_key = os.getenv("ZHIPUAI_API_KEY")
    if not api_key or api_key == "your_zhipuai_api_key_here":
        print("❌ 请先在 .env 文件中配置智谱 API Key")
        print("   运行测试脚本检查配置: python test_zhipu.py")
        return

    try:
        agent = None
        print_examples()

        print("=" * 67)
        print("🎉 交互模式已启动！输入您的问题，输入 'quit' 或 'exit' 退出")
        print("=" * 67)

        # 交互式循环
        while True:
            try:
                # 获取用户输入
                question = input("\n🧬 您的问题: ").strip().lstrip("\ufeff")

                # 检查退出命令
                if question.lower() in ['quit', 'exit', '退出', 'q']:
                    print("\n👋 感谢使用 Biomni，再见！")
                    break

                # 跳过空输入
                if not question:
                    continue

                # 显示帮助信息
                if question.lower() in ['help', '帮助', 'h', '?']:
                    print_examples()
                    continue

                if agent is None:
                    from biomni.agent import A1

                    use_tool_retriever = get_bool_env("BIOMNI_USE_TOOL_RETRIEVER", False)
                    print("🤖 正在创建 Biomni Agent...")
                    if use_tool_retriever:
                        print("🔍 Resource retriever: ON (full mode, slower)")
                    else:
                        print("⚡ Resource retriever: OFF (fast mode)")
                    agent = A1(
                        path=str(APP_DIR / 'data'),
                        llm='glm-4-flash',
                        source='Custom',
                        base_url='https://open.bigmodel.cn/api/paas/v4',
                        api_key=api_key,
                        use_tool_retriever=use_tool_retriever,
                        expected_data_lake_files=[],
                    )
                    print("✅ Agent 创建成功\n")

                # 处理问题
                print(f"\n🔬 正在分析: {question}")
                print("-" * 67)

                prepared_question = prepare_question(question)
                result = agent.go(prepared_question)

                print("-" * 67)
                print("✅ 分析完成\n")

            except KeyboardInterrupt:
                print("\n\n👋 检测到中断，退出交互模式")
                break
            except EOFError:
                print("\n\n👋 输入结束，退出交互模式")
                break
            except Exception as e:
                print(f"\n❌ 处理问题时出错: {e}")
                print("💡 建议：检查网络连接和 API 配置")

    except Exception as e:
        print(f"\n❌ 启动失败: {e}")
        print("\n💡 故障排除：")
        print("1. 检查网络连接")
        print("2. 确认 API Key 正确")
        print("3. 运行测试: python test_zhipu.py")

if __name__ == "__main__":
    main()
