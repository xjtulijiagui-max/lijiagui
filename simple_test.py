# -*- coding: utf-8 -*-
"""
Biomni 简单测试脚本
最简单的使用方式
"""
import sys
import io

# 设置 UTF-8 输出
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

def main():
    try:
        from biomni.agent import A1
        import os
        from dotenv import load_dotenv

        print("加载环境变量...")
        load_dotenv()

        print("检查 API Key...")
        api_key = os.getenv("ZHIPUAI_API_KEY")
        if not api_key:
            print("错误: 请在 .env 文件中设置 ZHIPUAI_API_KEY")
            return

        print("创建 Biomni Agent...")
        agent = A1(
            path='./data',
            llm='glm-4-flash',
            source='Custom',
            base_url='https://open.bigmodel.cn/api/paas/v4',
            api_key=api_key,
            expected_data_lake_files=[]
        )

        print("运行任务...")
        agent.go("用一句话解释什么是DNA")

        print("完成!")

    except Exception as e:
        print(f"出错: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()
