# Biomni 使用指南

## 🎯 快速开始（3种方式）

### 方式 1：直接测试（推荐首先尝试）

```bash
python test_zhipu.py
```

这会测试您的智谱 API 配置是否正确。

---

### 方式 2：简单 Python 脚本

创建文件 `simple_test.py`：

```python
# -*- coding: utf-8 -*-
import sys
import io

# 设置 UTF-8 输出
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

from biomni.agent import A1
import os
from dotenv import load_dotenv

# 加载环境变量
load_dotenv()

# 创建 Agent
agent = A1(
    path='./data',
    llm='glm-4-flash',
    source='Custom',
    base_url='https://open.bigmodel.cn/api/paas/v4',
    api_key=os.getenv("ZHIPUAI_API_KEY"),
    expected_data_lake_files=[]
)

# 运行任务
agent.go("简单解释什么是基因")

print("完成！")
```

运行：
```bash
python simple_test.py
```

---

### 方式 3：交互式对话（推荐体验）

```bash
python interactive_mode.py
```

然后输入您的问题，比如：
- "什么是CRISPR？"
- "解释基因编辑"
- "BRCA1基因的作用"

输入 `quit` 退出。

---

## 📋 常见问题

### Q1: 编码错误怎么办？
在脚本开头添加：
```python
import sys
import io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
```

### Q2: API 连接失败？
```bash
# 检查 .env 文件
cat .env | grep ZHIPUAI

# 重新测试
python test_zhipu.py
```

### Q3: 想要 Web 界面？

```bash
# 安装 Gradio
pip install "gradio>=5.0,<6.0"

# 启动 Web 界面
python web_interface.py
```

然后打开浏览器访问：`http://localhost:7860`

---

## 🧪 推荐的第一次体验流程

1. **测试配置**（1分钟）
   ```bash
   python test_zhipu.py
   ```

2. **简单脚本**（2分钟）
   ```bash
   python simple_test.py
   ```

3. **交互模式**（5-10分钟）
   ```bash
   python interactive_mode.py
   ```

4. **Web界面**（可选）
   ```bash
   pip install "gradio>=5.0,<6.0"
   python web_interface.py
   ```

---

## 💡 使用建议

1. **新手**: 从交互式模式开始
2. **开发者**: 使用 Python 脚本集成
3. **演示**: 使用 Web 界面

---

## 🔧 重要提示

- 首次运行会创建 `./data` 目录
- `expected_data_lake_files=[]` 跳过大数据下载（推荐）
- 智谱模型比 Claude/OpenAI 便宜
- 确保网络连接正常

---

## 📚 更多信息

- 完整文档：查看 `START_HERE.md`
- GitHub：https://github.com/snap-stanford/Biomni
- 官网：https://biomni.stanford.edu
