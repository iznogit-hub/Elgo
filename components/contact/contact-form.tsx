"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import {
  Loader2,
  Send,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MagneticWrapper } from "@/components/ui/magnetic-wrapper";
import { contactSchema, type ContactFormValues } from "@/lib/validators";
import { cn } from "@/lib/utils";
import { useSfx } from "@/hooks/use-sfx";
import { sendMessage } from "@/app/actions/send-message";

gsap.registerPlugin(useGSAP);

const TOTAL_STEPS = 3;

export function ContactForm() {
  const [currentStep, setCurrentStep] = React.useState(0);
  const [direction, setDirection] = React.useState(1);
  const [isSubmitted, setIsSubmitted] = React.useState(false);
  const [serverError, setServerError] = React.useState<string | null>(null);

  const containerRef = React.useRef<HTMLDivElement>(null);
  const stepRef = React.useRef<HTMLDivElement>(null);
  const { play } = useSfx();

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: "", email: "", message: "" },
    mode: "onChange",
  });

  const {
    register,
    handleSubmit,
    trigger,
    formState: { errors, isSubmitting },
  } = form;

  useGSAP(
    () => {
      if (isSubmitted || !stepRef.current) return;
      gsap.fromTo(
        stepRef.current,
        { x: direction * 50, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.4, ease: "power2.out" }
      );
    },
    { scope: containerRef, dependencies: [currentStep, isSubmitted] }
  );

  useGSAP(
    () => {
      if (isSubmitted) {
        gsap.from(".success-view", {
          opacity: 0,
          y: 20,
          duration: 0.5,
          ease: "back.out(1.7)",
        });
      }
    },
    { scope: containerRef, dependencies: [isSubmitted] }
  );

  const handleNext = async () => {
    let isValid = false;
    if (currentStep === 0) isValid = await trigger("name");
    if (currentStep === 1) isValid = await trigger("email");

    if (isValid) {
      play("click");
      setDirection(1);
      gsap.to(stepRef.current, {
        x: -50,
        opacity: 0,
        duration: 0.3,
        ease: "power2.in",
        onComplete: () => setCurrentStep((prev) => prev + 1),
      });
    } else {
      play("click");
    }
  };

  const handleBack = () => {
    play("click");
    setDirection(-1);
    gsap.to(stepRef.current, {
      x: 50,
      opacity: 0,
      duration: 0.3,
      ease: "power2.in",
      onComplete: () => setCurrentStep((prev) => prev - 1),
    });
  };

  async function onSubmit(data: ContactFormValues) {
    setServerError(null);
    play("click");

    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("email", data.email);
    formData.append("message", data.message);

    const result = await sendMessage(formData);

    if (result.error) {
      setServerError(result.error);
      play("click");
    } else {
      setIsSubmitted(true);
      play("success");
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && currentStep < TOTAL_STEPS - 1) {
      e.preventDefault();
      handleNext();
    }
  };

  if (isSubmitted) {
    return (
      <div
        ref={containerRef}
        // FIXED: Reduced min-height on mobile
        className="flex flex-col items-center justify-center p-8 md:p-12 text-center border border-green-500/30 bg-green-500/5 rounded-2xl backdrop-blur-md min-h-[300px] md:min-h-[400px]"
      >
        <div className="success-view">
          <CheckCircle2 className="h-12 w-12 md:h-16 md:w-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-xl md:text-2xl font-bold text-green-500">
            Transmission Received
          </h3>
          <p className="text-sm md:text-base text-muted-foreground mt-2">
            I will decrypt your message and respond shortly.
          </p>
          <Button
            variant="outline"
            className="mt-6 border-green-500/50 text-green-500 hover:bg-green-500 hover:text-black cursor-none"
            onClick={() => {
              setIsSubmitted(false);
              setCurrentStep(0);
              form.reset();
            }}
          >
            Send Another
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      // FIXED: Adjusted min-height for mobile
      className="w-full max-w-lg mx-auto min-h-[350px] md:min-h-[400px] flex flex-col justify-center"
    >
      {/* Progress Indicator */}
      <div className="mb-6 md:mb-8 flex items-center justify-between px-1">
        <div className="flex gap-2">
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <div
              key={i}
              className={cn(
                "h-1.5 rounded-full transition-all duration-500",
                i <= currentStep ? "w-8 bg-primary" : "w-2 bg-primary/20"
              )}
            />
          ))}
        </div>
        <span className="text-[10px] md:text-xs font-mono text-muted-foreground">
          STEP {currentStep + 1}/{TOTAL_STEPS}
        </span>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div ref={stepRef} className="space-y-6">
          {/* STEP 1: NAME */}
          {currentStep === 0 && (
            <div className="space-y-2 group">
              <label className="text-xs font-mono text-muted-foreground ml-1 group-focus-within:text-primary transition-colors">
                IDENTIFIER (NAME)
              </label>
              <Input
                {...register("name")}
                placeholder="John Doe"
                className="bg-background/50 border-white/10 focus:border-primary/50 transition-all text-base md:text-lg h-12"
                onKeyDown={handleKeyDown}
                autoFocus
                onMouseEnter={() => play("hover")}
              />
              {errors.name && (
                <p className="text-xs text-red-500 ml-1 animate-pulse">
                  {errors.name.message}
                </p>
              )}
            </div>
          )}

          {/* STEP 2: EMAIL */}
          {currentStep === 1 && (
            <div className="space-y-2 group">
              <label className="text-xs font-mono text-muted-foreground ml-1 group-focus-within:text-primary transition-colors">
                FREQUENCY (EMAIL)
              </label>
              <Input
                {...register("email")}
                placeholder="john@example.com"
                className="bg-background/50 border-white/10 focus:border-primary/50 transition-all text-base md:text-lg h-12"
                onKeyDown={handleKeyDown}
                autoFocus
                onMouseEnter={() => play("hover")}
              />
              {errors.email && (
                <p className="text-xs text-red-500 ml-1 animate-pulse">
                  {errors.email.message}
                </p>
              )}
            </div>
          )}

          {/* STEP 3: MESSAGE */}
          {currentStep === 2 && (
            <div className="space-y-2 group">
              <label className="text-xs font-mono text-muted-foreground ml-1 group-focus-within:text-primary transition-colors">
                PAYLOAD (MESSAGE)
              </label>
              <Textarea
                {...register("message")}
                placeholder="Project details, ideas, or just saying hello..."
                className="min-h-[120px] md:min-h-[150px] bg-background/50 border-white/10 focus:border-primary/50 transition-all text-base resize-none"
                autoFocus
                onMouseEnter={() => play("hover")}
              />
              {errors.message && (
                <p className="text-xs text-red-500 ml-1 animate-pulse">
                  {errors.message.message}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Server Error Message */}
        {serverError && (
          <div className="flex items-center gap-2 text-red-500 text-sm bg-red-500/10 p-3 rounded-md animate-fade-in">
            <AlertCircle className="h-4 w-4" />
            <p>{serverError}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 pt-2">
          {currentStep > 0 && (
            <Button
              type="button"
              variant="ghost"
              onClick={handleBack}
              disabled={isSubmitting}
              className="px-3 hover:bg-white/5"
              onMouseEnter={() => play("hover")}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}

          <MagneticWrapper strength={0.2} className="w-full">
            {currentStep < TOTAL_STEPS - 1 ? (
              <Button
                type="button"
                onClick={handleNext}
                className="w-full gap-2 cursor-none magnetic-target hover:scale-[1.02] transition-transform text-sm md:text-base h-11"
                onMouseEnter={() => play("hover")}
              >
                <span>CONTINUE</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full gap-2 cursor-none magnetic-target hover:scale-[1.02] transition-transform text-sm md:text-base h-11"
                onClick={() => play("click")}
                onMouseEnter={() => play("hover")}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>TRANSMITTING...</span>
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    <span>INITIATE UPLINK</span>
                  </>
                )}
              </Button>
            )}
          </MagneticWrapper>
        </div>
      </form>
    </div>
  );
}
