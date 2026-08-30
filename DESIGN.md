# Lijiagui Training Portal Design System

## 1. Atmosphere & Identity

这是一个企业培训工作台，不做炫技式展示。页面应该像一份经过认真编排的工作手册：入口明确、顺序可靠、长内容读得下去，也方便学员马上复制执行。识别性来自“蓝色流程轨道”，用连续的步骤标记把分散的提示词串成一条能实际跑通的链路。

## 2. Color

| Role | Token | Value | Usage |
|---|---|---|---|
| Canvas | `--surface-page` | `#f5f8fd` | 页面背景 |
| Primary surface | `--surface-primary` | `#ffffff` | 主要阅读区 |
| Secondary surface | `--surface-secondary` | `#eef5ff` | 提示与选中状态 |
| Dark surface | `--surface-dark` | `#061b46` | 页头与深色导航 |
| Text primary | `--text-primary` | `#15223a` | 标题与正文 |
| Text secondary | `--text-secondary` | `#5f6f89` | 说明与元数据 |
| Text on dark | `--text-on-dark` | `#ffffff` | 深色背景正文 |
| Text on dark muted | `--text-on-dark-muted` | `#cddcff` | 深色背景次级文字 |
| Text on dark soft | `--text-on-dark-soft` | `#d4e2ff` | Hero 导语 |
| Text on dark accent | `--text-on-dark-accent` | `#a9c7ff` | 深色背景提示标签 |
| Informational text | `--text-info` | `#173762` | 信息提示文字 |
| Warning text | `--text-warning` | `#5e3900` | 风险提示文字 |
| Border | `--border-default` | `#d8e4f7` | 分隔线与控件边界 |
| Border strong | `--border-strong` | `#b8c9e4` | 提示词面板边界 |
| Border on dark | `--border-on-dark` | `#6d89bd` | 深色背景控件边界 |
| Accent | `--accent-primary` | `#0f62fe` | 主按钮、链接、当前步骤 |
| Accent hover | `--accent-hover` | `#0043ce` | 悬停与按下状态 |
| Success | `--status-success` | `#16854b` | 复制成功 |
| Warning | `--status-warning` | `#a15c00` | 风险和待确认事项 |
| Warning surface | `--surface-warning` | `#fff6e5` | 风险提示底色 |
| Code surface | `--code-bg` | `#07152e` | Markdown 提示词底色 |
| Code text | `--code-text` | `#e7efff` | Markdown 提示词文字 |

规则：只使用一套蓝色作为交互色；背景层级表达深度，不添加装饰性渐变；新颜色先登记后使用。

## 3. Typography

| Level | Size | Weight | Line Height | Usage |
|---|---|---|---|---|
| Display | `clamp(36px, 6vw, 64px)` | 600 | 1.08 | 页面主标题 |
| H1 | `32px` | 600 | 1.25 | 大区块标题 |
| H2 | `24px` | 600 | 1.35 | 步骤标题 |
| H3 | `18px` | 600 | 1.45 | 卡片与提示标题 |
| Body large | `18px` | 400 | 1.75 | 导语 |
| Body | `16px` | 400 | 1.75 | 正文 |
| Body small | `14px` | 400 | 1.6 | 说明文字 |
| Caption | `12px` | 600 | 1.4 | 标签和元数据 |
| Code | `14px` | 400 | 1.75 | Markdown 提示词 |

主字体使用 `"Microsoft YaHei", "PingFang SC", "Noto Sans SC", Arial, sans-serif`；代码与提示词使用 `"Cascadia Code", "SFMono-Regular", Consolas, monospace`。正文不得小于 14px。

## 4. Spacing & Layout

以 4px 为最小单位，主要使用 8px 递增：`4, 8, 12, 16, 24, 32, 48, 64, 80, 96`。内容最大宽度 1184px，长文阅读列最大宽度 840px。桌面采用 12 列思路，移动端保持 16px 页边距。断点为 640px、768px、1024px。

## 5. Components

- `Masthead`：48px 高深蓝导航，含返回列表与当前页面名；链接具备 hover、focus、active 状态。
- `WorkflowRail`：四步锚点导航；当前或悬停步骤变为主蓝，移动端允许横向滚动。
- `StepSection`：步骤编号、标题、说明与操作区；用背景层级和左侧蓝线表达顺序。
- `PromptPanel`：提示词标题、使用说明、复制按钮、可滚动 Markdown 内容；复制中、成功、失败三种反馈齐全。
- `Callout`：信息、风险、成功三种语义；不能只靠颜色传达含义。
- `CaseLink`：案例标题、来源、外链动作；具备清晰的键盘焦点。
- `Toast`：复制结果提示，使用 `aria-live="polite"`，3 秒内自动消失。

## 6. Motion

动效只服务于状态反馈：按钮 160ms 颜色变化，步骤锚点 180ms 位移与底色变化，Toast 180ms 淡入淡出。禁止滚动监听动画；尊重 `prefers-reduced-motion`，此时关闭平滑滚动和位移动画。

## 7. Depth, Responsive Behavior & Accepted Debt

新页面主要依赖白、浅蓝、浅灰三层背景和 1px 分隔线，不给内容卡片加重阴影。浮层 Toast 可使用一层轻阴影。移动端所有交互目标至少 44px，流程导航横向滚动，提示词保留横向滚动而不压缩字体。仓库内历史页面仍有圆角、渐变和独立配色，本次不做全站迁移；`/ipo` 与新增的 `/list` 卡片保持现有门户兼容，后续页面按本文件执行。
