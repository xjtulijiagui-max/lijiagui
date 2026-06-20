"""
Biomni 快速启动脚本
最简单的使用方式 - 运行一个示例任务
"""
import sys
import codecs

# 设置 UTF-8 编码（Windows 兼容）
if sys.platform == 'win32':
    sys.stdout = codecs.getwriter('utf-8')(sys.stdout.buffer, 'strict')
    sys.stderr = codecs.getwriter('utf-8')(sys.stderr.buffer, 'strict')

from biomni.agent import A1
import os
from dotenv import load_dotenv

def main():
    print("🚀 Biomni 快速启动")
    print("=" * 50)

    # 加载环境变量
    load_dotenv()

    # 检查 API Key
    api_key = os.getenv("ZHIPUAI_API_KEY")
    if not api_key or api_key == "your_zhipuai_api_key_here":
        print("❌ 请先在 .env 文件中配置智谱 API Key")
        return

    print("✅ API 配置检测成功")

    try:
        # 创建 Biomni Agent
        print("\n🤖 正在创建 Biomni Agent...")
        agent = A1(
            path='./data',
            llm='glm-4-flash',
            source='Custom',
            base_url='https://open.bigmodel.cn/api/paas/v4',
            api_key=api_key,
            expected_data_lake_files=[]
        )
        print("✅ Agent 创建成功")

        # 运行示例任务
        print("\n🔬 运行示例任务...")
        print("-" * 50)

        task = "简单解释什么是 CRISPR 基因编辑技术"
        print(f"任务: {task}")

        result = agent.go(task)

        print("-" * 50)
        print("✅ 任务完成")

        print("\n📝 您可以尝试以下任务：")
        print("1. 分析 BRCA1 基因在乳腺癌中的作用")
        print("2. 设计一个筛选实验")
        print("3. 解释单细胞测序技术")
        print("4. 预测化合物的性质")

        print("\n💡 查看更多使用方法：")
        print(" - 交互模式: python interactive_mode.py")
        print(" - Web界面: python web_interface.py")
        print(" - 完整指南: 查看 START_HERE.md")

    except Exception as e:
        print(f"\n❌ 运行出错: {e}")
        print("\n💡 解决建议：")
        print("1. 检查网络连接")
        print("2. 确认 API Key 正确")
        print("3. 运行测试: python test_zhipu.py")

if __name__ == "__main__":
    main()
