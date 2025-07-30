import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import App from './App'
import { AuthProvider } from './contexts/AuthContext'
import Practice from './pages/Practice'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/practice/:articleId" element={<Practice />} />
        </Routes>
      </Router>
    </AuthProvider>
  </React.StrictMode>,
)
