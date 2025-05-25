import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import type { UserConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ command, mode }): UserConfig => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '')
  
  // Configuration constants from environment variables
  const API_BASE_URL = env.VITE_API_BASE_URL || 'http://localhost:5002'
  const APP_PORT = parseInt(env.VITE_APP_PORT || '3000', 10)
  const APP_HOST = env.VITE_APP_HOST || 'localhost'
  const BUILD_SOURCEMAP = env.VITE_BUILD_SOURCEMAP === 'true'
  const BUILD_OUTDIR = env.VITE_BUILD_OUTDIR || 'dist'
  
  // Default supported extensions
  const SUPPORTED_EXTENSIONS = ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json']
  
  // API proxy configuration
  const API_PROXY_CONFIG = {
    '/api': {
      target: API_BASE_URL,
      changeOrigin: true,
      secure: false,
      rewrite: (path: string) => {
        console.log(`Proxying request: ${path} -> ${API_BASE_URL}${path}`)
        return path
      }
    }
  }

  return {
    plugins: [react()],
    
    server: {
      port: APP_PORT,
      host: APP_HOST,
      proxy: API_PROXY_CONFIG,
      // Enable CORS for development
      cors: true,
      // Auto-open browser in development
      open: command === 'serve' ? true : false
    },
    
    resolve: {
      extensions: SUPPORTED_EXTENSIONS,
      alias: {
        '@': path.resolve(__dirname, './src'),
        // Add more aliases as needed
        '@components': path.resolve(__dirname, './src/components'),
        '@pages': path.resolve(__dirname, './src/pages'),
        '@services': path.resolve(__dirname, './src/services'),
        '@utils': path.resolve(__dirname, './src/utils'),
        '@context': path.resolve(__dirname, './src/context'),
        '@assets': path.resolve(__dirname, './src/assets')
      }
    },
    
    build: {
      sourcemap: BUILD_SOURCEMAP,
      outDir: BUILD_OUTDIR,
      // Optimize build performance
      target: 'esnext',
      minify: 'esbuild',
      // Chunk optimization
      rollupOptions: {
        output: {
          manualChunks: {
            // Split vendor code into separate chunks
            vendor: ['react', 'react-dom'],
            router: ['react-router-dom']
          }
        }
      }
    },
    
    // Define global constants
    define: {
      __API_BASE_URL__: JSON.stringify(API_BASE_URL),
      __APP_VERSION__: JSON.stringify(process.env.npm_package_version || '1.0.0'),
      __BUILD_TIME__: JSON.stringify(new Date().toISOString())
    },
    
    // CSS preprocessing
    css: {
      postcss: './postcss.config.js',
      devSourcemap: command === 'serve'
    },
    
    // Performance optimizations
    optimizeDeps: {
      include: ['react', 'react-dom', 'react-router-dom']
    },
    
    // Preview server configuration (for production preview)
    preview: {
      port: APP_PORT + 1000, // Use different port for preview
      host: APP_HOST
    }
  }
})
