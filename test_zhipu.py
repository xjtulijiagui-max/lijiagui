"""
Biomni 智谱 AI 集成测试
测试智谱 API 配置和基本功能
"""
import os
import sys
from dotenv import load_dotenv

# 设置 UTF-8 编码
if sys.platform == 'win32':
    import codecs
    sys.stdout = codecs.getwriter('utf-8')(sys.stdout.buffer, 'strict')
    sys.stderr = codecs.getwriter('utf-8')(sys.stderr.buffer, 'strict')
import os
from dotenv import load_dotenv
import sys

def test_env_loading():
    """测试环境变量加载"""
    print("🔍 测试环境变量加载...")

    # 加载 .env 文件
    load_dotenv()

    api_key = os.getenv("ZHIPUAI_API_KEY")
    if api_key and api_key != "your_zhipuai_api_key_here":
        print(f"✅ 智谱 API Key 已加载: {api_key[:10]}...")
        return True
    else:
        print("❌ 智谱 API Key 未正确配置")
        return False

def test_zhipu_connection():
    """测试智谱 API 连接"""
    print("\n🔍 测试智谱 API 连接...")

    try:
        from zhipuai import ZhipuAI

        # 加载环境变量
        load_dotenv()
        api_key = os.getenv("ZHIPUAI_API_KEY")

        # 创建客户端
        client = ZhipuAI(api_key=api_key)

        # 测试简单的 API 调用
        response = client.chat.completions.create(
            model="glm-4-flash",
            messages=[
                {"role": "user", "content": "你好，请简单介绍一下你自己"}
            ],
            temperature=0.7,
        )

        if response.choices:
            print("✅ 智谱 API 连接成功")
            print(f"📝 测试响应: {response.choices[0].message.content[:100]}...")
            return True
        else:
            print("❌ API 响应为空")
            return False

    except Exception as e:
        print(f"❌ 智谱 API 连接失败: {e}")
        return False

def test_biomni_config():
    """测试 Biomni 配置"""
    print("\n🔍 测试 Biomni 配置...")

    try:
        from biomni.config import default_config

        # 显示当前配置
        print(f"默认 LLM: {default_config.llm}")
        print(f"默认源: {default_config.source}")
        print(f"基础 URL: {default_config.base_url}")

        # 设置智谱配置
        load_dotenv()

        if os.getenv("BIOMNI_SOURCE") == "Custom":
            print("✅ 检测到自定义配置")

            if os.getenv("BIOMNI_CUSTOM_BASE_URL"):
                print(f"✅ 自定义基础 URL: {os.getenv('BIOMNI_CUSTOM_BASE_URL')}")

            if os.getenv("BIOMNI_LLM"):
                print(f"✅ 自定义模型: {os.getenv('BIOMNI_LLM')}")

            return True
        else:
            print("⚠️  未检测到自定义配置")
            return False

    except Exception as e:
        print(f"❌ Biomni 配置测试失败: {e}")
        return False

def main():
    """主测试函数"""
    print("🧪 Biomni 智谱 AI 集成测试\n")
    print("=" * 50)

    all_passed = True

    # 运行测试
    if not test_env_loading():
        all_passed = False

    if not test_zhipu_connection():
        all_passed = False

    if not test_biomni_config():
        all_passed = False

    print("\n" + "=" * 50)

    if all_passed:
        print("🎉 所有测试通过！智谱 API 已成功配置")
        print("\n📝 下一步：")
        print("1. 使用智谱模型运行 Biomni agent")
        print("2. 示例代码已保存在 examples/zhipu_example.py")
    else:
        print("⚠️  部分测试失败，请检查配置")

    return all_passed

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
