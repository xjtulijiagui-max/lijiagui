# -*- coding: utf-8 -*-
"""
Biomni 简化 Web 界面
绕过编码问题的版本
"""
import sys
import io

# 设置 UTF-8 输出
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

import gradio as gr
from biomni.agent import A1
import os
from dotenv import load_dotenv

# 全局变量存储 agent
biomni_agent = None

def create_agent():
    """创建 Biomni Agent"""
    global biomni_agent

    if biomni_agent is None:
        try:
            load_dotenv()

            print("创建 Biomni Agent...")
            agent = A1(
                path='./data',
                llm='glm-4-flash',
                source='Custom',
                base_url='https://open.bigmodel.cn/api/paas/v4',
                api_key=os.getenv("ZHIPUAI_API_KEY"),
                expected_data_lake_files=[]
            )

            biomni_agent = agent
            print("Agent 创建成功")

        except Exception as e:
            print(f"创建 Agent 失败: {e}")
            return None

    return biomni_agent

def process_biomni_query(question, history):
    """处理 Biomni 查询"""
    if not question or not question.strip():
        return history, history

    try:
        # 获取或创建 agent
        agent = create_agent()
        if agent is None:
            error_msg = "❌ Agent 创建失败，请检查配置"
            history.append((question, error_msg))
            return history, history

        # 添加用户问题到历史
        history.append((question, ""))

        # 处理问题
        print(f"处理问题: {question}")

        # 这里我们只返回简单的确认信息
        # 因为完整的 agent.go() 可能会有编码问题
        response = f"✅ 收到您的问题: {question}\n\n🔬 正在分析中...\n\n💡 由于编码限制，建议使用交互式命令行模式获得完整体验。"

        # 更新历史记录
        history[-1] = (question, response)

        return history, history

    except Exception as e:
        error_msg = f"❌ 处理失败: {str(e)}"
        history.append((question, error_msg))
        return history, history

def clear_history():
    """清除历史记录"""
    return [], []

def main():
    """启动 Gradio 界面"""
    try:

        print("🌐 启动 Biomni 简化 Web 界面...")
        print("=" * 50)

        # 加载环境变量
        load_dotenv()

        api_key = os.getenv("ZHIPUAI_API_KEY")
        if not api_key:
            print("❌ 请在 .env 文件中配置 ZHIPUAI_API_KEY")
            return

        print("✅ API 配置检测成功")

        # 创建 Gradio 界面
        with gr.Blocks(title="Biomni AI 生物医学助手") as demo:

            gr.Markdown("# 🧬 Biomni AI 生物医学助手")
            gr.Markdown("## 智谱 AI 驱动的通用生物医学智能体")
            gr.Markdown("---")

            chatbot = gr.Chatbot(
                label="对话历史",
                height=400,
                show_copy_button=True
            )

            with gr.Row():
                question_input = gr.Textbox(
                    label="您的问题",
                    placeholder="请输入您的生物医学问题...",
                    scale=4
                )
                submit_btn = gr.Button("提交", scale=1)

            with gr.Row():
                clear_btn = gr.Button("清除对话")

            gr.Markdown("---")
            gr.Markdown("### 💡 示例问题")
            gr.Markdown("""
            - "分析 BRCA1 基因在乳腺癌中的作用"
            - "解释什么是 CRISPR-Cas9 基因编辑技术"
            - "设计一个 CRISPR 筛选实验"
            - "预测化合物的 ADMET 性质"
            """)

            gr.Markdown("---")
            gr.Markdown("### ⚠️ 注意")
            gr.Markdown("当前为简化版本，完整功能请使用命令行交互模式：`python interactive_mode.py`")

            # 事件处理
            submit_btn.click(
                fn=process_biomni_query,
                inputs=[question_input, chatbot],
                outputs=[chatbot, chatbot]
            )

            question_input.submit(
                fn=process_biomni_query,
                inputs=[question_input, chatbot],
                outputs=[chatbot, chatbot]
            )

            clear_btn.click(
                fn=clear_history,
                inputs=[],
                outputs=[chatbot, chatbot]
            )

        print("\n🚀 启动 Web 界面...")
        print("=" * 50)
        print("📱 请在浏览器中打开以下地址：")
        print("    http://localhost:7860")
        print("    http://127.0.0.1:7860")
        print("=" * 50)
        print("💡 提示：")
        print("  - 在输入框中输入您的问题")
        print("  - 点击 '提交' 按钮发送")
        print("  - 按 Ctrl+C 停止服务")
        print("=" * 50)

        # 启动界面
        demo.launch(
            server_name="127.0.0.1",
            server_port=7860,
            share=False,
            show_error=True
        )

    except Exception as e:
        print(f"❌ 启动失败: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()
