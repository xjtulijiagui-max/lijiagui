# -*- coding: utf-8 -*-
"""
直接运行指定的 Biomni 问题
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
    print("🧬 Biomni AI 生物医学助手")
    print("=" * 60)

    # 加载环境变量
    load_dotenv()

    # 创建 Biomni Agent
    print("🤖 正在创建 Biomni Agent...")
    try:
        agent = A1(
            path='./data',
            llm='glm-4-flash',
            source='Custom',
            base_url='https://open.bigmodel.cn/api/paas/v4',
            api_key=os.getenv("ZHIPUAI_API_KEY"),
            expected_data_lake_files=[]
        )
        print("✅ Agent 创建成功\n")
    except Exception as e:
        print(f"❌ Agent 创建失败: {e}")
        return

    # 运行具体的问题
    question = "针对肺癌筛选潜在药物靶点，预测候选小分子ADMET性质、脱靶风险"

    print("🔬 任务开始")
    print("=" * 60)
    print(f"问题: {question}")
    print("=" * 60)

    try:
        result = agent.go(question)

        print("\n" + "=" * 60)
        print("✅ 分析完成")
        print("=" * 60)

    except Exception as e:
        print(f"\n❌ 分析失败: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()
