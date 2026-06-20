"""
Biomni 分析脚本：肺癌药物靶点筛选 + ADMET + 脱靶风险
"""
import sys
import codecs

# Windows UTF-8 编码兼容
if sys.platform == 'win32':
    sys.stdout = codecs.getwriter('utf-8')(sys.stdout.buffer, 'strict')
    sys.stderr = codecs.getwriter('utf-8')(sys.stderr.buffer, 'strict')

from biomni.agent import A1
import os
from dotenv import load_dotenv

# 加载环境变量
load_dotenv()

# 创建 Biomni Agent
print("🤖 正在创建 Biomni Agent...")
agent = A1(
    path='./data',
    llm='glm-4-flash',
    source='Custom',
    base_url='https://open.bigmodel.cn/api/paas/v4',
    api_key=os.getenv("ZHIPUAI_API_KEY"),
    expected_data_lake_files=[]
)
print("✅ Agent 创建成功\n")

# 用户的问题
question = "针对肺癌筛选潜在药物靶点，预测候选小分子ADMET性质、脱靶风险"

print("=" * 70)
print(f"🧬 问题: {question}")
print("=" * 70)
print("\n🔬 正在分析中，请耐心等待...\n")

try:
    result = agent.go(question)
    print("\n" + "=" * 70)
    print("✅ 分析完成！")
    print("=" * 70)
except Exception as e:
    print(f"\n❌ 分析出错: {e}")
    import traceback
    traceback.print_exc()
