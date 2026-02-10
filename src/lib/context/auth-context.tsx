"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, onSnapshot, updateDoc, serverTimestamp, Timestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { useRouter } from "next/navigation";

// --- 1. DATA STRUCTURES ---

export interface UserWallet {
  popCoins: number;
  bubblePoints: number;
}

export interface UserMembership {
  tier: "recruit" | "elite" | "warlord" | "council" | "inner_circle";
  joinedAt?: string;
  paymentId?: string;
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
  code: string;
  count: number;
  earnings: number;
}

// THE MASTER INTERFACE
export interface UserData {
  uid: string;
  email: string | null;
  username: string;
  avatar?: string;
  
  // Social Identities (THE NETWORK)
  instagramHandle: string; // MANDATORY
  youtubeHandle?: string;  // OPTIONAL
  linkedinHandle?: string; // OPTIONAL
  
  // Guild Data
  guildId?: string;
  guildName?: string;
  guildLeader?: string;
  guildBankContribution?: number;

  // Nested Objects
  wallet: UserWallet;
  membership: UserMembership;
  reputation: UserReputation;
  dailyTracker: DailyTracker;
  referrals?: ReferralData;

  // Arrays
  unlockedNiches: string[];
  completedTasks: string[];
  followedCreators: string[];
  inventory: InventoryItem[];
  
  // System State
  status: "active" | "banned" | "shadow_banned";
  createdAt: string;
  lastActive?: Timestamp;
}

const DEFAULT_USER_DATA: Partial<UserData> = {
  wallet: { popCoins: 0, bubblePoints: 0 },
  membership: { tier: "recruit" },
  unlockedNiches: ["general"],
  inventory: [],
  followedCreators: [],
  guildBankContribution: 0,
  guildName: "SHADOW_SYNDICATE",
  instagramHandle: "", // Default empty
};

// --- 2. CONTEXT SETUP ---

interface AuthContextType {
  user: User | null;
  userData: UserData | null;
  loading: boolean;
  isAdmin: boolean;
  isVIP: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userData: null,
  loading: true,
  isAdmin: false,
  isVIP: false,
});

export const useAuth = () => useContext(AuthContext);

// --- 3. PROVIDER ---

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        const userDocRef = doc(db, "users", currentUser.uid);
        
        updateDoc(userDocRef, { lastActive: serverTimestamp() }).catch(() => null);

        const unsubscribeSnapshot = onSnapshot(userDocRef, (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data() as UserData;
            setUserData({ ...DEFAULT_USER_DATA, ...data } as UserData);
          } else {
            console.error("Auth exists but Firestore Profile missing.");
            setUserData(null);
          }
          setLoading(false);
        }, (error) => {
          console.error("Firestore Listen Error:", error);
          setLoading(false);
        });

        return () => unsubscribeSnapshot();
      } else {
        setUserData(null);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  const isAdmin = userData?.email === "iznoatwork@gmail.com";
  const tier = userData?.membership?.tier;
  const isVIP = tier === "elite" || tier === "warlord" || tier === "council" || tier === "inner_circle";

  return (
    <AuthContext.Provider value={{ user, userData, loading, isAdmin, isVIP }}>
      {children}
    </AuthContext.Provider>
  );
};