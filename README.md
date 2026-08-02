# Kuventory

![Version](https://img.shields.io/badge/version-v2.0.0-blue.svg)
![Status](https://img.shields.io/badge/status-Frontend_Stable-success.svg)

**Kuventory** is a robust, enterprise-grade, web-based Inventory Management System designed specifically for the operational needs of Kape Uno Bistro.

## Purpose
The primary purpose of Kuventory is to provide a unified platform to track stock levels, manage sales, monitor expenses, and organize supplier relationships, streamlining the restaurant's daily operations.

## Features
- Dashboard with real-time analytics
- Inventory and stock-level tracking based on actual operational workflow (Beginning, Added, AM, PM, Ending)
- Auto-calculated Total Stock and Ending Stock to prevent manual entry errors
- Supplier directory and order tracking
- Purchases and operational expense management
- Sales tracking and daily reconciliation
- Comprehensive reporting with exports to PDF, CSV, and Excel
- Responsive UI spanning Mobile, Tablet, and Desktop displays
- Optimized performance utilizing strict React memoization

## Technology Stack
- **Framework:** React 19 + TypeScript + Vite
- **Styling:** Tailwind CSS + shadcn/ui
- **Routing:** React Router DOM
- **Data Fetching:** TanStack Query + Axios
- **Forms:** React Hook Form + Zod
- **Visuals:** Framer Motion + Recharts + Lucide React
- **Hosting:** GitHub Pages

## Documentation
Please refer to the `/docs` directory for detailed information regarding the project.
- [Project Overview](docs/PROJECT_OVERVIEW.md)
- [System Architecture](docs/SYSTEM_ARCHITECTURE.md)
- [Installation Guide](docs/INSTALLATION_GUIDE.md)
- [Deployment Guide](docs/DEPLOYMENT_GUIDE.md)
- [Frontend Security](docs/FRONTEND_SECURITY.md)
- [Tech Stack](docs/TECH_STACK.md)
- [Roadmap](docs/ROADMAP.md)

## Development Setup

1. **Prerequisites**
   Ensure you have Node.js (v18 or higher) installed on your system.

2. **Installation**
   ```bash
   cd frontend
   npm install
   ```

3. **Environment Variables**
   Create a `.env.local` file inside the `frontend/` directory containing:
   ```env
   VITE_API_URL=http://localhost:8000/api
   VITE_APP_NAME="Kuventory"
   VITE_APP_VERSION="v2.0.0"
   VITE_ENABLE_DEVTOOLS=true
   ```

4. **Running Locally**
   ```bash
   npm run dev
   ```

## Production Build
```bash
cd frontend
npm run build
```
This command compiles TypeScript and generates the optimized production bundle inside the `dist/` directory.

## GitHub Pages Deployment
Kuventory uses GitHub Actions to automate deployments. Any changes pushed to the `main` branch will automatically trigger the deployment workflow and publish the site to GitHub Pages.
Refer to [Deployment Guide](docs/DEPLOYMENT_GUIDE.md) for detailed configuration.

## Folder Structure
```
.
├── .github/          # GitHub Actions workflows
├── docs/             # Project Documentation
└── frontend/         # React Application Source
    ├── src/
    │   ├── assets/       # Branding and global styles
    │   ├── components/   # Reusable UI components
    │   ├── contexts/     # React Context providers (Auth, Theme)
    │   ├── hooks/        # Custom React Hooks
    │   ├── layouts/      # Layout components (Dashboard, Settings, etc.)
    │   ├── pages/        # Application Pages (Views)
    │   ├── services/     # API/Mock Services for data fetching
    │   ├── types/        # TypeScript Interfaces and Types
    │   └── utils/        # Helper functions
    └── package.json
```

## Current Version
**Kuventory v2.0.0** - Frontend Only (Mock Backend)

## License
This software is proprietary to Kape Uno Bistro. All rights reserved. Unauthorized copying, modification, or distribution is strictly prohibited.

## Contributors
- Frontend UI Developer Team

## Future Plans
- **Django Backend Integration:** Migrate off mock services to a fully functional Django REST Framework + PostgreSQL backend. (See [Roadmap](docs/ROADMAP.md))
- **Live Database:** Implement real-time database transactions for inventory and sales.
- **Enhanced Security:** Implement JWT token-based authentication and secure endpoints.
