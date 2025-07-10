# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

FacturApp is a Next.js 15 application for Chilean electronic invoicing (facturación electrónica) that integrates with the Chilean SII (Servicio de Impuestos Internos). The application handles digital certificate management, invoice generation, and SII communication for tax compliance.

## Development Commands

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build the application for production
- `npm run start` - Start the production server
- `npm run lint` - Run ESLint to check code quality

## Architecture

### Tech Stack
- **Framework**: Next.js 15 with App Router
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js with credentials provider
- **UI**: Tailwind CSS with Radix UI components
- **State Management**: Zustand for client-side state
- **Forms**: React Hook Form with Zod validation

### Key Directories
- `src/app/` - Next.js App Router pages and API routes
- `src/components/` - Reusable UI components organized by feature
- `src/lib/` - Utility functions and service layers
- `src/hooks/` - Custom React hooks and stores
- `src/types/` - TypeScript type definitions
- `prisma/` - Database schema and migrations

### Database Models
- **User**: Contains SII certificate tokens and authentication data
- **Cliente**: Customer information for invoicing
- **Factura**: Invoice records with status tracking
- **Producto**: Product catalog
- **DetalleFactura**: Invoice line items

### SII Integration
The application integrates with Chile's SII tax authority for electronic invoicing:
- Digital certificate management stored in User model (`certificateToken`)
- SII seed/token workflow for authentication (`siiSeed`, `siiToken`)
- Invoice sending to SII certification environment
- Rate limiting for login attempts (5 per minute per email)

### Authentication Flow
- Uses NextAuth.js with credentials provider
- JWT-based sessions
- Rate limiting protection against brute force attacks
- Protected routes via middleware for `/dashboard/*` paths

### Component Organization
- Feature-based component structure (clients/, invoices/, products/)
- Shared UI components in `ui/` directory
- Modal components for CRUD operations
- Data tables with sorting and pagination

## SII Certificate Setup Process

1. Upload digital certificate (.pfx/.pem) via `/dashboard/configuracion`
2. Verify certificate and store token in database
3. Request SII seed via `GET /api/sii/semilla`
4. Obtain SII token via `POST /api/sii/token`
5. Send test invoice via `POST /api/sii/factura-prueba`

## Development Notes

- All API routes require authentication via NextAuth session
- Database operations use Prisma client with proper error handling
- Forms use React Hook Form with Zod schemas for validation
- Components follow Chilean business terminology (factura, cliente, producto)
- The application targets the SII certification environment for testing