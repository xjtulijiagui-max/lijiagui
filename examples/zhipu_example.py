"""
Biomni 智谱 AI 使用示例
演示如何使用智谱模型运行 Biomni agent
"""
import os
from dotenv import load_dotenv
from biomni.config import default_config
from biomni.agent import A1

def main():
    """主函数"""
    print("🚀 启动 Biomni 智谱 AI Agent\n")

    # 加载环境变量
    load_dotenv()

    # 配置使用智谱模型
    print("📋 配置智谱模型...")

    # 方法1：通过环境变量自动配置
    # .env 文件中已配置：
    # BIOMNI_LLM=glm-4-flash
    # BIOMNI_SOURCE=Custom
    # BIOMNI_CUSTOM_BASE_URL=https://open.bigmodel.cn/api/paas/v4
    # BIOMNI_CUSTOM_API_KEY=your_api_key

    # 方法2：通过代码直接配置
    default_config.llm = "glm-4-flash"
    default_config.source = "Custom"
    default_config.base_url = "https://open.bigmodel.cn/api/paas/v4"
    default_config.api_key = os.getenv("ZHIPUAI_API_KEY")
    default_config.timeout_seconds = 1200

    print(f"✅ 模型: {default_config.llm}")
    print(f"✅ 源: {default_config.source}")
    print(f"✅ 基础 URL: {default_config.base_url}")
    print(f"✅ 超时: {default_config.timeout_seconds}秒\n")

    # 创建 Biomni agent
    print("🤖 创建 Biomni Agent...")
    agent = A1(
        path='./data',
        llm='glm-4-flash',
        source='Custom',
        base_url='https://open.bigmodel.cn/api/paas/v4',
        api_key=os.getenv("ZHIPUAI_API_KEY"),
        expected_data_lake_files=[]  # 跳过数据湖下载以加快测试
    )

    print("✅ Agent 创建成功\n")

    # 运行示例任务
    print("🔬 运行示例任务...")

    tasks = [
        "分析基因 BRCA1 在乳腺癌中的作用",
        "解释什么是 CRISPR-Cas9 基因编辑技术",
        "介绍单细胞 RNA 测序的基本原理"
    ]

    for i, task in enumerate(tasks, 1):
        print(f"\n--- 任务 {i}: {task} ---")
        try:
            result = agent.go(task)
            print(f"✅ 任务完成")
        except Exception as e:
            print(f"❌ 任务失败: {e}")

    print("\n🎉 示例完成！")

if __name__ == "__main__":
    main()
