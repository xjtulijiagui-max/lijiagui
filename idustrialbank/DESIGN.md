# 兴业银行三项AI实战练习 Design System

## 1. Atmosphere & Identity

这是一个给支行长和业务骨干使用的课堂任务工作台。气质稳、清楚、可信，像一张放在会议桌上的蓝色业务作战卡。页面识别点是深蓝任务轨道：三个任务按“输入材料 → AI处理 → 业务输出”串联，每一段都能直接下载资料、复制提示词并开始练习。

## 2. Color

| Role | Token | Value | Usage |
|---|---|---|---|
| Navy | `--navy` | `#061B46` | Hero、深色提示词区 |
| Blue | `--blue` | `#0A43C8` | 主按钮、链接、任务编号 |
| Bright | `--bright` | `#155EEF` | 焦点环、强调数字 |
| Pale | `--pale` | `#EEF5FF` | 用户故事、步骤背景 |
| Surface | `--surface` | `#FFFFFF` | 主卡片 |
| Background | `--background` | `#F5F8FD` | 页面背景 |
| Ink | `--ink` | `#15223A` | 正文与标题 |
| Muted | `--muted` | `#5F6F86` | 说明、元数据，浅底对比度高于4.5:1 |
| Line | `--line` | `#D8E4F7` | 边框与分隔 |
| Success | `--success` | `#147A55` | 下载完成、练习资料 |
| Warning | `--warning` | `#9A5B00` | 数据边界与注意事项 |

规则：蓝色只用于交互与结构强调；绿色只用于下载；橙色只用于边界提示。页面不使用红色装饰。

半透明状态色统一由 `--hero-*`、`--nav-glass`、`--prompt-border` 管理；深色提示词正文使用 `--code-text #E7EFFF`，组件内不散落颜色常量。

## 3. Typography

| Level | Desktop | Tablet | Mobile | Weight | Line Height |
|---|---:|---:|---:|---:|---:|
| Display | 40px | 34px | 29px | 800 | 1.15 |
| H2 | 25px | 24px | 22px | 750 | 1.35 |
| H3 | 18px | 18px | 17px | 700 | 1.45 |
| Body large | 17px | 17px | 16px | 400 | 1.75 |
| Body | 15px | 15px | 15px | 400 | 1.7 |
| Small | 13px | 13px | 13px | 400 | 1.6 |
| Caption | 12px | 12px | 12px | 600 | 1.5 |

字体：`Microsoft YaHei, PingFang SC, Noto Sans SC, Arial, sans-serif`。提示词使用同一字体，避免课堂投屏时中英文字形跳变。

移动端标题中的业务复合词使用 `.no-break` 保护，保证“练习台”“支行得分”“全国支行评比”“对公业务机会”不被拆开。

## 4. Spacing & Layout

基础单位为4px。令牌：`--space-1:4px`、`--space-2:8px`、`--space-3:12px`、`--space-4:16px`、`--space-5:20px`、`--space-6:24px`、`--space-8:32px`、`--space-10:40px`、`--space-12:48px`、`--space-16:64px`。

- 最大内容宽度：1180px。
- 桌面：12列逻辑网格，任务内容以5/7双栏展开。
- 768px及以下：用户故事、步骤和提示词改为单列。
- 640px及以下：页边距16px，任务导航横向滚动，按钮保持44px最小触控高度。

## 5. Components

### Hero
- **Structure**：课程标签、标题、说明、3个任务统计、数据安全提示。
- **States**：静态；链接具备hover、focus、active。
- **Accessibility**：唯一H1；背景与白字对比满足AA。

### Task Navigation
- **Structure**：三个锚点按钮和“返回训练导航”。
- **States**：default、hover、focus、active；当前任务用`aria-current`更新。
- **Motion**：120ms颜色与位移反馈，只使用transform与opacity。

### Task Panel
- **Structure**：任务编号、标题、用户故事、练习目标、四步路径、资料下载、提示词、交付标准。
- **Variants**：考核、评比、对公商机。
- **States**：静态、目标锚点高亮。
- **Accessibility**：section使用`aria-labelledby`，标题层级连续。

### Download Card
- **Structure**：文件名、用途、格式、下载链接。
- **States**：default、hover、focus、active。
- **Accessibility**：真实`a[download]`，文件类型写入可见文本。

### Prompt Card
- **Structure**：提示词标题、代码框、复制按钮。
- **States**：default、hover、focus、copied、error。
- **Accessibility**：按钮反馈写入`aria-live`；代码框支持完整选择，也可用键盘聚焦滚动，并带独立区域标签与高对比焦点环。

### Step Track
- **Structure**：1下载、2上传、3复制、4生成。
- **States**：静态。
- **Responsive**：桌面四列，移动单列。

## 6. Motion & Interaction

| Type | Duration | Easing | Usage |
|---|---:|---|---|
| Micro | 120ms | ease-out | 按钮、链接、复制反馈 |
| Standard | 220ms | ease-in-out | 锚点高亮、toast出现 |

只动画`transform`和`opacity`。`prefers-reduced-motion`下关闭平滑滚动和位移动效。

## 7. Depth & Surface

采用mixed策略：卡片默认使用`1px solid var(--line)`与轻微阴影`0 4px 14px rgba(23,54,99,.035)`；Hero使用深蓝多停点渐层；悬停卡片使用`0 12px 34px rgba(17,57,122,.09)`。圆角只使用8px、12px、16px三个级别。

来源：令牌、字体、卡片、按钮、三列/两列/单列响应式结构均从现有`/lijiagui/list/`运行时样式提取；练习组件结构遵循“课堂练习网页生成器”标准。
