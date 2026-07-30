import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { AppProvider } from './context/AppContext.tsx'

// Check dark mode preference on startup
const savedDarkMode = localStorage.getItem('zen_dark_mode');
if (savedDarkMode === 'true') {
  document.body.classList.add('dark-mode');
} else if (savedDarkMode === 'false') {
  document.body.classList.remove('dark-mode');
} else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
  document.body.classList.add('dark-mode');
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppProvider>
      <App />
    </AppProvider>
  </React.StrictMode>,
)
