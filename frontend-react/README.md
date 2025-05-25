# RecipeFindr Frontend (React + TypeScript + Vite)

A modern React frontend application for the RecipeFindr project, built with TypeScript and Vite for optimal development experience and production performance.

## 🚀 Features

- **TypeScript Configuration**: Full TypeScript support with strict type checking
- **Environment-Driven Configuration**: Configurable through environment variables
- **Optimized Build**: Chunk splitting and performance optimizations
- **Modern Development Stack**: Vite with Hot Module Replacement (HMR)
- **Path Aliases**: Organized imports with `@components`, `@pages`, `@services`, etc.

## 📁 Project Structure

```
frontend-react/
├── src/
│   ├── components/          # Reusable UI components
│   ├── pages/              # Page components
│   ├── services/           # API and external services
│   ├── config/             # Application configuration
│   │   └── app.ts          # Centralized app config
│   ├── vite-env.d.ts       # TypeScript environment definitions
│   ├── main.tsx            # Application entry point
│   └── App.tsx             # Main application component
├── .env                    # Environment variables (local)
├── .env.example            # Environment template
├── vite.config.ts          # Vite configuration (TypeScript)
├── tsconfig.json           # TypeScript configuration
└── package.json            # Dependencies and scripts
```

## 🛠️ Environment Configuration

Create a `.env` file based on `.env.example`:

```bash
cp .env.example .env
```

Available environment variables:

- `VITE_API_BASE_URL`: Backend API URL (default: http://localhost:5002)
- `VITE_APP_PORT`: Development server port (default: 3000)
- `VITE_APP_HOST`: Development server host (default: localhost)
- `VITE_BUILD_SOURCEMAP`: Enable source maps in production (default: false)
- `VITE_BUILD_MINIFY`: Enable minification (default: true)

## 🏃‍♂️ Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### TypeScript Commands

```bash
# Type checking only
npm run type-check

# Type checking in watch mode
npm run type-check:watch
```

## 🔧 Development

The application uses:

- **Vite** for fast development and optimized builds
- **TypeScript** for type safety and better developer experience
- **React Router** for client-side routing
- **Tailwind CSS** for styling
- **Path aliases** for clean imports:
  - `@/` → `src/`
  - `@components/` → `src/components/`
  - `@pages/` → `src/pages/`
  - `@services/` → `src/services/`
  - `@config/` → `src/config/`

## 🏗️ Build Optimizations

The production build includes:

- **Chunk Splitting**: Vendor libraries separated for better caching
- **Code Splitting**: Dynamic imports for route-based splitting
- **Asset Optimization**: Minification and compression
- **Source Maps**: Optional source map generation

## 🔌 API Integration

The frontend connects to the RecipeFindr backend through configurable API endpoints. All API calls are centralized in the `src/services/` directory with proper TypeScript interfaces.

## 📝 Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run type-check` - Run TypeScript type checking
- `npm run type-check:watch` - Run type checking in watch mode

## 🤝 Contributing

1. Ensure TypeScript compilation passes: `npm run type-check`
2. Test the build: `npm run build`
3. Follow the established project structure and naming conventions
