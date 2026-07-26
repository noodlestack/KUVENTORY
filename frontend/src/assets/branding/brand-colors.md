# Brand Colors

The Kuventory color palette uses warm, coffee-inspired tones to align with Kape Uno Bistro's physical branding, while keeping the digital interface clean, professional, and accessible.

## Base Palette
*These static values are defined in `src/styles/themes/colors.ts`.*

- **Gold (Primary):** `#D4AF37`
- **Coffee (Brand Dark):** `#4A3728`
- **Cream (Brand Light):** `#FDFBF7`
- **Stone Scale:** Warm neutral grays (`stone-50` to `stone-950`)

## Semantic Theme Palette
*These map to CSS variables (`--color-name`) in `globals.css` to enable Light/Dark mode.*

### Backgrounds & Surfaces
- `background`: App background. Light mode uses Cream, Dark mode uses Stone-950.
- `foreground`: Text on background.
- `card`: Surface color for widgets.
- `popover`: Surface color for dropdowns/modals.

### Actions & Highlights
- `primary`: Interactive elements (Gold).
- `secondary`: Subdued actions.
- `accent`: Hover states.
- `muted`: Disabled or low-emphasis elements.

### Status Indicators
- `destructive`: Error/Delete (`#dc2626`).
- `success`: Success/Save (`#16a34a`).
- `warning`: Warning/Pending (`#ea580c`).
- `info`: Info/Notice (`#2563eb`).

## Accessibility
All color combinations used for text and background are enforced to pass WCAG 2.1 AA contrast requirements (4.5:1 for normal text).
