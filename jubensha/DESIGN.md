# 立白AI终端突围战资料页 Design System

## 1. Atmosphere & Identity

一个课程现场的“资料补给站”：快速、可信、可复制。视觉语言以温暖纸感和企业绿色构成，像一份已经整理好的作战手册，而不是宣传页。签名元素是“线索卡”式提示词容器，每张卡都能被直接复制使用。

## 2. Color

| Role | Token | Value | Usage |
|---|---|---|---|
| Surface/primary | --surface-primary | #f6f3ea | Page background |
| Surface/elevated | --surface-elevated | #fffdf8 | Cards and prompt blocks |
| Surface-muted | --surface-muted | #ebe5d7 | Subtle panels |
| Text/primary | --text-primary | #17211b | Main text |
| Text/secondary | --text-secondary | #586159 | Body and metadata |
| Text/inverse | --text-inverse | #f9f5ea | Dark buttons |
| Accent/primary | --accent-primary | #0f7a42 | Main action |
| Accent/hover | --accent-hover | #0a6335 | Action hover |
| Accent/warm | --accent-warm | #c8613d | Status and emphasis |
| Border/default | --border-default | #ded6c4 | Card borders |
| Border/strong | --border-strong | #bfb39e | Focus and divisions |
| Success | --status-success | #0f7a42 | Copied state |

Rules: green is reserved for actions and course progress; terracotta is reserved for copied status and key accents. No decorative gradients dominate the page.

## 3. Typography

| Level | Size | Weight | Line Height | Tracking | Usage |
|---|---:|---:|---:|---:|---|
| Display | clamp(38px, 6vw, 68px) | 750 | 1.05 | 0 | Page title |
| H1 | 34px | 720 | 1.16 | 0 | Section titles |
| H2 | 22px | 700 | 1.28 | 0 | Card titles |
| Body/lg | 18px | 400 | 1.7 | 0 | Lead copy |
| Body | 16px | 400 | 1.7 | 0 | Default text |
| Body/sm | 14px | 400 | 1.55 | 0 | Metadata |
| Mono | 13px | 500 | 1.65 | 0 | Prompt text |

Font stack: system sans for UI, `ui-monospace` for prompt bodies. CJK text must wrap naturally, with no negative letter spacing.

## 4. Spacing & Layout

Base unit: 4px. Page max width is 1180px. Sections use 64px to 96px vertical rhythm on desktop and 40px to 56px on mobile. Cards use 24px padding on desktop, 18px on mobile.

## 5. Components

### Prompt Card
- Structure: card header, scenario label, prompt body, copy button.
- States: default, hover lift, focus ring, copied state.
- Accessibility: copy button has `aria-label`; status is written into the button text.

### Asset Download
- Structure: icon tile, file metadata, download link.
- States: default, hover, focus.
- Accessibility: native anchor with `download`; visible filename and format.

### Section Band
- Structure: constrained content within full-width background.
- States: static.

## 6. Motion & Interaction

Buttons and cards transition over 180ms using transform and color only. Copied state lasts 1600ms and never shifts card dimensions. Reduced motion removes lift transitions.

## 7. Depth & Surface

Strategy: mixed. Prompt cards use warm borders and a subtle paper shadow. Download assets use tonal shift and border. No nested cards.
