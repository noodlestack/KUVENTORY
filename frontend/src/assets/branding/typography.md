# Typography Guidelines

Kuventory utilizes modern, legible Google Fonts to ensure clarity across data-dense tables and beautiful, branded headers.

## Font Families
- **Headings (`font-heading`):** Poppins
  - Weights: `500` (Medium), `600` (SemiBold), `700` (Bold), `800` (ExtraBold)
  - Usage: Page titles, widget headers, primary labels.
- **Body (`font-sans`):** Inter
  - Weights: `400` (Normal), `500` (Medium), `600` (SemiBold)
  - Usage: Paragraphs, table data, buttons, UI text.

## Sizing Scale
*Defined in `src/styles/themes/typography.ts` and mapped to Tailwind utilities.*

- `text-xs`: 0.75rem (12px) - Meta text, subtle hints.
- `text-sm`: 0.875rem (14px) - Default table text, small buttons.
- `text-base`: 1rem (16px) - Standard body text.
- `text-lg`: 1.125rem (18px) - Sub-headers.
- `text-xl`: 1.25rem (20px) - Section headers.
- `text-2xl`: 1.5rem (24px) - Card headers.
- `text-3xl`: 1.875rem (30px) - Page titles.
- `text-4xl`: 2.25rem (36px) - Emphasized metrics.

## Implementation Rule
Never hardcode `font-family` or `font-size` using arbitrary values like `text-[15px]`. Always use the provided Tailwind text utilities.
