"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { Loader2, ArrowRight, Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { newsletterSchema, type NewsletterFormValues } from "@/lib/validators";
import { cn } from "@/lib/utils";

gsap.registerPlugin(useGSAP);

export function NewsletterForm() {
  const [isSubmitted, setIsSubmitted] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const form = useForm<NewsletterFormValues>({
    resolver: zodResolver(newsletterSchema),
    defaultValues: {
      email: "",
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = form;

  // Animate Success Message or Errors when they appear
  useGSAP(
    () => {
      if (isSubmitted) {
        gsap.from(".success-msg", {
          opacity: 0,
          scale: 0.9,
          duration: 0.5,
          ease: "back.out(1.7)",
        });
      }

      if (errors.email) {
        gsap.from(".error-msg", {
          opacity: 0,
          y: -10,
          duration: 0.3,
          ease: "power2.out",
        });
      }
    },
    { scope: containerRef, dependencies: [isSubmitted, errors.email] }
  );

  async function onSubmit(data: NewsletterFormValues) {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    console.log("Form submitted:", data);
    setIsSubmitted(true);
  }

  // Render Success State
  if (isSubmitted) {
    return (
      <div ref={containerRef}>
        <div className="success-msg flex items-center gap-2 text-green-500 bg-green-500/10 px-4 py-2 rounded-md border border-green-500/20">
          <Check className="h-4 w-4" />
          <span className="text-sm font-medium">You&apos;re on the list!</span>
        </div>
      </div>
    );
  }

  // Render Form State
  return (
    <div ref={containerRef} className="w-full max-w-sm">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-2">
        <div className="relative flex items-center gap-2">
          <Input
            {...register("email")}
            placeholder="Enter your email"
            className={cn(
              "pr-12 transition-all duration-200 bg-background/50 backdrop-blur-sm",
              errors.email &&
                "border-destructive focus-visible:ring-destructive"
            )}
            disabled={isSubmitting}
            autoComplete="email"
          />
          <Button
            type="submit"
            size="icon"
            disabled={isSubmitting}
            className="absolute right-1 h-8 w-8 transition-all"
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ArrowRight className="h-4 w-4" />
            )}
            <span className="sr-only">Notify me</span>
          </Button>
        </div>
        {errors.email && (
          <p className="error-msg text-xs text-destructive px-1">
            {errors.email.message}
          </p>
        )}
      </form>
    </div>
  );
}
