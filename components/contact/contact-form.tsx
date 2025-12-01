"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { Loader2, Send, CheckCircle2, AlertCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MagneticWrapper } from "@/components/ui/magnetic-wrapper"; // Import Physics
import { contactSchema, type ContactFormValues } from "@/lib/validators";
import { cn } from "@/lib/utils";
import { useSfx } from "@/hooks/use-sfx";
import { sendMessage } from "@/app/actions/send-message";

gsap.registerPlugin(useGSAP);

export function ContactForm() {
  const [isSubmitted, setIsSubmitted] = React.useState(false);
  const [serverError, setServerError] = React.useState<string | null>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const { play } = useSfx();

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: "", email: "", message: "" },
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = form;

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

  if (isSubmitted) {
    return (
      <div
        ref={containerRef}
        className="flex flex-col items-center justify-center p-12 text-center border border-green-500/30 bg-green-500/5 rounded-2xl backdrop-blur-md"
      >
        <div className="success-view">
          <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-green-500">
            Transmission Received
          </h3>
          <p className="text-muted-foreground mt-2">
            I will decrypt your message and respond shortly.
          </p>
          <Button
            variant="outline"
            className="mt-6 border-green-500/50 text-green-500 hover:bg-green-500 hover:text-black cursor-none"
            onClick={() => setIsSubmitted(false)}
          >
            Send Another
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="w-full max-w-lg mx-auto">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Name */}
        <div className="space-y-2 group">
          <label className="text-xs font-mono text-muted-foreground ml-1 group-focus-within:text-primary transition-colors">
            IDENTIFIER (NAME)
          </label>
          <Input
            {...register("name")}
            placeholder="John Doe"
            className={cn(
              "bg-background/50 border-white/10 focus:border-primary/50 transition-all"
            )}
            disabled={isSubmitting}
            onMouseEnter={() => play("hover")}
          />
          {errors.name && (
            <p className="text-xs text-red-500 ml-1">{errors.name.message}</p>
          )}
        </div>

        {/* Email */}
        <div className="space-y-2 group">
          <label className="text-xs font-mono text-muted-foreground ml-1 group-focus-within:text-primary transition-colors">
            FREQUENCY (EMAIL)
          </label>
          <Input
            {...register("email")}
            placeholder="john@example.com"
            className={cn(
              "bg-background/50 border-white/10 focus:border-primary/50 transition-all"
            )}
            disabled={isSubmitting}
            onMouseEnter={() => play("hover")}
            suppressHydrationWarning
          />
          {errors.email && (
            <p className="text-xs text-red-500 ml-1">{errors.email.message}</p>
          )}
        </div>

        {/* Message */}
        <div className="space-y-2 group">
          <label className="text-xs font-mono text-muted-foreground ml-1 group-focus-within:text-primary transition-colors">
            PAYLOAD (MESSAGE)
          </label>
          <Textarea
            {...register("message")}
            placeholder="Project details, ideas, or just saying hello..."
            className={cn(
              "min-h-[120px] bg-background/50 border-white/10 focus:border-primary/50 transition-all"
            )}
            disabled={isSubmitting}
            onMouseEnter={() => play("hover")}
          />
          {errors.message && (
            <p className="text-xs text-red-500 ml-1">
              {errors.message.message}
            </p>
          )}
        </div>

        {/* Server Error */}
        {serverError && (
          <div className="flex items-center gap-2 text-red-500 text-sm bg-red-500/10 p-3 rounded-md">
            <AlertCircle className="h-4 w-4" />
            <p>{serverError}</p>
          </div>
        )}

        {/* Submit with Physics */}
        <MagneticWrapper strength={0.2}>
          <Button
            type="submit"
            className={cn(
              "w-full gap-2 cursor-none magnetic-target hover:scale-[1.02] transition-transform"
            )}
            disabled={isSubmitting}
            onClick={() => play("click")}
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
        </MagneticWrapper>
      </form>
    </div>
  );
}
