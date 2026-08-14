# WorkBuddy 零售银行实战练习台 Design System

## 1. Atmosphere & Identity

这是一个清晰、可信、可审计的银行业务实训台，不追求营销页式炫技。页面借鉴 IBM Carbon 的矩形结构、蓝色交互语义和分层灰面，同时用更克制的编辑式排版降低课堂投屏时的认知负担。识别性签名是“审计轨道”：任务始终沿着“资料 → IPO → SOP → Skill”向前推进，每个阶段都能看见输入、边界与产出。

## 2. Color

### Palette

| Role | Token | Light | Usage |
|---|---|---|---|
| Canvas | `--wb-canvas` | `#ffffff` | 页面主背景 |
| Surface/soft | `--wb-surface-soft` | `#f4f4f4` | 交替区块、下载条目 |
| Surface/info | `--wb-surface-info` | `#edf5ff` | 教学提示、选中状态 |
| Ink/primary | `--wb-ink` | `#161616` | 标题、正文 |
| Ink/secondary | `--wb-muted` | `#525252` | 说明、元数据 |
| Border | `--wb-border` | `#c6c6c6` | 分隔线、描边 |
| Brand/navy | `--wb-navy` | `#0b3a7e` | 页头、银行语境锚点 |
| Accent | `--wb-accent` | `#0f62fe` | 主按钮、链接、焦点 |
| Accent/hover | `--wb-accent-hover` | `#0043ce` | 悬停 |
| Accent/active | `--wb-accent-active` | `#002d9c` | 按下 |
| Success | `--wb-success` | `#198038` | 复制成功、完成状态 |
| Warning | `--wb-warning` | `#8e6a00` | 风险提示文字 |
| Warning/surface | `--wb-warning-surface` | `#fff8d6` | 风险提示背景 |
| Error | `--wb-error` | `#da1e28` | 错误状态 |

### Rules

- 蓝色只用于交互、导航锚点与信息状态，不作大面积装饰。
- 深度通过白、灰、浅蓝三层背景切换形成，卡片不使用阴影。
- 任何新增颜色必须先进入本表。

## 3. Typography

### Scale

| Level | Size | Weight | Line Height | Usage |
|---|---:|---:|---:|---|
| Display | `clamp(2rem, 5vw, 3.75rem)` | 300 | 1.15 | Hero 标题 |
| H1 | `2rem` | 400 | 1.25 | 主章节 |
| H2 | `1.5rem` | 400 | 1.35 | 任务标题 |
| H3 | `1.25rem` | 600 | 1.4 | 区块标题 |
| Body/lg | `1.125rem` | 400 | 1.65 | 引导文字 |
| Body | `1rem` | 400 | 1.65 | 正文 |
| Body/sm | `0.875rem` | 400 | 1.55 | 说明 |
| Caption | `0.75rem` | 500 | 1.4 | 标签、元数据 |
| Code | `0.875rem` | 400 | 1.7 | 提示词 |

### Font Stack

- Primary: `"IBM Plex Sans", "Noto Sans SC", "Microsoft YaHei UI", system-ui, sans-serif`
- Mono: `"IBM Plex Mono", Consolas, "Microsoft YaHei UI", monospace`

### Rules

- 中文标题优先保持完整语义短语，容器使用合理宽度与 `text-wrap: balance`。
- 正文最小 14px；提示词在手机端允许自然换行，不横向截断。
- 只使用 300、400、600 三种字重。

## 4. Spacing & Layout

### Base Unit

以 4px 为基础单位，主要布局优先采用 8px 倍数。

| Token | Value | Usage |
|---|---:|---|
| `--space-1` | 4px | 微间距 |
| `--space-2` | 8px | 图标与标签 |
| `--space-3` | 12px | 紧凑内边距 |
| `--space-4` | 16px | 标准内边距 |
| `--space-6` | 24px | 区块内距 |
| `--space-8` | 32px | 任务内容分组 |
| `--space-12` | 48px | 主区块节奏 |
| `--space-16` | 64px | 页面级分隔 |
| `--space-20` | 80px | Hero 上下留白 |

### Grid

- Max content width: `1200px`
- 桌面：12 列概念网格，主要内容为 7:5 或 8:4 分配。
- 平板：双列优先，操作区按内容折行。
- 手机：单列，左右页边距 16px。
- Breakpoints: 640px、768px、1024px。

### Rules

- 页面不用无目的卡片网格；同一任务的信息保持在一个连续区块中。
- 下载资料、步骤、提示词用不同表面层级区分，不叠加阴影。

## 5. Components

### Masthead

- **Structure**: `<header>` 内含品牌标识、训练主题和返回导航链接。
- **Variants**: 深色主页头；浅色粘性任务导航。
- **States**: 链接默认、hover、active、focus。
- **Accessibility**: `<nav aria-label>`；移动端自然换行，不隐藏关键入口。

### ActionButton

- **Structure**: 语义化 `<a>` 或 `<button>`，文字加方向箭头 SVG。
- **Variants**: primary、secondary、ghost、download。
- **Spacing**: 高度至少 48px，内边距 `--space-4`。
- **States**: default、hover、active、focus-visible、disabled、success。
- **Accessibility**: 对比度达标；外链有 `target="_blank" rel="noopener"`；图标隐藏于读屏器。
- **Motion**: 120ms 颜色与位移反馈；按下仅 `transform: translateY(1px)`。

### TaskRail

- **Structure**: 有序列表，序号、标题、产出三段式。
- **Variants**: Hero 概览、任务内步骤。
- **States**: 默认、当前步骤、完成提示；无交互时不添加悬停动画。
- **Accessibility**: 保持 DOM 顺序与视觉顺序一致。

### DownloadRow

- **Structure**: 文件名、用途、格式标签、下载链接。
- **Variants**: 单文件、整包。
- **States**: default、hover、focus、missing（只用于 QA，不在产品页出现）。
- **Accessibility**: 链接写明文件名和格式，不只写“下载”。

### PromptPanel

- **Structure**: 标题、用途说明、复制按钮、`<pre><code>`。
- **Variants**: 标准任务提示词、Skill Creator 提示词。
- **States**: default、copying、success、error。
- **Accessibility**: 复制状态通过 `aria-live` 通知；代码块可键盘选择。

### Notice

- **Structure**: 标题与一段说明。
- **Variants**: info、warning、success。
- **States**: 静态；不使用无意义动画。
- **Accessibility**: warning 使用 `role="note"`，不单靠颜色表达。

## 6. Motion & Interaction

| Type | Duration | Easing | Usage |
|---|---:|---|---|
| Micro | 120ms | ease-out | 按钮、链接 |
| Standard | 240ms | ease-in-out | 粘性导航当前态、复制反馈 |
| Emphasis | 480ms | `cubic-bezier(0.16, 1, 0.3, 1)` | 首屏内容一次性进入 |

- 只动画 `transform` 与 `opacity`，颜色变化除外。
- `prefers-reduced-motion: reduce` 时关闭进入动画与平滑滚动。
- 非交互内容不设置悬停位移；流程轨道不做装饰性循环动画。

## 7. Depth & Surface

采用 **tonal-shift**：白色主背景、灰色资料层、浅蓝提示层。常规内容无阴影；仅复制反馈 Toast 作为临时浮层可使用 `0 2px 6px rgba(0,0,0,.24)`。按钮、下载条目与任务区均保持 0px 或 2px 圆角，避免消费级“胶囊卡片”感。

