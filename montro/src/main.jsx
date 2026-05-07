import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import App from './App'
import { MontroProvider } from './context/MontroContext'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <MontroProvider>
      <App />
    </MontroProvider>
  </React.StrictMode>
)
