import axios from "axios"

// Create an axios instance with the base URL pointing to our backend
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api",
  headers: {
    "Content-Type": "application/json",
  },
})

// Add a request interceptor to include the JWT token in protected requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken")
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Auth services
export const authService = {
  login: async (username: string, password: string) => {
    try {
      const response = await api.post("/auth/login", { username, password })
      return response.data
    } catch (error) {
      console.error("Login error:", error)
      throw error
    }
  },
}

// Policy services
export const policyService = {
  uploadPolicy: async (formData: FormData) => {
    try {
      const response = await api.post("/policies/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      return response.data
    } catch (error) {
      console.error("Upload policy error:", error)
      throw error
    }
  },

  getPolicies: async () => {
    try {
      const response = await api.get("/policies")
      return response.data
    } catch (error) {
      console.error("Get policies error:", error)
      throw error
    }
  },

  downloadPolicy: async (policyId: string) => {
    try {
      const authToken = localStorage.getItem("authToken")
      // Use axios directly to handle binary data with auth token
      const response = await axios({
        url: `${process.env.NEXT_PUBLIC_API_URL}/policies/download/${policyId}`,
        method: "GET",
        responseType: "blob",
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      })

      // Create a blob URL and open it
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement("a")
      link.href = url
      link.setAttribute("download", `policy-${policyId}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)

      return true
    } catch (error) {
      console.error("Download policy error:", error)
      throw error
    }
  },
}

// Questionnaire services
export const questionnaireService = {
  generateQuestionnaire: async (discipline: string, preferencePrompt?: string, audience?: string) => {
    try {
      const response = await api.post("/questionnaire/generate", {
        discipline,
        preferencePrompt,
        audience,
      })
      return response.data
    } catch (error) {
      console.error("Generate questionnaire error:", error)
      throw error
    }
  },

  getQuestionnaire: async (token: string) => {
    try {
      const response = await api.get(`/questionnaire/${token}`)
      return response.data
    } catch (error) {
      console.error("Get questionnaire error:", error)
      throw error
    }
  },

  submitQuestionnaire: async (token: string, answers: any[], duration: number, verificationAnswer: string) => {
    try {
      const response = await api.post(`/questionnaire/${token}/submit`, {
        answers,
        duration,
        verificationAnswer,
      })
      return response.data
    } catch (error) {
      console.error("Submit questionnaire error:", error)
      throw error
    }
  },

  submitSurvey: async (token: string, answers: any[], duration: number, respondentInfo: any) => {
    try {
      const response = await api.post(`/questionnaire/${token}/submit`, {
        answers,
        duration,
        respondentInfo,
      })
      return response.data
    } catch (error) {
      console.error("Submit survey error:", error)
      throw error
    }
  },

  getQuestionnaireReport: async (token: string) => {
    try {
      const response = await api.get(`/questionnaire/${token}/report`)
      return response.data
    } catch (error) {
      console.error("Get questionnaire report error:", error)
      throw error
    }
  },

  getRespondentCount: async (token: string) => {
    try {
      const response = await api.get(`/questionnaire/${token}`)
      return response.data.respondentCount || 0
    } catch (error) {
      console.error("Get respondent count error:", error)
      throw error
    }
  },

  recordView: async (token: string) => {
    try {
      const response = await api.post(`/questionnaire/${token}/view`)
      return response.data
    } catch (error) {
      console.error("Record view error:", error)
      throw error
    }
  },

  downloadReportPDF: async (token: string) => {
    try {
      const authToken = localStorage.getItem("authToken")
      // Use axios directly to handle binary data with auth token
      const response = await axios({
        url: `${process.env.NEXT_PUBLIC_API_URL}/questionnaire/${token}/report/pdf`,
        method: "GET",
        responseType: "blob",
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      })

      // Create a blob URL and open it
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement("a")
      link.href = url
      link.setAttribute("download", `report-${token}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)

      return true
    } catch (error) {
      console.error("Download report PDF error:", error)
      throw error
    }
  },
}

// Reports services
export const reportService = {
  getReports: async () => {
    try {
      const response = await api.get("/reports")
      return response.data
    } catch (error) {
      console.error("Get reports error:", error)
      throw error
    }
  },

  getReportSummary: async () => {
    try {
      const response = await api.get("/reports/summary")
      return (
        response.data || {
          totalRespondents: 0,
          totalSuggestions: 0,
          totalViews: 0,
        }
      )
    } catch (error) {
      console.error("Get report summary error:", error)
      // Return default values if API fails
      return {
        totalRespondents: 0,
        totalSuggestions: 0,
        totalViews: 0,
      }
    }
  },
}

export default api
