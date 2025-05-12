"use client"

import { CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, Info } from "lucide-react"
import { useNavigate } from "react-router-dom"

interface QuestionnaireFeedbackProps {
  feedback: any[]
  answers: any[]
  questionnaire: any
}

export default function QuestionnaireFeedback({ feedback, answers, questionnaire }: QuestionnaireFeedbackProps) {
  const navigate = useNavigate()

  // Function to get question text by ID
  const getQuestionText = (questionId: string) => {
    if (!questionnaire || !questionnaire.questions) return "Unknown Question"

    const question = questionnaire.questions.find((q: any) => q._id === questionId)
    return question ? question.stem : "Unknown Question"
  }

  // Function to determine feedback quality level
  const getFeedbackQualityClass = (item: any) => {
    if (!item) return "bg-gray-100 border-gray-300 text-gray-800"

    if (item.correctness) {
      if (item.correctness.toLowerCase().includes("correct")) {
        return "bg-green-50 border-green-200 text-green-800"
      } else if (item.correctness.toLowerCase().includes("incorrect")) {
        return "bg-red-50 border-red-200 text-red-800"
      }
    }

    if (item.compliance) {
      if (item.compliance.toLowerCase().includes("fully")) {
        return "bg-green-50 border-green-200 text-green-800"
      } else if (item.compliance.toLowerCase().includes("not")) {
        return "bg-red-50 border-red-200 text-red-800"
      }
    }

    return "bg-amber-50 border-amber-200 text-amber-800"
  }

  const handleBackToSurveys = () => {
    navigate("/surveys")
  }

  if (!feedback || !Array.isArray(feedback) || feedback.length === 0) {
    return (
      <>
        <CardContent className="pt-6">
          <Alert className="bg-green-50 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Thank you for submitting your responses! Your feedback has been recorded.
            </AlertDescription>
          </Alert>

          <div className="mt-6 p-4 bg-secondary/10 rounded-md">
            <h3 className="font-medium text-gray-800 mb-2">Your Submission</h3>
            <p className="text-sm text-gray-600">
              Your responses have been successfully submitted. We appreciate your participation in helping us improve
              our policies.
            </p>
          </div>
        </CardContent>

        <CardFooter className="border-t border-secondary pt-6">
          <Button onClick={handleBackToSurveys} className="w-full bg-primary hover:bg-primary/90">
            Back to Surveys
          </Button>
        </CardFooter>
      </>
    )
  }

  return (
    <>
      <CardContent className="pt-6 space-y-6">
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            Thank you for submitting your responses! Here's some feedback based on your answers.
          </AlertDescription>
        </Alert>

        <div className="space-y-6">
          {feedback.map((item, index) => {
            const questionId = answers && answers[index] ? answers[index].questionId : null
            const questionText = questionId ? getQuestionText(questionId) : item.questionStem || `Question ${index + 1}`
            const answerText = answers && answers[index] ? answers[index].answer : "No answer provided"

            return (
              <div key={index} className={`p-4 rounded-md border ${getFeedbackQualityClass(item)}`}>
                <h3 className="font-medium mb-2">{questionText}</h3>

                <div className="mb-3 p-2 bg-white bg-opacity-50 rounded">
                  <p className="text-sm font-medium text-gray-500">Your Answer:</p>
                  <p className="text-gray-800">{answerText}</p>
                </div>

                <div className="space-y-3">
                  {item.correctness && (
                    <div className="flex items-start gap-2">
                      <Badge variant="outline" className={getFeedbackQualityClass(item)}>
                        {item.correctness}
                      </Badge>
                    </div>
                  )}

                  {item.compliance && (
                    <div className="flex items-start gap-2">
                      <Badge variant="outline" className={getFeedbackQualityClass(item)}>
                        {item.compliance}
                      </Badge>
                    </div>
                  )}

                  {item.recommendation && (
                    <div className="mt-2">
                      <p className="text-xs font-medium text-gray-600 mb-1">Recommendation:</p>
                      <div className="p-2 bg-blue-50 rounded-md text-blue-800 text-sm">
                        <Info className="h-4 w-4 inline-block mr-1" />
                        {item.recommendation}
                      </div>
                    </div>
                  )}

                  {item.insight && (
                    <div className="mt-2">
                      <p className="text-xs font-medium text-gray-600 mb-1">Insight:</p>
                      <div className="p-2 bg-purple-50 rounded-md text-purple-800 text-sm">{item.insight}</div>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        <div className="p-4 bg-secondary/10 rounded-md">
          <h3 className="font-medium text-gray-800 mb-2">What's Next?</h3>
          <p className="text-sm text-gray-600">
            Your feedback will be analyzed along with other responses to help us improve our {questionnaire.discipline}{" "}
            policy. Thank you for your valuable contribution to our school community.
          </p>
        </div>
      </CardContent>

      <CardFooter className="border-t border-secondary pt-6">
        <Button onClick={handleBackToSurveys} className="w-full bg-primary hover:bg-primary/90">
          Back to Surveys
        </Button>
      </CardFooter>
    </>
  )
}
