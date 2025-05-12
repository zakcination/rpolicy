"use client"

import { CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, Info, ThumbsUp, ThumbsDown } from "lucide-react"
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

  // Extract general feedback if available
  const generalFeedback =
    Array.isArray(feedback) && feedback.length > 0 && feedback[0].feedback
      ? feedback[0].feedback
      : Array.isArray(feedback) && feedback.some((item) => item.status)
        ? feedback.filter((item) => item.status)
        : null

  if (
    !feedback ||
    (!Array.isArray(feedback) && !feedback.report) ||
    (Array.isArray(feedback) && feedback.length === 0)
  ) {
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

  // Handle the case where feedback is in the report format
  const reportItems = !Array.isArray(feedback) && feedback.report ? feedback.report : null
  const feedbackItems = !Array.isArray(feedback) && feedback.feedback ? feedback.feedback : null

  return (
    <>
      <CardContent className="pt-6 space-y-6">
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            Thank you for submitting your responses! Here's some feedback based on your answers.
          </AlertDescription>
        </Alert>

        {/* General Feedback Section */}
        {(generalFeedback || feedbackItems) && (
          <div className="space-y-4">
            <h3 className="font-medium text-gray-800">Overall Feedback</h3>
            {generalFeedback &&
              generalFeedback.map((item: any, index: number) => (
                <div
                  key={index}
                  className={`p-4 rounded-md border ${
                    item.status && item.status.toLowerCase() === "positive"
                      ? "bg-green-50 border-green-200"
                      : "bg-amber-50 border-amber-200"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    {item.status && item.status.toLowerCase() === "positive" ? (
                      <ThumbsUp className="h-5 w-5 text-green-600" />
                    ) : (
                      <ThumbsDown className="h-5 w-5 text-amber-600" />
                    )}
                    <h4 className="font-medium">{item.status || "Feedback"}</h4>
                  </div>
                  <p className="text-sm mb-2">{item.text}</p>
                  {item.recommendations && (
                    <div className="mt-2 p-2 bg-white bg-opacity-50 rounded text-sm">
                      <span className="font-medium">Recommendation: </span>
                      {item.recommendations}
                    </div>
                  )}
                </div>
              ))}

            {feedbackItems &&
              feedbackItems.map((item: any, index: number) => (
                <div
                  key={index}
                  className={`p-4 rounded-md border ${
                    item.status && item.status.toLowerCase() === "positive"
                      ? "bg-green-50 border-green-200"
                      : "bg-amber-50 border-amber-200"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    {item.status && item.status.toLowerCase() === "positive" ? (
                      <ThumbsUp className="h-5 w-5 text-green-600" />
                    ) : (
                      <ThumbsDown className="h-5 w-5 text-amber-600" />
                    )}
                    <h4 className="font-medium">{item.status || "Feedback"}</h4>
                  </div>
                  <p className="text-sm mb-2">{item.text}</p>
                  {item.recommendations && (
                    <div className="mt-2 p-2 bg-white bg-opacity-50 rounded text-sm">
                      <span className="font-medium">Recommendation: </span>
                      {item.recommendations}
                    </div>
                  )}
                </div>
              ))}
          </div>
        )}

        <div className="space-y-6">
          <h3 className="font-medium text-gray-800">Question-by-Question Feedback</h3>
          {Array.isArray(feedback) &&
            feedback.map((item, index) => {
              const questionId = answers && answers[index] ? answers[index].questionId : null
              const questionText = questionId
                ? getQuestionText(questionId)
                : item.questionStem || `Question ${index + 1}`
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

          {reportItems &&
            reportItems.map((item: any, index: number) => (
              <div key={index} className={`p-4 rounded-md border ${getFeedbackQualityClass(item)}`}>
                <h3 className="font-medium mb-2">{item.questionStem || `Question ${index + 1}`}</h3>

                <div className="mb-3 p-2 bg-white bg-opacity-50 rounded">
                  <p className="text-sm font-medium text-gray-500">Your Answer:</p>
                  <p className="text-gray-800">{item.answer}</p>
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

                  {item.fruitfulness && (
                    <div className="flex items-start gap-2">
                      <Badge variant="outline" className="bg-blue-50 border-blue-200 text-blue-800">
                        {item.fruitfulness}
                      </Badge>
                    </div>
                  )}

                  {item.sensitivity && (
                    <div className="flex items-start gap-2">
                      <Badge variant="outline" className="bg-purple-50 border-purple-200 text-purple-800">
                        {item.sensitivity}
                      </Badge>
                    </div>
                  )}
                </div>
              </div>
            ))}
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
