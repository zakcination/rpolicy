"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, ArrowLeft, ChevronLeft, ChevronRight, FileText } from "lucide-react"
import api from "../../services/api"

export default function ResponseDetails() {
  const { responseId } = useParams<{ responseId: string }>()
  const navigate = useNavigate()
  const [response, setResponse] = useState<any>(null)
  const [questionnaire, setQuestionnaire] = useState<any>(null)
  const [questionMap, setQuestionMap] = useState<Record<string, any>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [allResponses, setAllResponses] = useState<any[]>([])
  const [currentIndex, setCurrentIndex] = useState(-1)

  useEffect(() => {
    const fetchData = async () => {
      if (!responseId) return

      try {
        setIsLoading(true)

        // Fetch all responses first to enable navigation
        const responsesResponse = await api.get("/responses")
        const allResponsesData = responsesResponse.data || []
        setAllResponses(allResponsesData)

        // Find the current response and its index
        const currentResponse = allResponsesData.find((r: any) => r._id === responseId)
        const index = allResponsesData.findIndex((r: any) => r._id === responseId)
        setCurrentIndex(index)

        if (!currentResponse) {
          throw new Error("Response not found")
        }

        setResponse(currentResponse)

        // Fetch questionnaire details
        const questionnaireResponse = await api.get(`/questionnaire/${currentResponse.token}`)
        setQuestionnaire(questionnaireResponse.data)

        // Create a map of question IDs to question text
        const questionMapping: Record<string, any> = {}
        if (questionnaireResponse.data.questions) {
          questionnaireResponse.data.questions.forEach((q: any) => {
            questionMapping[q._id] = {
              text: q.stem || q.text,
              type: q.type,
              options: q.options || [],
            }
          })
        }
        setQuestionMap(questionMapping)
      } catch (error) {
        console.error("Error fetching response details:", error)
        setError("Failed to load response details. Please try again later.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [responseId])

  const navigateToPrevious = () => {
    if (currentIndex > 0) {
      const prevResponse = allResponses[currentIndex - 1]
      navigate(`/admin/responses/${prevResponse._id}`)
    }
  }

  const navigateToNext = () => {
    if (currentIndex < allResponses.length - 1) {
      const nextResponse = allResponses[currentIndex + 1]
      navigate(`/admin/responses/${nextResponse._id}`)
    }
  }

  const handleBackToList = () => {
    navigate("/admin/responses")
  }

  // Function to determine feedback quality level
  const getFeedbackQuality = (feedback: any[]) => {
    if (!feedback || !Array.isArray(feedback) || feedback.length === 0) return "neutral"

    // Count correctness levels
    let correctCount = 0
    let incorrectCount = 0
    let neutralCount = 0

    feedback.forEach((item) => {
      if (item.correctness) {
        if (item.correctness.toLowerCase().includes("correct")) {
          correctCount++
        } else if (item.correctness.toLowerCase().includes("incorrect")) {
          incorrectCount++
        } else {
          neutralCount++
        }
      }

      if (item.compliance) {
        if (item.compliance.toLowerCase().includes("fully")) {
          correctCount++
        } else if (item.compliance.toLowerCase().includes("not")) {
          incorrectCount++
        } else {
          neutralCount++
        }
      }
    })

    // Determine overall quality
    if (correctCount > incorrectCount && correctCount > neutralCount) {
      return "positive"
    } else if (incorrectCount > correctCount && incorrectCount > neutralCount) {
      return "negative"
    } else {
      return "neutral"
    }
  }

  // Format date function
  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A"
    try {
      return new Date(dateString).toLocaleDateString() + " " + new Date(dateString).toLocaleTimeString()
    } catch (error) {
      return "N/A"
    }
  }

  // Format duration function
  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}m ${remainingSeconds}s`
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  if (!response) {
    return (
      <Alert variant="warning" className="bg-amber-50 border-amber-200 text-amber-800">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>Response not found. Please go back to the responses list.</AlertDescription>
      </Alert>
    )
  }

  // Extract report and feedback from the response
  const reportItems =
    response.feedback && Array.isArray(response.feedback)
      ? response.feedback
      : response.report && Array.isArray(response.report)
        ? response.report
        : []

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Button variant="ghost" onClick={handleBackToList} className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Responses
        </Button>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={navigateToPrevious}
            disabled={currentIndex <= 0}
            className="flex items-center gap-1"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          <span className="text-sm text-gray-500">
            {currentIndex + 1} of {allResponses.length}
          </span>
          <Button
            variant="outline"
            onClick={navigateToNext}
            disabled={currentIndex >= allResponses.length - 1}
            className="flex items-center gap-1"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="bg-secondary/20 pb-3">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg font-semibold text-primary flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Response Details
            </CardTitle>
            <Badge
              variant="outline"
              className={`
                ${
                  getFeedbackQuality(reportItems) === "positive"
                    ? "bg-green-50 text-green-700 border-green-200"
                    : getFeedbackQuality(reportItems) === "negative"
                      ? "bg-red-50 text-red-700 border-red-200"
                      : "bg-amber-50 text-amber-700 border-amber-200"
                }
              `}
            >
              {getFeedbackQuality(reportItems) === "positive"
                ? "Positive"
                : getFeedbackQuality(reportItems) === "negative"
                  ? "Needs Improvement"
                  : "Neutral"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Questionnaire</p>
                <p className="mt-1">{questionnaire?.discipline || "Unknown"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Submitted At</p>
                <p className="mt-1">{formatDate(response.submittedAt)}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Duration</p>
                <p className="mt-1">{formatDuration(response.duration)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Token</p>
                <p className="mt-1 truncate">{response.token}</p>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-primary mb-4">Answers</h3>
              <div className="space-y-4">
                {response.answers?.map((answer: any, index: number) => (
                  <div key={index} className="p-4 bg-white border border-secondary rounded-md">
                    <h4 className="font-medium text-gray-700">
                      Question {index + 1}: {questionMap[answer.questionId]?.text || "Unknown Question"}
                    </h4>
                    <div className="mt-2">
                      <p className="text-sm">
                        <span className="font-medium">Answer:</span> {answer.answer}
                      </p>
                      {questionMap[answer.questionId]?.type === "multiple_choice" && (
                        <p className="text-xs text-gray-500 mt-1">
                          Option from: {questionMap[answer.questionId]?.options.join(", ")}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-primary mb-4">Feedback</h3>
              <div className="space-y-4">
                {reportItems.map((item: any, index: number) => (
                  <div
                    key={index}
                    className={`p-4 rounded-md border ${
                      item.correctness?.toLowerCase().includes("correct") ||
                      item.compliance?.toLowerCase().includes("fully")
                        ? "bg-green-50 border-green-200"
                        : item.correctness?.toLowerCase().includes("incorrect") ||
                            item.compliance?.toLowerCase().includes("not")
                          ? "bg-red-50 border-red-200"
                          : "bg-amber-50 border-amber-200"
                    }`}
                  >
                    <h4 className="font-medium">{item.questionStem || `Question ${index + 1}`}</h4>

                    <div className="flex flex-wrap gap-1 mt-2">
                      {item.correctness && (
                        <Badge
                          variant={item.correctness.includes("Correct") ? "default" : "outline"}
                          className={`text-xs ${
                            item.correctness.includes("Correct")
                              ? "bg-green-100 text-green-800 border-green-300"
                              : "bg-red-100 text-red-800 border-red-300"
                          }`}
                        >
                          {item.correctness}
                        </Badge>
                      )}
                      {item.fruitfulness && (
                        <Badge variant="outline" className="text-xs">
                          {item.fruitfulness}
                        </Badge>
                      )}
                      {item.compliance && (
                        <Badge
                          variant={item.compliance.includes("Fully") ? "default" : "outline"}
                          className={`text-xs ${
                            item.compliance.includes("Fully")
                              ? "bg-green-100 text-green-800 border-green-300"
                              : "bg-amber-100 text-amber-800 border-amber-300"
                          }`}
                        >
                          {item.compliance}
                        </Badge>
                      )}
                      {item.sensitivity && (
                        <Badge variant="outline" className="text-xs bg-blue-50 text-blue-800 border-blue-200">
                          {item.sensitivity}
                        </Badge>
                      )}
                    </div>

                    {item.recommendation && (
                      <div className="mt-2">
                        <p className="text-xs font-medium text-gray-600">Recommendation:</p>
                        <p className="text-sm mt-1 p-2 bg-blue-50 rounded-md text-blue-800">{item.recommendation}</p>
                      </div>
                    )}

                    {item.insight && (
                      <div className="mt-2">
                        <p className="text-xs font-medium text-gray-600">Insight:</p>
                        <p className="text-sm mt-1 p-2 bg-purple-50 rounded-md text-purple-800">{item.insight}</p>
                      </div>
                    )}
                  </div>
                ))}

                {reportItems.length === 0 && (
                  <div className="p-4 bg-gray-50 rounded-md text-gray-700">
                    No detailed feedback available for this response.
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
