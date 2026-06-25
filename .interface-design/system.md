# Alpha Boguslav — Product UI Design System

## Direction

**Personality:** Sophistication & Trust — B2B procurement for premium corporate gift sets.  
**Foundation:** Warm cream canvas, navy structure, Christmas red accent (~10%).  
**Depth:** Borders-only with whisper-quiet surface shifts (no heavy drop shadows on tools).  
**Density:** Workbench — 8px spacing base, compact controls, airy section breaks.

**Human:** Office manager or HR lead ordering 50–500 gift sets before New Year.  
**Task:** Browse catalog → configure quantities → checkout → track order.  
**Feel:** Calm, premium, trustworthy — like opening a well-packed gift box, not a generic SaaS template.

## Tokens

### Spacing scale (4px base)
`4 · 8 · 12 · 16 · 24 · 32 · 48`

| Context | Value |
|---------|-------|
| Micro (icon gaps) | 4–8px |
| Component padding | 16–20px |
| Section gap | 24–32px |
| Page padding | 16px mobile / 48px vertical |

### Surfaces (light mode)
| Level | Token | Use |
|-------|-------|-----|
| Canvas | `--cream` | Page background |
| Panel | `--card` / `surface-panel` | Cards, tables, forms |
| Inset | `--control-bg` | Inputs, selects |
| Elevated | `bg-card` + border | Popovers, sticky summary |

### Borders
- Standard: `border-border/60`
- Subtle row dividers: `border-border/40`
- Focus: `ring-ring/50`

### Typography
- **UI:** Inter — body 14px, labels 11px uppercase tracked
- **Display:** Playfair — page titles only, not metric numbers
- **Hierarchy levers:** size + weight + opacity (not size alone)
- **Metrics:** `tabular-nums`, semibold, 24–28px — never Playfair on numbers

### Type scale (1.25 ratio, 14px body)
`caption 11 · body 14 · h4 16 · h3 18 · h2 22 · h1 28`

### Radius
| Element | Radius |
|---------|--------|
| Controls (button, input) | 8px (`rounded-lg`) |
| Cards / panels | 16px (`rounded-2xl`) |
| Modals / hero blocks | 24px (`rounded-3xl`) |

## Patterns

### StatCard (KPI)
- Label: 11px / 500 / uppercase / tracking 0.12em / muted
- Value: 24–28px / 600 / tabular-nums / brand-blue
- Icon: 16px / muted / top-right, decorative only

### PageHeader
- Title: Playfair 28–32px semibold tracking-tight text-balance
- Description: 14px muted, max-w-2xl

### Button primary
- Height: 36px (`h-9`)
- Padding: 12px 16px
- Radius: 8px

### Input / control
- Height: 36px
- Background: inset (`control-bg`), slightly darker than panel
- Border: border/70

### Data table
- Head: 11px uppercase tracked muted
- Row hover: muted/50
- Prices: right-aligned tabular-nums

### Form section
- Title: ui-section-title (uppercase label, not Playfair h3)
- Panel: surface-panel rounded-2xl p-6
- Field gap: 16px

## Signature
Premium product staging (float + spotlight) on catalog; restrained navy+cream panels on all B2B workflows.

## Rejected defaults
- Identical glass cards with shadow-xl everywhere → surface-panel borders-only
- Playfair on all KPI numbers → tabular Inter semibold
- Raw English table headers in admin → i18n + styled TableHead
- Duplicate order metadata below account table → removed
