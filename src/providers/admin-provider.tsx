"use client";

import React, { createContext, useContext } from "react";
import { useSession } from "next-auth/react"; // We need the client-side session hook
import { SessionProvider } from "next-auth/react";

interface AdminContextType {
  isAdmin: boolean;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

// Internal component to consume the session
function AdminLogic({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const isAdmin = !!session?.user?.isAdmin;

  return (
    <AdminContext.Provider value={{ isAdmin }}>
      {children}
    </AdminContext.Provider>
  );
}

// Wrapper to ensure SessionProvider exists
export function AdminProvider({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AdminLogic>{children}</AdminLogic>
    </SessionProvider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error("useAdmin must be used within an AdminProvider");
  }
  return context;
}
