# AI 总裁班实战训练台 Design System

## 1. Atmosphere & Identity

一座“经营者的 AI 作战室”：稳重、克制、可决策，同时保留现场共创的行动感。视觉签名是深墨蓝底上的青绿色进度线与大号数字，让战略、场景和落地三层成果像同一张作战地图。

## 2. Color

### Palette

| Role | Token | Value | Usage |
|---|---|---|---|
| Surface/primary | `--surface-primary` | `#F3F6F2` | 页面背景 |
| Surface/secondary | `--surface-secondary` | `#FEFFFC` | 卡片与输入区 |
| Surface/elevated | `--surface-elevated` | `#FBFCF9` | 提示词与下载面板 |
| Surface/dark | `--surface-dark` | `#0C2434` | Hero、页脚 |
| Text/primary | `--text-primary` | `#102A43` | 标题与正文 |
| Text/secondary | `--text-secondary` | `#617489` | 说明文字 |
| Text/inverse | `--text-inverse` | `#FEFFFC` | 深色背景文字 |
| Border/default | `--border-default` | `#D9E3E4` | 卡片边界 |
| Border/strong | `--border-strong` | `#446271` | 深色按钮边界 |
| Accent/primary | `--accent-primary` | `#087E78` | 核心操作与进度 |
| Accent/hover | `--accent-hover` | `#066D68` | 悬停态 |
| Accent/soft | `--accent-soft` | `#DDF4ED` | 标签与提示 |
| Accent/blue | `--accent-blue` | `#2563A9` | 工具入口与链接 |
| Status/success | `--status-success` | `#1B7F5A` | 完成态 |
| Status/warning | `--status-warning` | `#8A641A` | 教学提示 |
| Status/error | `--status-error` | `#B33A3A` | 错误反馈 |

### Rules

- 青绿色仅用于行动、完成状态和 AI 介入点，不作大面积装饰。
- 深墨蓝负责管理者语境与首屏重量；主体保持暖白，适合长时间投屏。
- 不引入表外颜色；状态和交互必须保持可读对比度。

## 3. Typography

### Scale

| Level | Size | Weight | Line Height | Tracking | Usage |
|---|---:|---:|---:|---:|---|
| Display | `62px / 48px / 32px` | 700 | 1.05—1.1 | 0 | Hero 主标题，按桌面/平板/手机断点阶梯缩放 |
| H1 | `52px / 42px / 34px` | 700 | 1.12 | 0 | 大模块标题，按桌面/平板/手机断点阶梯缩放 |
| H2 | `30px` | 700 | 1.2 | 0 | 子模块标题 |
| H3 | `21px` | 700 | 1.35 | 0 | 卡片标题 |
| Body/lg | `18px` | 400 | 1.7 | 0 | 导语 |
| Body | `16px` | 400 | 1.65 | 0 | 正文 |
| Body/sm | `14px` | 400 | 1.6 | 0 | 次级信息 |
| Caption | `12px` | 600 | 1.45 | 0.03em | 标签 |
| Overline | `11px` | 700 | 1.35 | 0.12em | 英文眉题 |

### Font Stack

- Primary: `"Microsoft YaHei", "PingFang SC", "Noto Sans SC", system-ui, sans-serif`
- Mono: `"Cascadia Code", "SFMono-Regular", Consolas, monospace`

### Rules

- 中文标题避免一字孤行；标题按桌面、平板、手机断点使用固定阶梯字号。
- 正文不小于 14px，提示词编辑区保持 14px / 1.7。

## 4. Spacing & Layout

### Base Unit

所有间距以 4px 为基础：`--space-1` 4px、`--space-2` 8px、`--space-3` 12px、`--space-4` 16px、`--space-5` 20px、`--space-6` 24px、`--space-8` 32px、`--space-10` 40px、`--space-12` 48px、`--space-16` 64px、`--space-20` 80px、`--space-24` 96px。

### Grid

