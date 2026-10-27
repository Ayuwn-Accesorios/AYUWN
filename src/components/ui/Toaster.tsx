"use client";

import { useEffect, useRef, useState } from "react";
import SedimentStack, { SedimentStackHandle, SedimentToastInput } from "./toast-gravity-stack";

export const toast = (input: SedimentToastInput) => {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("sediment-toast", { detail: input }));
  }
};

export function Toaster() {
  const stackRef = useRef<SedimentStackHandle>(null);
  const [activeCount, setActiveCount] = useState(0);

  useEffect(() => {
    const handleToast = (e: Event) => {
      const customEvent = e as CustomEvent<SedimentToastInput>;
      stackRef.current?.push(customEvent.detail);
      setActiveCount((prev) => prev + 1);
    };
    window.addEventListener("sediment-toast", handleToast);
    return () => window.removeEventListener("sediment-toast", handleToast);
  }, []);

  const handleDismissOrClear = () => {
    setActiveCount((prev) => Math.max(0, prev - 1));
  };

  return (
    <div className="fixed bottom-4 right-4 sm:right-6 z-[9999] w-full max-w-sm h-0 overflow-visible pointer-events-none">
      <div className="w-full h-[400px] absolute bottom-0 right-0 flex flex-col justify-end pointer-events-none">
        <SedimentStack ref={stackRef} className="h-full w-full pointer-events-none" />
      </div>
    </div>
  );
}