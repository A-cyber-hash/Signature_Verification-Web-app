#!/usr/bin/env node
/**
 * SignaSecure Enterprise Frontend Setup
 * Production-ready React application with enterprise features
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Setting up SignaSecure Enterprise Frontend...');

// Create frontend directory structure
const frontendDirs = [
    'frontend',
    'frontend/src',
    'frontend/src/components',
    'frontend/src/components/common',
    'frontend/src/components/auth',
    'frontend/src/components/dashboard',
    'frontend/src/components/signatures',
    'frontend/src/components/verification',
    'frontend/src/components/analytics',
    'frontend/src/components/reports',
    'frontend/src/components/admin',
    'frontend/src/pages',
    'frontend/src/hooks',
    'frontend/src/services',
    'frontend/src/store',
    'frontend/src/utils',
    'frontend/src/constants',
    'frontend/src/assets',
    'frontend/src/assets/images',
    'frontend/src/assets/icons',
    'frontend/src/styles',
    'frontend/public',
    'frontend/public/images',
    'frontend/public/icons',
];

frontendDirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`✅ Created directory: ${dir}`);
    }
});

// Create package.json
const packageJson = {
    "name": "signasecure-enterprise-frontend",
    "version": "1.0.0",
    "description": "SignaSecure Enterprise - AI Signature Verification Platform",
    "private": true,
    "dependencies": {
        "@mui/material": "^5.14.18",
        "@mui/icons-material": "^5.14.18",
        "@mui/lab": "^5.0.0-alpha.155",
        "@mui/x-charts": "^6.18.1",
        "@mui/x-data-grid": "^6.18.1",
        "@mui/x-date-pickers": "^6.18.1",
        "@reduxjs/toolkit": "^1.9.7",
        "react": "^18.2.0",
        "react-dom": "^18.2.0",
        "react-redux": "^8.1.3",
        "react-router-dom": "^6.20.1",
        "axios": "^1.6.2",
        "formik": "^2.4.5",
        "yup": "^1.3.3",
        "chart.js": "^4.4.0",
        "react-chartjs-2": "^5.2.0",
        "react-dropzone": "^14.2.3",
        "react-image-crop": "^11.0.4",
        "framer-motion": "^10.16.16",
        "date-fns": "^2.30.0",
        "lodash": "^4.17.21",
        "uuid": "^9.0.1",
        "js-cookie": "^3.0.5",
        "react-helmet-async": "^1.3.0",
        "react-hot-toast": "^2.4.1",
        "react-window": "^1.8.8",
        "react-virtualized-auto-sizer": "^1.0.20",
        "recharts": "^2.8.0",
        "socket.io-client": "^4.7.4"
    },
    "devDependencies": {
        "@types/react": "^18.2.39",
        "@types/react-dom": "^18.2.17",
        "@vitejs/plugin-react": "^4.2.0",
        "vite": "^5.0.5",
        "eslint": "^8.54.0",
        "eslint-plugin-react": "^7.33.2",
        "eslint-plugin-react-hooks": "^4.6.0",
        "prettier": "^3.1.0",
        "typescript": "^5.3.2",
        "autoprefixer": "^10.4.16",
        "postcss": "^8.4.32",
        "tailwindcss": "^3.3.6"
    },
    "scripts": {
        "dev": "vite",
        "build": "vite build",
        "preview": "vite preview",
        "lint": "eslint . --ext js,jsx,ts,tsx",
        "lint:fix": "eslint . --ext js,jsx,ts,tsx --fix",
        "format": "prettier --write \"src/**/*.{js,jsx,ts,tsx,json,css,scss,md}\"",
        "type-check": "tsc --noEmit",
        "test": "vitest",
        "test:coverage": "vitest --coverage"
    },
    "browserslist": {
        "production": [
            ">0.2%",
            "not dead",
            "not op_mini all"
        ],
        "development": [
            "last 1 chrome version",
            "last 1 firefox version",
            "last 1 safari version"
        ]
    }
};

fs.writeFileSync('frontend/package.json', JSON.stringify(packageJson, null, 2));
console.log('✅ Created package.json');

