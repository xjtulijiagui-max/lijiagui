# Biomni 学员通用启动说明

这份说明不要写死老师电脑路径。每个学员只需要进入自己的 Biomni 文件夹，再运行启动脚本。

## 1. 进入自己的 Biomni 目录

如果学员的 Biomni 在桌面：

```powershell
cd "C:\Users\你的用户名\Desktop\Biomni"
```

如果在下载目录：

```powershell
cd "C:\Users\你的用户名\Downloads\Biomni"
```

原则：`cd` 后，运行下面命令能看到 `student_cli.py`、`.env`、`biomni` 文件夹：

```powershell
dir
```

## 2. 检查环境

```powershell
python .\student_cli.py --check
```

如果 `python` 不认识，试：

```powershell
py .\student_cli.py --check
```

如果 `python` 和 `py` 都不认识，运行批处理：

```powershell
.\start_biomni_cli.bat
```

## 3. 配置 API Key

在 Biomni 目录里打开 `.env`：

```powershell
notepad .env
```

至少要有：

```env
ZHIPUAI_API_KEY=你的智谱APIKey
BIOMNI_LLM=glm-4-flash
BIOMNI_SOURCE=Custom
BIOMNI_CUSTOM_BASE_URL=https://open.bigmodel.cn/api/paas/v4
```

## 4. 启动交互模式

推荐：

```powershell
python .\student_cli.py
```

或者双击：

```text
start_biomni_cli.bat
```

进入后直接输入问题，例如：

```text
对比 EGFR 19 外显子缺失与 T790M 突变靶向药用药差异、耐药机制
```

退出输入：

```text
quit
```

## 5. 单次提问模式

```powershell
python .\student_cli.py -q "解释什么是 CRISPR-Cas9"
```

## 6. 常见报错

### py 或 python 无法识别

原因：Python 没加入 PATH，或者没有 Python Launcher。

处理：

```powershell
.\start_biomni_cli.bat
```

还不行就重新安装 Python，并勾选 `Add python.exe to PATH`。

### can't open file student_cli.py

原因：当前目录不是 Biomni 目录。

处理：先进入 Biomni 目录：

```powershell
cd "你的Biomni完整路径"
```

### 没有找到 API Key

原因：`.env` 不在当前 Biomni 目录，或者没有写 `ZHIPUAI_API_KEY`。

处理：

```powershell
notepad .env
```

### ModuleNotFoundError

原因：依赖装在另一个 Python 里，当前 Python 找不到。

处理：

```powershell
python -m pip install python-dotenv zhipuai flask gradio
python -m pip install -e .
```

### API 连接失败

先运行：

```powershell
python .\student_cli.py --check
```

再检查：API Key 是否正确、智谱账号是否可用、网络是否能访问 `https://open.bigmodel.cn`。

## 7. 关于 datalake

教学入门阶段可以先跳过完整 datalake 下载。`student_cli.py` 默认使用：

```python
expected_data_lake_files=[]
```

这会加快启动。部分高级工具如果需要特定数据湖文件，之后再单独下载。

## 8. 第一次启动或第一次提问很慢怎么办

慢不一定是模型回答慢，也可能是 Biomni 智能体在启动前做了准备工作：

- 重复启动了多个 Python 进程。
- `A1` 初始化需要导入依赖、加载配置和工具。
- `use_tool_retriever=True` 时，每次提问前会额外把可用工具、数据和库列表发给 LLM 做选择。
- datalake 文件越多，工具/数据检索提示词可能越长，第一次提问更容易慢。

课堂阶段建议优先使用“快速模式”：先稳定跑通问答，需要深度调用工具或数据湖时，再切回完整模式。

可以在 `.env` 里加入：

```env
BIOMNI_FAST_MODE=true
BIOMNI_USE_TOOL_RETRIEVER=false
```

如果要做深度分析，再改成：

```env
BIOMNI_FAST_MODE=false
BIOMNI_USE_TOOL_RETRIEVER=true
```

给学员解释时可以这样说：

> 快速模式像“先直接问老师”，完整模式像“先翻工具书、查目录、再回答”。课堂第一步先让大家跑通，所以用快速模式更合适。

## 9. 让 Codex 帮你改成课堂快版

如果要让 Codex 或其他编程助手优化 `interactive_mode.py`，可以复制下面这段提示词：

```text
请帮我优化 Biomni 的 interactive_mode.py，目标是课堂教学时启动和提问更快、更稳定。

背景：
- 现在第一次启动和第一次提问很慢。
- 主要慢点可能来自 A1 初始化、use_tool_retriever=True、datalake 文件很多时每次问题前检索工具/数据/库列表。
- 学员是新手，不希望他们处理复杂参数。
- 需要保留原有交互式问答体验。

请做这些改动：
1. 默认启用“快速模式”。
2. 快速模式下：
   - A1(use_tool_retriever=False)
   - expected_data_lake_files=[]
   - llm 使用 glm-4-flash
   - source 使用 Custom
   - base_url 使用 https://open.bigmodel.cn/api/paas/v4
   - api_key 从 .env 的 ZHIPUAI_API_KEY 读取
3. 允许通过 .env 覆盖：
   - BIOMNI_USE_TOOL_RETRIEVER=true/false
   - BIOMNI_FAST_MODE=true/false
   - BIOMNI_LLM
   - BIOMNI_SOURCE
   - BIOMNI_CUSTOM_BASE_URL
4. 启动时打印清楚当前模式：
   - 快速模式：适合课堂问答，速度快，但不会主动检索大量工具/数据湖
   - 完整模式：适合深度分析，可能较慢
5. 给初始化步骤加耗时日志：
   - 加载 .env
   - 检查 API Key
   - 创建 A1 Agent
   - 进入交互模式
6. 避免每次问题重新创建 agent；整个进程只创建一次。
7. 出错时给中文提示，不要只打印 traceback。
8. 保持 Windows UTF-8 输出兼容。
9. 不要依赖 Flask/Gradio/Web 前端。
10. 改完后运行一次语法检查。

请尽量小改，不要重构整个项目。
```

如果想把课堂版和原版分开，可以继续让 Codex 新增一个独立入口：

```text
另外请新增一个 student_fast_mode.py，作为给学员使用的稳定入口。它不依赖老师电脑路径，不依赖 Web 前端，只要求放在 Biomni 根目录。默认快速模式，支持 --check 环境检查，支持 -q "问题" 单次提问，也支持交互模式。
```
