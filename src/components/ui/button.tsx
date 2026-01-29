import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-none text-sm font-bold uppercase tracking-widest transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-cyan-500 disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-cyan-500 text-black hover:bg-white hover:shadow-[0_0_20px_rgba(6,182,212,0.8)] border border-cyan-400",
        pink: "bg-pink-600 text-white hover:bg-pink-500 hover:shadow-[0_0_20px_rgba(236,72,153,0.8)] border border-pink-400",
        outline: "border-2 border-white/20 bg-transparent text-white hover:border-cyan-500 hover:text-cyan-400 backdrop-blur-sm",
        ghost: "hover:bg-white/5 text-gray-400 hover:text-white",
      },
      size: {
        default: "h-12 px-8",
        sm: "h-9 px-4 text-xs",
        lg: "h-16 px-12 text-lg",
        icon: "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export function Button({ className, variant, size, asChild = false, ...props }: React.ComponentProps<"button"> & VariantProps<typeof buttonVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "button";
  return <Comp className={cn(buttonVariants({ variant, size, className }))} {...props} />;
}