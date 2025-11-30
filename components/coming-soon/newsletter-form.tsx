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
  const formRef = React.useRef<HTMLFormElement>(null);

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

  // --- 1. Spotlight Logic ---
  const handleMouseMove = (e: React.MouseEvent<HTMLFormElement>) => {
    if (!formRef.current) return;
    const rect = formRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    formRef.current.style.setProperty("--mouse-x", `${x}px`);
    formRef.current.style.setProperty("--mouse-y", `${y}px`);
  };

  // --- 2. Animations ---
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
    await new Promise((resolve) => setTimeout(resolve, 1500));
    console.log("Form submitted:", data);
    setIsSubmitted(true);
  }

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

  return (
    <div ref={containerRef} className="w-full max-w-sm">
      <form
        ref={formRef}
        onSubmit={handleSubmit(onSubmit)}
        onMouseMove={handleMouseMove}
        className="group relative flex flex-col gap-2 rounded-xl p-px"
      >
        {/* --- Spotlight Glow Layer --- 
                    This sits behind the input. It uses a radial gradient that follows the mouse.
                */}
        <div
          className="pointer-events-none absolute -inset-px rounded-xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{
            background: `radial-gradient(600px circle at var(--mouse-x) var(--mouse-y), rgba(255,255,255,0.4), transparent 40%)`,
          }}
        />

        {/* Secondary static border for non-hover state */}
        <div className="absolute inset-0 rounded-xl border border-border/50" />

        <div className="relative flex items-center gap-2 z-10 bg-background/80 backdrop-blur-xl rounded-xl p-1">
          <Input
            {...register("email")}
            placeholder="Enter your email"
            className={cn(
              "pr-12 border-none bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/50",
              errors.email && "text-destructive placeholder:text-destructive/50"
            )}
            disabled={isSubmitting}
            autoComplete="email"
          />
          <Button
            type="submit"
            size="icon"
            disabled={isSubmitting}
            className="h-9 w-9 shrink-0 rounded-lg transition-all hover:scale-105"
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
          <p className="error-msg absolute -bottom-6 left-1 text-xs text-destructive">
            {errors.email.message}
          </p>
        )}
      </form>
    </div>
  );
}