// Create vite.config.js
const viteConfig = `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@pages': path.resolve(__dirname, './src/pages'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@services': path.resolve(__dirname, './src/services'),
      '@store': path.resolve(__dirname, './src/store'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@constants': path.resolve(__dirname, './src/constants'),
      '@assets': path.resolve(__dirname, './src/assets'),
      '@styles': path.resolve(__dirname, './src/styles'),
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          mui: ['@mui/material', '@mui/icons-material'],
          charts: ['chart.js', 'react-chartjs-2', 'recharts'],
        },
      },
    },
  },
  define: {
    'process.env': process.env,
  },
});`;

fs.writeFileSync('frontend/vite.config.js', viteConfig);
console.log('✅ Created vite.config.js');

// Create index.html
const indexHtml = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="SignaSecure Enterprise - AI-Powered Signature Verification Platform" />
    <meta name="keywords" content="signature verification, AI, fraud detection, enterprise security" />
    <meta name="author" content="SignaSecure Enterprise" />
    
    <!-- Preconnect to external resources -->
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    
    <!-- Google Fonts -->
    <link
      href="https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400;500;600;700;800;900&display=swap"
      rel="stylesheet"
    />
    
    <!-- Favicon -->
    <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
    <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
    <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
    <link rel="manifest" href="/site.webmanifest" />
    
    <title>SignaSecure Enterprise - AI Signature Verification</title>
    
    <!-- Critical CSS -->
    <style>
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }
      
      body {
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        min-height: 100vh;
      }
      
      #root {
        min-height: 100vh;
      }
      
      /* Loading animation */
      .loading-spinner {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100vh;
        flex-direction: column;
        gap: 20px;
      }
      
      .spinner {
        width: 50px;
        height: 50px;
        border: 3px solid rgba(255, 255, 255, 0.3);
        border-radius: 50%;
        border-top-color: #fff;
        animation: spin 1s ease-in-out infinite;
      }
      
      @keyframes spin {
        to { transform: rotate(360deg); }
      }
      
      .loading-text {
        color: white;
        font-size: 18px;
        font-weight: 500;
      }
    </style>
  </head>
  <body>
    <div id="root">
      <div class="loading-spinner">
        <div class="spinner"></div>
        <div class="loading-text">Loading SignaSecure Enterprise...</div>
      </div>
    </div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>`;

fs.writeFileSync('frontend/index.html', indexHtml);
console.log('✅ Created index.html');

// Create ESLint config
const eslintConfig = `module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    'eslint:recommended',
    '@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs'],
  parser: '@typescript-eslint/parser',
  plugins: ['react-refresh'],
  rules: {
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],
    'no-console': 'warn',
    'no-debugger': 'error',
    'no-unused-vars': 'warn',
    'react/prop-types': 'off',
  },
};`;

fs.writeFileSync('frontend/.eslintrc.cjs', eslintConfig);
console.log('✅ Created ESLint config');

// Create Prettier config
const prettierConfig = {
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "bracketSpacing": true,
  "bracketSameLine": false,
  "arrowParens": "avoid"
};

fs.writeFileSync('frontend/.prettierrc', JSON.stringify(prettierConfig, null, 2));
console.log('✅ Created Prettier config');

// Create TypeScript config
const tsConfig = {
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@components/*": ["./src/components/*"],
      "@pages/*": ["./src/pages/*"],
      "@hooks/*": ["./src/hooks/*"],
      "@services/*": ["./src/services/*"],
      "@store/*": ["./src/store/*"],
      "@utils/*": ["./src/utils/*"],
      "@constants/*": ["./src/constants/*"],
      "@assets/*": ["./src/assets/*"],
      "@styles/*": ["./src/styles/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
};

fs.writeFileSync('frontend/tsconfig.json', JSON.stringify(tsConfig, null, 2));
console.log('✅ Created TypeScript config');

console.log('✅ Frontend setup completed successfully!');
console.log('\\n🔧 Next steps:');
console.log('1. cd frontend');
console.log('2. npm install');
console.log('3. npm run dev');