# Biomni 终端使用完整指南

## 🖥️ Windows 终端使用方法

### 方法1：PowerShell（推荐）

#### 1.1 设置Python环境

**一次性设置（每次打开PowerShell都需要）：**
```powershell
# 添加Python到系统PATH
$env:Path += ";C:\Users\xjtul\AppData\Local\Programs\Python\Python312"
$env:Path += ";C:\Users\xjtul\AppData\Local\Programs\Python\Python312\Scripts"
```

**永久设置（只需执行一次）：**
```powershell
# 以管理员身份运行PowerShell，然后执行：
[Environment]::SetEnvironmentVariable("Path", $env:Path + ";C:\Users\xjtul\AppData\Local\Programs\Python\Python312;C:\Users\xjtul\AppData\Local\Programs\Python\Python312\Scripts", "User")
```

#### 1.2 进入项目目录
```powershell
cd C:\Users\xjtul\Biomni
```

#### 1.3 运行Biomni
```powershell
# 交互式模式
python interactive_mode.py

# Web界面
python flask_web.py

# 检查环境
python test_zhipu.py

# 肺癌分析
python lung_cancer_screening.py
```

### 方法2：命令提示符（CMD）

#### 2.1 打开CMD
- 按 `Win + R`
- 输入 `cmd`
- 按回车

#### 2.2 使用完整路径
```cmd
cd C:\Users\xjtul\Biomni
C:\Users\xjtul\AppData\Local\Programs\Python\Python312\python.exe interactive_mode.py
```

### 方法3：Windows Terminal（最佳体验）

#### 3.1 安装Windows Terminal
```powershell
# 从Microsoft Store安装
# 或访问：https://aka.ms/terminal
```

#### 3.2 配置Python环境
```powershell
# 在Windows Terminal的PowerShell中执行
$env:Path += ";C:\Users\xjtul\AppData\Local\Programs\Python\Python312;C:\Users\xjtul\AppData\Local\Programs\Python\Python312\Scripts"
```

#### 3.3 使用
```powershell
cd C:\Users\xjtul\Biomni
python interactive_mode.py
```

---

## 🎯 三种使用模式详解

### 模式1：交互式命令行

**启动：**
```bash
# PowerShell
cd C:\Users\xjtul\Biomni
python interactive_mode.py

# 或使用批处理文件
.\启动交互模式.bat
```

**使用示例：**
```bash
# 启动后会看到提示符
🧬 您的问题:

# 输入您的问题
分析EGFR基因在肺癌中的作用

# 查看结果
# 继续提问
设计一个细胞增殖实验

# 退出
quit
```

**技巧：**
- 可以多轮对话
- 支持上下文理解
- 输入 `quit` 或 `exit` 退出

### 模式2：Web界面

**启动：**
```bash
# PowerShell
cd C:\Users\xjtul\Biomni
python flask_web.py

# 或使用批处理文件
.\启动Web界面.bat
```

**使用：**
1. 等待启动完成
2. 打开浏览器访问：`http://localhost:5000`
3. 在网页中输入问题
4. 查看分析结果

**优点：**
- 用户界面友好
- 支持长文本显示
- 可以复制结果

### 模式3：脚本编程

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
    api_key=os.getenv("ZHIPUAI_API_KEY"),
    expected_data_lake_files=[]
)

# 运行分析
result = agent.go("您的问题")
print("分析完成！")
```

**运行脚本：**
```bash
python my_analysis.py
```

---

## 🔧 常用终端命令

### PowerShell 常用命令

```powershell
# 查看Python版本
python --version

# 查看当前目录
Get-Location

# 切换目录
cd C:\Users\xjtul\Biomni

# 列出文件
Get-ChildItem

# 查看环境变量
$env:Path

# 测试API连接
Test-NetConnection api.openai.com -Port 443
```

### 文件操作命令

```powershell
# 复制配置文件
Copy-Item .env.example .env

# 编辑文件
notepad .env

# 查看文件内容
Get-Content .env

# 搜索文件
Get-ChildItem -Recurse -Filter "*.py"
```

---

## 🚨 常见问题解决

### 问题1：找不到python命令

**原因：** Python不在系统PATH中

**解决方案A（临时）：**
```powershell
$env:Path += ";C:\Users\xjtul\AppData\Local\Programs\Python\Python312"
python --version
```

**解决方案B（永久）：**
```powershell
# 以管理员身份运行
[Environment]::SetEnvironmentVariable("Path", $env:Path + ";C:\Users\xjtul\AppData\Local\Programs\Python\Python312", "Machine")
```

### 问题2：权限不足

**错误信息：**
```
AccessDenied
```

**解决方案：**
```powershell
# 以管理员身份运行PowerShell
# 右键点击PowerShell图标 -> "以管理员身份运行"
```

### 问题3：模块未找到

**错误信息：**
```
ModuleNotFoundError: No module named 'xxx'
```

**解决方案：**
```powershell
# 重新安装模块
python -m pip install biomni --upgrade

# 或强制重装
python -m pip install biomni --force-reinstall
```

### 问题4：编码错误

**解决方案：**
```powershell
# 设置终端编码
chcp 65001

# 或在PowerShell配置文件中添加
# $env:PYTHONIOENCODING = "utf-8"
```

---

## 💡 终端使用技巧

### 技巧1：命令历史

```powershell
# 上箭头键 - 查看历史命令
# 下箭头键 - 前进历史命令
# F7 - 显示历史命令列表
```

### 技巧2：Tab补全

```powershell
# 输入部分命令后按Tab
python int<Tab>  # 自动补全为 python interactive_mode.py
```

### 技巧3：管道和重定向

```powershell
# 保存输出到文件
python test_zhipu.py > output.txt 2>&1

# 查看输出
Get-Content output.txt
```

### 技巧4：后台运行

```powershell
# 在新窗口中运行
Start-Process python -ArgumentList "flask_web.py"
```

---

## 📋 快速参考卡片

### PowerShell 快速启动

```powershell
# 1. 设置环境（如果未设置）
$env:Path += ";C:\Users\xjtul\AppData\Local\Programs\Python\Python312"

# 2. 进入目录
cd C:\Users\xjtul\Biomni

# 3. 运行Biomni
python interactive_mode.py
```

### CMD 快速启动

```cmd
cd C:\Users\xjtul\Biomni
C:\Users\xjtul\AppData\Local\Programs\Python\Python312\python.exe interactive_mode.py
```

### 批处理文件快速启动

```cmd
# 直接双击运行
启动交互模式.bat
```

---

## 🎓 培训建议

### 新手学习路径

**第1天：环境熟悉**
1. 学习启动PowerShell
2. 设置Python环境
3. 进入项目目录
4. 运行测试脚本

**第2天：基础操作**
1. 启动交互式模式
2. 输入简单问题
3. 观察输出格式
4. 正确退出程序

**第3天：进阶操作**
1. 尝试Web界面
2. 运行分析脚本
3. 配置API密钥
4. 解决常见问题

**第4天：实战应用**
1. 设计实验方案
2. 分析药物靶点
3. 预测化合物性质
4. 优化工作流程

---

## 📞 获取帮助

### 查看帮助信息

```powershell
# Biomni内置帮助
python interactive_mode.py
# 然后输入: help

# Python帮助
python --help

# 查看文档
Get-Content README.md
```

### 诊断脚本

```powershell
# 运行环境检查
python check_env.py

# 运行API测试
python test_zhipu.py
```

---

**🎯 记住：熟练使用终端是高效工作的基础！**
