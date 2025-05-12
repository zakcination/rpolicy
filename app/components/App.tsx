"use client"

import { useState, useEffect } from "react"
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import AdminDashboard from "./admin/AdminDashboard"
import AdminLogin from "./admin/AdminLogin"
import Questionnaire from "./questionnaire/Questionnaire"
import NotFound from "./shared/NotFound"
import { authService } from "../services/api"
import { Toaster } from "@/components/ui/toaster"
import ThankYou from "./questionnaire/ThankYou"
import ResponseDetails from "./admin/ResponseDetails"

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Check if user is already authenticated
  useEffect(() => {
    const token = localStorage.getItem("authToken")
    if (token) {
      setIsAuthenticated(true)
    }
    setIsLoading(false)
  }, [])

  const handleLogin = async (username: string, password: string) => {
    try {
      // For backward compatibility during development
      if (username === "admin" && password === "admin") {
        setIsAuthenticated(true)
        localStorage.setItem("authToken", "dev-token")
        return true
      }

      // Try the backend API
      const response = await authService.login(username, password)
      if (response.token) {
        localStorage.setItem("authToken", response.token)
        setIsAuthenticated(true)
        return true
      }
      return false
    } catch (error) {
      console.error("Login failed:", error)
      return false
    }
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    localStorage.removeItem("authToken")
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary/20">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="mt-4 text-gray-600">Loading application...</p>
        </div>
      </div>
    )
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/admin" replace />} />
        <Route
          path="/admin/*"
          element={isAuthenticated ? <AdminDashboard onLogout={handleLogout} /> : <AdminLogin onLogin={handleLogin} />}
        />
        {/* Direct questionnaire access for respondents */}
        <Route path="/questionnaire/:token" element={<Questionnaire />} />
        <Route path="/thank-you/:token" element={<ThankYou />} />
        {/* Response details page */}
        <Route path="/admin/responses/:responseId" element={<ResponseDetails />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster />
    </Router>
  )
}
