# 🛠️ Biomni 故障排除指南

## 🚨 常见问题快速解决

### 问题1：找不到 python 命令

#### ❌ 错误信息
```
python : 无法将"python"项识别为 cmdlet、函数、脚本文件
```

#### ✅ 解决方案

**方法A：快速修复（每次打开终端都需要）**
```powershell
# 复制粘贴到PowerShell
$env:Path += ";C:\Users\xjtul\AppData\Local\Programs\Python\Python312"
```

**方法B：永久修复（只需执行一次）**
```powershell
# 以管理员身份运行PowerShell，然后执行：
[Environment]::SetEnvironmentVariable("Path", $env:Path + ";C:\Users\xjtul\AppData\Local\Programs\Python\Python312;C:\Users\xjtul\AppData\Local\Programs\Python\Python312\Scripts", "User")
```

**方法C：使用批处理文件（最简单）**
- 直接双击 `启动交互模式.bat`

---

### 问题2：程序启动失败

#### ❌ 错误信息
```
ModuleNotFoundError: No module named 'xxx'
```

#### ✅ 解决方案
```powershell
# 重新安装Biomni
pip install biomni --upgrade --force-reinstall

# 如果pip有问题
python -m pip install --upgrade pip
python -m pip install biomni --upgrade
```

---

### 问题3：API连接失败

#### ❌ 错误信息
```
APIConnectionError: Connection error.
```

#### ✅ 解决方案

**步骤1：检查API密钥**
```powershell
# 查看配置文件
Get-Content .env | Select-String "API_KEY"

# 应该看到您的API密钥
# 如果是 your_xxx_here，需要修改为真实密钥
```

**步骤2：测试网络连接**
```powershell
# 测试智谱AI连接
Test-NetConnection api.bigmodel.cn -Port 443

# 测试OpenAI连接（如果使用）
Test-NetConnection api.openai.com -Port 443
```

**步骤3：重新配置API密钥**
```powershell
# 编辑配置文件
notepad .env

# 修改API密钥行
ZHIPUAI_API_KEY=您的真实密钥
```

---

### 问题4：编码错误

#### ❌ 错误信息
```
UnicodeEncodeError: 'gbk' codec can't encode byte
```

#### ✅ 解决方案
```powershell
# 设置终端编码
chcp 65001

# 然后重新运行程序
python interactive_mode.py
```

---

### 问题5：程序卡住无响应

#### ❌ 症状
程序启动后长时间无输出

#### ✅ 解决方案

**可能原因1：首次运行初始化**
- 等待10-30秒
- 不要关闭程序

**可能原因2：网络问题**
- 检查网络连接
- 尝试稍后重新运行

**可能原因3：API响应慢**
- 等待更长时间
- 考虑使用其他API提供商

---

### 问题6：批处理文件无法运行

#### ❌ 错误信息
```
系统找不到指定的路径
```

#### ✅ 解决方案

**步骤1：确认文件存在**
```powershell
# 检查文件是否存在
Test-Path "C:\Users\xjtul\Biomni\启动交互模式.bat"
```

**步骤2：检查Python路径**
```powershell
# 检查Python是否存在
Test-Path "C:\Users\xjtul\AppData\Local\Programs\Python\Python312\python.exe"
```

**步骤3：使用终端直接运行**
```powershell
cd C:\Users\xjtul\Biomni
C:\Users\xjtul\AppData\Local\Programs\Python\Python312\python.exe interactive_mode.py
```

---

## 🔧 环境诊断工具

### 完整诊断脚本

