# Changelog

All notable changes to this project will be documented in this file.

## [1.9.5] - 2026-08-02

### Fixed

- Created global `ChartTooltip` for Recharts to ensure dark mode visibility.
- Resolved tooltip color contrast conflicts across all Recharts charts.
- Formatted all chart monetary values properly with Philippine Peso (₱).
- Ensured tooltips are highly readable in both Light Mode and Dark Mode.
- Updated to version v1.9.5 across all components.

## [1.9.4] - 2026-08-02

### Fixed

- Fixed Kape Uno Bistro login logo clipping on responsive viewports.
- Fixed footer overlapping page content across application modules.
- Fixed responsive page scrolling and content visibility.
- Fixed Sales Overview chart Y-axis currency labels being clipped.
- Fixed Philippine Peso (₱) symbol visibility on charts across mobile, tablet, laptop, and desktop.
- Improved responsive Recharts margins and Y-axis formatting.
- Standardized chart currency formatting using the global currency formatter.
- Improved chart readability in Dark Mode and Light Mode.

## [1.9.0] - 2026-07-28

### Changed

- **Maintenance Update**: Reorganized top navigation, fixed dark mode charts, resolved mobile drawer bugs.
- **Theme**: Removed hardcoded colors in sidebar and replaced with theme tokens.
- **Optimization**: Addressed layout, performance, and accessibility issues.

## [1.3.0] - 2026-07-26

### Changed

- **Currency Localization**: Localized the application for the Philippines. All currency values now use the Philippine Peso (₱) symbol and format.
- **Improved Currency Formatting**: Implemented a global utility `formatCurrency` using `Intl.NumberFormat` with `en-PH` locale to ensure consistent thousands separators and standard `-₱` formatting for negative numbers.
- **Updated Version Information**: Bumped version to v1.3.0 across the application interface, including Sidebar, Footer, and Settings sections.
- **Documentation**: Updated `README.md` and `docs/frontend-guide.md` to reflect the new version and localization details.
- **Performance Optimization**: Configured `React.lazy` and `Suspense` for aggressive lazy loading of secondary routes, drastically improving initial application load times.
- **Bundle Optimization**: Upgraded `vite.config.ts` Rollup `manualChunks` to intelligently split `react`, `ui`, `chart`, and `data` vendor libraries, eliminating the ">500KB" warning.
- **Search Optimization**: Debounced the `GlobalSearch` input logic and memoized the component to prevent lag on lower-end devices.
- **Code Quality**: Eradicated all `any` types and repaired cascading `set-state-in-effect` re-renders, culminating in ZERO ESLint errors and ZERO compiler errors.
