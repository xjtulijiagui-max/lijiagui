# AI 实战训练导航设计系统

## 1. Visual Direction

页面是一张面向讲师与企业学员的高信息密度资源地图。视觉语言保持稳重的深蓝课程门户：顶部用海军蓝到亮蓝的渐变建立品牌识别，内容区以浅灰蓝背景和白色卡片承载大量入口。重点资源通过“推荐”状态和蓝色主按钮突出，不引入新的装饰风格。

## 2. Color Tokens

| Token | Value | Usage |
|---|---|---|
| `--navy` | `#061b46` | Hero、Toast、深色信息区 |
| `--blue` | `#0a43c8` | 主按钮、激活筛选、分类文字 |
| `--bright` | `#155eef` | 强调色与推荐轮廓 |
| `--pale` | `#eef5ff` | 浅蓝强调背景 |
| `--line` | `#d8e4f7` | 输入框、筛选器和分隔线 |
| `--ink` | `#15223a` | 主文字 |
| `--muted` | `#64748b` | 次级说明 |
| `--white` | `#ffffff` | 卡片与反色文字 |
| `--bg` | `#f5f8fd` | 页面背景 |
| `--shadow` | `0 12px 34px rgba(17,57,122,.09)` | 卡片悬停和 Toast |

## 3. Typography

- 字体栈：`Microsoft YaHei`, `PingFang SC`, `Noto Sans SC`, Arial, sans-serif。
- Hero 标题：桌面 40px、平板 34px、手机 29px，字重 800，行高 1.15。
- 模块标题：24px；卡片标题：18px / 1.45；正文：13—16px / 1.75—1.85。
- 中文标题保持完整语义，避免单字孤行；英文眉题允许增加字距。

## 4. Spacing & Layout

- 内容最大宽度 1240px，桌面水平留白 26px，手机 16px。
- 基础间距遵循 4px 倍数；主要卡片间距 16px。
- 资源网格：桌面 3 列、平板 2 列、手机 1 列。
- 卡片使用 16px 圆角、19px 内边距、最小高度 236px；手机取消固定最小高度。

## 5. Components & States

- `HeroQuickLink`：半透明白色表面；hover 提高背景不透明度；始终为真实链接。
- `SearchToolbar`：桌面吸顶；输入与下拉获得蓝色 focus ring；手机回到普通文档流。
- `CategoryChip`：默认白底描边；active 为蓝底白字；水平区域允许滚动。
- `ResourceCard`：分类、状态、标题、说明、标签、客户/类型、操作区组成；hover 仅用于可交互提示。
- `OpenButton`：蓝色主操作；hover 使用更深蓝；链接在新窗口打开并带 `noopener`。
- `CopyButton`：白底描边；点击后显示 Toast；复制失败时使用隐藏 textarea 降级。
- `EmptyState`：筛选无结果时占满网格，使用虚线边框和可行动提示。

## 6. Responsive Rules

- `>950px`：3 列资源网格，4 列统计，完整搜索/类型/清除控制。
- `641—950px`：2 列网格、2 列统计，搜索与类型筛选同排。
- `≤640px`：1 列网格、2 列统计，只保留搜索框；标题和留白同步收紧。
- 所有断点禁止页面级横向溢出；分类 Chip 自身可以横向滚动。

## 7. Accessibility & Motion

- 使用语义化 `header/nav/main/section/article/footer`；筛选控件必须有可访问名称。
- 键盘 focus 状态保持清晰；颜色不作为唯一状态信号。
- 过渡只用于卡片 hover 与 Toast 状态反馈，持续时间 200ms，不添加无意义装饰动画。
- 外链使用 `target="_blank"` 时配套 `rel="noopener"`。
