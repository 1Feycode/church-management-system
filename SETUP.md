# Project Setup Documentation

## Overview

This document describes the setup and organization of the Church Management System React project, built with Vite. The project has been cleaned and organized to provide a professional starting point for development.

## Folder Structure

The project follows a clean, scalable folder structure under the `src/` directory:

```
src/
├── components/     # Reusable UI components
├── pages/          # Page-level components
├── routes/         # Routing configuration
├── data/           # Data management and API calls
├── App.jsx         # Root application component
└── main.jsx        # Application entry point
```

### Directory Purposes

- **components/** - Contains reusable UI components such as buttons, forms, modals, and other shared elements that can be used across multiple pages
- **pages/** - Contains page-level components that represent complete views or screens in the application (e.g., Dashboard, Login, Settings)
- **routes/** - Contains routing configuration files for React Router, defining the navigation structure of the application
- **data/** - Contains data management logic, API client setup, data fetching utilities, and helper functions for working with external data sources

## Files Removed During Cleanup

The following files were removed from the default Vite template to create a clean starting point:

| File | Reason for Removal |
|------|-------------------|
| `src/App.css` | Default component styles - not needed for clean setup |
| `src/index.css` | Default global styles - will add custom styles later |
| `src/assets/react.svg` | React logo from template - not needed for production app |
| `public/vite.svg` | Vite logo from template - not needed for production app |

## Essential Files Preserved

The following files are essential for the project to function and must be preserved:

| File | Purpose |
|------|---------|
| `package.json` | Project dependencies, scripts, and metadata |
| `vite.config.js` | Vite build tool configuration with React plugin |
| `index.html` | HTML entry point for the application |
| `.gitignore` | Git version control ignore rules |
| `eslint.config.js` | ESLint configuration for code quality |
| `src/main.jsx` | Application entry point that renders the root component |
| `src/App.jsx` | Root React component |

## Next Steps

Now that the project structure is in place, you can:

1. **Add routing**: Install React Router with `npm install react-router-dom` and configure routes in the `routes/` folder
2. **Add styling**: Choose and install a styling solution (CSS Modules, Tailwind CSS, styled-components, etc.)
3. **Create components**: Start building reusable UI components in the `components/` folder
4. **Build pages**: Create page-level components in the `pages/` folder
5. **Set up data layer**: Configure API clients and data fetching utilities in the `data/` folder

## Running the Project

- **Development server**: `npm run dev` - Starts the Vite development server on http://localhost:5173
- **Build for production**: `npm run build` - Creates an optimized production build
- **Preview production build**: `npm run preview` - Previews the production build locally

## Dependencies

### Core Dependencies
- **react** (^18.3.1) - React library for building user interfaces
- **react-dom** (^18.3.1) - React DOM rendering

### Development Dependencies
- **vite** (^6.0.5) - Fast build tool and development server
- **@vitejs/plugin-react** (^4.3.4) - Vite plugin for React support
- **eslint** (^9.17.0) - JavaScript linting tool
- **@eslint/js** (^9.17.0) - ESLint JavaScript configuration
- **eslint-plugin-react** (^7.37.2) - React-specific linting rules
- **eslint-plugin-react-hooks** (^5.0.0) - Linting rules for React Hooks
- **eslint-plugin-react-refresh** (^0.4.16) - Linting rules for React Fast Refresh
- **globals** (^15.13.0) - Global variables for different environments

## Project Status

✅ Project initialized with Vite React template  
✅ Unnecessary boilerplate files removed  
✅ Professional folder structure created  
✅ Clean entry points configured  
✅ Project verified and functional  

The project is now ready for feature development!
