"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

// --- 1. DEFINING THE OPERATIVE PROFILE ---
export interface UserProfile {
  uid: string;
  email: string | null;
  username: string;
  
  // Game Stats
  niche: string;
  tier: "recruit" | "soldier" | "captain" | "inner_circle";
  bubblePoints: number; // Premium Currency
  popCoins: number;     // Free Currency
  velocity: number;     // XP / Score
  
  // Assets
  avatarId: string;
  unlockedSkins: string[]; // Array of skin IDs
  
  // Network
  invitedBy?: string;      // UID of the referrer
  instagramConnected: boolean;
  instagramToken?: string; // Stored securely (ideally)
  
  // System Status
  status: "active" | "banned" | "purged" | "pending_whitelist";
  createdAt: string;
}

interface AuthContextType {
  user: User | null;            // Raw Firebase User
  userData: UserProfile | null; // Database Game Data
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
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        // FETCH GAME DATA FROM FIRESTORE
        try {
          const docRef = doc(db, "users", currentUser.uid);
          const docSnap = await getDoc(docRef);
          
          if (docSnap.exists()) {
            setUserData(docSnap.data() as UserProfile);
          } else {
            console.warn("⚠️ User authenticated but no game profile found.");
            // Optional: You could trigger a redirect to a "Finish Setup" page here
          }
        } catch (err) {
          console.error("❌ Error fetching user profile:", err);
        }
      } else {
        setUserData(null);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // --- ADMIN GATEKEEPER ---
  // Replace this with your actual admin email(s)
  const ADMIN_EMAILS = ["amber@bubblepops.com", "admin@zaibatsu.com"];
  
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