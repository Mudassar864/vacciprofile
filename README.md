# VacciPROFILE

A comprehensive vaccine information database and web application providing detailed information about licensed vaccines, vaccine candidates, manufacturers, licensing authorities, and National Immunization Technical Advisory Groups (NITAGs).

## Overview

VacciPROFILE is a Next.js-based web application designed to help users explore and compare vaccine-related information. The platform provides access to:

- **Licensed Vaccines**: Browse vaccines by pathogen, brand name, licenses, and vaccine types (single and combination)
- **Vaccine Candidates**: Explore vaccines currently in development by pathogen and manufacturer
- **Manufacturers**: Company information, product portfolios, vaccines, and licensing details
- **Licensing Authorities**: Regulatory bodies, approved vaccines, and licensing information
- **NITAGs**: National Immunization Technical Advisory Groups organized by country
- **Comparison Tool**: Compare vaccines data and specifications based on pathogens

## Features

- 🎨 Modern, responsive UI built with Tailwind CSS and shadcn/ui components
- 🔍 Advanced search and filtering capabilities
- 📊 Data visualization with charts and maps
- 🌍 Interactive world map for geographic data
- 📱 Mobile-friendly design
- ⚡ Fast performance with Next.js App Router and tag-based caching
- 🔄 On-demand cache revalidation for immediate UI updates
- 🔐 Type-safe development with TypeScript

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) 13.5.1 (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/) 5.2.2
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) 3.3.3
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/) (Radix UI primitives)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Forms**: [React Hook Form](https://react-hook-form.com/) with [Zod](https://zod.dev/) validation
- **Charts**: [Recharts](https://recharts.org/)
- **Maps**: [React Simple Maps](https://www.react-simple-maps.io/)
- **Notifications**: [Sonner](https://sonner.emilkowal.ski/)

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd vacciprofile-frontend
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

### Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build the application for production
- `npm run start` - Start the production server
- `npm run lint` - Run ESLint to check for code issues
- `npm run typecheck` - Run TypeScript type checking

## Project Structure

```
vacciprofile-frontend/
├── app/                    # Next.js App Router pages
│   ├── admin/             # Admin panel
│   ├── authorities/       # Licensing authorities pages
│   ├── candidates/        # Vaccine candidates pages
│   ├── compare/           # Comparison tool
│   ├── manufacturers/     # Manufacturers pages
│   ├── nitags/            # NITAGs pages
│   ├── vaccines/           # Licensed vaccines pages
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── admin/            # Admin-specific components
│   ├── common/           # Shared/common components
│   ├── ui/               # shadcn/ui components
│   └── ...               # Other feature components
├── hooks/                 # Custom React hooks
├── lib/                   # Utility functions and types
├── public/                # Static assets
└── ...                    # Configuration files
```

## Configuration

The project uses several configuration files:

- `next.config.js` - Next.js configuration
- `tailwind.config.ts` - Tailwind CSS configuration
- `tsconfig.json` - TypeScript configuration
- `components.json` - shadcn/ui configuration
- `postcss.config.js` - PostCSS configuration

## Caching & Performance

VacciPROFILE implements tag-based caching with on-demand revalidation for optimal performance:

- **Server-side caching**: All data fetches are cached for 1 hour
- **Tag-based invalidation**: Granular cache control by data type
- **On-demand revalidation**: Immediate cache updates when data changes
- **API endpoint**: `/api/revalidate` for triggering cache invalidation

See [docs/CACHING.md](docs/CACHING.md) for detailed caching documentation and backend integration guide.

## Development

### Code Style

- The project uses TypeScript with strict mode enabled
- ESLint is configured for code quality
- Components follow React best practices
- Path aliases are configured (`@/*` maps to the root directory)

### Adding New Components

The project uses shadcn/ui for UI components. To add new components:

```bash
npx shadcn-ui@latest add [component-name]
```

## Environment Variables

If you need to configure environment variables, create a `.env.local` file in the root directory. Add any required variables there (check with your team for specific requirements).

## Build for Production

To create an optimized production build:

```bash
npm run build
npm run start
```

## Contributing

1. Create a feature branch from `main`
2. Make your changes
3. Ensure all tests pass and code is properly formatted
4. Submit a pull request

## License

[Add your license information here]

## Support

For questions or issues, please [create an issue](link-to-issues) or contact the development team.

---

Built with ❤️ using Next.js and TypeScript

