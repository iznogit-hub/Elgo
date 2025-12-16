"use client";

import { usePathname, useRouter } from "next/navigation";
import { animatePageOut } from "@/utils/transition";

// ⚡ EXTEND: Inherit all standard HTML Button props (onClick, onMouseEnter, className, etc.)
interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  href: string;
  label?: string; // Optional convenience prop
}

export function TransitionLink({
  href,
  label,
  children,
  className,
  onClick,
  ...props // ⚡ CAPTURE: Gather all other props (like onMouseEnter) into this object
}: Props) {
  const router = useRouter();
  const pathname = usePathname();

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    // 1. Run the custom transition logic
    if (pathname !== href) {
      animatePageOut(href, router);
    }

    // 2. Run any onClick handler passed from the parent (e.g., plays sound)
    if (onClick) {
      onClick(e);
    }
  };

  return (
    <button
      className={className}
      onClick={handleClick}
      role="link"
      // ⚡ SPREAD: Pass all standard props to the DOM element
      {...props}
    >
      {children || label}
    </button>
  );
}
