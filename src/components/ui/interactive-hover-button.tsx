'use client';

import React from "react";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface InteractiveHoverButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  text?: string;
}

const InteractiveHoverButton = React.forwardRef<
  HTMLButtonElement,
  InteractiveHoverButtonProps
>(({ text = "Button", className, ...props }, ref) => {
  return (
    <button
      ref={ref}
      // Quitamos w-40 y agregamos w-full para que sea responsivo
      className={cn(
        "group relative w-full cursor-pointer overflow-hidden rounded-full border border-ink/15 bg-white p-2.5 px-6 text-center text-sm font-semibold text-ink",
        className,
      )}
      {...props}
    >
      <span className="inline-block transition-all duration-300 group-hover:translate-x-8 group-hover:opacity-0">
        {text}
      </span>
      <div className="absolute top-0 left-0 z-10 flex h-full w-full translate-x-12 items-center justify-center gap-2 text-white opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100">
        <span>{text}</span>
        <ArrowRight size={16} />
      </div>
      <div className="absolute left-[20%] top-[40%] h-2 w-2 rounded-lg bg-brand transition-all duration-300 group-hover:left-0 group-hover:top-0 group-hover:h-full group-hover:w-full group-hover:scale-[2.5]" />
    </button>
  );
});

InteractiveHoverButton.displayName = "InteractiveHoverButton";

export { InteractiveHoverButton };