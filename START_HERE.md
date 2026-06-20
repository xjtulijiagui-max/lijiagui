# Biomni 使用指南

## 🚀 快速开始

### 方法 1：Python 代码运行（推荐新手）

#### 步骤 1：创建运行脚本
创建文件 `my_first_biomni.py`：

```python
from biomni.agent import A1
import os
from dotenv import load_dotenv

# 加载环境变量
load_dotenv()

# 创建 Biomni Agent
agent = A1(
    path='./data',
    llm='glm-4-flash',  # 使用智谱模型
    source='Custom',
    base_url='https://open.bigmodel.cn/api/paas/v4',
    api_key=os.getenv("ZHIPUAI_API_KEY"),
    expected_data_lake_files=[]  # 跳过大数据下载，加快启动
)

# 执行您的第一个生物医药任务
print("🔬 正在分析...")

result = agent.go("解释什么是 CRISPR 基因编辑技术，它有什么应用？")

print("✅ 分析完成！")
```

#### 步骤 2：运行脚本
```bash
python my_first_biomni.py
```

---

### 方法 2：交互式命令行（像聊天一样）

创建文件 `interactive_mode.py`：

```python
from biomni.agent import A1
import os
from dotenv import load_dotenv

# 加载环境变量并创建 agent
load_dotenv()

print("🤖 Biomni AI 助手启动中...")
agent = A1(
    path='./data',
    llm='glm-4-flash',
    source='Custom',
    base_url='https://open.bigmodel.cn/api/paas/v4',
    api_key=os.getenv("ZHIPUAI_API_KEY"),
    expected_data_lake_files=[]
)

print("✅ 启动成功！您可以开始提问了")
print("=" * 50)

# 交互式循环
while True:
    question = input("\n🧬 您的问题（输入 'quit' 退出）: ")

    if question.lower() == 'quit':
        print("👋 再见！")
        break

    if question.strip():
        print(f"\n🔬 正在分析: {question}")
        try:
            result = agent.go(question)
            print("✅ 完成")
        except Exception as e:
            print(f"❌ 出错了: {e}")
```

运行：
```bash
python interactive_mode.py
```

---

### 方法 3：Web 界面（最直观）

#### 步骤 1：安装 Gradio
```bash
pip install "gradio>=5.0,<6.0"
```

#### 步骤 2：创建 Web 界面脚本
创建文件 `web_interface.py`：

```python
from biomni.agent import A1
import os
from dotenv import load_dotenv

# 加载环境变量
load_dotenv()

print("🌐 启动 Biomni Web 界面...")

# 创建 agent
agent = A1(
    path='./data',
    llm='glm-4-flash',
    source='Custom',
    base_url='https://open.bigmodel.cn/api/paas/v4',
    api_key=os.getenv("ZHIPUAI_API_KEY"),
    expected_data_lake_files=[]
)

# 启动 Gradio 界面
print("✅ Web 界面启动中...")
print("📱 请在浏览器中打开: http://localhost:7860")

agent.launch_gradio_demo(
    share=False,        # 不创建公开链接
    server_name="127.0.0.1",  # 本地访问
    require_verification=False  # 不需要访问码
)
```

#### 步骤 3：运行并打开浏览器
```bash
python web_interface.py
```

然后在浏览器中打开：`http://localhost:7860`

---

## 📝 常见使用场景

### 1. 基因分析
```python
agent.go("分析 BRCA1 基因在乳腺癌中的作用")
```

### 2. 药物设计
```python
agent.go("预测这个化合物的 ADMET 性质: CC(C)CC1=CC=C(C=C1)C(C)C(=O)O")
```

### 3. 实验设计
```python
agent.go("设计一个 CRISPR 筛选实验来识别调节 T 细胞耗竭的基因")
```

### 4. 文献综述
```python
agent.go("总结单细胞 RNA 测序在癌症研究中的最新进展")
```

---

## 🎯 推荐启动流程

**第一次使用推荐流程：**

1. **快速体验**（5分钟）
   ```bash
   # 运行测试脚本
   python test_zhipu.py
   ```

2. **交互式体验**（10分钟）
   ```bash
   # 启动交互模式
   python interactive_mode.py
   ```

3. **Web 界面体验**（15分钟）
   ```bash
   # 安装 Gradio
   pip install "gradio>=5.0,<6.0"

   # 启动 Web 界面
   python web_interface.py
   ```

---

## 💡 使用技巧

### 1. 跳过数据下载（加快启动）
```python
agent = A1(expected_data_lake_files=[])  # 不下载 11GB 数据
```

### 2. 调整超时时间
```python
from biomni.config import default_config
default_config.timeout_seconds = 1800  # 30分钟
```

### 3. 保存分析结果
```python
agent.go("您的任务")
agent.save_conversation_history("result.pdf")  # 保存为 PDF
```

---

## 🛠️ 故障排除

### 问题 1：API 连接失败
```bash
# 检查 .env 文件中的 API Key 是否正确
cat .env | grep ZHIPUAI_API_KEY
```

### 问题 2：模块导入错误
```bash
# 重新安装 biomni
pip install biomni --upgrade
```

### 问题 3：编码错误
```python
# 在脚本开头添加
import sys
import codecs
if sys.platform == 'win32':
    sys.stdout = codecs.getwriter('utf-8')(sys.stdout.buffer)
```

---

## 📚 更多资源

- **官方文档**: [biomni.stanford.edu](https://biomni.stanford.edu)
- **GitHub 仓库**: [github.com/snap-stanford/Biomni](https://github.com/snap-stanford/Biomni)
- **论文**: [bioRxiv 论文](https://www.biorxiv.org/content/10.1101/2025.05.30.656746v1)

---

## 🎉 开始使用

现在选择一个方法开始您的 Biomni 之旅：

```bash
# 推荐：先运行测试确认配置正确
python test_zhipu.py

# 然后选择您喜欢的使用方式
python interactive_mode.py       # 命令行交互
# 或
python web_interface.py          # Web 界面
```

**祝您使用愉快！** 🧬✨
