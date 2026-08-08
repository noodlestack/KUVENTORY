# Kuventory

![Version](https://img.shields.io/badge/version-v2.0.2-blue.svg)
![Status](https://img.shields.io/badge/status-Phase_3_Complete-success.svg)

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
- **Data Fetching:** TanStack Query + Supabase SDK
- **Forms:** React Hook Form + Zod
- **Visuals:** Framer Motion + Recharts + Lucide React
- **Backend:** Supabase (PostgreSQL, Auth)

## Documentation
Please refer to the `/docs` directory for detailed information regarding the project.
- [Project Overview](docs/PROJECT_OVERVIEW.md)
- [System Architecture](docs/SYSTEM_ARCHITECTURE.md)
- [Supabase Integration](docs/supabase/README.md)
- [Supabase Data Model](docs/supabase/data-model.md)
- [Supabase Database Schema](docs/supabase/database-schema.md)
- [Supabase Authentication](docs/supabase/authentication.md)
- [Supabase RBAC Matrix](docs/supabase/rbac-matrix.md)
- [Supabase RBAC Architecture](docs/supabase/rbac.md)
- [Supabase User Profiles](docs/supabase/user-profiles.md)

## Development Setup

1. **Prerequisites**
   Ensure you have Node.js (v18 or higher) installed on your system. Docker is required for Supabase local development.

2. **Supabase Local Setup**
   ```bash
   npx supabase start
   ```

3. **Installation**
   ```bash
   cd frontend
   npm install
   ```

4. **Environment Variables**
   Create a `.env.local` file inside the `frontend/` directory containing:
   ```env
   VITE_SUPABASE_URL=http://127.0.0.1:54321
   VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key-here
   ```

5. **Running Locally**
   ```bash
   npm run dev
   ```

## Folder Structure
```
.
├── .github/          # GitHub Actions workflows
├── docs/             # Project Documentation
├── supabase/         # Supabase Config and Migrations
└── frontend/         # React Application Source
    ├── src/
    │   ├── assets/       # Branding and global styles
    │   ├── components/   # Reusable UI components
    │   ├── contexts/     # React Context providers (Auth, Theme)
    │   ├── hooks/        # Custom React Hooks
    │   ├── integrations/ # Supabase and third-party integrations
    │   ├── layouts/      # Layout components (Dashboard, Settings, etc.)
    │   ├── pages/        # Application Pages (Views)
    │   ├── routes/       # React Router configurations and guards
    │   ├── services/     # API/Auth Services for data fetching
    │   ├── types/        # TypeScript Interfaces and Types
    │   └── utils/        # Helper functions (RBAC, formatting)
    └── package.json
```

## Phase 3 Complete (Auth & RBAC)
Kuventory now uses **Supabase Auth** with email/password authentication. The `auth.users` table syncs seamlessly to `public.profiles`. The frontend utilizes robust role-resolution (e.g. Administrator, Cashier, Inventory Staff) to dynamically filter the sidebar and protect routes. True data-level Row Level Security (RLS) is scheduled for Phase 4.

## License
This software is proprietary to Kape Uno Bistro. All rights reserved. Unauthorized copying, modification, or distribution is strictly prohibited.
