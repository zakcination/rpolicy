"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Edit, ArrowLeft } from "lucide-react"
import api from "../../services/api"
import QuestionnaireForm from "./QuestionnaireForm"
import QuestionnaireFeedback from "./QuestionnaireFeedback"
import { useToast } from "@/components/ui/use-toast"

export default function Questionnaire() {
  const { token } = useParams<{ token: string }>()
  const navigate = useNavigate()
  const { toast } = useToast()
  const [questionnaire, setQuestionnaire] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [submissionData, setSubmissionData] = useState<any>(null)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    const fetchQuestionnaire = async () => {
      if (!token) return

      try {
        setIsLoading(true)
        console.log(`Fetching questionnaire with token: ${token}`)
        const response = await api.get(`/questionnaire/${token}`)
        console.log("Fetched questionnaire:", response.data)
        setQuestionnaire(response.data)

        // Check if user is admin (has auth token)
        const authToken = localStorage.getItem("authToken")
        setIsAdmin(!!authToken)

        // Record view
        try {
          await api.post(`/questionnaire/${token}/view`)
        } catch (viewError) {
          console.error("Error recording view:", viewError)
        }
      } catch (error: any) {
        console.error("Error fetching questionnaire:", error)
        const errorMessage =
          error.response?.status === 404
            ? "Questionnaire not found. Please check the URL and try again."
            : "Failed to load questionnaire. Please check the URL and try again."
        setError(errorMessage)

        // Log more detailed error information
        console.error("Error details:", {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message,
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchQuestionnaire()
  }, [token])

  const handleSubmit = async (answers: any[], duration: number, verificationAnswer: string) => {
    try {
      const response = await api.post(`/questionnaire/${token}/submit`, {
        answers,
        duration,
        verificationAnswer,
      })

      toast({
        title: "Submission successful",
        description: "Thank you for completing the questionnaire!",
        variant: "default",
      })

      // If admin, show feedback immediately
      if (isAdmin) {
        console.log("Full submission response:", response.data)
        setSubmissionData(response.data)
        setIsSubmitted(true)
        return true
      } else {
        // Otherwise redirect to thank you page
        navigate(`/thank-you/${token}`)
        return true
      }
    } catch (error) {
      console.error("Error submitting questionnaire:", error)
      toast({
        title: "Submission failed",
        description: "There was an error submitting your responses. Please try again.",
        variant: "destructive",
      })
      return false
    }
  }

  const handleEditQuestionnaire = () => {
    navigate(`/admin/questionnaire-generate?token=${token}`)
  }

  const handleBackToList = () => {
    if (isAdmin) {
      navigate("/admin/questionnaires")
    } else {
      navigate("/")
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary/20">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="mt-4 text-gray-600">Loading questionnaire...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary/20 p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="text-xl text-primary">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </CardContent>
          <CardFooter>
            <Button onClick={handleBackToList} className="w-full bg-primary hover:bg-primary/90">
              {isAdmin ? "Back to Questionnaires" : "Back to Home"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  if (!questionnaire) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary/20 p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="text-xl text-primary">Questionnaire Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p>The requested questionnaire could not be found. Please check the URL and try again.</p>
          </CardContent>
          <CardFooter>
            <Button onClick={handleBackToList} className="w-full bg-primary hover:bg-primary/90">
              {isAdmin ? "Back to Questionnaires" : "Back to Home"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-secondary/20 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <Card className="shadow-lg">
          <CardHeader className="bg-primary/10 border-b border-secondary">
            <div className="flex justify-between items-center">
              {isAdmin && (
                <Button variant="ghost" size="sm" onClick={handleBackToList} className="flex items-center gap-1">
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </Button>
              )}
              {isAdmin && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleEditQuestionnaire}
                  className="flex items-center gap-1 border-primary text-primary hover:bg-primary/10"
                >
                  <Edit className="h-4 w-4" />
                  Edit
                </Button>
              )}
            </div>
            <div className="flex items-center justify-center mb-4">
              <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center">
                <span className="text-white font-bold text-xl">A</span>
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-center text-primary">
              {questionnaire.discipline || "Policy"} Questionnaire
            </CardTitle>
            <CardDescription className="text-center text-gray-600">
              Help us improve our educational policies
            </CardDescription>
          </CardHeader>

          {isSubmitted && isAdmin ? (
            <QuestionnaireFeedback
              feedback={submissionData}
              answers={submissionData?.answers || []}
              questionnaire={questionnaire}
            />
          ) : (
            <QuestionnaireForm questionnaire={questionnaire} onSubmit={handleSubmit} />
          )}
        </Card>
      </div>
    </div>
  )
}
