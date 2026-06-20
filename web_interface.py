# -*- coding: utf-8 -*-
"""
Biomni Web 界面
在浏览器中访问 Biomni
"""
import sys
import io

# 设置 UTF-8 输出
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

from biomni.agent import A1
import os
from dotenv import load_dotenv

def main():
    try:
        print("🌐 启动 Biomni Web 界面...")
        print("=" * 50)

        # 加载环境变量
        print("📋 加载配置...")
        load_dotenv()

        api_key = os.getenv("ZHIPUAI_API_KEY")
        if not api_key:
            print("❌ 请在 .env 文件中配置 ZHIPUAI_API_KEY")
            return

        print("✅ API 配置检测成功")

        # 创建 Biomni Agent
        print("🤖 正在创建 Biomni Agent...")
        agent = A1(
            path='./data',
            llm='glm-4-flash',
            source='Custom',
            base_url='https://open.bigmodel.cn/api/paas/v4',
            api_key=api_key,
            expected_data_lake_files=[]
        )
        print("✅ Agent 创建成功")

        # 启动 Gradio 界面
        print("\n🚀 启动 Web 界面...")
        print("=" * 50)
        print("📱 请在浏览器中打开以下地址：")
        print("    http://localhost:7860")
        print("    http://127.0.0.1:7860")
        print("=" * 50)
        print("💡 提示：")
        print("  - 在输入框中输入您的问题")
        print("  - 点击 'Submit' 提交")
        print("  - 按 Ctrl+C 停止服务")
        print("=" * 50)

        # 启动 Gradio 界面
        agent.launch_gradio_demo(
            share=False,              # 不创建公开链接
            server_name="127.0.0.1",  # 本地访问
            require_verification=False # 不需要访问码
        )

    except ImportError:
        print("❌ 缺少 Gradio 依赖")
        print("📦 请安装：pip install \"gradio>=5.0,<6.0\"")

    except Exception as e:
        print(f"❌ 启动失败: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()