- Max content width: 1240px
- Desktop: 12-column concept, 24px gutters, 24px outer margin
- Tablet: 24px margin, navigation becomes horizontal scroll
- Mobile: 16px margin, single column
- Breakpoints: 640px / 768px / 1024px / 1280px

### Rules

- 练习卡采用内容驱动高度，不使用固定高度。
- 桌面端保持侧边步骤导航；1024px 以下改为顶部任务条。

## 5. Components

### Pill Button

- **Structure**: semantic `button` or `a` + optional inline SVG + label
- **Variants**: primary, inverse, ghost, tool, download
- **Spacing**: `--space-2` × `--space-4`
- **States**: default, hover translateY(-1px), active translateY(0), focus 3px accent ring, disabled 55% opacity, loading swaps label, error status message
- **Accessibility**: visible focus, 44px minimum target, descriptive label
- **Motion**: 140ms transform/opacity/color

### Section Header

- **Structure**: overline + heading + lead + optional action row
- **Variants**: light, dark
- **Spacing**: `--space-2`, `--space-5`, `--space-8`
- **States**: static; actions inherit button states
- **Accessibility**: ordered heading levels, no decorative text in heading
- **Motion**: no decorative motion

### Exercise Card

- **Structure**: number rail + header + goal/meta + editable prompt + actions + optional downloads
- **Variants**: strategy, scene, presentation, completed
- **Spacing**: `--space-6` / `--space-8`
- **States**: default, focus-within accent border, completed success rail, error inline status; empty prompt shows guidance
- **Accessibility**: article landmark, labelled textarea, buttons adjacent to affected control
- **Motion**: completion mark fades/scales in 220ms

### Download Card

- **Structure**: file type + title + description + real download link
- **Variants**: markdown, csv, pptx, zip
- **Spacing**: `--space-4` / `--space-5`
- **States**: default, hover border/accent, focus ring, unavailable disabled with reason
- **Accessibility**: file type and purpose included in link name
- **Motion**: 140ms transform/opacity/color

### Progress Rail

- **Structure**: step links + completion count + native progress element
- **Variants**: desktop vertical, mobile horizontal
- **Spacing**: `--space-2` / `--space-4`
- **States**: current, completed, hover, focus
- **Accessibility**: labelled navigation, progress has text fallback
- **Motion**: progress fill 300ms transform/opacity only

### Strategy Canvas

- **Structure**: labelled textarea grid + save/export actions
- **Variants**: five-dimension, vision, KPI
- **Spacing**: `--space-4` / `--space-6`
- **States**: empty, editing, saved, error
- **Accessibility**: explicit labels, persistent helper text, keyboard-first actions
- **Motion**: saved state fades in 200ms

### Status Toast

- **Structure**: live region + icon + message
- **Variants**: success, warning, error
- **Spacing**: `--space-3` / `--space-4`
- **States**: hidden, visible, dismissed
- **Accessibility**: `role=status` or `role=alert`
- **Motion**: opacity/translateY 220ms; disabled under reduced motion

## 6. Motion & Interaction

| Type | Duration | Easing | Usage |
|---|---:|---|---|
| Micro | 140ms | ease-out | 按钮、链接 |
| Standard | 240ms | ease-in-out | 完成态、提示条 |
| Emphasis | 520ms | cubic-bezier(0.16, 1, 0.3, 1) | 首屏进入、锚点定位反馈 |

- 仅动画 `transform`、`opacity`、`filter`。
- `prefers-reduced-motion` 时取消平滑滚动与非必要动画。
- 所有编辑内容与完成状态写入当前浏览器 `localStorage`。

## 7. Depth & Surface

采用 mixed 策略，以细边框和轻微色阶为主，仅深色浮层使用投影。

| Level | Value | Usage |
|---|---|---|
| Card | `0 1px 0 rgba(16,42,67,.03)` | 练习卡 |
| Floating | `0 18px 50px rgba(12,36,52,.24)` | Toast/移动导航展开 |
| Border/default | `1px solid var(--border-default)` | 卡片与输入框 |
