"use client"

import { Check, Building2, MapPin, UserCheck, CreditCard, Settings2 } from "lucide-react"
import { cn } from "@workspace/ui/lib/utils"

export const steps = [
  { id: 1, title: "Basic Info", icon: Building2, description: "Portal slug & official titles" },
  { id: 2, title: "Geography", icon: MapPin, description: "Division & district boundaries" },
  { id: 3, title: "Contact", icon: UserCheck, description: "Officials & office contact" },
  { id: 4, title: "Subscription", icon: CreditCard, description: "SaaS plan & billing" },
  { id: 5, title: "Limits", icon: Settings2, description: "Resource quota overrides" },
]

interface StepIndicatorProps {
  currentStep: number
  onStepClick: (step: number) => void
}

export function StepIndicator({ currentStep, onStepClick }: StepIndicatorProps) {
  return (
    <div className="mb-8">
      {/* Desktop Step Indicator */}
      <div className="hidden sm:flex justify-between items-center relative">
        {/* Connecting Line */}
        <div className="absolute top-5 left-0 w-full h-0.5 bg-border/30 -z-0" />
        <div
          className="absolute top-5 left-0 h-0.5 bg-primary transition-all duration-500 -z-0"
          style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
        />

        {steps.map((step, index) => {
          const stepNumber = index + 1
          const isActive = currentStep === stepNumber
          const isCompleted = currentStep > stepNumber
          const StepIcon = step.icon

          return (
            <div
              key={step.title}
              className="flex-1 flex flex-col items-center group relative cursor-pointer z-10"
              onClick={() => onStepClick(stepNumber)}
            >
              <div
                className={cn(
                  "size-10 rounded-xl flex items-center justify-center transition-all duration-300 border-2 bg-background",
                  isActive
                    ? "bg-primary text-primary-foreground border-primary shadow-glow scale-110"
                    : isCompleted
                    ? "bg-primary/20 text-primary border-primary/20"
                    : "text-muted-foreground border-border/50 hover:border-primary/30",
                )}
              >
                {isCompleted ? (
                  <Check className="h-5 w-5 stroke-[3]" />
                ) : (
                  <StepIcon className={cn("size-5", isActive && "stroke-[2.5]")} />
                )}

                {isActive && (
                  <div className="absolute inset-x-0 inset-y-0 rounded-xl bg-primary/20 animate-ping -z-10" />
                )}
              </div>

              <div className="mt-3 text-center hidden md:block">
                <span
                  className={cn(
                    "text-[10px] font-black uppercase tracking-widest transition-colors duration-300",
                    isActive ? "text-primary" : "text-muted-foreground",
                  )}
                >
                  Step {stepNumber}
                </span>
                <p
                  className={cn(
                    "text-xs font-bold transition-colors duration-300 line-clamp-1",
                    isActive ? "text-foreground" : "text-muted-foreground",
                  )}
                >
                  {step.title}
                </p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Mobile Step Indicator */}
      <div className="sm:hidden">
        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-primary">
              Step {currentStep} of {steps.length}
            </span>
            <h3 className="text-sm font-black text-foreground">
              {steps[currentStep - 1]?.title}
            </h3>
          </div>
          <div className="size-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary border border-primary/20">
            {(() => {
              const Icon = steps[currentStep - 1]?.icon
              return Icon ? <Icon className="size-5" /> : null
            })()}
          </div>
        </div>
        <div className="w-full bg-border/30 rounded-full h-1.5 overflow-hidden">
          <div
            className="bg-primary h-full rounded-full transition-all duration-700 shadow-glow"
            style={{ width: `${(currentStep / steps.length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  )
}
