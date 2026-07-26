# Branding Guidelines

## Logo Usage
The branding assets from Kape Uno Bistro are located in `src/assets/branding/`.

- **`logo-original.png`**: The archival source logo. Used only for physical reports, PDF exports, or scenarios requiring a solid white background.
- **`logo-transparent.png`**: The primary application logo. Used in the Top Navigation, the expanded Sidebar, and on the login page.
- **`logo-icon.png`**: The compact square mark.

## Favicon
The `logo-icon.png` serves as the browser favicon and PWA app icon.

## Brand Identity
The UI reflects a modern, warm, and professional bistro aesthetic. Clean lines, ample whitespace, and coffee-inspired semantic colors define the visual identity.

## Theme Integration
The `logo-transparent.png` is designed to overlay colored or themed backgrounds seamlessly. Ensure the background provides sufficient contrast in both Light and Dark modes.

## Sidebar Branding
- **Expanded:** Displays `logo-transparent.png`.
- **Collapsed:** Displays `logo-icon.png` to save horizontal space.

## Login Branding
The login screen features `logo-transparent.png` centered above the authentication form.

## Report Branding
Exported reports should utilize `logo-original.png` in the header to ensure maximum compatibility with standard printer backgrounds.

## Brand Consistency Rules
- Do not stretch, squash, or distort the logos. Use CSS `object-fit: contain`.
- Never overwrite or modify the original asset files in the `assets/branding/` directory.
- Maintain adequate clear space (padding) around the logos.
