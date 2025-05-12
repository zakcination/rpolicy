"use client"

import { useState, useEffect } from "react"
import { useLocation } from "react-router-dom"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, Copy, LinkIcon } from "lucide-react"
import { questionnaireService } from "../../services/api"
import api from "../../services/api" // Import the api variable

export default function GenerateQuestionnaire() {
  const location = useLocation()
  const [discipline, setDiscipline] = useState("")
  const [policyId, setPolicyId] = useState("")
  const [preferencePrompt, setPreferencePrompt] = useState("")
  const [audience, setAudience] = useState("Teachers and Staff")
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedLink, setGeneratedLink] = useState("")
  const [token, setToken] = useState("")
  const [respondentCount, setRespondentCount] = useState(0)
  const [copySuccess, setCopySuccess] = useState(false)
  const [error, setError] = useState("")

  // Use policy data from location state if available
  useEffect(() => {
    if (location.state?.policyId) {
      setPolicyId(location.state.policyId)
    }
    if (location.state?.discipline) {
      setDiscipline(location.state.discipline)
    }
  }, [location.state])

  // Poll for respondent count if we have a token
  useEffect(() => {
    if (!token) return

    const fetchRespondentCount = async () => {
      try {
        const count = await questionnaireService.getRespondentCount(token)
        setRespondentCount(count)
      } catch (error) {
        console.error("Error fetching respondent count:", error)
      }
    }

    // Initial fetch
    fetchRespondentCount()

    // Set up polling
    const interval = setInterval(fetchRespondentCount, 10000) // Poll every 10 seconds

    return () => clearInterval(interval)
  }, [token])

  const handleGenerate = async () => {
    if (!discipline) {
      setError("Please select a discipline")
      return
    }

    setError("")
    setIsGenerating(true)

    try {
      // Update the API call to include preferencePrompt and audience
      const response = await api.post("/questionnaire/generate", {
        discipline,
        preferencePrompt,
        audience,
      })

      setToken(response.data.questionnaire.token)
      setGeneratedLink(
        response.data.link || `${window.location.origin}/questionnaire/${response.data.questionnaire.token}`,
      )
      setRespondentCount(response.data.questionnaire.respondentCount || 0)
    } catch (error: any) {
      console.error("Error generating questionnaire:", error)

      // For development/testing, create mock data if API fails
      const mockToken = `mock-${Math.random().toString(36).substring(2, 10)}`
      setToken(mockToken)
      setGeneratedLink(`${window.location.origin}/questionnaire/${mockToken}`)
      setRespondentCount(0)
      setError("Using mock data. API endpoint not available.")
    } finally {
      setIsGenerating(false)
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedLink)
    setCopySuccess(true)
    setTimeout(() => setCopySuccess(false), 2000)
  }

  return (
    <div className="space-y-6">
      <Card className="bg-white">
        <CardContent className="pt-6">
          <div className="space-y-6">
            <div>
              <Label htmlFor="discipline" className="text-base">
                Discipline
              </Label>
              <Select value={discipline} onValueChange={setDiscipline}>
                <SelectTrigger id="discipline" className="mt-1 border-secondary">
                  <SelectValue placeholder="Select discipline" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Assessment">Assessment</SelectItem>
                  <SelectItem value="Academic Honesty">Academic Honesty</SelectItem>
                  <SelectItem value="Inclusion">Inclusion</SelectItem>
                  <SelectItem value="Language">Language</SelectItem>
                  <SelectItem value="Admission">Admissions</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="audience" className="text-base">
                Target Audience
              </Label>
              <Select value={audience} onValueChange={setAudience}>
                <SelectTrigger id="audience" className="mt-1 border-secondary">
                  <SelectValue placeholder="Select audience" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Teachers and Staff">Teachers and Staff</SelectItem>
                  <SelectItem value="Students">Students</SelectItem>
                  <SelectItem value="Parents">Parents</SelectItem>
                  <SelectItem value="Administrators">Administrators</SelectItem>
                  <SelectItem value="All Stakeholders">All Stakeholders</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="preferencePrompt" className="text-base">
                Preference Prompt
              </Label>
              <Textarea
                id="preferencePrompt"
                placeholder="Enter any specific preferences or focus areas for this questionnaire..."
                value={preferencePrompt}
                onChange={(e) => setPreferencePrompt(e.target.value)}
                className="mt-1 min-h-[100px] border-secondary"
              />
              <p className="text-xs text-gray-500 mt-1">
                Optional: Specify any particular aspects of the policy you want feedback on, or any specific questions
                to include.
              </p>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button
              onClick={handleGenerate}
              disabled={!discipline || isGenerating}
              className="w-full bg-primary hover:bg-primary/90"
            >
              {isGenerating ? "Generating..." : "Generate Questionnaire"}
            </Button>

            {generatedLink && (
              <div className="space-y-4 mt-6 p-4 bg-secondary/20 rounded-md">
                <h3 className="font-medium text-primary">Questionnaire Generated!</h3>

                <div className="flex items-center">
                  <LinkIcon className="h-4 w-4 text-primary mr-2" />
                  <span className="font-medium text-sm">Shareable Link:</span>
                </div>

                <div className="flex">
                  <Input value={generatedLink} readOnly className="flex-1 bg-white border-secondary" />
                  <Button
                    onClick={copyToClipboard}
                    variant="outline"
                    className="ml-2 flex gap-2 border-primary text-primary hover:bg-primary/10"
                  >
                    {copySuccess ? (
                      <>
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="hidden sm:inline">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" />
                        <span className="hidden sm:inline">Copy</span>
                      </>
                    )}
                  </Button>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-secondary/50">
                  <span className="text-sm text-gray-700">Respondents:</span>
                  <div className="flex items-center">
                    <span className="font-medium text-primary">{respondentCount}</span>
                    <span className="text-sm text-gray-600 ml-1">accessed</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {generatedLink && (
        <Alert className="bg-secondary/20 border-secondary">
          <AlertDescription className="text-gray-800">
            Share this link with {audience.toLowerCase()} to collect their feedback on the {discipline} policy.
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
