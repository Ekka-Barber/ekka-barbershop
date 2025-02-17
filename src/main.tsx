
import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'
import { TooltipProvider } from "@/components/ui/tooltip"

const container = document.getElementById('root')
if (!container) throw new Error('Root element not found')

const root = createRoot(container)

// Wrap the entire app with React.StrictMode
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
