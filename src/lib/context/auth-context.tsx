"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, onSnapshot, updateDoc, serverTimestamp, Timestamp, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { toast } from "sonner";

// --- 1. LOYALTIES DATA STRUCTURES ---

export interface UserWallet {
  credits: number;
}

export interface UserMembership {
  tier: "member" | "verified" | "partner" | "sovereign";
  joinedAt?: string;
  paymentId?: string;
}

export interface UserReputation {
  trustScore: number;
  successfulDeployments?: number;
}

export interface ActiveUpgrade {
  upgradeId: string;
  name: string;
  status: string; 
  purchasedAt: string;
}

export interface InventoryItem {
  itemId: string;
  name: string;
  purchasedAt: string;
}

// 🛡️ UPDATED: Deployment State Interface (Digital Armory Spec)
export interface DeploymentState {
  step?: number;
  brandData?: {
    name: string;
    mission: string;
    colors: string;
    domain: string; 
  };
  selectedTemplate?: string | null; 
  selectedAddons?: string[];        
  
  // Legacy fields 
  selectedUpgrades?: string[];
  selectedMarketing?: string[];
  
  paymentStatus?: "idle" | "pending_verification" | "verified";
  status?: string; 
  vercelUrl?: string; 
  totalCredits?: number;
  txnRef?: string;
  deployedAt?: string;
  startTime?: number;
}

export interface UserData {
  uid: string;
  email: string | null;
  username: string; 
  brandName?: string; 
  mission?: string;
  aesthetic?: string;
  preferredFoundation?: string; 
  avatar?: string;
  
  instagramHandle?: string; 
  inventory?: InventoryItem[]; 
  websiteStatus?: string;
  prDistributions?: any[];
  
  deployment?: DeploymentState;

  wallet: UserWallet;
  membership: UserMembership;
  reputation: UserReputation;

  activeUpgrades: ActiveUpgrade[]; 
  status: "active" | "banned" | "review";
  createdAt: string;
  lastActive?: Timestamp;
  guildName?: string;
  guildId?: string;
  guildLeader?: string;
  guildBankContribution?: number;
}

const DEFAULT_USER_DATA: Partial<UserData> = {
  wallet: { credits: 0 },
  membership: { tier: "member" },
  reputation: { trustScore: 100, successfulDeployments: 0 },
  activeUpgrades: [],
  status: "active",
};

// --- 2. CONTEXT SETUP ---

interface AuthContextType {
  user: User | null;
  userData: UserData | null;
  loading: boolean;
  isAdmin: boolean;
  isVIP: boolean;
  updateDeployment: (data: Partial<DeploymentState>) => Promise<void>;
  commitFeedback: (message: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userData: null,
  loading: true,
  isAdmin: false,
  isVIP: false,
  updateDeployment: async () => {},
  commitFeedback: async () => {},
});

export const useAuth = () => useContext(AuthContext);

// --- 3. PROVIDER ---

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        const userDocRef = doc(db, "users", currentUser.uid);
        
        const docSnap = await getDoc(userDocRef);
        if (!docSnap.exists()) {
          // Initialize profile if it doesn't exist
          await setDoc(userDocRef, {
            uid: currentUser.uid,
            email: currentUser.email,
            username: currentUser.displayName || "New operative",
            createdAt: new Date().toISOString(),
            ...DEFAULT_USER_DATA
          });
        } else {
          // Fail silently if rules block this (e.g. strict rate limits)
          updateDoc(userDocRef, { lastActive: serverTimestamp() }).catch(() => null);
        }

        // Listen for real-time updates
        const unsubscribeSnapshot = onSnapshot(
          userDocRef, 
          (snap) => {
            if (snap.exists()) {
              setUserData(snap.data() as UserData);
            }
            setLoading(false);
          },
          // 🛡️ ADD THIS ERROR CATCHER:
          (error) => {
            if (error.code === 'permission-denied') return; // Ignore on logout
            console.error("Auth Sync Error:", error);
          }
        );

        return () => unsubscribeSnapshot();
      } else {
        setUserData(null);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  // 🚀 FUNCTION: Persist Dashboard Progress Safely
  const updateDeployment = async (data: Partial<DeploymentState>) => {
    if (!user) return;
    const userDocRef = doc(db, "users", user.uid);
    try {
      // Create a specific update payload using dot-notation to avoid overwriting nested objects
      const updatePayload: Record<string, any> = {};
      
      // We manually construct the payload so Firestore merges it properly
      Object.keys(data).forEach((key) => {
        updatePayload[`deployment.${key}`] = data[key as keyof DeploymentState];
      });

      await updateDoc(userDocRef, updatePayload);
    } catch (error) {
      console.error("FAILED_TO_SYNC_DEPLOYMENT:", error);
      toast.error("SYSTEM SYNC FAILED"); // Optional: Feedback if it fails
    }
  };

  // 🚀 FUNCTION: Dispatch Feedback to Admin
  const commitFeedback = async (message: string) => {
    if (!user) return;
    const feedbackRef = doc(db, "feedback", `${user.uid}_${Date.now()}`);
    await setDoc(feedbackRef, {
      uid: user.uid,
      username: userData?.username || "Unknown",
      brandName: userData?.deployment?.brandData?.name || "N/A",
      message,
      timestamp: serverTimestamp(),
      status: "unread"
    });
  };

  const isAdmin = userData?.email === "iznoatwork@gmail.com";
  const isVIP = userData?.membership?.tier === "partner" || userData?.membership?.tier === "sovereign";

  return (
    <AuthContext.Provider value={{ 
      user, 
      userData, 
      loading, 
      isAdmin, 
      isVIP, 
      updateDeployment,
      commitFeedback
    }}>
      {children}
    </AuthContext.Provider>
  );
};