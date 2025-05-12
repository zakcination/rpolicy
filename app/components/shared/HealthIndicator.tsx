"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export default function HealthIndicator() {
  const [status, setStatus] = useState<"loading" | "online" | "offline">("loading")
  const [lastChecked, setLastChecked] = useState<Date | null>(null)

  const checkHealth = async () => {
    try {
      // Only run in browser
      if (typeof window === "undefined") return

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api"
      const baseUrl = apiUrl.replace("/api", "")

      const response = await fetch(baseUrl)
      if (response.ok) {
        setStatus("online")
      } else {
        setStatus("offline")
      }
    } catch (error) {
      setStatus("offline")
    }
    setLastChecked(new Date())
  }

  useEffect(() => {
    checkHealth()
    const interval = setInterval(checkHealth, 60000) // Check every minute
    return () => clearInterval(interval)
  }, [])

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center">
            <Badge
              variant="outline"
              className={`flex items-center gap-1 ${
                status === "online"
                  ? "bg-green-100 text-green-800 border-green-300"
                  : status === "offline"
                    ? "bg-red-100 text-red-800 border-red-300"
                    : "bg-gray-100 text-gray-800 border-gray-300"
              }`}
            >
              <span
                className={`h-2 w-2 rounded-full ${
                  status === "online" ? "bg-green-500" : status === "offline" ? "bg-red-500" : "bg-gray-500"
                }`}
              ></span>
              <span className="text-xs">API {status}</span>
            </Badge>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>API Status: {status}</p>
          {lastChecked && <p className="text-xs">Last checked: {lastChecked.toLocaleTimeString()}</p>}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
