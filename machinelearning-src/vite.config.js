import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export default defineConfig({
  plugins: [react()],
  base: '/machinelearning/',
  build: {
    outDir: '../machinelearning',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        knn: resolve(__dirname, 'knn/index.html'),
        decisiontrees: resolve(__dirname, 'decisiontrees/index.html'),
        evaluationmetrics: resolve(__dirname, 'evaluationmetrics/index.html'),
      },
    },
  },
})
