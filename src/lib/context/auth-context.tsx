"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

// --- 1. DEFINING THE OPERATIVE PROFILE ---
export interface UserProfile {
  uid: string;
  email: string | null;
  username: string;
  
  // 📸 IDENTITY BINDING (Added)
  instagramHandle?: string;

  // 💰 THE WALLET (Economy)
  wallet: {
    popCoins: number;       // The "Grind" Currency
    bubblePoints: number;   // The "Fiat" Currency
  };

  // 🔐 ACCESS & PROGRESSION
  unlockedNiches: string[]; // Array of Niche IDs (e.g. ["general", "tech"])
  membership: {
    tier: "recruit" | "operative" | "council" | "inner_circle";
    validUntil?: string; // ISO Date
  };

  // 🔋 DAILY RATION TRACKER
  dailyTracker: {
    date: string;           // "2026-02-05"
    audiosViewed: number;
    imagesGenerated: number;
    bountiesClaimed: number;
  };
  
  // ⚔️ MERCENARY STATS
  reputation: {
    intelSubmitted: number;
    trustScore: number;
  };
  
  // System Status
  status: "active" | "banned" | "purged";
  createdAt: string;
}

interface AuthContextType {
  user: User | null;              // Raw Firebase User
  userData: UserProfile | null;   // Database Game Data
  loading: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userData: null,
  loading: true,
  isAdmin: false,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // REAL-TIME LISTENER FOR AUTH STATE
    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        // ⚡ REAL-TIME DB LISTENER (Updates Wallet Instantly)
        const docRef = doc(db, "users", currentUser.uid);
        
        const unsubscribeSnapshot = onSnapshot(docRef, (docSnap) => {
          if (docSnap.exists()) {
            setUserData(docSnap.data() as UserProfile);
          } else {
            console.warn("⚠️ User authenticated but no DB profile found.");
            setUserData(null);
          }
          setLoading(false);
        }, (err) => {
          console.error("❌ Error fetching live profile:", err);
          setLoading(false);
        });

        // Cleanup the snapshot listener when auth state changes
        return () => unsubscribeSnapshot();
      } else {
        setUserData(null);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  // --- ADMIN GATEKEEPER ---
  const ADMIN_EMAILS = ["iznoatwork@gmail.com", "admin@zaibatsu.com"];
  
  const isAdmin = !!(
    userData && 
    userData.email && 
    ADMIN_EMAILS.includes(userData.email)
  );

  return (
    <AuthContext.Provider value={{ user, userData, loading, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);