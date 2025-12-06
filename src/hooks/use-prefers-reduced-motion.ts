"use client";

import { useSyncExternalStore } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

/**
 * Subscribes to the media query change event.
 * React calls this function to register a callback that notifies components of store updates.
 */
function subscribe(callback: () => void) {
  const mediaQuery = window.matchMedia(QUERY);
  mediaQuery.addEventListener("change", callback);
  return () => mediaQuery.removeEventListener("change", callback);
}

/**
 * Returns the current value of the media query from the browser.
 */
function getSnapshot() {
  return window.matchMedia(QUERY).matches;
}

/**
 * Returns the default value for server-side rendering (since window is undefined).
 * We default to false (no preference) on the server to match initial hydration.
 */
function getServerSnapshot() {
  return false;
}

export function usePrefersReducedMotion() {
  // useSyncExternalStore handles the hydration mismatch check and event listening automatically
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
