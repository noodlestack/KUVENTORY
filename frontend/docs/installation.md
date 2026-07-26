# Installation & Setup Guide

This guide outlines the steps to install and configure the Kuventory frontend development environment.

## Required Software
Ensure the following tools are installed before proceeding:
- **Node.js:** version 20.x or higher
- **npm:** version 10.x or higher
- **Git:** version 2.x or higher
- **VS Code:** Recommended IDE

## Recommended VS Code Extensions
To ensure a consistent development experience, we recommend installing the following VS Code extensions:
- **ESLint** (dbaeumer.vscode-eslint)
- **Prettier** (esbenp.prettier-vscode)
- **Tailwind CSS IntelliSense** (bradlc.vscode-tailwindcss)
- **Error Lens** (usernamehw.errorlens)
- **GitLens** (eamodio.gitlens)
- **Path IntelliSense** (christian-kohler.path-intellisense)

## Installation Steps

### 1. Clone the Repository
```bash
git clone <repository_url>
cd frontend
```

### 2. Dependency Installation
Run the following command in the `frontend/` directory to install all required dependencies (React 19, Vite, Tailwind CSS, shadcn/ui, etc.):
```bash
npm install
```

### 3. Environment Variables
Copy the example environment file and fill in local values.
```bash
cp .env.example .env.local
```

### 4. Running Development Server
```bash
npm run dev
```
The application will be available at `http://localhost:5173`.

### 5. Production Build
To create a production-ready bundle and preview it:
```bash
npm run build
npm run preview
```

## Troubleshooting
- **Node Version Error:** Ensure you are running Node 20+. Use `nvm` to manage Node versions.
- **Dependency Conflicts:** If you encounter issues (especially with React 19 compatibility), try running `npm install --legacy-peer-deps` or clear the `node_modules` and `package-lock.json` and reinstall.
