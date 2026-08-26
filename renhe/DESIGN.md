# 仁和人寿新员工 AI 练习台设计系统

## 1. Atmosphere & Identity

这是一张适合课堂投屏、也能让学员课后独立使用的训练工作台。整体要有保险企业培训材料的稳重感，但不做成规章汇编。视觉签名来自参考图中的“蓝色标题带”：它被延展成页首主带、任务编号和分区标题，让三类训练像一套连贯的课程，而不是三张互不相干的卡片。

## 2. Color

| Role | Token | Value | Usage |
|---|---|---|---|
| Brand/deep | `--brand-deep` | `#082b66` | 页首、深色提示词区 |
| Brand/main | `--brand-main` | `#0d66c2` | 参考图蓝色标题带、主按钮 |
| Brand/strong | `--brand-strong` | `#0955a5` | hover、编号 |
| Brand/pale | `--brand-pale` | `#edf5fd` | 浅蓝内容面 |
| Brand/mist | `--brand-mist` | `#f5f9fe` | 页面背景 |
| Surface | `--surface` | `#fffefd` | 主要内容面 |
| Surface/soft | `--surface-soft` | `#f8fbff` | 文件行、说明区 |
| Text/primary | `--text-primary` | `#17253b` | 正文与标题 |
| Text/secondary | `--text-secondary` | `#5c6d84` | 辅助说明 |
| Text/inverse | `--text-inverse` | `#f7fbff` | 深色背景文字 |
| Border | `--border` | `#d8e5f3` | 分隔、表单与文件行 |
| Success | `--success` | `#16794d` | 下载按钮、完成反馈 |
| Success/hover | `--success-hover` | `#10643f` | 下载按钮 hover |
| Warning/surface | `--warning-surface` | `#fff8e8` | 教学模拟提醒 |
| Warning/border | `--warning-border` | `#e6c978` | 提醒边框 |
| Focus | `--focus` | `#78aee4` | 键盘焦点环 |
| Prompt | `--prompt` | `#0e1f38` | 提示词代码框 |
| Prompt/text | `--prompt-text` | `#e5eef8` | 提示词正文 |
| Shadow | `--shadow-color` | `rgba(8, 43, 102, 0.12)` | 悬浮与 Toast |

规则：所有色值只在这一套 token 中出现；强调色主要服务操作和导航，不使用大面积红橙色。

## 3. Typography

| Level | Size | Weight | Line Height | Usage |
|---|---:|---:|---:|---|
| Display | `clamp(32px, 5vw, 52px)` | 800 | 1.15 | 页首标题 |
| H1 | `32px` | 800 | 1.25 | 大区块标题 |
| H2 | `24px` | 800 | 1.35 | 任务标题 |
| H3 | `17px` | 750 | 1.5 | 内容小标题 |
| Lead | `18px` | 400 | 1.8 | 页首导语 |
| Body | `15px` | 400 | 1.75 | 正文 |
| Small | `13px` | 500 | 1.6 | 标签、说明 |
| Caption | `12px` | 600 | 1.5 | 元数据 |

- 标题字体：`STKaiti`, `KaiTi`, `FangSong`, serif，用于呼应参考图的培训课件气质，仅用于少量展示标题。
- 正文字体：`Microsoft YaHei`, `PingFang SC`, `Noto Sans SC`, sans-serif。
- 提示词等宽字体：`Cascadia Code`, `Microsoft YaHei`, monospace。
- 中文标题使用语义短语并设置平衡换行，避免单字孤行。

## 4. Spacing & Layout

- 基础单位：4px。
- `--space-1` 4px；`--space-2` 8px；`--space-3` 12px；`--space-4` 16px；`--space-5` 20px；`--space-6` 24px；`--space-8` 32px；`--space-10` 40px；`--space-12` 48px；`--space-16` 64px。
- 内容宽度：1180px；桌面左右留白 24px，手机 16px。
- 断点：640px、840px、1080px。
- 页面节奏：开场简短，三类能力导航在首屏露出；任务正文采用开放式区段和细分隔，不把所有内容层层装进卡片。

## 5. Components

### HeroBand

- **Structure**：眉题、主标题、导语、三个训练概览、教学模拟说明。
- **States**：静态；概览链接支持 hover、active、focus。
- **Spacing**：`--space-8` 至 `--space-16`。
- **Accessibility**：语义化 `header` 与 `nav`，文字对比度满足正文阅读。

### ScenarioNav

- **Structure**：编号、短标题、能力关键词。
- **Variants**：三类任务；手机改为纵向。
- **States**：default、hover、active、focus-visible。
- **Motion**：只对真实链接做 180ms 的 transform/颜色反馈。

### TaskSection

- **Structure**：任务标题带、用户故事、目标、路径、文件、提示词、提交物。
- **Variants**：材料、数据、知识库。
- **States**：静态；内部操作元素有完整交互态。
- **Accessibility**：每节独立 `section`，标题与锚点对应。

### FileRow

- **Structure**：文件序号、文件名、用途、下载链接。
- **States**：default、hover、active、focus-visible；无 disabled/loading，因为文件是静态资源。
- **Accessibility**：真实 `a[download]`，下载语义写入可见标签。

### PromptPanel

- **Structure**：提示词标题、复制按钮、`pre` 内容。
- **States**：default、focus、copied、error；复制失败时显示可读反馈。
- **Accessibility**：按钮有可访问名称；Toast 使用 `role=status`。

### ToolLink

- **Structure**：工具名称、外链图标、说明。
- **States**：default、hover、active、focus-visible。
- **Accessibility**：外链带 `rel=noopener`，不使用图标代替文字。

## 6. Motion & Interaction

- Micro：120ms ease-out，用于按钮按压。
- Standard：180ms cubic-bezier(0.16, 1, 0.3, 1)，用于 hover 与 Toast。
- 只动画 `transform` 和 `opacity`；页面无装饰性滚动动画。
- `prefers-reduced-motion: reduce` 时取消平滑滚动与所有变换。

## 7. Depth & Surface

采用 mixed 策略，但阴影仅用于悬浮操作和 Toast。主要层级靠蓝色标题带、浅蓝面与细边框建立。任务主体不使用大面积浮卡，以免长页面像模板化仪表盘。

- Default border：`1px solid var(--border)`。
- Rest shadow：无。
- Interactive shadow：`0 12px 28px var(--shadow-color)`。
