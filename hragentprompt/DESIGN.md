# HR Agent Prompt Library Design System

## 1. Atmosphere & Identity

这是一个面向 HR 专业人士的能力资产库：克制、可信、可快速定位。标志性体验是从 8 个领域的“能力地图”进入清晰的资源卡片，深绿作为唯一行动色，纸张白与暖灰让长时间检索不疲劳。

## 2. Color

| Role | Token | Value | Usage |
|---|---|---:|---|
| Canvas | `--canvas` | `#f6f5f1` | 页面背景 |
| Surface | `--surface` | `#ffffff` | 卡片、弹窗 |
| Ink | `--ink` | `#18312d` | 标题和主文案 |
| Muted | `--muted` | `#61716c` | 辅助说明 |
| Line | `--line` | `#d9ded8` | 分隔线、描边 |
| Accent | `--accent` | `#0c6b5a` | 主操作、焦点 |
| Accent hover | `--accent-hover` | `#095548` | 主操作悬停 |
| Soft accent | `--accent-soft` | `#e2f0ec` | 标签、筛选状态 |
| Warm marker | `--marker` | `#c7773b` | 编号、二级强调 |
| Error | `--error` | `#b24135` | 密码错误 |

规则：只有可操作元素使用深绿；类别由细线、文本和柔和背景区分，避免多色噪音。

## 3. Typography

| Level | Size | Weight | Line-height | Usage |
|---|---:|---:|---:|---|
| Display | `clamp(2.25rem, 5vw, 4.75rem)` | 750 | 1.03 | 首屏标题 |
| H2 | `1.25rem` | 700 | 1.35 | 卡片标题 |
| Body | `1rem` | 400 | 1.65 | 默认正文 |
| Small | `.8125rem` | 500 | 1.45 | 标签和元信息 |
| Overline | `.6875rem` | 700 | 1.3 | 分区标签 |

字体：`"Noto Sans SC", "Microsoft YaHei", system-ui, sans-serif`；数字使用 `ui-monospace, "Cascadia Code", monospace`。正文不低于 14px。

## 4. Spacing & Layout

基础单位为 4px。使用 `--s1:4px`、`--s2:8px`、`--s3:12px`、`--s4:16px`、`--s5:20px`、`--s6:24px`、`--s8:32px`、`--s10:40px`、`--s12:48px`、`--s16:64px`、`--s20:80px`。

内容最大宽度 1440px；桌面采用 12 列网格，卡片为 3 列，平板 2 列，手机 1 列。断点：768px、1080px。

## 5. Components

### Domain navigation

Desktop and tablet use a selectable, sticky left-side domain navigation with search above the domain choices. The selected domain is filled with `--accent`; hover and focus use the existing border and accent tokens. Below 640px, the sidebar becomes a normal-flow search-and-horizontal-choice strip so the catalog remains one-column and reachable.

CJK display and card titles use neutral letter spacing (`0`) to keep Chinese glyphs clear and avoid unnatural wrapping. The sidebar stays left-aligned through tablet widths and changes to the horizontal mobile strip below 640px.
- **Structure**：按钮组 + 计数。
- **States**：默认、hover、active、focus；键盘可达。
- **Motion**：150ms 色彩与边框过渡。

### Resource card
- **Structure**：领域标签、编号、标题、简介、资源标识、操作区。
- **Variants**：`legacy`（历史提示词）与 `matrix`（Skill + 制作提示词）。
- **States**：默认、hover、focus-within、筛选隐藏。
- **Accessibility**：卡片标题为 h3，下载按钮清晰说明文件类型。

### Password dialog
- **Structure**：原生 dialog、输入框、错误提示、确认/取消按钮。
- **States**：默认、错误、焦点、关闭。
- **Accessibility**：模态焦点由原生 dialog 管理；密码输入有 label 和 `aria-live` 错误区。

## 6. Motion & Interaction

筛选和按钮只使用颜色、`transform`、`opacity`，时长 150ms。资源卡悬停上移 2px；减少动态偏好下禁用非必要过渡。筛选后更新可见资源数量，下载密码正确后才开始导航。

## 7. Depth & Surface

采用 **mixed**：卡片使用 1px `--line` 描边和单一柔和阴影 `0 14px 35px rgba(24,49,45,.07)`；弹窗使用更明显的同色阴影。所有表面保持同一光源方向。
