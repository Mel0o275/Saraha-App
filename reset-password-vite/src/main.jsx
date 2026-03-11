import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import App from './App.jsx'
import ForgetPassword from './ForgetPassword.jsx'
import ResetPassword from './ResetPassword.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<ForgetPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
      </Routes>
    </Router>
  </React.StrictMode>
)