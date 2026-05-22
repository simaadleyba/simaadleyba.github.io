import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import DecisionTreesApp from './DecisionTreesApp'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <DecisionTreesApp />
  </StrictMode>
)
