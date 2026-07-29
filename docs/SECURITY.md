# KUVENTORY Frontend Security Hardening

This document outlines the security features and hardening measures implemented on the frontend application (React 19 + TypeScript + Vite).

## 1. Authentication & Session Security
- **Strict Logout:** When a user logs out, all tokens are cleared, the user context is set to `null`, and any timers are destroyed.
- **Cross-Tab Synchronization:** The `BroadcastChannel` API is implemented to synchronize logout events. If a user logs out in one tab, all other open KUVENTORY tabs will instantly log out and clear sensitive data.
- **Idle Timeout:** An automatic idle timeout mechanism logs users out after 30 minutes of inactivity. The timer is reset by mouse movements, clicks, keystrokes, and touch events.

## 2. Route Protection & Role-Based UI
- **Protected Routes:** Strict client-side route protection redirects unauthenticated users back to the `/login` page securely.
- **Role Validation:** Protected routes implement `RoleProtectedRoute` to restrict access strictly by role (`Admin`, `Manager`, `Cashier`, etc.). Unauthorized attempts to access role-restricted pages are rerouted to a safe `/unauthorized` component.
- **Dynamic Navigation:** The sidebar and mobile drawer filter navigation options based on the authenticated user's role, hiding unauthorized links completely.

## 3. Error Handling
- **Global Error Boundaries:** A top-level React `ErrorBoundary` wraps the application tree. In the event of an unhandled exception or crash, a generic, user-friendly UI is displayed.
- **Information Disclosure Prevention:** The error boundary intercepts stack traces, SQL errors, or sensitive technical details, preventing them from bleeding into the DOM or being visible to end users.

## 4. Form Security & Performance Protection
- **Validation:** Forms utilize `react-hook-form` and `zod` schema validation enforcing required fields, minimum/maximum lengths, strict email patterns, and numeric ranges.
- **Duplicate Submission Prevention:** All submit buttons check the `isSubmitting` form state and immediately disable upon the first click, preventing rapid multiple POST requests.
- **Performance Debouncing:** The Global Search implements a 250ms debounce and utilizes `queueMicrotask` to throttle user input, reducing unnecessary rapid API-triggering actions.

## 5. Production Build Hardening
- **Debug Obfuscation:** The `vite.config.ts` incorporates `esbuild.drop: ['console', 'debugger']` removing all `console.log` statements in the production build to prevent accidental data leakage.
- **Source Map Security:** `build.sourcemap` is strictly set to `false`, ensuring original TypeScript source code, comments, and structure are not accessible to users viewing network assets.

## 6. Required Server-Side Security Headers
The frontend itself does not configure headers since it is statically built. When deploying the application (e.g., via NGINX, Vercel, or a backend framework), the following security headers **MUST** be configured:

- `Content-Security-Policy`: Restrict sources of executable scripts, stylesheets, and iframe embeddings.
- `Cache-Control: no-store`: (For authenticated API responses) Prevents caching of sensitive data.
- `Referrer-Policy: strict-origin-when-cross-origin`: Controls information sent in the Referer header.
- `X-Frame-Options: DENY`: Prevents clickjacking by disabling iframe rendering of the site.
- `X-Content-Type-Options: nosniff`: Prevents MIME-type sniffing.
