# WorkBuddy 业务场景创新练习台设计系统

## 1. Atmosphere & Identity

页面是一张克制、可信、可立即动手的企业 AI 训练工作台。结构复用 `med/` 的“长流程练习台”语言，颜色承接授课 PPT 的深蓝体系。记忆签名是“一张桌、两种脑、三类外援，六步把场景做成结果”：它同时出现在 Hero、步骤导航和结尾行动区。

## 2. Color

| Role | Token | Value | Usage |
|---|---|---|---|
| Canvas | `--canvas` | `#F3F6FA` | 页面背景 |
| Paper | `--paper` | `#FEFFFF` | 卡片、输入区域 |
| Text primary | `--ink` | `#102A43` | 标题与正文 |
| Text muted | `--muted` | `#42566D` | 说明与元信息；满足浅色表面正文对比度 |
| Accent primary | `--teal` | `#0A4FA8` | 主按钮、步骤、进度 |
| Accent hover | `--teal-dark` | `#083E85` | 主按钮 hover |
| Accent pale | `--mint` | `#E2EEFC` | 步骤底、完成态 |
| Accent stronger | `--mint-strong` | `#BDD4F3` | focus ring、顶部分色 |
| Link | `--blue` | `#2563A9` | 工具与作者链接 |
| Warning | `--amber` | `#B36A12` | 已编辑状态 |
| Warning surface | `--amber-soft` | `#FFF1D6` | 修改提示 |
| Border | `--line` | `#D9E3EE` | 卡片和分隔线 |
| Night | `--night` | `#0C2434` | 准备栏与页脚 |
| Error | `--danger` | `#A73B35` | 错误反馈 |

颜色仅通过以上 CSS 变量使用；状态不能只靠颜色表达。

## 3. Typography

| Level | Size | Weight | Line Height | Usage |
|---|---:|---:|---:|---|
| Display | `clamp(42px,5.5vw,76px)` | 800 | 1.05 | Hero |
| Section | `clamp(30px,4vw,52px)` | 800 | 1.12 | 大章节 |
| Card title | `21px` | 800 | 1.3 | 提示词卡 |
| Body large | `18px` | 400 | 1.65 | Hero 引导 |
| Body | `14px` | 400 | 1.7 | 提示词与正文 |
| Small | `13px` | 400 | 1.65 | 说明 |
| Caption | `12px` | 800 | 1.4 | 标签与状态 |

字体栈：`Microsoft YaHei`, `PingFang SC`, `Noto Sans SC`, sans-serif。中文标题使用 `text-wrap: balance`，正文使用 `word-break: normal` 与 `overflow-wrap: anywhere`，禁止单字孤行和 `break-all`。

## 4. Spacing & Layout

- 基础单位为 4px；间距变量：4、8、12、16、20、24、32、40、48、64、80px。
- 最大内容宽度 1440px，桌面外边距 24px，手机 14px。
- 桌面：250px 步骤栏 + 自适应内容区；平板与手机改为单列。
- Hero：桌面双列，≤980px 单列；提示词正文双列指导块，≤720px 单列。

## 5. Components

### TopNavigation
- **Structure**：品牌入口、课程导航、作者介绍外链。
- **States**：default、hover、focus-visible；作者链接新窗口打开。
- **Accessibility**：语义化 `header/nav`，外链带 `noopener`。

### PromptCard
- **Structure**：编号、标题、摘要、工具入口、练习目标、修改位置、可编辑提示词、操作按钮。
- **Variants**：六步方法卡、业务案例卡、完成态。
- **States**：default、edited、completed、focus、copy success/failure。
- **Accessibility**：每个 textarea 有 label，按钮使用真实 `button`。

### DownloadCard
- **Structure**：资料类型、文件名、用途、下载按钮、模拟数据声明。
- **States**：default、hover、focus。
- **Accessibility**：真实文件链接，文件名即下载名。

### ProgressPanel
- **Structure**：完成数、文字说明、原生 progress。
- **States**：0—9，状态持久化到本地浏览器。

### Toast
- **Structure**：固定状态反馈。
- **States**：hidden、shown、copy success、copy failure。
- **Accessibility**：`role=status`、`aria-live=polite`。

## 6. Motion & Interaction

- 微交互 160ms，强调反馈 220ms，缓动 `cubic-bezier(.16,1,.3,1)`。
- 只动画 `transform` 与 `opacity`；按钮按下使用 `scale(.98)`。
- 尊重 `prefers-reduced-motion: reduce`。
- 所有动作必须对应复制、完成、准备状态或焦点提示，不添加装饰动画。

## 7. Depth & Surface

采用 mixed 策略：卡片以 1px 边框和轻微 `0 1px 0 rgba(16,42,67,.03)` 区分；完成态用双层浅蓝描边；Toast 使用显著阴影。正文区域不使用大面积投影。
