"use client"

import { useEffect, useState } from "react"
import dynamic from "next/dynamic"

// Use dynamic import with ssr: false to prevent document not defined errors
const App = dynamic(() => import("./components/App"), {
  ssr: false,
})

export default function ClientApp() {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="mt-4 text-gray-600">Loading application...</p>
        </div>
      </div>
    )
  }

  return <App />
}
