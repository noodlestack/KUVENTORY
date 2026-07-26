# Folder Structure Guide

## `assets/`
- **Purpose:** Storage for static files.
- **Expected Contents:** Branding logos, icons, images, fonts.
- **Example Files:** `logo-transparent.png`, `inter.woff2`
- **When to Use:** When a component requires a static visual asset.
- **When NOT to Use:** Do not store dynamic JSON config here.
- **Naming Convention:** `kebab-case.ext`.

## `components/`
- **Purpose:** Reusable React components.
- **Expected Contents:** Buttons, generic tables, dialogs, form inputs.
- **Example Files:** `Button.tsx`, `DataTable.tsx`
- **When to Use:** Whenever UI is used in more than one place.
- **When NOT to Use:** Full-page layouts or route-specific business logic.
- **Naming Convention:** `PascalCase.tsx`.

## `pages/`
- **Purpose:** Top-level route components.
- **Expected Contents:** Views mapped directly to URLs.
- **Example Files:** `Dashboard.tsx`, `InventoryList.tsx`
- **When to Use:** Creating a new route in the application.
- **When NOT to Use:** For small pieces of UI meant to be embedded elsewhere.
- **Naming Convention:** `PascalCase.tsx`.

## `layouts/`
- **Purpose:** Structural wrappers for pages.
- **Expected Contents:** Wrappers providing navigation and framing.
- **Example Files:** `DashboardLayout.tsx`, `AuthLayout.tsx`
- **When to Use:** To provide consistent navigation across multiple routes.
- **When NOT to Use:** For localized wrappers (like a card).
- **Naming Convention:** `PascalCase.tsx`.

## `routes/`
- **Purpose:** Route definitions and access guards.
- **Expected Contents:** Route mappers and protection logic.
- **Example Files:** `index.tsx`, `ProtectedRoute.tsx`
- **When to Use:** Defining URL paths and managing navigation flow.
- **When NOT to Use:** UI rendering.
- **Naming Convention:** `PascalCase.tsx` or `camelCase.ts`.

## `hooks/`
- **Purpose:** Reusable React state and side-effect logic.
- **Expected Contents:** Custom hooks.
- **Example Files:** `useAuth.ts`, `useInventory.ts`
- **When to Use:** To abstract complex logic from UI components.
- **When NOT to Use:** Pure utility functions.
- **Naming Convention:** `camelCase.ts` starting with `use`.

## `services/`
- **Purpose:** API communication layer.
- **Expected Contents:** Network request functions.
- **Example Files:** `inventoryService.ts`, `authService.ts`
- **When to Use:** Functions that make HTTP requests.
- **When NOT to Use:** React component rendering or state.
- **Naming Convention:** `camelCase.ts`.

## `store/`
- **Purpose:** Global state management (Zustand).
- **Expected Contents:** Global UI state stores.
- **Example Files:** `uiStore.ts`
- **When to Use:** For complex, cross-component UI state.
- **When NOT to Use:** For server data (use TanStack Query instead).
- **Naming Convention:** `camelCase.ts`.

## `contexts/`
- **Purpose:** React Context providers.
- **Expected Contents:** Theme or Auth context logic.
- **Example Files:** `ThemeProvider.tsx`
- **When to Use:** For global state that rarely changes.
- **When NOT to Use:** For rapidly changing state.
- **Naming Convention:** `PascalCase.tsx`.

## `types/`
- **Purpose:** Global TypeScript interfaces and Zod schemas.
- **Expected Contents:** Domain models.
- **Example Files:** `Product.ts`, `User.ts`
- **When to Use:** Defining shared types.
- **When NOT to Use:** Localized component props.
- **Naming Convention:** `PascalCase.ts`.

## `utils/`
- **Purpose:** Pure, stateless helper functions.
- **Expected Contents:** Data formatting, math.
- **Example Files:** `formatCurrency.ts`, `dateHelpers.ts`
- **When to Use:** Reusable data transformations.
- **When NOT to Use:** If the function requires a React Hook.
- **Naming Convention:** `camelCase.ts`.

## `constants/`
- **Purpose:** Static configuration arrays and strings.
- **Expected Contents:** Magic strings, roles, status codes.
- **Example Files:** `routes.ts`, `roles.ts`
- **When to Use:** To prevent hardcoding strings.
- **When NOT to Use:** Environment variables.
- **Naming Convention:** `camelCase.ts` or `UPPER_SNAKE_CASE.ts`.

## `config/`
- **Purpose:** Environment parsing and library initialization.
- **Expected Contents:** Env validators, query client setup.
- **Example Files:** `env.ts`, `queryClient.ts`
- **When to Use:** Setting up tools on app initialization.
- **When NOT to Use:** Application business logic.
- **Naming Convention:** `camelCase.ts`.

## `styles/`
- **Purpose:** Global CSS and theme configuration.
- **Expected Contents:** CSS variables, tailwind globals.
- **Example Files:** `globals.css`, `themes/light.ts`
- **When to Use:** Defining design system tokens.
- **When NOT to Use:** Component-specific CSS.
- **Naming Convention:** `kebab-case.css` or `camelCase.ts`.

## `docs/`
- **Purpose:** Markdown documentation.
- **Expected Contents:** Guides and architectural records.
- **Example Files:** `architecture.md`
- **When to Use:** For onboarding and references.
- **When NOT to Use:** Source code.
- **Naming Convention:** `kebab-case.md`.
