"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { FileText, Download, Plus, ClipboardList, Clock } from "lucide-react"
import { policyService } from "../../services/api"
import FilterBar from "../shared/FilterBar"
import PDFThumbnail from "./PDFThumbnail"

export default function ViewPolicies() {
  const [policies, setPolicies] = useState<any[]>([])
  const [filteredPolicies, setFilteredPolicies] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [selectedPolicy, setSelectedPolicy] = useState<any>(null)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchPolicies = async () => {
      try {
        setIsLoading(true)
        const data = await policyService.getPolicies()

        // Add downloadUrl to each policy with auth token
        const authToken = localStorage.getItem("authToken")
        const policiesWithUrls = data.map((policy: any) => ({
          ...policy,
          downloadUrl: `${process.env.NEXT_PUBLIC_API_URL}/policies/download/${policy._id}`,
          // Include auth token in the URL for PDFThumbnail
          pdfThumbnailUrl: `${process.env.NEXT_PUBLIC_API_URL}/policies/download/${policy._id}?token=${authToken}`,
        }))

        setPolicies(policiesWithUrls)
        setFilteredPolicies(policiesWithUrls)
      } catch (error) {
        console.error("Error fetching policies:", error)
        setError("Failed to load policies. Please try again later.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchPolicies()
  }, [])

  const handleAddPolicy = () => {
    navigate("/admin/policy-upload")
  }

  const handlePolicyClick = (policy: any) => {
    setSelectedPolicy(policy)
  }

  const handleCloseModal = () => {
    setSelectedPolicy(null)
  }

  const handleCreateQuestionnaire = () => {
    if (selectedPolicy) {
      navigate("/admin/questionnaire-generate", {
        state: { policyId: selectedPolicy._id, discipline: selectedPolicy.discipline },
      })
    }
    handleCloseModal()
  }

  const handleFilter = (filters: any) => {
    let result = [...policies]

    if (filters.searchTerm) {
      const searchTerm = filters.searchTerm.toLowerCase()
      result = result.filter(
        (policy) =>
          policy.discipline?.toLowerCase().includes(searchTerm) ||
          policy.fileName?.toLowerCase().includes(searchTerm) ||
          policy.summary?.toLowerCase().includes(searchTerm),
      )
    }

    if (filters.discipline) {
      result = result.filter((policy) => policy.discipline === filters.discipline)
    }

    if (filters.language) {
      result = result.filter((policy) => policy.language === filters.language)
    }

    if (filters.dateFrom) {
      result = result.filter((policy) => new Date(policy.createdAt) >= new Date(filters.dateFrom))
    }

    if (filters.dateTo) {
      result = result.filter((policy) => new Date(policy.createdAt) <= new Date(filters.dateTo))
    }

    setFilteredPolicies(result)
  }

  // Function to get a placeholder image URL for a policy
  const getPlaceholderUrl = (policy: any) => {
    const discipline = policy.discipline?.toLowerCase() || "default"
    return `/placeholder.svg?height=200&width=150&text=${discipline}`
  }

  // Function to handle PDF download with auth token
  const handleDownloadPDF = (policy: any) => {
    const authToken = localStorage.getItem("authToken")
    if (!authToken) {
      console.error("No auth token available")
      return
    }

    // Open in a new tab with auth token
    window.open(`${policy.downloadUrl}?token=${authToken}`, "_blank")
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
        <h2 className="text-2xl font-bold text-primary">Policies</h2>
        <Button onClick={handleAddPolicy} className="bg-primary hover:bg-primary/90 flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Policy
        </Button>
      </div>

      <FilterBar onFilter={handleFilter} showAudienceFilter={false} />

      {error && <div className="p-4 bg-red-50 text-red-800 rounded-md">{error}</div>}

      {filteredPolicies.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-6 text-center">
            <FileText className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No policies found</h3>
            <p className="text-sm text-gray-500 mt-1">
              Upload your first policy to get started or adjust your filters.
            </p>
            <Button onClick={handleAddPolicy} className="mt-4 bg-primary hover:bg-primary/90">
              Upload Policy
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredPolicies.map((policy) => (
            <Card
              key={policy._id}
              className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handlePolicyClick(policy)}
            >
              <div className="h-40 bg-secondary/30 relative flex items-center justify-center">
                {/* Policy preview image */}
                <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
                  {policy.pdfThumbnailUrl ? (
                    <PDFThumbnail
                      pdfUrl={policy.pdfThumbnailUrl}
                      width={150}
                      height={200}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <img
                      src={policy.previewUrl || getPlaceholderUrl(policy)}
                      alt={`Preview of ${policy.discipline} policy`}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                <div className="absolute bottom-2 left-2 right-2 flex justify-between items-center">
                  <Badge variant="outline" className="bg-white text-primary">
                    {policy.language || "English"}
                  </Badge>
                  <div className="flex items-center text-xs text-white bg-black/50 px-2 py-1 rounded-full">
                    <Clock className="h-3 w-3 mr-1" />
                    {policy.pages || "N/A"} pages
                  </div>
                </div>
              </div>
              <CardContent className="p-4">
                <h3 className="text-lg font-medium text-primary truncate">{policy.discipline}</h3>
                <p className="text-sm text-gray-500 truncate">{policy.fileName}</p>
                <p className="text-sm text-gray-600 mt-2 line-clamp-2 h-10">
                  {policy.summary || "No summary available for this policy document."}
                </p>
                <div className="flex justify-between items-center mt-4">
                  <span className="text-xs text-gray-500">
                    {policy.createdAt ? new Date(policy.createdAt).toLocaleDateString() : "N/A"}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-primary"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDownloadPDF(policy)
                    }}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!selectedPolicy} onOpenChange={(open) => !open && handleCloseModal()}>
        {selectedPolicy && (
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-primary">{selectedPolicy.discipline} Policy</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-2">
              <div className="h-48 bg-secondary/30 relative flex items-center justify-center rounded-md overflow-hidden">
                {selectedPolicy.pdfThumbnailUrl ? (
                  <PDFThumbnail
                    pdfUrl={selectedPolicy.pdfThumbnailUrl}
                    width={300}
                    height={200}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <img
                    src={selectedPolicy.previewUrl || getPlaceholderUrl(selectedPolicy)}
                    alt={`Preview of ${selectedPolicy.discipline} policy`}
                    className="w-full h-full object-cover"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">File Name</p>
                  <p className="mt-1">{selectedPolicy.fileName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Language</p>
                  <p className="mt-1">{selectedPolicy.language || "English"}</p>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-500">Path</p>
                <p className="mt-1 text-sm text-gray-700">{selectedPolicy.filePath}</p>
              </div>

              {selectedPolicy.summary && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Summary</p>
                  <p className="mt-1 text-sm text-gray-700">{selectedPolicy.summary}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Pages</p>
                  <p className="mt-1">{selectedPolicy.pages || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Created At</p>
                  <p className="mt-1">
                    {selectedPolicy.createdAt ? new Date(selectedPolicy.createdAt).toLocaleDateString() : "N/A"}
                  </p>
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
              <Button
                className="bg-primary hover:bg-primary/90 flex items-center gap-2"
                onClick={handleCreateQuestionnaire}
              >
                <ClipboardList className="h-4 w-4" />
                Create Questionnaire
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </div>
  )
}
