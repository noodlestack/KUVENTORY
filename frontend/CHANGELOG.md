# Changelog

All notable changes to this project will be documented in this file.

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
