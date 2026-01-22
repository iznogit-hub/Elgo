"use client";

import React from "react";

export function Footer() {
  return (
    <footer className="w-full py-6 mt-12 border-t border-white/10 bg-black text-center">
      <p className="text-[10px] text-gray-600 font-mono tracking-widest uppercase">
        &copy; <span suppressHydrationWarning>{new Date().getFullYear()}</span> BUBBLEPOPS STUDIOS.
        ALL RIGHTS RESERVED.
      </p>
    </footer>
  );
}