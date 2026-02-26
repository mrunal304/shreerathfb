# Shree Rath Restaurant Feedback System

## Overview

A full-stack web application for "Shree Rath" Pure Veg restaurant that manages customer feedback via QR codes. Customers scan a QR code to submit ratings across 5 categories (Interior, Food, Service, Staff, Hygiene), and restaurant staff can view and manage feedback through an admin dashboard with analytics.

Key features:
- Mobile-first customer feedback form with star ratings
- Duplicate submission prevention (same phone + date)
- Admin dashboard with KPIs, charts, and feedback management
- Contact tracking for follow-up with customers

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with Vite for development and building
- **Routing**: Wouter for lightweight client-side routing
- **Styling**: Tailwind CSS with custom restaurant theme (orange primary, cream background, wood brown accents)
- **UI Components**: Shadcn UI component library with Radix UI primitives
- **State Management**: TanStack Query (React Query) for server state with 15-second polling for live updates
- **Forms**: React Hook Form with Zod validation via @hookform/resolvers
- **Animations**: Framer Motion for page transitions and confetti effects
- **Charts**: Recharts for dashboard analytics visualization

### Backend Architecture
- **Runtime**: Node.js with Express 5
- **Database**: MongoDB with Mongoose ODM (connection via MONGODB_URI environment variable)
- **Session Management**: Express-session with MemoryStore for development
- **Authentication**: Passport.js with Local Strategy (hardcoded admin credentials: username "admin", password "shreerath_admin_2026")
- **API Design**: RESTful endpoints under `/api/*` prefix with Zod schema validation

### Data Storage
- **Primary Database**: MongoDB
- **Schema Location**: `shared/schema.ts` contains Zod schemas for validation
- **Mongoose Models**: Defined in `server/storage.ts`
- **Key Collections**: Feedback (with compound unique index on phoneNumber + dateKey for duplicate prevention)

### Authentication & Authorization
- **Session-based authentication using Passport.js**
- **Admin-only access to dashboard routes**
- **Persistent sessions via express-session**

### Build System
- **Development**: tsx for TypeScript execution, Vite dev server with HMR
- **Production**: esbuild for server bundling, Vite for client build
- **Output**: `dist/` directory with `dist/public` for static assets

### Path Aliases
- `@/*` → `./client/src/*`
- `@shared/*` → `./shared/*`
- `@assets/*` → `./attached_assets/*`

## External Dependencies

### Database
- **MongoDB**: Primary data store (requires MONGODB_URI environment variable)
- **Drizzle Config**: Present but implementation uses MongoDB/Mongoose.

### Third-Party Libraries
- **UI**: Radix UI primitives, Lucide React icons, Embla Carousel
- **Data Visualization**: Recharts
- **Date Handling**: date-fns
- **Validation**: Zod
- **Animation**: Framer Motion, react-confetti

### Environment Variables Required
- `MONGODB_URI`: MongoDB connection string
- `SESSION_SECRET`: Session signing secret
- `PORT`: Port to listen on (defaults to 5000)

## Current Status
- Project imported and configured.
- `tsx` installed and dev server running.
- MongoDB connection verified.
- App is responding correctly on port 5000.
