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

## Marketing (home page)

**Rhythm:** alternate cream (`bg-cream`, `bg-white`) and navy blocks; navy sections use `border-cream/10` and a soft cream gradient at the top to avoid harsh transitions.

### Section header (marketing)
- Eyebrow: 11–12px uppercase / tracking 0.28em / primary
- Title: Playfair 3xl–5xl semibold / brand-blue / text-balance
- Subtitle: 14px muted / max-w-xl / left-aligned (not centered)

### Why-us tab panel
- Left: step tabs with primary left border when active
- Right: `surface-panel` detail with watermark number, bottom progress bar

### Stat strip (DeliveryGoal)
- Reuse `StatCard` in 3-column grid on cream canvas
- Metrics: Inter tabular semibold — never Playfair on numbers
- Optional count-up animation; respect `prefers-reduced-motion`

### B2B configurator
- Mobile: sticky live preview bar (`top-[5.75rem]`) updating with sliders
- Steps: compact pill buttons + progress bar; inset control-bg for values
- Desktop: sticky glass-dark product staging (signature pattern)

### Dark rails (showcase, CTA)
- `bg-brand-blue grain` + `dark-section-ambient` (dot grid + gold top glow)
- Cream top fade (`from-cream/[0.06–0.07]`) + `border-cream/10`
- Product cards: `glass-dark`, gold price accent
- CTA: layered gradients, quote form below headline

### Global & section ambient
- **`canvas-ambient`** (fixed, site-wide): warm gradient + diagonal ribbon crosshatch + color blooms + grain
- **`SectionAmbient`** component: tones `white | cream | warm` — gradient base, dot/line pattern, drifting color blobs, grain
- **`LightSectionParticles`**: falling flakes on light sections (white paper dots + navy + gold), mirror of hero snow; `particles={false}` to disable
- Use on all light marketing sections; disable blobs on busy sections (`blobs={false}`)
- Blobs respect `prefers-reduced-motion`

### Trust pages (About, Contact, Auth)
- Wrap in `MarketingPageShell` — ambient + particles + max-width container
- `PageHeader` with eyebrow + hero size for landing intros
- Content blocks: `StatCard` grid, vertical timeline, navy story card, `surface-panel` forms
- Footer: 4 columns — brand, nav, B2B links (catalog, compare, quote, configurator), contact
