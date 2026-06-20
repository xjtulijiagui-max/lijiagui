# Biomni 培训指南 - 学员版

## 🎓 培训目标

让学员能够熟练使用 Biomni AI 生物医学助手进行各种研究任务。

---

## 📋 培训大纲

### 第一部分：环境准备 (30分钟)
### 第二部分：基础操作 (1小时)
### 第三部分：进阶功能 (1.5小时)
### 第四部分：实战案例 (2小时)

---

## 🔧 第一部分：环境准备

### 1.1 检查系统要求

**必需软件：**
- ✅ Python 3.10 或更高版本
- ✅ 网络连接（需要访问API）
- ✅ 15GB 可用磁盘空间（如需完整数据湖）

**检查Python版本：**
```bash
python --version
```

### 1.2 安装 Biomni

**步骤1：克隆或下载项目**
```bash
# 如果使用 Git
git clone https://github.com/snap-stanford/Biomni.git
cd Biomni

# 或直接下载解压
```

**步骤2：安装依赖**
```bash
pip install biomni --upgrade
```

**步骤3：配置API密钥**
```bash
# 复制示例配置文件
cp .env.example .env

# 编辑 .env 文件，添加您的API密钥
# Windows 用户可以使用记事本编辑
```

### 1.3 验证安装

**运行测试脚本：**
```bash
python test_zhipu.py
```

**预期输出：**
```
✅ 智谱 API Key 已加载
✅ 智谱 API 连接成功
✅ Biomni 配置检测成功
```

### 1.4 常见问题解决

**问题1：找不到 python 命令**
```powershell
# Windows PowerShell
$env:Path += ";C:\Users\xjtul\AppData\Local\Programs\Python\Python312\Scripts"
```

**问题2：pip 安装失败**
```bash
# 升级 pip
python -m pip install --upgrade pip
```

**问题3：API连接失败**
```bash
# 检查网络连接
ping api.openai.com

# 检查防火墙设置
```

---

## 🚀 第二部分：基础操作

### 2.1 三种使用方式

#### 方式A：交互式命令行模式（推荐新手）

**启动方法：**
```bash
# Windows
run_interactive.bat

# 或使用完整路径
C:\Users\xjtul\AppData\Local\Programs\Python\Python312\python.exe interactive_mode.py
```

**使用技巧：**
- 输入问题后按回车
- 输入 `quit` 或 `exit` 退出
- 输入 `help` 查看帮助

#### 方式B：Web界面模式

**启动方法：**
```bash
python flask_web.py
```

**访问地址：**
```
http://localhost:5000
```

#### 方式C：脚本编程模式

**创建脚本：**
```python
# my_analysis.py
from biomni.agent import A1
import os
from dotenv import load_dotenv

load_dotenv()

agent = A1(
    path='./data',
    llm='glm-4-flash',
    source='Custom',
    base_url='https://open.bigmodel.cn/api/paas/v4',
    api_key=os.getenv("ZHIPUAI_API_KEY")
)

# 运行分析
result = agent.go("您的问题")
```

**运行脚本：**
```bash
python my_analysis.py
```

### 2.2 提问技巧

**好的提问方式：**
```
✅ "分析EGFR基因在非小细胞肺癌中的作用机制"
✅ "设计一个针对KRAS G12C突变的筛选实验"
✅ "预测化合物CC(C)CC1=CC=C(C=C1)C(C)C(=O)O的ADMET性质"
```

**不好的提问方式：**
```
❌ "分析一下"（太笼统）
❌ "这是什么？"（缺少上下文）
❌ "帮我做实验"（任务描述不清晰）
```

### 2.3 结果解读

**理解输出格式：**
- **🔬 分析结果**：AI 的主要分析
- **📊 数据支持**：相关数据和研究
- **💡 建议**：下一步操作建议
- **⚠️ 注意事项**：需要留意的问题

---

## 🎯 第三部分：进阶功能

### 3.1 数据湖下载（可选）

**何时需要下载数据湖：**
- 需要精确的分子对接
- 需要专业的ADMET预测
- 需要访问化合物数据库
- 需要进行结构预测

**下载方法：**
```bash
python download_datalake.py
```

**注意事项：**
- 数据大小：约11GB
- 下载时间：1-3小时
- 磁盘空间：需要至少15GB

### 3.2 配置管理

**修改默认配置：**
```python
from biomni.config import default_config

# 修改默认设置
default_config.llm = "glm-4-flash"
default_config.timeout_seconds = 1200
default_config.temperature = 0.7
```

**环境变量配置：**
```bash
# 在 .env 文件中添加
BIOMNI_LLM=glm-4-flash
BIOMNI_TIMEOUT_SECONDS=1200
BIOMNI_TEMPERATURE=0.7
```

### 3.3 批量处理

