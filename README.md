# Paradigm Home Health Employee Directory

A clean, fast employee directory web application for Paradigm Home Health. Features a mobile-friendly interface with search, region-based filtering, and location tabs across 9 offices in 4 Texas regions.

## Features

- **Employee Directory**: Browse employees with contact information
- **Live Search**: Search by name, title, team, or location with instant results
- **Region & Location Filtering**: Filter by region (ETX, DFW, WTX, CTX) then drill into individual locations
- **Admin Portal**: Role-based admin panel with approval workflows
- **CSV Import/Export**: Upload and manage employee data via CSV
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices

## Locations

| Region | Offices |
|--------|---------|
| ETX | Tyler, Longview |
| DFW | Keller, Plano |
| WTX | Abilene, San Angelo |
| CTX | Temple, Whitney, Cedar Park |

## Tech Stack

- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Prisma** - Database ORM (PostgreSQL)
- **Tailwind CSS** - Utility-first styling
- **PapaParse** - CSV import/export
- **Heroicons** - Icon library

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## Deployment

This application is optimized for deployment on Vercel with Vercel Postgres.

## Project Structure

```
src/
├── app/
│   ├── admin/           # Admin portal (login, dashboard)
│   ├── api/             # API routes (employees, admin)
│   └── page.tsx         # Main directory page
├── components/
│   ├── AppleDirectoryView.tsx  # Main directory UI
│   ├── LocationTabs.tsx        # Region/location filtering
│   ├── ExportMenu.tsx          # CSV/Excel export
│   ├── CSVImport.tsx           # CSV upload
│   └── admin/                  # Admin components
├── lib/
│   ├── database.ts      # Prisma database operations
│   ├── locations.ts     # Region & location config
│   ├── csvImport.ts     # CSV parsing utilities
│   └── auth-helpers.ts  # Authentication helpers
└── styles/
    ├── phh-design-system.css   # Brand design system
    ├── apple-design-system.css # UI component styles
    └── directory-layout.css    # Card grid layout
```

## Admin Portal

Access the admin portal at `/admin` to:
- Manage employees (add, edit, delete with approval workflow)
- Upload new employee data via CSV
- Export current data to CSV/Excel
- Manage admin users and roles
- Version history with rollback

## License

ISC
