import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './App.css'
import BiteBook from './App'
import { AuthProvider } from './context/AuthProvider'
import ThemeProvider from './context/ThemeProvider'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <ThemeProvider>
        <BiteBook />
      </ThemeProvider>
    </AuthProvider>
  </StrictMode>,
)
