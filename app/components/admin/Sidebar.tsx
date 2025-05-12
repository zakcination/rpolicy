"use client"

import { Link, useLocation } from "react-router-dom"
import { FileUp, FileText, BarChart3, ClipboardList, MessageSquare, PieChart } from "lucide-react"

interface SidebarProps {
  onClose?: () => void
}

export function Sidebar({ onClose }: SidebarProps) {
  const location = useLocation()

  const navigation = [
    { name: "Upload Policy", href: "/admin/policy-upload", icon: FileUp },
    { name: "View Policies", href: "/admin/policies", icon: FileText },
    { name: "Generate Questionnaire", href: "/admin/questionnaire-generate", icon: ClipboardList },
    { name: "View Questionnaires", href: "/admin/questionnaires", icon: BarChart3 },
    { name: "View Responses", href: "/admin/responses", icon: MessageSquare },
    { name: "View Reports", href: "/admin/reports", icon: PieChart },
  ]

  const isActive = (path: string) => {
    return (
      location.pathname === path ||
      (location.pathname === "/admin" && path === "/admin/policy-upload") ||
      (path !== "/admin/policy-upload" && location.pathname.startsWith(path))
    )
  }

  return (
    <div className="flex flex-col h-full border-r border-secondary bg-white">
      <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
        <div className="flex items-center justify-center flex-shrink-0 px-4">
          <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center">
            <span className="text-white font-bold text-xl">A</span>
          </div>
          <h2 className="ml-2 text-xl font-bold text-primary">Alqa</h2>
        </div>
        <nav className="mt-8 flex-1 px-2 space-y-1">
          {navigation.map((item) => {
            const active = isActive(item.href)
            return (
              <Link
                key={item.name}
                to={item.href}
                onClick={onClose}
                className={`${
                  active ? "bg-secondary text-primary" : "text-gray-600 hover:bg-muted hover:text-primary"
                } group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors duration-150`}
                aria-current={active ? "page" : undefined}
              >
                <item.icon
                  className={`${
                    active ? "text-primary" : "text-gray-400 group-hover:text-primary"
                  } mr-3 flex-shrink-0 h-5 w-5 transition-colors duration-150`}
                  aria-hidden="true"
                />
                {item.name}
              </Link>
            )
          })}
        </nav>
      </div>
      <div className="flex-shrink-0 flex border-t border-secondary p-4">
        <div className="flex items-center">
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-700">Alqa Platform</p>
            <p className="text-xs font-medium text-gray-500">Circle of Equal Voices</p>
          </div>
        </div>
      </div>
    </div>
  )
}
