"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, ArrowLeft, FileText, Eye, ChevronDown, ChevronUp } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import api, { questionnaireService } from "../../services/api"

export default function QuestionnaireReport() {
  const { token } = useParams<{ token: string }>()
  const navigate = useNavigate()
  const [report, setReport] = useState<any>(null)
  const [questionnaire, setQuestionnaire] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDownloading, setIsDownloading] = useState(false)
  const [error, setError] = useState("")
  const [questionOptions, setQuestionOptions] = useState<Record<string, string[]>>({})
  const [completedSuggestions, setCompletedSuggestions] = useState<Record<string, boolean>>({})
  const [expandedThemes, setExpandedThemes] = useState<Record<number, boolean>>({})

  useEffect(() => {
    const fetchReport = async () => {
      if (!token) return

      try {
        setIsLoading(true)

        // Fetch questionnaire details
        const questionnaireResponse = await api.get(`/questionnaire/${token}`)
        setQuestionnaire(questionnaireResponse.data)

        // Create a map of question stems to their options
        const optionsMap: Record<string, string[]> = {}
        if (questionnaireResponse.data.questions) {
          questionnaireResponse.data.questions.forEach((q: any) => {
            if (q.options && q.options.length > 0) {
              optionsMap[q.stem] = q.options
            }
          })
        }
        setQuestionOptions(optionsMap)

        // Fetch report
        const reportResponse = await api.get(`/questionnaire/${token}/report`)
        console.log("Full report data:", reportResponse.data)
        setReport(reportResponse.data.report)

        // Record view
        try {
          await api.post(`/questionnaire/${token}/view`)
        } catch (viewError) {
          console.error("Error recording view:", viewError)
        }
      } catch (error: any) {
        console.error("Error fetching report:", error)
        setError(error.response?.data?.message || "Failed to load report")
      } finally {
        setIsLoading(false)
      }
    }

    fetchReport()
  }, [token])

  const handleDownloadPDF = async () => {
    if (!token) return

    try {
      setIsDownloading(true)
      await questionnaireService.downloadReportPDF(token)
    } catch (error) {
      console.error("Error downloading PDF:", error)
      setError("Failed to download PDF report. Please try again later.")
    } finally {
      setIsDownloading(false)
    }
  }

  const handleBack = () => {
    navigate("/admin/questionnaires")
  }

  // Helper function to get the option text for a given question and option key
  const getOptionText = (questionStem: string, optionKey: string) => {
    if (!questionOptions[questionStem] || !questionOptions[questionStem][optionKey.charCodeAt(0) - 97]) {
      return optionKey // Return the key if we can't find the option text
    }
    return questionOptions[questionStem][optionKey.charCodeAt(0) - 97]
  }

  // Function to toggle suggestion completion
  const toggleSuggestionCompletion = (index: number) => {
    setCompletedSuggestions((prev) => ({
      ...prev,
      [index]: !prev[index],
    }))
  }

  // Function to toggle theme expansion
  const toggleThemeExpansion = (index: number) => {
    setExpandedThemes((prev) => ({
      ...prev,
      [index]: !prev[index],
    }))
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

  if (!report) {
    return (
      <Alert variant="warning" className="bg-amber-50 border-amber-200 text-amber-800">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>No report data available for this questionnaire yet.</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={handleBack} className="flex items-center gap-1">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <h2 className="text-2xl font-bold text-primary">{questionnaire?.discipline || "Questionnaire"} Report</h2>
        </div>
        <Button
          onClick={handleDownloadPDF}
          variant="outline"
          className="border-primary text-primary hover:bg-primary/10 flex items-center gap-2"
          disabled={isDownloading}
        >
          <Download className="h-4 w-4" />
          {isDownloading ? "Downloading..." : "Download PDF"}
        </Button>
      </div>

      {/* Participation Rate */}
      {report.participationRate && (
        <div className="text-sm font-semibold text-gray-600 mb-4">
          Participation Rate: <span className="text-primary text-lg">{report.participationRate}</span>
        </div>
      )}

      {questionnaire && (
        <Card className="bg-white">
          <CardHeader className="pb-2 bg-secondary/10">
            <CardTitle className="text-lg text-primary flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Questionnaire Details
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="grid gap-4 md:grid-cols-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Discipline</p>
                <p className="mt-1 font-medium">{questionnaire.discipline}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Respondents</p>
                <p className="mt-1 font-medium">{questionnaire.respondentCount || 0}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Language</p>
                <p className="mt-1 font-medium">{questionnaire.language || "English"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Views</p>
                <p className="mt-1 font-medium flex items-center">
                  <Eye className="h-4 w-4 mr-1 text-primary" />
                  {questionnaire.views || 0}
                </p>
              </div>
            </div>

            {questionnaire.preferencePrompt && (
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-500">Preference Prompt</p>
                <p className="mt-1 text-sm p-2 bg-secondary/10 rounded-md">{questionnaire.preferencePrompt}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Policy Adoption Status */}
      {report.policyAdoptionStatus && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-primary">Policy Adoption Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">Assessment Summary</h3>
                  <div className="mt-2 text-sm text-blue-700">
                    <p className="leading-relaxed">{report.policyAdoptionStatus}</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quantitative Metrics */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg text-primary">Quantitative Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {report.quantitativeMetrics && Array.isArray(report.quantitativeMetrics) ? (
              report.quantitativeMetrics.map((metric: any, index: number) => (
                <div key={index} className="border-b pb-6 last:border-0">
                  <h4 className="font-medium mb-4">{metric.questionStem}</h4>
                  {metric.type === "multiple_choice" ? (
                    <div className="space-y-4">
                      {Object.entries(metric.metrics).map(([optionKey, percentage]: [string, any]) => {
                        // Get the full option text
                        const optionText = getOptionText(metric.questionStem, optionKey)
                        // Check if this is the correct answer
                        const isCorrectAnswer = metric.correctAnswer === optionKey

                        return (
                          <div key={optionKey} className="space-y-1">
                            <div
                              className={`text-sm font-medium flex items-center ${isCorrectAnswer ? "text-green-600" : ""}`}
                            >
                              {optionText}
                              {isCorrectAnswer && (
                                <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                                  Correct Answer
                                </span>
                              )}
                            </div>
                            <div className="flex items-center">
                              <div
                                className={`h-4 rounded ${isCorrectAnswer ? "bg-green-500" : "bg-primary"}`}
                                style={{ width: `${Number.parseFloat(percentage)}%` }}
                              ></div>
                              <span className="ml-2 text-sm">{percentage}</span>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="text-sm">
                      <Badge variant="outline" className="bg-secondary text-primary">
                        {metric.metrics}
                      </Badge>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500">No quantitative metrics available</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Qualitative Themes */}
      {report.qualitativeThemes && Array.isArray(report.qualitativeThemes) && report.qualitativeThemes.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-primary">Qualitative Themes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {report.qualitativeThemes.map((theme: any, index: number) => (
                <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div
                    className="flex justify-between items-center cursor-pointer"
                    onClick={() => toggleThemeExpansion(index)}
                  >
                    <h4 className="font-medium text-primary">{theme.theme}</h4>
                    {expandedThemes[index] ? (
                      <ChevronUp className="h-4 w-4 text-gray-500" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-gray-500" />
                    )}
                  </div>

                  {expandedThemes[index] && (
                    <div className="mt-3 space-y-3">
                      <p className="text-sm text-gray-700">{theme.description}</p>

                      {theme.exampleQuotes && theme.exampleQuotes.length > 0 && (
                        <div>
                          <p className="text-xs font-medium text-gray-500 mb-2">Example quotes:</p>
                          <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                            {theme.exampleQuotes.map((quote: string, i: number) => (
                              <li key={i} className="italic">
                                "{quote}"
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Edit Suggestions */}
      {report.editSuggestions && Array.isArray(report.editSuggestions) && report.editSuggestions.length > 0 && (
        <Card>
          <CardHeader className="pb-2 flex flex-row justify-between items-center">
            <CardTitle className="text-lg text-primary">Edit Suggestions</CardTitle>
            <Badge variant="outline" className="bg-primary/10 text-primary">
              {report.editSuggestions.length} {report.editSuggestions.length === 1 ? "suggestion" : "suggestions"}
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {report.editSuggestions.map((suggestion: any, index: number) => (
                <div
                  key={index}
                  className={`border rounded-lg p-4 hover:shadow-md transition-shadow ${
                    completedSuggestions[index] ? "opacity-60 bg-gray-50" : ""
                  }`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <h5 className="font-semibold text-primary text-base leading-relaxed">{suggestion.section}</h5>
                    <Badge
                      variant={suggestion.priority === "High" ? "destructive" : "secondary"}
                      className="ml-2 flex-shrink-0"
                    >
                      {suggestion.priority || "Medium"}
                    </Badge>
                  </div>

                  {suggestion.currentState && (
                    <div className="mb-3 p-3 bg-amber-50 border-l-4 border-amber-400 rounded-r-md">
                      <p className="text-sm font-medium text-amber-800">Current State</p>
                      <p className="text-sm text-amber-700 mt-1 leading-relaxed">{suggestion.currentState}</p>
                    </div>
                  )}

                  <div className="mb-3 p-3 bg-green-50 border-l-4 border-green-400 rounded-r-md">
                    <p className="text-sm font-medium text-green-800">Suggested Action</p>
                    <p className="text-sm text-green-700 mt-1 leading-relaxed">{suggestion.suggestion}</p>
                  </div>

                  {suggestion.rationale && (
                    <div className="mb-3 p-3 bg-blue-50 border-l-4 border-blue-400 rounded-r-md">
                      <p className="text-sm font-medium text-blue-800">Rationale</p>
                      <p className="text-sm text-blue-700 mt-1 leading-relaxed">{suggestion.rationale}</p>
                    </div>
                  )}

                  {suggestion.implementation && (
                    <div className="mb-3">
                      <p className="text-sm font-semibold mb-2 text-gray-800">Implementation Steps:</p>
                      <div className="bg-gray-50 p-3 rounded-md">
                        {suggestion.implementation
                          .split(/(?=\d+\.)/)
                          .filter((step: string) => step.trim())
                          .map((step: string, i: number) => {
                            const cleanStep = step.replace(/^\d+\.\s*/, "").trim()
                            return cleanStep ? (
                              <div key={i} className="flex items-start mb-2 last:mb-0">
                                <span className="inline-flex items-center justify-center w-6 h-6 bg-primary text-white text-xs font-medium rounded-full mr-3 flex-shrink-0 mt-0.5">
                                  {i + 1}
                                </span>
                                <span className="text-sm text-gray-700 leading-relaxed">{cleanStep}</span>
                              </div>
                            ) : null
                          })}
                      </div>
                    </div>
                  )}

                  {suggestion.expectedImpact && (
                    <div className="mb-4 p-3 bg-purple-50 border-l-4 border-purple-400 rounded-r-md">
                      <p className="text-sm font-medium text-purple-800">Expected Impact</p>
                      <p className="text-sm text-purple-700 mt-1 leading-relaxed">{suggestion.expectedImpact}</p>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id={`suggestion-${index}`}
                        checked={!!completedSuggestions[index]}
                        onChange={() => toggleSuggestionCompletion(index)}
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <label
                        htmlFor={`suggestion-${index}`}
                        className={`ml-2 text-sm ${
                          completedSuggestions[index] ? "line-through text-gray-500" : "text-gray-700"
                        }`}
                      >
                        Mark as completed
                      </label>
                    </div>
                    <Button
                      size="sm"
                      variant={completedSuggestions[index] ? "outline" : "default"}
                      onClick={() => toggleSuggestionCompletion(index)}
                      className={completedSuggestions[index] ? "border-green-500 text-green-600" : ""}
                    >
                      {completedSuggestions[index] ? "Completed ✓" : "Mark Complete"}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Trends */}
      {report.trends && Array.isArray(report.trends) && report.trends.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-primary">Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside text-sm space-y-2">
              {report.trends.map((trend: any, i: number) => (
                <li key={i}>
                  <span className="font-semibold">{trend.pattern}:</span> {trend.evidence}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Recommendations */}
      {report.recommendations && Array.isArray(report.recommendations) && report.recommendations.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-primary">Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside text-sm space-y-2">
              {report.recommendations.map((rec: any, i: number) => (
                <li key={i}>
                  <strong>{rec.area}:</strong> {rec.suggestion}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
