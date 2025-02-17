
import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'

// Clear root element before mounting
const container = document.getElementById('root')
if (!container) throw new Error('Root element not found')
while (container.firstChild) {
  container.removeChild(container.firstChild)
}

const root = createRoot(container)

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
