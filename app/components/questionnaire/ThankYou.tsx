"use client"

import { useParams, useNavigate } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle } from "lucide-react"

export default function ThankYou() {
  const { token } = useParams<{ token: string }>()
  const navigate = useNavigate()

  const handleBackToHome = () => {
    navigate("/")
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary/20 p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-primary">Thank You!</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-gray-700">
            Your response has been successfully submitted. We appreciate your valuable feedback on our policy.
          </p>
          <p className="mt-4 text-gray-600">
            Your insights will help us improve our educational policies and practices.
          </p>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button onClick={handleBackToHome} className="bg-primary hover:bg-primary/90">
            Return to Home
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
