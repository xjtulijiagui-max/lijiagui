# 银盛支付 WorkBuddy 练习台 Design System

## 1. Atmosphere & Identity

一个克制、可信的支付业务训练操作台：深色背景像运行中的业务系统，靛蓝用于工作流与可操作项，青绿用于完成与资源状态。签名元素是沿左侧延伸的编号任务轨道，让学员始终知道自己正处在哪一个 Skill 与练习资料之间。

## 2. Color

| Role | Token | Value | Usage |
|---|---|---:|---|
| Base | `--surface-base` | `#08090a` | 页面背景 |
| Panel | `--surface-panel` | `#101215` | 侧栏、资源面板 |
| Raised | `--surface-raised` | `#191c20` | Skill 卡片、提示词区域 |
| Primary text | `--text-primary` | `#f5f7fa` | 标题与正文 |
| Secondary text | `--text-secondary` | `#c0c7d0` | 辅助信息 |
| Muted text | `--text-muted` | `#8c96a3` | 标签、说明 |
| Divider | `--line` | `rgba(255,255,255,.10)` | 分隔线、默认边框 |
| Brand | `--accent` | `#7b7cff` | 链接、主操作、焦点 |
| Brand hover | `--accent-strong` | `#9696ff` | 主操作悬停 |
| Success | `--success` | `#2dd4bf` | 完成、资料状态 |
| Warning | `--warning` | `#f3bd64` | 人工复核提醒 |

## 3. Typography

| Level | Size | Weight | Usage |
|---|---:|---:|---|
| Display | 36px | 700 | 页面标题 |
| H2 | 24px | 700 | 分区标题 |
| H3 | 18px | 650 | Skill 标题 |
| Body | 16px | 400 | 默认正文 |
| Small | 14px | 400 | 描述、元信息 |
| Caption | 12px | 600 | 徽标、标签 |

- Primary: `"Microsoft YaHei", "PingFang SC", system-ui, sans-serif`
- Mono: `"Cascadia Mono", Consolas, monospace`

## 4. Spacing & Layout

基础单位为 4px；使用 `--space-1` 至 `--space-16`。桌面端采用 280px 固定左导航与自适应内容列，内容最大宽度 1500px；小于 880px 时侧栏转为横向可滚动导航。

## 5. Components

### Side Navigation
- **Structure**: 品牌区、进度、分类筛选、资料下载。
- **States**: 默认、当前分类、hover、focus。
- **Accessibility**: `nav` landmark，当前项使用 `aria-current`。

### Skill Card
- **Structure**: 序号、难度/时长、标题、适用对象、提示词、Skill 下载；S03–S07 额外提供对应模拟数据下载。
- **States**: 默认、hover、focus、复制成功。
- **Accessibility**: 操作均为原生 button 或 anchor；复制反馈使用 `aria-live`。

### Resource Link
- **Structure**: 文件名、用途、下载链接。
- **States**: 默认、hover、focus。
- **Accessibility**: 链接文字包含文件用途。

### Workflow Lab
- **Structure**: 两轮提示词、复制操作、岗位替换说明。
- **States**: 默认、hover、focus、复制成功。
- **Accessibility**: 每轮操作为原生 button，复制结果复用页面 `aria-live` 反馈。
### Expert Prompt
- **Structure**: 专家角色说明、完整系统提示词与单一复制操作。
- **States**: 默认、hover、focus、复制成功；长文本在固定高度内滚动阅读。
- **Accessibility**: 原生 button 触发复制，完整文本保留在语义化 `pre` 中，并复用页面 `aria-live` 反馈。

## 6. Motion & Interaction

- 微交互：160ms `ease-out`，仅使用 `transform` 与 `opacity`。
- 卡片 hover 上浮 2px；复制按钮反馈为即时文本变化。
- `prefers-reduced-motion` 下取消非必要过渡。

## 7. Depth & Surface

采用 mixed 策略：面板用 `--line` 细边框隔开，卡片在 hover 时使用低对比度阴影；不使用玻璃效果或装饰性渐变。
