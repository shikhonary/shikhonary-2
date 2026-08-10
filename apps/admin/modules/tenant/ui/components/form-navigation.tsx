"use client"

import { Button } from "@workspace/ui/components/button"
import { ArrowLeft, ArrowRight, Loader2, Send } from "lucide-react"

interface FormNavigationProps {
  currentStep: number
  totalSteps: number
  onPrevious: () => void
  onNext: () => void
  isSubmitting: boolean
  isValidating: boolean
}

export function FormNavigation({
  currentStep,
  totalSteps,
  onPrevious,
  onNext,
  isSubmitting,
  isValidating,
}: FormNavigationProps) {
  const isLastStep = currentStep === totalSteps
  const isFirstStep = currentStep === 1

  return (
    <div className="flex items-center justify-between pt-6 border-t border-border/30">
      <Button
        type="button"
        variant="ghost"
        onClick={onPrevious}
        disabled={isSubmitting}
        className={`gap-2 rounded-xl font-bold text-muted-foreground hover:text-foreground hover:bg-muted/50 ${
          isFirstStep ? "opacity-50 pointer-events-none" : ""
        }`}
      >
        <ArrowLeft className="h-4 w-4" />
        Previous
      </Button>

      <div className="text-xs text-muted-foreground font-medium">
        Step {currentStep} of {totalSteps}
      </div>

      <Button
        type="button"
        onClick={onNext}
        disabled={isSubmitting || isValidating}
        className="gap-2 rounded-xl font-bold bg-gradient-to-br from-primary to-primary-container text-white shadow-glow hover:scale-[1.02] active:scale-[0.98] transition-all"
      >
        {isSubmitting || isValidating ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            {isSubmitting ? "Provisioning..." : "Validating..."}
          </>
        ) : isLastStep ? (
          <>
            <Send className="h-4 w-4" />
            Register UP Portal
          </>
        ) : (
          <>
            Next
            <ArrowRight className="h-4 w-4" />
          </>
        )}
      </Button>
    </div>
  )
}