**处理多个任务：**
```python
tasks = [
    "分析EGFR基因功能",
    "设计ALK抑制剂筛选实验",
    "预测KRAS G12C抑制剂ADMET"
]

for task in tasks:
    print(f"处理任务: {task}")
    result = agent.go(task)
    print(f"完成: {task}\n")
```

---

## 💼 第四部分：实战案例

### 案例1：肺癌药物靶点筛选

**任务描述：**
"针对肺癌筛选潜在药物靶点，预测候选小分子ADMET性质、脱靶风险"

**预期结果：**
- 6个已验证的肺癌药物靶点
- 每个靶点的详细特征分析
- ADMET预测框架
- 虚拟筛选演示

**学习要点：**
- 如何描述复杂的药物筛选任务
- 如何解读多个靶点的分析结果
- 理解ADMET预测的重要性

### 案例2：实验设计

**任务描述：**
"设计CCK8细胞增殖实验分组、浓度梯度、孵育时间、统计分析方法"

**预期结果：**
- 实验分组设计
- 浓度梯度设置
- 时间点选择
- 统计分析方法

**学习要点：**
- 实验设计的系统性思维
- 对照组的重要性
- 统计方法的选择依据

### 案例3：基因分析

**任务描述：**
"分析BRCA1基因在乳腺癌中的作用机制和相关治疗策略"

**预期结果：**
- 基因功能分析
- 突变效应
- 治疗靶点
- 药物选择建议

**学习要点：**
- 基因-疾病关联分析
- 精准医疗概念
- 治疗策略优化

---

## 📝 培训练习

### 练习1：基础操作（30分钟）

1. 启动交互式模式
2. 输入简单问题："什么是EGFR？"
3. 观察输出格式
4. 尝试退出命令

### 练习2：实验设计（1小时）

1. 设计一个简单的细胞实验
2. 包含对照组设置
3. 确定样本量
4. 选择统计方法

### 练习3：药物分析（1.5小时）

1. 选择一个药物靶点
2. 分析其特征
3. 设计候选化合物
4. 预测ADMET性质

---

## 🛠️ 常用工具命令

### Windows 批处理文件

**run_interactive.bat** - 启动交互式模式
```batch
@echo off
chcp 65001 >nul
echo Starting Biomni Interactive Mode...
cd /d C:\Users\xjtul\Biomni
C:\Users\xjtul\AppData\Local\Programs\Python\Python312\python.exe interactive_mode.py
pause
```

**run_web.bat** - 启动Web界面
```batch
@echo off
chcp 65001 >nul
echo Starting Biomni Web Interface...
cd /d C:\Users\xjtul\Biomni
C:\Users\xjtul\AppData\Local\Programs\Python\Python312\python.exe flask_web.py
pause
```

### 检查脚本

**check_env.py** - 检查环境配置
```bash
python check_env.py
```

---

## 📞 技术支持

### 常见错误处理

**错误1：ModuleNotFoundError**
```bash
# 重新安装 biomni
pip install biomni --upgrade --force-reinstall
```

**错误2：API连接失败**
```bash
# 检查API密钥配置
cat .env | grep API_KEY

# 测试网络连接
ping open.bigmodel.cn
```

**错误3：超时错误**
```python
# 增加超时时间
default_config.timeout_seconds = 1800
```

### 获取帮助

**查看文档：**
- README.md - 完整功能说明
- START_HERE.md - 快速入门
- HOW_TO_USE.md - 使用指南

**在线资源：**
- GitHub: https://github.com/snap-stanford/Biomni
- 官网: https://biomni.stanford.edu

---

## 🎓 培训考核

### 理论考核（30分钟）

1. Biomni 的主要功能有哪些？
2. 如何配置 API 密钥？
3. 三种使用方式的区别是什么？

### 实操考核（1小时）

1. 成功启动交互式模式
2. 完成一个实验设计任务
3. 分析一个药物靶点
4. 预测化合物的ADMET性质

### 综合考核（2小时）

设计一个完整的药物筛选流程：
- 靶点选择
- 虚拟筛选
- ADMET预测
- 实验验证

---

## 📚 进阶学习路径

### 初级（1-2周）
- 熟练使用三种操作方式
- 掌握基础提问技巧
- 理解输出格式

### 中级（1-2个月）
- 下载数据湖
- 使用进阶功能
- 批量处理任务
- 配置优化

### 高级（3-6个月）
- 脚本编程集成
- 自定义工具开发
- 工作流程优化
- API集成

---

## 💡 最佳实践

### 提问原则
1. **明确性**：清楚描述任务目标
2. **具体性**：提供必要的背景信息
3. **系统性**：涵盖关键要素
4. **可操作性**：结果可指导实践

### 使用原则
1. **从简单开始**：先掌握基础功能
2. **循序渐进**：逐步学习进阶功能
3. **实践导向**：通过实际项目学习
4. **持续优化**：根据反馈调整使用策略

---

**祝学习愉快！** 🎓✨
