import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import EvaluationMetricsApp from './EvaluationMetricsApp'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <EvaluationMetricsApp />
  </StrictMode>
)
