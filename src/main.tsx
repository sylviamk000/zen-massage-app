import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { AppProvider } from './context/AppContext.tsx'

// Check dark mode preference on startup
if (localStorage.getItem('zen_dark_mode') === 'true' || 
   (!localStorage.getItem('zen_dark_mode') && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
  document.body.classList.add('dark-mode');
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppProvider>
      <App />
    </AppProvider>
  </React.StrictMode>,
)
