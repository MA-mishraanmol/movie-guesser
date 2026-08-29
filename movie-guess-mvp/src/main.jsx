import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import AuroraBackground from './components/AuroraBackground.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuroraBackground />
    <App />
  </StrictMode>,
)
