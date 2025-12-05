"use client";

import { createContext, useContext } from "react";

interface LoadingContextType {
  assetsLoaded: boolean;
}

export const LoadingContext = createContext<LoadingContextType>({
  assetsLoaded: false,
});

export function useLoadingStatus() {
  const context = useContext(LoadingContext);
  if (context === undefined) {
    throw new Error("useLoadingStatus must be used within a LoadingProvider");
  }
  return context;
}
