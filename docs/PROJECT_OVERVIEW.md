# Project Overview

**Kuventory v2.0.0**

## Business Problem
Kape Uno Bistro relies heavily on accurate inventory monitoring, stock movement tracking, and expense recording to maintain its daily operations. Previously, these processes were handled using paper-based logs or disparate spreadsheets. This manual approach often led to:
- Discrepancies between recorded stock and actual stock.
- Lack of real-time visibility into inventory levels.
- Difficulties in tracking daily sales against beginning and ending stock.
- Inefficiencies in consolidating end-of-day reports.

## Solution
Kuventory is a bespoke, enterprise-grade web application developed to digitalize and streamline Kape Uno Bistro's operational workflow. It consolidates inventory management, sales tracking, supplier coordination, and expense monitoring into a single, intuitive platform.

## Objectives
- **Digital Transformation**: Transition from paper-based tracking to a secure, centralized digital system.
- **Workflow Alignment**: Strictly mirror the existing operational workflow (tracking Beginning Stock, Added Stock, AM/PM Sales, and Ending Stock) to minimize staff training time.
- **Error Reduction**: Auto-calculate critical stock and financial metrics to prevent human data-entry errors.
- **Real-Time Analytics**: Provide management with an interactive dashboard for quick insights into business health.

## Scope
The current scope encompasses a fully functional Frontend Application (v2.0.0) complete with:
- Mocked backend services for data persistence during the frontend evaluation phase.
- Comprehensive UI/UX tailored for desktop, tablet, and mobile environments.
- Robust role-based view layouts.

## Modules
1. **Dashboard**: Real-time business analytics and summary charts.
2. **Inventory Management**: Shift-based stock tracking enforcing strict mathematical constraints.
3. **Supply Chain**: Management of supplier records and incoming purchase orders.
4. **Finance & Reports**: Tracking of sales, discounts, operational expenses, and detailed exportable reporting.
5. **System Settings**: User profile and application-wide configurations.

## Current Progress
- [x] **Phase 1**: Core Layouts and Navigation structure.
- [x] **Phase 2**: Dashboard and Data Visualizations.
- [x] **Phase 3**: Form validations and Mock Data services.
- [x] **Phase 4**: Workflow refinement and optimization (v2.0.0).
- [ ] **Phase 5**: Backend API integration (Django (Previous backend architecture discarded. New backend architecture pending.) + PostgreSQL (Previous backend architecture discarded. New backend architecture pending.)).

## Future Backend Integration
While the frontend currently relies on mock services, the architecture is explicitly designed to support seamless integration with a planned **Django REST Framework (Previous backend architecture discarded. New backend architecture pending.)** backend. 
- API calls are abstracted into a `services/` layer.
- TanStack Query is used to manage asynchronous state, caching, and background fetching, preparing the app for real network requests.
- Form payloads (`react-hook-form` + `zod`) are standardized to match standard REST API JSON body constraints.

