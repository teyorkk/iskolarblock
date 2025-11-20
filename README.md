## IskolarBlock – Capstone Project Overview

IskolarBlock is a capstone initiative of students from La Consolacion University Philippines.  
The platform demonstrates how blockchain-assisted workflows, automated screening, and transparent reporting can strengthen barangay-level scholarship administration. This documentation summarises the project’s objectives, architecture, and operational guidelines in an academic tone suited for faculty review and future research.

## 1. Project Rationale and Objectives

1. Deliver an end-to-end digital scholarship portal that streamlines applicant onboarding, evaluation, and granting.
2. Employ verifiable ledger concepts to increase trust in fund reimbursements and applicant status tracking.
3. Provide near real-time analytics (e.g., Live Impact metrics) to support evidence-based decision making for local administrators.
4. Serve as a pedagogical artifact illustrating the application of contemporary web technologies (Next.js, Supabase, OCR services) in a civic context.

## 2. System Architecture

| Layer                | Description                                                                                                                 |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| Presentation         | Next.js App Router (React 18) with responsive landing, user, and admin interfaces.                                          |
| Application Services | Client/server Supabase SDK usage, session provider, custom hooks for scroll and device handling.                            |
| Data Management      | Supabase Postgres for persistent entities (`User`, `Application`, `Budget`, `Awarding`, etc.), plus Supabase Auth for RBAC. |
| Integrations         | Document OCR helpers, blockchain service stubs, PDF report generation, and dynamic analytics (Live Impact API).             |

The repository follows a monolithic structure (`app/`, `components/`, `lib/`) to keep server routes, shared utilities, and UI primitives co-located.

## 3. Technology Stack

| Domain                         | Technologies                                                            |
| ------------------------------ | ----------------------------------------------------------------------- |
| Frontend Framework             | Next.js 15 (App Router), React 18, Tailwind CSS, Framer Motion          |
| UI Component Systems           | shadcn/ui (Radix UI primitives), lucide-react iconography               |
| Programming Language           | TypeScript (strict mode)                                                |
| Authentication & Authorization | Supabase Auth, JSON Web Tokens (JWT) for session validation             |
| Database & Persistence         | Supabase PostgreSQL with RLS policies                                   |
| Document Intelligence          | Tesseract OCR (text extraction), PDF.js (viewer/processing)             |
| Automation & Orchestration     | n8n (workflow automation hooks)                                         |
| AI Assistance                  | Google Gemini Flash 2.5 (for exploratory reasoning and content support) |
| Reporting & Assets             | PDFKit (formal reports)                                                 |
| Tooling & DevOps               | PNPM, ESLint, Vercel deployments                                        |

## 4. Environment Configuration

Create an `.env.local` file with:

```
NEXT_PUBLIC_SUPABASE_URL=<project-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
SUPABASE_SERVICE_ROLE_KEY=<service-role>
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Additional secrets (e.g., OCR providers) should be declared following the patterns in `lib/services`.

## 5. Installation and Execution

```bash
pnpm install              # install dependencies
pnpm dev                  # launch local development server at http://localhost:3000
pnpm lint                 # run ESLint/TypeScript checks
pnpm build && pnpm start  # production build preview
```

For teams preferring other package managers, equivalent `npm`, `yarn`, or `bun` commands may be substituted, although PNPM is the canonical choice for this repository.

## 6. Key Application Domains

1. **Landing Page** – Presents Live Impact statistics drawn from Supabase aggregations and describes platform benefits for stakeholders.
2. **Applicant Portal** – Guides scholars through personal information capture, document upload with OCR validation, and status monitoring.
3. **Administrator Suite** – Provides dashboards, screening workflows, awarding controls, pagination-equipped tables, and PDF reporting.
4. **Transparency Features** – Live Impact API (`/api/live-impact`) and blockchain service abstractions support auditability and future extensibility.

## 7. Data Flow Summary

1. Applicants authenticate via Supabase Auth, create or renew applications, and upload required credentials.
2. Admins review submissions, adjust budget allocations, and grant awards. Each awarding updates reimbursement metrics.
3. Aggregated statistics (e.g., total applicants, granted scholars) feed both admin dashboards and the public landing page.

## 8. Deployment Guidelines

1. **Vercel** – Recommended target; connect the repository, configure environment variables, and ensure the Supabase project allows the deployed domain.
2. **Supabase** – Maintain migrations, RLS policies, and service-role keys securely. Consider separate projects for staging and production.
3. **Monitoring** – Use Vercel analytics plus Supabase telemetry (pg_stat_statements, logs) to observe performance and enforce quotas.

## 9. Academic Contribution and Future Work

The project exemplifies how localized governance challenges can be addressed through contemporary web engineering. Future enhancements may include:

- Formal integration with an actual blockchain network beyond the current service abstraction.
- Advanced analytics (predictive applicant success, needs-based prioritisation).
- Accessibility audits and multilingual support to broaden community adoption.

## 10. Citation

When referencing this work, cite it as:

> “IskolarBlock: A Blockchain-enabled Scholarship Management Platform.” Capstone Project, La Consolacion University Philippines, 2025.

---

For inquiries, collaboration proposals, or academic review, please contact the project maintainers through the repository issue tracker or the supervising faculty representatives at La Consolacion University Philippines.
