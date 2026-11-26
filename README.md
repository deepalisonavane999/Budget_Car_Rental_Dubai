# Budget Rent a Car UAE — Unified Customer Workspace (Genesys Cloud CRM)

A pixel-perfect, high-performance **React + Vite + Tailwind CSS** implementation of the **AGMC | Budget Rent a Car UAE Contact Center Workspace** integrated with **Genesys Cloud**.

---

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Start Vite development server
npm run dev

# 3. Build for production (TypeScript + Vite bundle)
npm run build

# 4. Preview production build
npm run preview
```

---

## 🖥️ Screen Views & Routes

All routes feature **deep-link synchronization** and **refresh persistence** (preserving the active tab, subtab, communication dock mode, and timeline filter):

| Route | View | Description | Screenshot Reference |
|---|---|---|---|
| `/rentals` | **Rentals Workspace** | Active rental `RA-20418`, previous rental `RA-20301`, phone telephony dock & transfer module | `s1.png` & `s4_Rental_EmailPage.png` |
| `/reservations` | **Availability & Quotation** | Quote `RES-56792`, vehicle class specs, quote breakdown, lead history, live chat dock | `s4_ReservationsPage.png` |
| `/billing` | **Billing & Statement** | Rental `RA-20301`, financial summary, charge breakdown, fines & Salik, transactions, refund actions | `s2_BillingPage.png` |
| `/operations` | **Operations Dashboard** | Roadside assistance request `RSA-10510`, vehicle drivable alert, 5-step progress stepper, dispatch details, wrap-up | `s6_OperationsDashbaordPage.png` |
| `/cases` | **Cases Console** | Case `FIN-10482`, SLA status, internal & customer discussion threads, quick templates, status radio options | `s3_CasesPage.png` |

---

## 🔄 Refresh & URL State Persistence

The application guarantees that refreshing the page keeps the user on the exact same view:
- **Main View**: via `pathname` (`/rentals`, `/reservations`, `/billing`, `/operations`, `/cases`)
- **Communication Dock**: via query param `?comm=phone`, `?comm=chat`, or `?comm=email`
- **Operations Subtabs**: via query param `?op=roadside`, `?op=maintenance`, `?op=replacement`, etc.
- **Activity Timeline**: via query param `?activity=calls`, `?activity=chats`, `?activity=emails`, or `?activity=tickets`

Example URL:
`http://localhost:3000/operations?op=roadside&comm=phone&activity=calls`

---

## ⚡ Performance & Lazy Loading

- Every page is code-split with `React.lazy()` and wrapped in `<Suspense>`.
- Bespoke `<SkeletonCard>` placeholders prevent layout shifts while data is fetched.
- Production build delivers modular chunks under ~15KB per page.

---

## 📁 Project Structure

```
Budget_Dubai/
├── Screens_images/          # Source mockups & docx catalogue
├── PostmanCollection/       # Customer Portal Postman Collection
├── public/
│   └── assets/
│       └── nissan-sunny.png # Extracted vehicle asset
├── src/
│   ├── components/
│   │   ├── common/          # Badge, SkeletonCard, NavigationTabs
│   │   ├── communication/   # CommunicationDock, Phone, Chat, Email
│   │   ├── layout/          # GenesysCallHeader, CustomerSidebar, ActivitySidebar, Footer
│   │   └── modals/          # CustomerEditModal, TransferCallModal
│   ├── context/
│   │   └── WorkspaceContext.tsx # Central telephony, customer, and routing state
│   ├── pages/               # RentalsPage, ReservationsPage, BillingPage, OperationsPage, CasesPage
│   ├── routes/              # AppRoutes.tsx (Lazy routes & redirects)
│   ├── services/            # mockData.ts (mirrors Postman API responses)
│   ├── types/               # crm.types.ts (strong TypeScript schemas)
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── package.json
├── vite.config.ts
├── tailwind.config.js
└── tsconfig.json
```
