import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import KnnApp from './KnnApp'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <KnnApp />
  </StrictMode>
)
