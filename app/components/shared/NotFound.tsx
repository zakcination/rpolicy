import { Button } from "@/components/ui/button"
import { Link } from "react-router-dom"

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-secondary/20 px-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-primary">404</h1>
        <h2 className="mt-4 text-2xl font-semibold text-gray-900">Page Not Found</h2>
        <p className="mt-2 text-gray-600">The page you are looking for doesn't exist or has been moved.</p>
        <div className="mt-6">
          <Button asChild className="bg-primary hover:bg-primary/90">
            <Link to="/admin">Return to Dashboard</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
