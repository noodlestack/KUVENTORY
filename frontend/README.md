# Kuventory

**Version 1.3.0**
## Project Overview
Kuventory is a robust, enterprise-grade, web-based Inventory Management System designed specifically for the operational needs of Kape Uno Bistro.

## Purpose
The primary purpose of Kuventory is to provide a unified platform to track stock levels, manage sales, monitor expenses, and organize supplier relationships, streamlining the restaurant's daily operations.

## Features
- Dashboard with real-time analytics
- Inventory and stock-level tracking
- Product categorization and recipe tracking
- Supplier directory and order tracking
- Purchases and operational expense management
- Sales tracking and daily reconciliation
- Comprehensive reporting

## Technology Stack
- **Framework:** React 19 + TypeScript + Vite
- **Styling:** Tailwind CSS + shadcn/ui
- **Routing:** React Router DOM
- **Data Fetching:** TanStack Query + Axios
- **Forms:** React Hook Form + Zod
- **Visuals:** Framer Motion + Recharts + Lucide React

## Installed Dependencies
The project is configured with the following key libraries:
- `react`, `react-dom` (v19)
- `react-router-dom` (Routing)
- `axios` (API Layer)
- `@tanstack/react-query` (Data fetching & caching)
- `react-hook-form`, `zod`, `@hookform/resolvers` (Forms & Validation)
- `lucide-react`, `recharts`, `framer-motion`, `sonner`, `@tanstack/react-table`, `next-themes` (UI Components & Utils)
- `clsx`, `tailwind-merge`, `class-variance-authority`, `tailwind-variants` (Tailwind Utilities)

## Development Commands & Scripts
- `npm run dev` - Starts the Vite development server.
- `npm run build` - Compiles TypeScript and builds the production bundle.
- `npm run preview` - Previews the production build locally.
- `npm run lint` - Runs ESLint to check for code quality issues.
- `npm run format` - Runs Prettier to format source files.
- `npm run typecheck` - Runs the TypeScript compiler to check for type errors without emitting files.

## Environment Variables
Create a `.env.local` file in the project root containing:
- `VITE_API_URL` - Base URL for the backend API.
- `VITE_APP_NAME` - The application name.
- `VITE_APP_VERSION` - The current application version.
- `VITE_ENABLE_DEVTOOLS` - Set to `true` to enable React Query devtools in development.

## Folder Structure
The `src/` directory is logically separated by feature and domain. Key directories include `assets/`, `components/`, `pages/`, `services/`, and `hooks/`. Refer to `docs/folder-structure.md` for full details.

## Development Workflow
1. Branch from `develop` to `feature/your-feature-name`.
2. Implement features following the architecture guidelines.
3. Open a Pull Request for review.

## Naming Conventions
- **Components/Pages:** `PascalCase.tsx`
- **Hooks/Utils/Services:** `camelCase.ts`
- **Folders:** `kebab-case` or `camelCase`

## Coding Standards
- Enforce strict TypeScript; avoid `any`.
- Keep components focused (Single Responsibility Principle).
- Use custom hooks for complex business logic.

## Installation Overview
See `docs/installation.md` for full instructions.
1. Run `npm install`.
2. Copy `.env.example` to `.env.local`.
3. Run `npm run dev` to start the development server.

## Contributors
- Frontend UI Developer Team
