"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { ClipboardList, Copy, BarChart3, Share2, AlertCircle, Users, ExternalLink } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import api from "../../services/api"
import FilterBar from "../shared/FilterBar"

export default function ViewQuestionnaires() {
  const [questionnaires, setQuestionnaires] = useState<any[]>([])
  const [filteredQuestionnaires, setFilteredQuestionnaires] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [selectedQuestionnaire, setSelectedQuestionnaire] = useState<any>(null)
  const [copySuccess, setCopySuccess] = useState<string | null>(null)
  const navigate = useNavigate()

  // Add a function to determine questionnaire status
  const getQuestionnaireStatus = (questionnaire: any) => {
    // If there are no responses yet, it's collecting answers
    if (!questionnaire.respondentCount || questionnaire.respondentCount === 0) {
      return "collecting"
    }

    // If the questionnaire has an endDate and it's in the past, it's completed
    if (questionnaire.endDate && new Date(questionnaire.endDate) < new Date()) {
      return "completed"
    }

    // Otherwise, it's still collecting answers
    return "collecting"
  }

  // Add a function to render status badge
  const renderStatusBadge = (status: string) => {
    if (status === "completed") {
      return (
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          Completed
        </Badge>
      )
    }

    return (
      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
        Collecting Answers
      </Badge>
    )
  }

  useEffect(() => {
    const fetchQuestionnaires = async () => {
      try {
        setIsLoading(true)
        // Try to fetch questionnaires from the API
        const response = await api.get("/questionnaires")

        // Ensure createdAt is properly formatted
        const formattedQuestionnaires = response.data.map((q: any) => {
          // If createdAt is missing or invalid, set it to current date
          if (!q.createdAt || isNaN(new Date(q.createdAt).getTime())) {
            q.createdAt = new Date().toISOString()
          }
          return q
        })

        setQuestionnaires(formattedQuestionnaires)
        setFilteredQuestionnaires(formattedQuestionnaires)
      } catch (error) {
        console.error("Error fetching questionnaires:", error)

        // For development purposes, create mock data if the API fails
        const mockQuestionnaires = [
          {
            _id: "1",
            token: "abc123def456",
            discipline: "Assessment",
            respondentCount: 12,
            policyFileName: "assessment_policy_v2.pdf",
            language: "English",
            preferencePrompt: "Focus on clarity of assessment criteria and alignment with IB standards",
            audience: "Teachers and Staff",
            createdAt: new Date().toISOString(),
            questions: [
              { id: "q1", text: "How clear are the current assessment criteria?", type: "multiple-choice" },
              { id: "q2", text: "How well does the policy align with IB standards?", type: "multiple-choice" },
              { id: "q3", text: "What improvements would you suggest?", type: "open-ended" },
            ],
          },
          {
            _id: "2",
            token: "xyz789uvw012",
            discipline: "Academic Honesty",
            respondentCount: 8,
            policyFileName: "academic_honesty_policy.pdf",
            language: "English",
            preferencePrompt: "Gather feedback on plagiarism detection and consequences for violations",
            audience: "All Stakeholders",
            createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
            questions: [
              {
                id: "q1",
                text: "How effective are the current plagiarism detection methods?",
                type: "multiple-choice",
              },
              { id: "q2", text: "Are the consequences for violations appropriate?", type: "multiple-choice" },
              { id: "q3", text: "What improvements would you suggest?", type: "open-ended" },
            ],
          },
        ]

        setQuestionnaires(mockQuestionnaires)
        setFilteredQuestionnaires(mockQuestionnaires)
        setError("Using mock data. API endpoint not available.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchQuestionnaires()
  }, [])

  const handleQuestionnaireClick = (questionnaire: any) => {
    setSelectedQuestionnaire(questionnaire)
  }

  const handleCloseModal = () => {
    setSelectedQuestionnaire(null)
  }

  const handleViewReport = (token: string) => {
    navigate(`/admin/questionnaire/${token}/report`)
  }

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopySuccess(id)
    setTimeout(() => setCopySuccess(null), 2000)
  }

  // Update the getDirectAccessLink function to use the questionnaire path
  const getDirectAccessLink = (token: string) => {
    return `${window.location.origin}/questionnaire/${token}`
  }

  const handleFilter = (filters: any) => {
    let result = [...questionnaires]

    if (filters.searchTerm) {
      const searchTerm = filters.searchTerm.toLowerCase()
      result = result.filter(
        (q) =>
          q.discipline?.toLowerCase().includes(searchTerm) ||
          q.token?.toLowerCase().includes(searchTerm) ||
          q.preferencePrompt?.toLowerCase().includes(searchTerm) ||
          q.audience?.toLowerCase().includes(searchTerm),
      )
    }

    if (filters.discipline) {
      result = result.filter((q) => q.discipline === filters.discipline)
    }

    if (filters.language) {
      result = result.filter((q) => q.language === filters.language)
    }

    if (filters.audience) {
      result = result.filter((q) => q.audience === filters.audience)
    }

    if (filters.dateFrom) {
      result = result.filter((q) => new Date(q.createdAt) >= new Date(filters.dateFrom))
    }

    if (filters.dateTo) {
      result = result.filter((q) => new Date(q.createdAt) <= new Date(filters.dateTo))
    }

    setFilteredQuestionnaires(result)
  }

  // Function to format date
  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A"
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return "N/A"
      return date.toLocaleDateString()
    } catch (error) {
      return "N/A"
    }
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
        <h2 className="text-2xl font-bold text-primary">Questionnaires</h2>
        <Button
          onClick={() => navigate("/admin/questionnaire-generate")}
          className="bg-primary hover:bg-primary/90 flex items-center gap-2"
        >
          <ClipboardList className="h-4 w-4" />
          Generate Questionnaire
        </Button>
      </div>

      <FilterBar onFilter={handleFilter} />

      {error && (
        <Alert variant="warning" className="bg-amber-50 border-amber-200 text-amber-800">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {filteredQuestionnaires.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-6 text-center">
            <ClipboardList className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No questionnaires found</h3>
            <p className="text-sm text-gray-500 mt-1">
              Generate your first questionnaire to get started or adjust your filters.
            </p>
            <Button
              onClick={() => navigate("/admin/questionnaire-generate")}
              className="mt-4 bg-primary hover:bg-primary/90"
            >
              Generate Questionnaire
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full bg-white rounded-lg shadow">
            <thead className="bg-secondary/30">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Token
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Discipline
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Respondents
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Audience
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-secondary">
              {filteredQuestionnaires.map((questionnaire) => (
                <tr
                  key={questionnaire._id || questionnaire.token}
                  className="hover:bg-secondary/10 cursor-pointer"
                  onClick={() => handleQuestionnaireClick(questionnaire)}
                >
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {questionnaire.token.substring(0, 8)}...
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">{questionnaire.discipline}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">
                    {questionnaire.respondentCount || 0}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">
                    <Badge variant="outline" className="bg-secondary text-primary">
                      {questionnaire.audience || "All Stakeholders"}
                    </Badge>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">
                    {renderStatusBadge(getQuestionnaireStatus(questionnaire))}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">
                    {formatDate(questionnaire.createdAt)}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-primary"
                      onClick={(e) => {
                        e.stopPropagation()
                        const link = getDirectAccessLink(questionnaire.token)
                        copyToClipboard(link, questionnaire._id || questionnaire.token)
                      }}
                    >
                      {copySuccess === (questionnaire._id || questionnaire.token) ? (
                        <Copy className="h-4 w-4 text-green-500" />
                      ) : (
                        <Share2 className="h-4 w-4" />
                      )}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={!!selectedQuestionnaire} onOpenChange={(open) => !open && handleCloseModal()}>
        {selectedQuestionnaire && (
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-primary">{selectedQuestionnaire.discipline} Questionnaire</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Token</p>
                  <p className="mt-1">{selectedQuestionnaire.token}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Respondents</p>
                  <p className="mt-1">{selectedQuestionnaire.respondentCount || 0}</p>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-500">Target Audience</p>
                <div className="mt-1 flex items-center gap-2">
                  <Badge variant="outline" className="bg-secondary text-primary">
                    <Users className="h-3 w-3 mr-1" />
                    {selectedQuestionnaire.audience || "All Stakeholders"}
                  </Badge>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-500">Preference Prompt</p>
                <p className="mt-1 text-sm p-2 bg-secondary/10 rounded-md">
                  {selectedQuestionnaire.preferencePrompt || "No specific preferences provided."}
                </p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-500">Shareable Link</p>
                <div className="mt-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                      Direct Access
                    </Badge>
                    <input
                      type="text"
                      readOnly
                      value={getDirectAccessLink(selectedQuestionnaire.token)}
                      className="flex-1 p-2 text-sm border rounded-md"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-primary text-primary hover:bg-primary/10"
                      onClick={() => {
                        const link = getDirectAccessLink(selectedQuestionnaire.token)
                        copyToClipboard(link, "direct-link")
                      }}
                    >
                      {copySuccess === "direct-link" ? "Copied!" : "Copy"}
                    </Button>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Share this link with stakeholders to collect their feedback on the policy. They will receive immediate
                  feedback after submission.
                </p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-500">Questions</p>
                <div className="mt-1 max-h-40 overflow-y-auto border rounded-md p-2">
                  {selectedQuestionnaire.questions?.map((question: any, index: number) => (
                    <div key={index} className="mb-2 pb-2 border-b border-gray-100 last:border-0">
                      <p className="text-sm font-medium">
                        {index + 1}. {question.text || question.stem}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">Type: {question.type}</p>
                    </div>
                  )) || <p className="text-sm text-gray-500">No questions available</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Created At</p>
                  <p className="mt-1">
                    {selectedQuestionnaire.createdAt
                      ? new Date(selectedQuestionnaire.createdAt).toLocaleString()
                      : "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Language</p>
                  <p className="mt-1">{selectedQuestionnaire.language || "English"}</p>
                </div>
              </div>
            </div>
            <DialogFooter className="flex gap-2 sm:justify-between">
              <Button
                variant="outline"
                className="border-primary text-primary hover:bg-primary/10"
                onClick={handleCloseModal}
              >
                Close
              </Button>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="border-green-500 text-green-600 hover:bg-green-50 flex items-center gap-2"
                  onClick={() => {
                    window.open(getDirectAccessLink(selectedQuestionnaire.token), "_blank")
                  }}
                >
                  <ExternalLink className="h-4 w-4" />
                  Open Questionnaire
                </Button>
                <Button
                  className="bg-primary hover:bg-primary/90 flex items-center gap-2"
                  onClick={() => handleViewReport(selectedQuestionnaire.token)}
                >
                  <BarChart3 className="h-4 w-4" />
                  View Report
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </div>
  )
}
