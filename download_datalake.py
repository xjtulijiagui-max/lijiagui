"""
Biomni 数据湖下载脚本
触发 A1 agent 创建，自动下载约 11GB 的数据湖文件
"""
import sys
import codecs
import time

# Windows UTF-8 编码兼容
if sys.platform == 'win32':
    sys.stdout = codecs.getwriter('utf-8')(sys.stdout.buffer, 'strict')
    sys.stderr = codecs.getwriter('utf-8')(sys.stderr.buffer, 'strict')

import os
from dotenv import load_dotenv

# 加载环境变量
load_dotenv()

print("🚀 开始下载 Biomni 数据湖...")
print("📦 数据大小约 11GB，请耐心等待...")
print("=" * 70)
print(f"⏰ 开始时间: {time.strftime('%Y-%m-%d %H:%M:%S')}")
print("=" * 70)

try:
    from biomni.agent import A1

    # 创建 Agent，允许下载数据湖（不设置 expected_data_lake_files=[]）
    agent = A1(
        path='./data',
        llm='glm-4-flash',
        source='Custom',
        base_url='https://open.bigmodel.cn/api/paas/v4',
        api_key=os.getenv("ZHIPUAI_API_KEY")
    )

    print("\n" + "=" * 70)
    print(f"⏰ 完成时间: {time.strftime('%Y-%m-%d %H:%M:%S')}")
    print("✅ 数据湖下载完成！")
    print("=" * 70)

except Exception as e:
    print(f"\n❌ 下载出错: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)
