# Changelog

All notable changes to the Kuventory project will be documented in this file.

## [v2.0.2] - 2026-08-05

### Added
- Created actual REST API services using Axios to replace mock data services.
- Added dynamic Category Management UI and linked it to Inventory Form for inline creation.

### Changed
- Removed all hardcoded mock business data for Dashboard, Inventory, Sales, Expenses, Purchases, Suppliers, and Discounts.
- Changed the frontend app to fetch data from the newly implemented Django (Previous backend architecture discarded. New backend architecture pending.) backend endpoints instead of using simulated delays.


## [v2.0.1] - 2026-08-05

### Changed
- Replaced outdated user-facing "Product" terminology with context-appropriate "Supplies", "Stock", "Stock Item", and "Item" terminology.
- Removed the standalone Products module from the user-facing workflow.

### Added
- Centralized discount management.
- Senior Citizen Discounts.
- PWD Discounts.
- Delivery Driver Discounts.
- Employee Discounts.
- Promotional Discounts.
- Manual and Custom Discounts.
- Discount reporting and analytics.

### Improved
- Discount calculations.
- Sales transaction handling.
- Delivery discount workflows.
- Reports and exports.
- Responsive discount interfaces.
- Overall terminology consistency.

## [v2.0.0] - 2026-08-03

### Added
- **Workflow Alignment**: Introduced precise operational flow tracking with `Beginning`, `Added`, `AM Sales`, `PM Sales`, and `Ending` stock for inventory items.
- **Reporting Enhancements**: Added robust PDF and Excel export capabilities for sales, expenses, and inventory reports.
- **Deployment**: Integrated a GitHub Actions workflow to automatically deploy to GitHub Pages upon pushing to `main`.
- **System Documentation**: Centralized and comprehensively expanded all documentation inside the `/docs` directory.

### Changed
- **Total Stock Calculation**: Total Stock is now strictly auto-calculated as `(Beginning + Added)`.
- **Ending Stock Calculation**: Ending Stock is strictly auto-calculated as `(Total - (AM + PM))`.
- **Global Theme & Layout**: Refined navigation layouts, breadcrumbs, and sidebar configurations to enhance mobile and tablet viewing experiences.
- **Data Tables**: Enabled horizontal scrolling (`overflow-x-auto`) to prevent layout breaking on small screens.

### Improved
- **Code Maintainability**: Substantially cleaned the codebase by purging dead files, unused modules, and duplicate styling logic.
- **State Optimization**: Utilized custom hooks and centralized mock services effectively.

### Optimized
- **React Rendering**: Wrapped heavily re-rendered components, such as `InventoryTable`, `SalesTable`, `PurchaseTable`, and `ExpenseTable`, in `React.memo` to enhance rendering performance and UI responsiveness.

### Fixed
- **Dark Mode Visibility**: Resolved a bug where chart tooltip text and backgrounds clashed in Recharts, ensuring high contrast in dark mode.
- **Responsive Navigation**: Fixed an issue where the navigation drawer was un-clickable on narrow devices.

### Removed
- **Unused Modules**: Purged the generic `Products` module, `StockMovement`, and `StockAdjustment` tabs, focusing purely on Kape Uno Bistro's specific requirements.
- **Manual Input Overrides**: Removed the ability to manually override calculated stock values to enforce data integrity.

### Security Improvements
- Defined distinct frontend roles mapping, preparing the foundation for JWT-based backend security.
- Enhanced form validations using Zod to sanitize inputs locally before transmission.

---

## [v1.9.5] - 2026-07-28
- Initial stable release of the frontend UI featuring dashboard, inventory, supply chain, and settings modules with mock data.

