import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import BiteBook from './App'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BiteBook />
  </StrictMode>,
)
