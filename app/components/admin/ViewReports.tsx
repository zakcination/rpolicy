"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Users, FileText, Download, Eye } from "lucide-react"
import { reportService, questionnaireService } from "../../services/api"
import { Button } from "@/components/ui/button"
import FilterBar from "../shared/FilterBar"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

export default function ViewReports() {
  const [reports, setReports] = useState<any[]>([])
  const [filteredReports, setFilteredReports] = useState<any[]>([])
  const [summary, setSummary] = useState<any>({
    totalRespondents: 0,
    totalSuggestions: 0,
    totalViews: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [downloadingReport, setDownloadingReport] = useState<string | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        // Fetch reports from the API
        const reportsData = await reportService.getReports()
        console.log("Reports data:", reportsData)

        // Format the reports data
        const formattedReports = reportsData.map((report: any) => {
          // Extract key themes properly
          let keyThemes = ["No themes available"]
          if (
            report.report?.qualitativeThemes &&
            Array.isArray(report.report.qualitativeThemes) &&
            report.report.qualitativeThemes.length > 0
          ) {
            keyThemes = report.report.qualitativeThemes.map((theme: any) => theme.theme || "Unnamed theme")
          }

          // Extract suggestion count properly
          const suggestionCount = report.report?.editSuggestions?.length || 0

          return {
            id: report.questionnaireId || report._id,
            token: report.token,
            discipline: report.discipline,
            respondents: report.respondentCount || 0,
            views: report.views || 0,
            keyThemes: keyThemes,
            suggestions: suggestionCount,
            status: report.report?.policyAdoptionStatus ? "Complete" : "In Progress",
            createdAt: report.createdAt || new Date().toISOString(),
            policyFileName: report.policyFileName || "N/A",
          }
        })

        setReports(formattedReports)
        setFilteredReports(formattedReports)

        // Calculate summary data
        const summaryData = {
          totalRespondents: formattedReports.reduce((sum: number, report: any) => sum + report.respondents, 0),
          totalSuggestions: formattedReports.reduce((sum: number, report: any) => sum + report.suggestions, 0),
          totalViews: formattedReports.reduce((sum: number, report: any) => sum + report.views, 0),
        }

        setSummary(summaryData)
      } catch (error) {
        console.error("Error fetching reports:", error)
        setError("Failed to load reports. Please try again later.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleViewReport = (token: string) => {
    navigate(`/admin/questionnaire/${token}/report`)
  }

  const handleDownloadReport = async (token: string) => {
    try {
      setDownloadingReport(token)
      await questionnaireService.downloadReportPDF(token)
    } catch (error) {
      console.error("Error downloading report:", error)
    } finally {
      setDownloadingReport(null)
    }
  }

  const handleFilter = (filters: any) => {
    let result = [...reports]

    if (filters.searchTerm) {
      const searchTerm = filters.searchTerm.toLowerCase()
      result = result.filter(
        (report) =>
          report.discipline?.toLowerCase().includes(searchTerm) ||
          report.keyThemes?.some((theme: string) => theme.toLowerCase().includes(searchTerm)),
      )
    }

    if (filters.discipline) {
      result = result.filter((report) => report.discipline === filters.discipline)
    }

    if (filters.dateFrom) {
      result = result.filter((report) => new Date(report.createdAt) >= new Date(filters.dateFrom))
    }

    if (filters.dateTo) {
      result = result.filter((report) => new Date(report.createdAt) <= new Date(filters.dateTo))
    }

    setFilteredReports(result)
  }

  // Format date function
  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A"
    try {
      return new Date(dateString).toLocaleDateString()
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
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Respondents</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.totalRespondents}</div>
            <p className="text-xs text-gray-500">Across all questionnaires</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Policy Suggestions</CardTitle>
            <CheckCircle className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.totalSuggestions}</div>
            <p className="text-xs text-gray-500">Across all disciplines</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.totalViews}</div>
            <p className="text-xs text-gray-500">Questionnaire impressions</p>
          </CardContent>
        </Card>
      </div>

      <h2 className="text-xl font-semibold mt-8 mb-4">Policy Reports</h2>

      <FilterBar onFilter={handleFilter} showAudienceFilter={false} showLanguageFilter={false} />

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {filteredReports.length === 0 ? (
        <div className="text-center p-8 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No reports available yet. Generate questionnaires to collect feedback.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredReports.map((report) => (
            <Card key={report.id || report.token} className="overflow-hidden">
              <CardHeader className="bg-secondary/20 pb-3">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg font-semibold text-primary">{report.discipline}</CardTitle>
                  <Badge variant={report.status === "Complete" ? "default" : "outline"}>{report.status}</Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-sm text-gray-500">Respondents</p>
                      <p className="font-medium">{report.respondents}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Views</p>
                      <p className="font-medium">{report.views}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500 mb-1">Key Themes</p>
                    <div className="flex flex-wrap gap-1">
                      {report.keyThemes && report.keyThemes.length > 0 ? (
                        report.keyThemes.map((theme: string, i: number) => (
                          <Badge key={i} variant="secondary" className="font-normal">
                            {theme}
                          </Badge>
                        ))
                      ) : (
                        <Badge variant="secondary" className="font-normal">
                          No themes available
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="pt-2 border-t">
                    <div className="flex justify-between items-center">
                      <p className="text-sm text-gray-500">Created</p>
                      <p className="text-sm text-gray-600">{formatDate(report.createdAt)}</p>
                    </div>
                    <div className="flex justify-between items-center mt-1">
                      <p className="text-sm text-gray-500">Policy File</p>
                      <p className="text-sm text-gray-600 truncate max-w-[150px]">{report.policyFileName}</p>
                    </div>
                    <div className="flex justify-between items-center mt-1">
                      <p className="text-sm text-gray-500">Policy Suggestions</p>
                      <p className="font-medium text-primary">{report.suggestions}</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleViewReport(report.token)}
                      variant="outline"
                      className="flex-1 flex items-center justify-center gap-2 border-primary text-primary hover:bg-primary/10"
                    >
                      <FileText className="h-4 w-4" />
                      <span>View Report</span>
                    </Button>
                    <Button
                      onClick={() => handleDownloadReport(report.token)}
                      variant="outline"
                      className="flex items-center justify-center gap-2"
                      disabled={downloadingReport === report.token}
                    >
                      {downloadingReport === report.token ? (
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-solid border-primary border-r-transparent"></div>
                      ) : (
                        <Download className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
