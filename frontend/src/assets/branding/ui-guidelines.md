# UI Design Guidelines

Kuventory's UI aims for a "Minimalist Business Dashboard" aesthetic. It should feel lightweight, responsive, and extremely clean to prevent eye strain during long hours of operation.

## Design Philosophy
1. **Content Over Chrome:** Data and actions are the primary focus. UI borders and backgrounds should be subtle.
2. **Warmth & Branding:** Use Kape Uno's signature Coffee, Gold, and Cream tones semantically, rather than overwhelming the screen.
3. **Consistency:** Always use the defined 8px spacing system, rounded corners, and semantic tokens.

## Dark Mode Strategy
- Dark mode utilizes `stone-950` instead of pure `#000000` to reduce astigmatism glare.
- High-contrast text uses `stone-50` rather than pure white.
- Borders remain subtle (`stone-800`).

## Component Standards
- **Buttons:** Subtle shadow (`shadow-sm`), rounded standard (`rounded`), primary uses Brand Gold.
- **Cards:** Clean borders, soft elevation (`shadow`), `p-6` internal padding.
- **Tables:** Dense enough for data reading (Inter text-sm), alternating row hover states (using `bg-muted/50`).
- **Forms:** Focus rings must use the Gold primary (`ring-ring`). Use clear validation states (red text for errors).
- **Icons:** Use `lucide-react` uniformly. Keep stroke width at `2px` for standard icons.

## Accessibility (A11y)
- **Keyboard Navigation:** All interactive elements must have the `:focus-visible` ring.
- **Reduced Motion:** Animations (like dropdowns and modals) fade and slide in `0.2s`. They can be disabled globally via OS settings (automatically handled by Tailwind).
- **Contrast:** Maintain accessible contrast for readability.
