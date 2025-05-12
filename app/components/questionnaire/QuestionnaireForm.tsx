"use client"

import { useState, useEffect } from "react"
import { CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, ArrowRight, Loader2 } from "lucide-react"
import { Progress } from "@/components/ui/progress"

interface QuestionnaireFormProps {
  questionnaire: any
  onSubmit: (answers: any[], duration: number, verificationAnswer: string) => Promise<boolean>
}

export default function QuestionnaireForm({ questionnaire, onSubmit }: QuestionnaireFormProps) {
  const [questions, setQuestions] = useState<any[]>([])
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [verificationAnswer, setVerificationAnswer] = useState("")
  const [currentStep, setCurrentStep] = useState(0)
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [startTime, setStartTime] = useState(Date.now())

  useEffect(() => {
    // Map the questions to a format our component can use
    if (questionnaire && questionnaire.questions) {
      console.log("Questionnaire data:", questionnaire)

      const mappedQuestions = questionnaire.questions.map((q: any) => ({
        id: q._id,
        text: q.stem || q.text, // Use stem field as text, fallback to text
        type: q.type === "multiple_choice" ? "multiple-choice" : "open-ended", // Convert type format
        options: q.options || [],
        order: q.order || 0,
        required: q.required !== false, // Default to true if not specified
      }))

      // Sort questions by order if available
      const sortedQuestions = mappedQuestions.sort((a: any, b: any) => a.order - b.order)
      console.log("Mapped questions:", sortedQuestions)
      setQuestions(sortedQuestions)
      setStartTime(Date.now())
    }
  }, [questionnaire])

  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }))
  }

  const validateCurrentStep = () => {
    if (currentStep === questions.length) {
      // Validate verification question
      if (!verificationAnswer.trim()) {
        setError("Please answer the verification question.")
        return false
      }
      return true
    } else if (currentStep < questions.length) {
      // Validate current question
      const currentQuestion = questions[currentStep]
      if (currentQuestion.required && !answers[currentQuestion.id]) {
        setError(`Please answer this question before proceeding.`)
        return false
      }
      return true
    }
    return true
  }

  const handleNext = () => {
    if (validateCurrentStep()) {
      setError("")
      setCurrentStep((prev) => prev + 1)
    }
  }

  const handlePrevious = () => {
    setError("")
    setCurrentStep((prev) => Math.max(0, prev - 1))
  }

  const handleSubmit = async () => {
    // Final validation
    const unansweredRequired = questions.filter((q) => q.required && !answers[q.id])

    if (unansweredRequired.length > 0) {
      setError(`Please answer all required questions before submitting.`)
      return
    }

    if (!verificationAnswer.trim()) {
      setError("Please answer the verification question.")
      return
    }

    setError("")
    setIsSubmitting(true)

    // Calculate time spent
    const duration = Math.floor((Date.now() - startTime) / 1000)

    // Format answers for API
    const formattedAnswers = Object.entries(answers).map(([questionId, answer]) => ({
      questionId,
      answer,
    }))

    try {
      const success = await onSubmit(formattedAnswers, duration, verificationAnswer)
      if (!success) {
        setError("Failed to submit questionnaire. Please try again.")
      }
    } catch (error) {
      console.error("Error submitting questionnaire:", error)
      setError("Failed to submit questionnaire. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Calculate progress percentage
  const totalSteps = questions.length + 1 // +1 for verification
  const progressPercentage = (currentStep / totalSteps) * 100

  // Get current question if showing a question
  const currentQuestion = currentStep < questions.length ? questions[currentStep] : null
  const showVerification = currentStep === questions.length
  const showReview = currentStep > questions.length

  // If no questions are available, show an error
  if (questions.length === 0) {
    return (
      <CardContent className="pt-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            No questions found for this questionnaire. Please contact the administrator.
          </AlertDescription>
        </Alert>
      </CardContent>
    )
  }

  return (
    <>
      <div className="px-6 pt-4">
        <div className="flex justify-between text-sm text-gray-500 mb-2">
          <span>Progress</span>
          <span>{Math.round(progressPercentage)}%</span>
        </div>
        <Progress value={progressPercentage} className="h-2" />
      </div>

      <CardContent className="space-y-6 pt-6">
        {error && (
          <Alert variant="destructive" className="bg-red-50 border-red-200 text-red-800">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {currentQuestion && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-800">
              Question {currentStep + 1} of {questions.length}
              {currentQuestion.required && <span className="text-red-500 ml-1">*</span>}
            </h3>
            <p className="text-gray-800">{currentQuestion.text}</p>

            {currentQuestion.type === "multiple-choice" ? (
              <RadioGroup
                value={answers[currentQuestion.id] || ""}
                onValueChange={(value) => handleAnswerChange(currentQuestion.id, value)}
              >
                <div className="space-y-3">
                  {currentQuestion.options.map((option: string, i: number) => (
                    <div
                      key={i}
                      className="flex items-center space-x-2 rounded-md border border-secondary p-3 hover:bg-secondary/10 transition-colors"
                    >
                      <RadioGroupItem value={option} id={`${currentQuestion.id}-option-${i}`} />
                      <Label htmlFor={`${currentQuestion.id}-option-${i}`} className="flex-1 cursor-pointer">
                        {option}
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            ) : (
              <Textarea
                placeholder="Enter your response here..."
                className="min-h-[120px] border-secondary"
                value={answers[currentQuestion.id] || ""}
                onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
              />
            )}
          </div>
        )}

        {showVerification && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-800">Verification</h3>
            <p className="text-gray-800">
              Please answer the following question to verify you are part of our school community:
            </p>
            <div>
              <Label htmlFor="verification" className="text-gray-700">
                What is the name of our school mascot? <span className="text-red-500">*</span>
              </Label>
              <Input
                id="verification"
                value={verificationAnswer}
                onChange={(e) => setVerificationAnswer(e.target.value)}
                className="mt-1 border-secondary"
                placeholder="Enter your answer"
              />
            </div>
          </div>
        )}

        {showReview && (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-800">Review Your Answers</h3>
            <p className="text-sm text-gray-600">Please review your answers before submitting the questionnaire.</p>

            <div className="space-y-4">
              {questions.map((question, index) => (
                <div key={question.id} className="p-4 bg-white border border-secondary rounded-md">
                  <h4 className="font-medium text-gray-700">
                    Question {index + 1}: {question.text}
                  </h4>
                  <div className="mt-2">
                    <span className="font-medium text-sm">Your Answer:</span>{" "}
                    <span className="text-gray-800">
                      {answers[question.id] || <em className="text-gray-400">No answer provided</em>}
                    </span>
                  </div>
                </div>
              ))}

              <div className="p-4 bg-secondary/10 rounded-md">
                <h4 className="font-medium text-gray-700">Verification Question</h4>
                <div className="mt-2">
                  <span className="font-medium text-sm">Your Answer:</span> {verificationAnswer}
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex justify-between border-t border-secondary pt-6">
        <Button
          type="button"
          variant="outline"
          onClick={handlePrevious}
          disabled={currentStep === 0}
          className="border-primary text-primary hover:bg-primary/10"
        >
          Previous
        </Button>

        {currentStep <= totalSteps - 1 ? (
          <Button type="button" onClick={handleNext} className="bg-primary hover:bg-primary/90">
            Next
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        ) : (
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-primary hover:bg-primary/90"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit Questionnaire"
            )}
          </Button>
        )}
      </CardFooter>
    </>
  )
}
