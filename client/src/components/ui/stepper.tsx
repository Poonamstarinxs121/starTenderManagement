import React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface Step {
  title: string;
  description: string;
}

interface StepperProps {
  steps: Step[];
  currentStep: number;
  onStepClick?: (step: number) => void;
}

export const Stepper: React.FC<StepperProps> = ({
  steps,
  currentStep,
  onStepClick,
}) => {
  return (
    <div className="relative">
      <div
        className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200"
        style={{ width: "100%" }}
      />
      <div className="relative flex justify-between">
        {steps.map((step, index) => {
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;

          return (
            <div
              key={step.title}
              className={cn(
                "flex flex-col items-center cursor-pointer",
                (isCompleted || isCurrent) && "text-black",
                !isCompleted && !isCurrent && "text-gray-400"
              )}
              onClick={() => onStepClick?.(index)}
            >
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center relative bg-white border-2",
                  isCompleted && "border-black bg-black text-white",
                  isCurrent && "border-black",
                  !isCompleted && !isCurrent && "border-gray-300"
                )}
              >
                {isCompleted ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <span>{index + 1}</span>
                )}
              </div>
              <div className="mt-2 text-center">
                <div className="text-sm font-medium">{step.title}</div>
                <div className="text-xs text-gray-500 max-w-[120px]">
                  {step.description}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Stepper; 