创建文件 `diagnose.bat`：
```batch
@echo off
chcp 65001 >nul
echo ====================================
echo   Biomni 环境诊断工具
echo ====================================
echo.

echo [1/5] 检查Python安装...
C:\Users\xjtul\AppData\Local\Programs\Python\Python312\python.exe --version
if %errorlevel% neq 0 (
    echo ❌ Python未找到或路径错误
    goto :error_end
) else (
    echo ✅ Python正常
)

echo.
echo [2/5] 检查pip...
C:\Users\xjtul\AppData\Local\Programs\Python\Python312\python.exe -m pip --version
if %errorlevel% neq 0 (
    echo ❌ pip有问题
    goto :error_end
) else (
    echo ✅ pip正常
)

echo.
echo [3/5] 检查Biomni安装...
C:\Users\xjtul\AppData\Local\Programs\Python\Python312\python.exe -c "import biomni; print('✅ Biomni已安装')"
if %errorlevel% neq 0 (
    echo ❌ Biomni未安装
    echo 💡 运行: pip install biomni --upgrade
    goto :error_end
)

echo.
echo [4/5] 检查配置文件...
if not exist .env (
    echo ❌ .env配置文件不存在
    echo 💡 运行: copy .env.example .env
    goto :error_end
) else (
    echo ✅ 配置文件存在
)

echo.
echo [5/5] 测试API连接...
C:\Users\xjtul\AppData\Local\Programs\Python\Python312\python.exe test_zhipu.py
if %errorlevel% neq 0 (
    echo ⚠️  API连接测试失败，请检查网络和API密钥
) else (
    echo ✅ API连接正常
)

echo.
echo ====================================
echo   诊断完成！
echo ====================================
pause
goto :eof

:error_end
echo.
echo ====================================
echo   诊断发现问题，请参考上述建议
echo ====================================
pause
```

---

## 📋 问题检查清单

使用此清单快速定位问题：

### 环境检查
- [ ] Python 3.10+ 已安装
- [ ] pip 可正常使用
- [ ] Biomni 已安装
- [ ] .env 配置文件存在

### 配置检查
- [ ] API密钥已正确配置
- [ ] 网络连接正常
- [ ] 防火墙允许Python访问网络

### 功能检查
- [ ] 测试脚本可以运行
- [ ] 交互模式可以启动
- [ ] Web界面可以访问

---

## 🆘 获取技术支持

### 自助资源

**查看日志文件：**
```powershell
# 查看错误日志
Get-Content *.log | Select-String -Pattern "Error"

# 查看最近修改的文件
Get-ChildItem -Recurse | Sort-Object LastWriteTime -Descending | Select-Object -First 10
```

**重置环境：**
```powershell
# 1. 卸载Biomni
pip uninstall biomni

# 2. 重新安装
pip install biomni --upgrade

# 3. 测试
python test_zhipu.py
```

### 常用修复命令

```powershell
# 修复路径问题
$env:Path = [System.Environment]::GetEnvironmentVariable("Path", "User") + ";C:\Users\xjtul\AppData\Local\Programs\Python\Python312"

# 修复编码问题
chcp 65001
$env:PYTHONIOENCODING = "utf-8"

# 重新安装依赖
pip install --upgrade pip setuptools wheel
pip install --upgrade biomni
```

---

## 🎓 培训建议

### 对于培训讲师

**准备工作：**
1. 确保所有学员电脑已安装Python
2. 提前配置好环境变量
3. 测试批处理文件是否可用
4. 准备常见问题的解决方案

**培训技巧：**
1. 先演示，后让学员操作
2. 从批处理文件开始，再教终端命令
3. 准备足够的备用方案
4. 鼓励学员记录错误信息

### 对于学员

**学习技巧：**
1. 按顺序学习，不要跳步骤
2. 遇到错误先看指南，再问老师
3. 记录成功的操作步骤
4. 保存好用的命令

---

## 💡 最佳实践

### 预防问题

**1. 使用批处理文件**
- 最简单，最少出错
- 适合初学者

**2. 设置环境变量**
- 一次设置，永久使用
- 提高工作效率

**3. 定期更新**
```powershell
# 每月更新一次
pip install biomni --upgrade
```

### 问题记录

**创建个人问题日志：**
```
日期: 2024-xx-xx
问题: xxx
解决: xxx
耗时: xx分钟
```

---

**🎯 记住：90%的问题都有简单的解决方案！**
