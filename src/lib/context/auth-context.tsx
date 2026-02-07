"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { useRouter } from "next/navigation";

// --- 1. DEFINING THE DATA STRUCTURE ---

export interface UserWallet {
  popCoins: number;
  bubblePoints: number;
}

export interface UserMembership {
  // Added "elite" here to fix your error
  tier: "recruit" | "elite" | "warlord" | "council" | "inner_circle";
  joinedAt?: string;
  paymentId?: string; // For tracking the ₹99 payment
}

export interface UserReputation {
  intelSubmitted: number;
  trustScore: number;
}

export interface DailyTracker {
  date: string;
  audiosViewed: number;
  imagesGenerated: number;
  bountiesClaimed: number;
}

export interface InventoryItem {
  itemId: string;
  name: string;
  purchasedAt: string;
}

export interface ReferralData {
  code: string;       // The unique code (usually username)
  count: number;      // How many people invited
  earnings: number;   // Total PC earned from invites
}

// THE MASTER INTERFACE
export interface UserData {
  uid: string;
  email: string | null;
  username: string;
  instagramHandle?: string;
  avatar?: string;
  
  // Nested Objects
  wallet: UserWallet;
  membership: UserMembership;
  reputation: UserReputation;
  dailyTracker: DailyTracker;
  referrals?: ReferralData; // Optional, might not exist for old users yet

  // Arrays
  unlockedNiches: string[];
  completedTasks: string[];
  followedCreators: string[];
  inventory: InventoryItem[];
  
  status: "active" | "banned" | "shadow_banned";
  createdAt: string;
}

// --- 2. CONTEXT SETUP ---

interface AuthContextType {
  user: User | null;          // The raw Firebase Auth user
  userData: UserData | null;  // The live Firestore data
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userData: null,
  loading: true,
});

export const useAuth = () => useContext(AuthContext);

// --- 3. PROVIDER COMPONENT ---

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Listen to Firebase Auth state (Login/Logout)
    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        // If logged in, listen to Firestore document in Real-time
        const userDocRef = doc(db, "users", currentUser.uid);
        
        const unsubscribeSnapshot = onSnapshot(userDocRef, (docSnap) => {
          if (docSnap.exists()) {
            // Force cast data to our Interface
            setUserData(docSnap.data() as UserData);
          } else {
            console.error("Auth exists but Firestore Profile missing.");
            setUserData(null);
          }
          setLoading(false);
        }, (error) => {
          console.error("Firestore Listen Error:", error);
          setLoading(false);
        });

        // Cleanup snapshot listener when auth state changes
        return () => unsubscribeSnapshot();
      } else {
        // Logged out
        setUserData(null);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ user, userData, loading }}>
      {children}
    </AuthContext.Provider>
  );
};