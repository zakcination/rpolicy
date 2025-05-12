"use client"

import { useState } from "react"
import { Routes, Route, useNavigate, useLocation, Navigate } from "react-router-dom"
import { Sidebar } from "./Sidebar"
import UploadPolicy from "./UploadPolicy"
import GenerateQuestionnaire from "./GenerateQuestionnaire"
import ViewPolicies from "./ViewPolicies"
import ViewQuestionnaires from "./ViewQuestionnaires"
import ViewResponses from "./ViewResponses"
import QuestionnaireReport from "./QuestionnaireReport"
import ViewReports from "./ViewReports"
import { Button } from "@/components/ui/button"
import { LogOut, Menu } from "lucide-react"
import HealthIndicator from "../shared/HealthIndicator"

interface AdminDashboardProps {
  onLogout: () => void
}

export default function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  // Get current section title based on path
  const getTitle = () => {
    const path = location.pathname.split("/").pop() || ""

    switch (path) {
      case "policy-upload":
        return "Upload Policy"
      case "policies":
        return "View Policies"
      case "questionnaire-generate":
        return "Generate Questionnaire"
      case "questionnaires":
        return "View Questionnaires"
      case "responses":
        return "View Responses"
      case "reports":
        return "View Reports"
      case "report":
        return "Questionnaire Report"
      default:
        return "Dashboard"
    }
  }

  return (
    <div className="flex h-screen bg-secondary/20">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-40 flex md:hidden ${sidebarOpen ? "" : "hidden"}`}>
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-75 transition-opacity"
          onClick={() => setSidebarOpen(false)}
        ></div>
        <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              type="button"
              className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              onClick={() => setSidebarOpen(false)}
            >
              <span className="sr-only">Close sidebar</span>
              <svg
                className="h-6 w-6 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <Sidebar onClose={() => setSidebarOpen(false)} />
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-64">
          <Sidebar />
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <header className="bg-white shadow-sm z-10">
          <div className="px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
            <div className="flex items-center">
              <button
                type="button"
                className="md:hidden -ml-0.5 -mt-0.5 h-12 w-12 inline-flex items-center justify-center rounded-md text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary"
                onClick={() => setSidebarOpen(true)}
              >
                <span className="sr-only">Open sidebar</span>
                <Menu className="h-6 w-6" aria-hidden="true" />
              </button>
              <h1 className="ml-3 text-xl font-semibold text-primary">{getTitle()}</h1>
            </div>
            <div className="flex items-center gap-4">
              <HealthIndicator />
              <Button
                variant="outline"
                size="sm"
                onClick={onLogout}
                className="flex items-center gap-2 border-accent text-primary hover:bg-accent/20"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          </div>
        </header>

        <main className="flex-1 relative overflow-y-auto focus:outline-none bg-secondary/20">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              <Routes>
                <Route path="/" element={<Navigate to="/admin/policy-upload" replace />} />
                <Route path="/policy-upload" element={<UploadPolicy />} />
                <Route path="/policies" element={<ViewPolicies />} />
                <Route path="/questionnaire-generate" element={<GenerateQuestionnaire />} />
                <Route path="/questionnaires" element={<ViewQuestionnaires />} />
                <Route path="/responses" element={<ViewResponses />} />
                <Route path="/reports" element={<ViewReports />} />
                <Route path="/questionnaire/:token/report" element={<QuestionnaireReport />} />
              </Routes>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
