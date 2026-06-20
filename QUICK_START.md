# 🚀 Biomni 学员快速入门

## ⚡ 30秒快速开始

### 方式1：双击批处理文件（最简单）

1. **找到文件：** `C:\Users\xjtul\Biomni\`
2. **双击运行：** `启动交互模式.bat`
3. **开始使用：** 输入您的问题

---

## 🎯 三种使用方式

### 1️⃣ 交互式模式（推荐新手）

**启动方法：**
- **双击：** `启动交互模式.bat`
- **或终端：**
  ```powershell
  cd C:\Users\xjtul\Biomni
  python interactive_mode.py
  ```

**使用示例：**
```
🧬 您的问题: 设计CCK8细胞增殖实验

[AI分析结果...]

🧬 您的问题: 分析EGFR基因功能

[AI分析结果...]

🧬 您的问题: quit
👋 再见！
```

### 2️⃣ Web界面模式

**启动方法：**
- **双击：** `启动Web界面.bat`
- **或终端：**
  ```powershell
  cd C:\Users\xjtul\Biomni
  python flask_web.py
  ```
- **浏览器打开：** `http://localhost:5000`

### 3️⃣ 分析脚本模式

**运行专门的分析：**
```powershell
cd C:\Users\xjtul\Biomni
python lung_cancer_screening.py    # 肺癌药物筛选
python local_analysis.py             # 本地化分析
python simple_screening.py           # 简化虚拟筛选
```

---

## 🔧 终端使用速查

### PowerShell 用户

```powershell
# 第1步：设置Python环境（复制粘贴）
$env:Path += ";C:\Users\xjtul\AppData\Local\Programs\Python\Python312"

# 第2步：进入目录
cd C:\Users\xjtul\Biomni

# 第3步：运行程序
python interactive_mode.py
```

### CMD 用户

```cmd
REM 第1步：进入目录
cd C:\Users\xjtul\Biomni

REM 第2步：运行程序
C:\Users\xjtul\AppData\Local\Programs\Python\Python312\python.exe interactive_mode.py
```

---

## 💡 常见命令

### 测试环境
```bash
python test_zhipu.py
```

### 检查Python版本
```bash
python --version
```

### 查看帮助
```bash
# 在交互模式中输入
help
```

### 退出程序
```bash
# 在交互模式中输入
quit
# 或
exit
```

---

## 📝 好的问题示例

### ✅ 药物研发类
```
"设计针对EGFR的抑制剂筛选实验"
"预测化合物的ADMET性质和脱靶风险"
"分析KRAS G12C突变的治疗策略"
```

### ✅ 实验设计类
```
"设计CCK8细胞增殖实验分组和统计分析"
"设计Western blot实验的对照组设置"
"设计qPCR实验的引物和反应条件"
```

### ✅ 基因分析类
```
"分析BRCA1基因在乳腺癌中的作用"
"解释CRISPR-Cas9基因编辑原理"
"分析TP53突变的临床意义"
```

---

## ⚠️ 常见问题

### ❌ "找不到python命令"

**解决：**
```powershell
# PowerShell
$env:Path += ";C:\Users\xjtul\AppData\Local\Programs\Python\Python312"
python --version
```

### ❌ "程序无响应"

**解决：**
- 检查网络连接
- 等待10-20秒（首次运行较慢）
- 重新启动程序

### ❌ "API连接失败"

**解决：**
- 检查 `.env` 文件中的API密钥
- 检查网络连接
- 运行 `python test_zhipu.py` 测试

---

## 🎓 学习路径

### 第1步：熟悉环境（10分钟）
1. 双击 `启动交互模式.bat`
2. 输入简单问题测试
3. 输入 `quit` 退出

### 第2步：实战练习（30分钟）
1. 设计一个简单的实验
2. 分析一个基因功能
3. 预测化合物性质

### 第3步：深入应用（1小时）
1. 运行专门的脚本
2. 尝试Web界面
3. 学习进阶功能

---

## 📚 更多资源

### 详细文档
- `TRAINING_GUIDE.md` - 完整培训指南
- `TERMINAL_GUIDE.md` - 终端使用指南
- `START_HERE.md` - 快速入门
- `HOW_TO_USE.md` - 使用说明

### 示例脚本
- `lung_cancer_screening.py` - 肺癌药物筛选
- `local_analysis.py` - 本地化分析
- `simple_screening.py` - 虚拟筛选演示

---

## 🆘 遇到问题？

### 快速诊断
```bash
# 1. 测试Python
python --version

# 2. 测试Biomni
python test_zhipu.py

# 3. 检查配置
Get-Content .env
```

### 重置环境
```bash
# 重新安装Biomni
pip install biomni --upgrade --force-reinstall
```

---

**🎯 记住：先用批处理文件，再学终端命令！**

**🚀 现在就开始：双击 `启动交互模式.bat`！**
