# Agent Canvas Design System

## 1. Atmosphere & Identity

An instructional command canvas for business users designing AI agents. The surface should feel clear, practical, and guided: blue primary structure, white worksheet cards, compact form controls, and a persistent top action area that keeps download and save actions obvious.

## 2. Color

| Role | Token | Value | Usage |
|------|-------|-------|-------|
| Surface/page | --surface-page | #f0f4f8 | Page background |
| Surface/card | --surface-card | #ffffff | Canvas cards and nav |
| Surface/soft | --surface-soft | #f8fbff | Tip cards |
| Text/primary | --text-primary | #1f2937 | Main text and headings |
| Text/secondary | --text-secondary | #64748b | Hints and secondary labels |
| Border/default | --border-default | #e5e7eb | Card and toolbar borders |
| Border/blue | --border-blue | #dbeafe | Instruction card borders |
| Accent/primary | --accent-primary | #4f46e5 | Buttons, focus, section headers |
| Accent/primary-hover | --accent-primary-hover | #4338ca | Button hover |
| Accent/blue | --accent-blue | #3b82f6 | Header gradient start |
| Accent/blue-deep | --accent-blue-deep | #1e40af | Header gradient end |
| Status/success | --status-success | #10b981 | Save confirmations |
| Status/warning | --status-warning | #f59e0b | Guidance notice |
| Status/error | --status-error | #fee2e2 | Error messages |

## 3. Typography

| Level | Size | Weight | Line Height | Usage |
|-------|------|--------|-------------|-------|
| Page title | 30px | 700 | 1.25 | Tips hero |
| Canvas title | 24px | 700 | 1.2 | Canvas header |
| Toolbar title | 20px | 700 | 1.2 | Main nav title |
| Section title | 20px | 700 | 1.4 | Tips sections |
| Card title | 16px | 700 | 1.4 | Tip card headings |
| Body | 14px | 400 | 1.7 | Instructions, tables, labels |
| Caption | 12px | 400 | 1.4 | Secondary nav text |

Primary font stack: PingFang SC, Microsoft YaHei, system sans-serif.

## 4. Spacing & Layout

Base unit: 4px. Common spacing uses 8px, 12px, 16px, 18px, 22px, 24px, and 30px. Main canvas keeps its original wide worksheet layout with a minimum width for classroom display. Tips and navigation pages are responsive and collapse grids to one column below 900px.

Max content width is 80rem for the canvas and 1180px for the guidance page.

## 5. Components

### Toolbar

- Structure: brand block, secondary nav links, status message, primary download action.
- States: links and buttons have hover and focus states; status supports success, info, warning, and error.
- Accessibility: top nav uses `aria-label`; status uses `role="status"` and `aria-live="polite"`.

### Button

- Variants: primary, success, secondary.
- Spacing: 12px x 24px, large variant 14px x 32px.
- States: hover raises with transform and shadow; focus uses a visible indigo outline.

### Worksheet Card

- Structure: white surface, 12px radius, 1px border, subtle shadow, section pill header.
- Use: repeated canvas fields and example sections.

### Tip Card

- Structure: soft blue surface, 8px radius, blue border, compact heading and body copy.
- Use: repeated guidance blocks only.

## 6. Motion & Interaction

Interactive movement is limited to button hover and focus feedback. Duration is 200ms. Download, save, export, reset, and keyboard save are functional interactions; decorative animation is not used. Main page supports Ctrl/Cmd+S for saving the draft state.

## 7. Depth & Surface

Depth strategy: mixed subtle shadow plus clear borders. Toolbar and cards use soft shadows to separate them from the page background. Form inputs use borders and focus rings, not shadows, so the worksheet stays scannable.
