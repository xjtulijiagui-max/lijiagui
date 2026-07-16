# AI深度应用实战课堂工具页（NPC官网） Design System

## 1. Atmosphere & Identity

复古海盗档案室与课堂 NPC 官网页结合。页面像一套可以上桌使用的线索卡：羊皮纸底、黑色手绘边框、深蓝制服感、金色罗盘与星标。核心情绪是“领取线索、按关闯关、留下证据”，不是现代 SaaS 工具站。

## 2. Color

| Role | Token | Value | Usage |
|---|---|---|---|
| Paper | --paper | #f4e4c6 | Page and card parchment |
| Paper/deep | --paper-deep | #dfbd80 | Aged edge and panel depth |
| Ink | --ink | #15120d | Main copy and borders |
| Ink/soft | --ink-soft | #463a2a | Body copy |
| Navy | --navy | #101a29 | Primary button and role-card suit tone |
| Navy/2 | --navy-2 | #17263b | Dark surfaces |
| Gold | --gold | #d49a2f | Accents |
| Gold/bright | --gold-bright | #f0be56 | Compass and focus accents |
| Sepia | --sepia | #8a5b2b | Secondary emphasis |
| Rust | --rust | #8d3c24 | Warnings and pitfall strips |
| Line | --line | #21170f | Hand-drawn border color |
| Muted | --muted | #735f44 | Metadata |

Rules: no purple-blue gradients, no generic dark SaaS glow. Gold is used as a clue marker; navy is reserved for authority and primary actions.

## 3. Typography

| Level | Size | Weight | Line Height | Usage |
|---|---:|---:|---:|---|
| Display | clamp(42px, 7vw, 82px) | 950 | 1.06 | Hero title |
| Section | clamp(30px, 4vw, 50px) | 950 | 1.12 | Section title |
| Card title | 25px | 900 | 1.25 | Tool, prompt, tip cards |
| Body/lg | clamp(17px, 2vw, 22px) | 400 | 1.85 | Hero copy |
| Body | 16px | 400 | 1.7 | Default text |
| Small | 14px | 700 | 1.55 | Metadata and links |
| Prompt | 14px | 400 | 1.72 | Prompt code blocks |

Font stack: Chinese serif first for the parchment role-card feeling, with monospace only inside prompt bodies. Letter spacing stays 0 except small navigation labels.

## 4. Spacing & Layout

Base unit: 4px. Page width is 1180px. Sections use 46px to 82px vertical rhythm. Hero uses an asymmetric two-column composition: copy left, role card right. Mobile collapses to one column with role card centered.

## 5. Components

### Download Card
- Structure: format badge, title, description, filename.
- States: default, hover lift, keyboard focus through native anchor.
- Rule: file paths use English-safe filenames; visible labels do not contain brand traces.

### Tool Card
- Structure: stage badge, task title, option groups, external tool links.
- States: searchable, hidden state, hover on links.

### Prompt Card
- Structure: stage badge, title, copy button, collapsible prompt body.
- States: default, expanded, copied, search filtered, stage filtered.
- Accessibility: native `details` for long content; copy buttons have visible state.

### Tip Card
- Structure: ribbon, title, source, exam points, steps, tool tags, pitfall strip.
- States: searchable, copied.

## 6. Motion & Interaction

Motion is restrained and functional. Buttons and cards use transform-only lift over 180ms. Search and filters instantly hide cards without layout animation. Reduced-motion users keep full function.

## 7. Depth & Surface

Surface depth comes from layered paper gradients, black offset shadows, double borders, and inset paper highlights. No nested cards inside cards; each repeated item is a single framed clue card.
