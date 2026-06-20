"""
Biomni 数据湖下载脚本（带代理版本）
强制走 Clash 7890 端口
"""
import sys
import codecs
import time
import os

# Windows UTF-8 编码兼容
if sys.platform == 'win32':
    sys.stdout = codecs.getwriter('utf-8')(sys.stdout.buffer, 'strict')
    sys.stderr = codecs.getwriter('utf-8')(sys.stderr.buffer, 'strict')

# ===== 强制设置代理 =====
os.environ['HTTP_PROXY'] = 'http://127.0.0.1:7890'
os.environ['HTTPS_PROXY'] = 'http://127.0.0.1:7890'
os.environ['http_proxy'] = 'http://127.0.0.1:7890'
os.environ['https_proxy'] = 'http://127.0.0.1:7890'

print("🌐 代理已设置: http://127.0.0.1:7890")

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

    # 创建 Agent，允许下载数据湖
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
