# WorkBuddy 从入门到精通｜课堂练习台设计系统

## 1. Atmosphere & Identity

这是一张面向企业课堂的“能力进阶工作台”。视觉延续上一场 WorkBuddy 公开课的蓝白体系，但结构从“六步场景创新”改为“五关能力训练”。页面不做营销落地页，也不使用装饰性大图；记忆签名是左侧连续进度线，以及每关都能产出一份可带走的文字成果。

## 2. Color

| Role | Token | Value | Usage |
|---|---|---|---|
| Canvas | `--canvas` | `#F2F6FB` | 页面底色 |
| Paper | `--paper` | `#FFFFFF` | 卡片、输入区 |
| Ink | `--ink` | `#102A43` | 标题、正文 |
| Muted | `--muted` | `#4B6078` | 辅助说明 |
| Primary | `--primary` | `#075FCB` | 主按钮、进度 |
| Primary dark | `--primary-dark` | `#08458F` | hover、深色强调 |
| Pale | `--pale` | `#E7F1FD` | 弱强调、完成态 |
| Strong pale | `--pale-strong` | `#BCD7F7` | focus、选中 |
| Night | `--night` | `#0C2C4A` | Hero、页脚 |
| Line | `--line` | `#D6E2EF` | 分隔、边框 |
| Success | `--success` | `#176B52` | 已保存、已完成 |
| Warning | `--warning` | `#9A5A12` | 待补充提示 |

颜色只从 CSS 变量读取；状态同时有文字或图形变化，不能只靠颜色。

## 3. Typography

- 字体栈：`Microsoft YaHei`, `PingFang SC`, `Noto Sans SC`, sans-serif。
- Display：`clamp(40px, 5vw, 68px)`，800，行高 1.08。
- Section：`clamp(28px, 3.5vw, 44px)`，800，行高 1.18。
- Card title：20px，800，行高 1.35。
- Body large：17px，行高 1.75。
- Body：14px，行高 1.75。
- Caption：12px，700，行高 1.5。
- 中文使用自然断行；标题使用 `text-wrap: balance`，禁止 `break-all`。

## 4. Spacing & Layout

- 基础单位 4px；间距只使用 4、8、12、16、20、24、32、40、48、64、80。
- 最大宽度 1440px；桌面左右留白 24px，手机 14px。
- 桌面：240px 训练导航 + 主内容；小于 980px 变为单列。
- 练习卡内部最多两列；小于 720px 全部单列。
- 平板隐藏顶部快捷导航，保留下方五关索引，避免导航文字挤压换行。
- 手机端标题按语义断行；评分表显示横滑提示、右侧渐隐，并固定任务名称列。
- 长页面练习卡使用 `content-visibility: auto` 和固有尺寸占位，减少移动端首屏渲染成本，不隐藏内容。

## 5. Components

### StageNavigation

- 五关导航、完成状态与原生 progress。
- 状态：default、current、completed、focus。

### ExerciseCard

- 标题、目标、完成条件、输入区域、动作区。
- 状态：default、edited、completed、focus。

### TaskBuilder

- 五项任务输入与实时任务卡预览。
- 状态：empty、partial、ready。

### ScoreTable

- 五行任务、四项 1—5 评分、自动计算总分与 TOP1。
- 状态：empty、scored、top。

### ResourceLinkCard

- 课程案例、项目协同和外部实战入口；标题、用途说明和主按钮三层结构。
- 状态：default、hover、focus、visited。

### PromptWorkbench

- 可编辑提示词、一键复制、恢复默认。
- 状态：default、edited、copied、copy-failed。

### SkillCanvas

- 场景、IPO、SOP、边界、测试五个区域；可复制与下载 Markdown。
- 状态：partial、ready、downloaded。

### LearningRecordDownload

- 五项未全部完成时禁用；完成后下载包含作业内容、五项完成状态、TOP1 和参考链接的 Markdown 学习记录。
- 状态：disabled、ready、downloaded。

### Toast

- 固定反馈区域，`role=status`，`aria-live=polite`。

## 6. Motion & Interaction

- 交互反馈 160ms，Toast 220ms，缓动 `cubic-bezier(.16,1,.3,1)`。
- 只动画 `transform` 与 `opacity`。
- 尊重 `prefers-reduced-motion`。
- 只为复制、完成、导航、保存和下载提供反馈，不添加装饰动画。

## 7. Depth & Surface

- 主卡片使用 1px 边框、轻微 `0 1px 0 rgba(16,42,67,.04)`。
- Hero 使用深蓝底、两层径向光晕和细网格，体现工作台层次。
- 完成态使用浅蓝内描边；Toast 使用唯一的明显阴影。
