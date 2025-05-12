"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { MessageSquare, AlertCircle, ChevronDown, ChevronUp, FileText, ExternalLink } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import api from "../../services/api"
import FilterBar from "../shared/FilterBar"

export default function ViewResponses() {
  const [responses, setResponses] = useState<any[]>([])
  const [filteredResponses, setFilteredResponses] = useState<any[]>([])
  const [groupedResponses, setGroupedResponses] = useState<Record<string, any[]>>({})
  const [questionnaires, setQuestionnaires] = useState<Record<string, any>>({})
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [selectedResponse, setSelectedResponse] = useState<any>(null)
  const [questionMap, setQuestionMap] = useState<Record<string, any>>({})

  useEffect(() => {
    const fetchResponses = async () => {
      try {
        setIsLoading(true)
        // Try to fetch responses from the API
        const response = await api.get("/responses")

        // Map the API response to our expected format
        const formattedResponses = response.data.map((item: any) => ({
          _id: item._id,
          questionnaireId: item.questionnaireId,
          token: item.token,
          answers: item.answers,
          duration: item.duration,
          feedback: item.feedback || item.report,
          submittedAt: item.submittedAt || new Date().toISOString(),
          discipline: item.discipline || "N/A",
        }))

        setResponses(formattedResponses)
        setFilteredResponses(formattedResponses)

        // Group responses by token
        const grouped = formattedResponses.reduce((acc: Record<string, any[]>, response: any) => {
          if (!acc[response.token]) {
            acc[response.token] = []
          }
          acc[response.token].push(response)
          return acc
        }, {})

        setGroupedResponses(grouped)

        // Fetch questionnaire details for each token
        const questionnairesData: Record<string, any> = {}
        const questionMapping: Record<string, any> = {}

        for (const token of Object.keys(grouped)) {
          try {
            const questionnaireResponse = await api.get(`/questionnaire/${token}`)
            questionnairesData[token] = questionnaireResponse.data

            // Create a map of question IDs to question text
            if (questionnaireResponse.data.questions) {
              questionnaireResponse.data.questions.forEach((q: any) => {
                questionMapping[q._id] = {
                  text: q.stem || q.text,
                  type: q.type,
                  options: q.options || [],
                }
              })
            }
          } catch (error) {
            console.error(`Error fetching questionnaire for token ${token}:`, error)
            questionnairesData[token] = {
              discipline: "Unknown",
              audience: "Unknown",
              createdAt: new Date().toISOString(),
              policyId: { discipline: "Unknown" },
            }
          }
        }

        setQuestionnaires(questionnairesData)
        setQuestionMap(questionMapping)
      } catch (error) {
        console.error("Error fetching responses:", error)
        setError("Failed to load responses. Please try again later.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchResponses()
  }, [])

  const handleResponseClick = (response: any) => {
    setSelectedResponse(response)
  }

  const handleCloseModal = () => {
    setSelectedResponse(null)
  }

  const toggleGroup = (token: string) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [token]: !prev[token],
    }))
  }

  const handleFilter = (filters: any) => {
    let result = [...responses]

    if (filters.searchTerm) {
      const searchTerm = filters.searchTerm.toLowerCase()
      result = result.filter(
        (response) =>
          response.token?.toLowerCase().includes(searchTerm) || response.discipline?.toLowerCase().includes(searchTerm),
      )
    }

    if (filters.discipline) {
      result = result.filter((response) => response.discipline === filters.discipline)
    }

    if (filters.dateFrom) {
      result = result.filter((response) => new Date(response.submittedAt) >= new Date(filters.dateFrom))
    }

    if (filters.dateTo) {
      result = result.filter((response) => new Date(response.submittedAt) <= new Date(filters.dateTo))
    }

    setFilteredResponses(result)

    // Re-group filtered responses
    const grouped = result.reduce((acc: Record<string, any[]>, response: any) => {
      if (!acc[response.token]) {
        acc[response.token] = []
      }
      acc[response.token].push(response)
      return acc
    }, {})

    setGroupedResponses(grouped)
  }

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}m ${remainingSeconds}s`
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A"
    try {
      return new Date(dateString).toLocaleDateString()
    } catch (error) {
      return "N/A"
    }
  }

  const viewPolicy = (policyId: string) => {
    if (!policyId) return
    window.open(`/admin/policies?id=${policyId}`, "_blank")
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

  // Function to get feedback summary
  const getFeedbackSummary = (feedback: any[]) => {
    if (!feedback || !Array.isArray(feedback) || feedback.length === 0) return "No feedback available"

    // Get the first recommendation or insight
    for (const item of feedback) {
      if (item.recommendation) return item.recommendation.substring(0, 60) + "..."
      if (item.insight) return item.insight.substring(0, 60) + "..."
    }

    return "Feedback available"
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-primary">Questionnaire Responses</h2>
      </div>

      <FilterBar onFilter={handleFilter} showAudienceFilter={false} />

      {error && (
        <Alert variant="destructive" className="bg-red-50 border-red-200 text-red-800">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {Object.keys(groupedResponses).length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-6 text-center">
            <MessageSquare className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No responses found</h3>
            <p className="text-sm text-gray-500 mt-1">
              Responses will appear here once stakeholders complete questionnaires.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedResponses).map(([token, tokenResponses]) => {
            const questionnaire = questionnaires[token] || {}
            const isExpanded = expandedGroups[token] || false
            const createdAt = questionnaire.createdAt || new Date().toISOString()
            const discipline = questionnaire.policyId?.discipline || questionnaire.discipline || "Unknown"

            return (
              <Card key={token} className="overflow-hidden">
                <CardHeader
                  className="bg-secondary/20 cursor-pointer flex flex-row items-center justify-between"
                  onClick={() => toggleGroup(token)}
                >
                  <div>
                    <CardTitle className="text-lg text-primary flex items-center">
                      <FileText className="h-5 w-5 mr-2" />
                      {discipline} Questionnaire
                      <Badge variant="outline" className="ml-2 bg-white">
                        {tokenResponses.length} {tokenResponses.length === 1 ? "response" : "responses"}
                      </Badge>
                    </CardTitle>
                    <div className="text-sm text-gray-500 mt-1">
                      <span className="font-medium">Token:</span> {token.substring(0, 12)}...
                      {questionnaire.audience && (
                        <span className="ml-4">
                          <span className="font-medium">Audience:</span> {questionnaire.audience}
                        </span>
                      )}
                      <span className="ml-4">
                        <span className="font-medium">Created:</span> {formatDate(createdAt)}
                      </span>
                      {questionnaire.policyId && (
                        <Button
                          variant="link"
                          size="sm"
                          className="text-primary p-0 h-auto ml-2"
                          onClick={(e) => {
                            e.stopPropagation()
                            viewPolicy(questionnaire.policyId._id)
                          }}
                        >
                          <ExternalLink className="h-3 w-3 mr-1" />
                          View Policy
                        </Button>
                      )}
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="ml-2">
                    {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </Button>
                </CardHeader>

                {isExpanded && (
                  <CardContent className="pt-4">
                    <div className="overflow-x-auto">
                      <table className="w-full bg-white rounded-lg">
                        <thead className="bg-secondary/10">
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Submitted At
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Duration
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Answers
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Feedback
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-secondary/30">
                          {tokenResponses.map((response) => {
                            const feedbackQuality = getFeedbackQuality(response.feedback)
                            const feedbackSummary = getFeedbackSummary(response.feedback)

                            return (
                              <tr
                                key={response._id}
                                className="hover:bg-secondary/10 cursor-pointer"
                                onClick={() => handleResponseClick(response)}
                              >
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                                  {formatDate(response.submittedAt)}{" "}
                                  {new Date(response.submittedAt).toLocaleTimeString()}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                                  {formatDuration(response.duration)}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                                  {response.answers?.length || 0} answers
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-700">
                                  <Badge
                                    variant="outline"
                                    className={`
                                      ${
                                        feedbackQuality === "positive"
                                          ? "bg-green-50 text-green-700 border-green-200"
                                          : feedbackQuality === "negative"
                                            ? "bg-red-50 text-red-700 border-red-200"
                                            : "bg-amber-50 text-amber-700 border-amber-200"
                                      }
                                    `}
                                  >
                                    {feedbackSummary}
                                  </Badge>
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                )}
              </Card>
            )
          })}
        </div>
      )}

      <Dialog open={!!selectedResponse} onOpenChange={(open) => !open && handleCloseModal()}>
        {selectedResponse && (
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-primary">Response Details</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Questionnaire</p>
                  <p className="mt-1">{selectedResponse.token}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Submitted At</p>
                  <p className="mt-1">{new Date(selectedResponse.submittedAt).toLocaleString()}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Duration</p>
                  <p className="mt-1">{formatDuration(selectedResponse.duration)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Discipline</p>
                  <p className="mt-1">
                    {questionnaires[selectedResponse.token]?.policyId?.discipline ||
                      questionnaires[selectedResponse.token]?.discipline ||
                      selectedResponse.discipline ||
                      "N/A"}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-500">Answers</p>
                <div className="mt-1 max-h-60 overflow-y-auto border rounded-md p-2">
                  {selectedResponse.answers?.map((answer: any, index: number) => (
                    <div key={index} className="mb-4 pb-2 border-b border-gray-100 last:border-0">
                      <p className="text-sm font-medium">
                        Question {index + 1}: {questionMap[answer.questionId]?.text || "Unknown Question"}
                      </p>
                      <div className="mt-2 p-2 bg-secondary/10 rounded-md">
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
                  )) || <p className="text-sm text-gray-500">No answers available</p>}
                </div>
              </div>

              {selectedResponse.feedback && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Feedback</p>
                  <div className="mt-1 max-h-60 overflow-y-auto border rounded-md p-2">
                    {Array.isArray(selectedResponse.feedback) ? (
                      selectedResponse.feedback.map((item, index) => (
                        <div key={index} className="mb-4 pb-4 border-b border-gray-100 last:border-0">
                          {item.questionStem && <p className="text-sm font-medium">{item.questionStem}</p>}

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
                              <p className="text-sm mt-1 p-2 bg-blue-50 rounded-md text-blue-800">
                                {item.recommendation}
                              </p>
                            </div>
                          )}

                          {item.insight && (
                            <div className="mt-2">
                              <p className="text-xs font-medium text-gray-600">Insight:</p>
                              <p className="text-sm mt-1 p-2 bg-purple-50 rounded-md text-purple-800">{item.insight}</p>
                            </div>
                          )}

                          {item.text && (
                            <div className="mt-2">
                              <p className="text-xs font-medium text-gray-600">Feedback:</p>
                              <p className="text-sm mt-1 p-2 bg-gray-50 rounded-md text-gray-800">{item.text}</p>
                            </div>
                          )}

                          {item.status && (
                            <div className="mt-2">
                              <Badge
                                className={`${
                                  item.status === "Positive"
                                    ? "bg-green-100 text-green-800"
                                    : item.status === "Negative"
                                      ? "bg-red-100 text-red-800"
                                      : "bg-amber-100 text-amber-800"
                                }`}
                              >
                                {item.status}
                              </Badge>
                            </div>
                          )}
                        </div>
                      ))
                    ) : (
                      <p className="text-sm p-3 bg-secondary/20 rounded-md">
                        {typeof selectedResponse.feedback === "string"
                          ? selectedResponse.feedback
                          : "No detailed feedback available"}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                className="border-primary text-primary hover:bg-primary/10"
                onClick={handleCloseModal}
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </div>
  )
}
