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
        modelevaluation: resolve(__dirname, 'modelevaluation/index.html'),
        mlemap: resolve(__dirname, 'mlemap/index.html'),
        naivebayes: resolve(__dirname, 'naivebayes/index.html'),
        logisticregression: resolve(__dirname, 'logisticregression/index.html'),
        linearregression: resolve(__dirname, 'linearregression/index.html'),
        handlingimbalanceddata: resolve(__dirname, 'handlingimbalanceddata/index.html'),
        handlingmissingdata: resolve(__dirname, 'handlingmissingdata/index.html'),
      },
    },
  },
})
