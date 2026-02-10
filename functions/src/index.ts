import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();
const db = admin.firestore();

// --- CONSTANTS ---
const MAX_ENERGY = 100;
const RAID_COST = 20;
const RAID_SUCCESS_RATE = 0.75; // 75% chance to win
const ADMIN_EMAIL = "iznoatwork@gmail.com";

// ============================================================================
// 1. AUTH TRIGGER: AUTOMATIC PROFILE CREATION
// ============================================================================
// This runs AUTOMATICALLY whenever a new user signs up via Google or Email.
export const createOperative = functions.auth.user().onCreate(async (user) => {
  const userRef = db.collection("users").doc(user.uid);
  const snapshot = await userRef.get();

  if (snapshot.exists) return; // Already exists, don't overwrite

  const today = new Date().toISOString().split("T")[0];
  const unitId = user.displayName
    ? user.displayName.toUpperCase().replace(/\s/g, "_")
    : `UNIT_${Math.floor(Math.random() * 99999)}`;

  await userRef.set({
    uid: user.uid,
    email: user.email || "",
    username: unitId,
    avatar: user.photoURL || "/avatars/1.jpg",
    
    // Identity placeholders
    instagramHandle: "",
    youtubeHandle: "",
    linkedinHandle: "",

    // Economy & Stats
    wallet: { popCoins: 300, bubblePoints: 0 },
    energy: MAX_ENERGY, // Server-side energy tracking
    lastEnergyUpdate: admin.firestore.FieldValue.serverTimestamp(),
    
    // Game State
    unlockedNiches: ["general"],
    inventory: [],
    completedTasks: [],
    guildId: user.uid, // Own their own guild by default
    
    // Meta
    dailyTracker: { date: today, audiosViewed: 0, imagesGenerated: 0, bountiesClaimed: 0 },
    membership: { tier: "recruit" },
    status: "active",
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  console.log(`[OPS] New Operative Initialized: ${unitId}`);
});

// ============================================================================
// 2. GAMEPLAY: EXECUTE RAID (PvP)
// ============================================================================
// Called from frontend: const result = await httpsCallable(functions, 'executeRaid')({ targetId: "..." });
export const executeRaid = functions.https.onCall(async (data, context) => {
  // 1. Security Check
  if (!context.auth) throw new functions.https.HttpsError("unauthenticated", "IDENTIFY YOURSELF");
  
  const attackerId = context.auth.uid;
  const targetId = data.targetId;

  if (!targetId || targetId === attackerId) {
    throw new functions.https.HttpsError("invalid-argument", "INVALID TARGET");
  }

  const userRef = db.collection("users").doc(attackerId);
  const targetRef = db.collection("users").doc(targetId);

  // 2. Run Transaction (Atomic Operation)
  return db.runTransaction(async (t) => {
    const userDoc = await t.get(userRef);
    const targetDoc = await t.get(targetRef);

    if (!userDoc.exists || !targetDoc.exists) {
      throw new functions.https.HttpsError("not-found", "TARGET LOST");
    }

    const userData = userDoc.data()!;
    const targetData = targetDoc.data()!;

    // Check Energy
    if ((userData.energy || 0) < RAID_COST) {
      throw new functions.https.HttpsError("resource-exhausted", "ENERGY DEPLETED");
    }

    // Deduct Energy
    t.update(userRef, { energy: admin.firestore.FieldValue.increment(-RAID_COST) });

    // 3. Roll the Dice (Server-Side RNG)
    const isSuccess = Math.random() < RAID_SUCCESS_RATE;

    if (isSuccess) {
      // Calculate Loot (10% - 30% of target's wallet, capped at 500)
      const targetBalance = targetData.wallet?.popCoins || 0;
      let stolenAmount = Math.floor(targetBalance * (0.1 + Math.random() * 0.2));
      stolenAmount = Math.min(stolenAmount, 500); // Cap
      stolenAmount = Math.max(stolenAmount, 10);  // Minimum

      // Transfer Funds
      t.update(userRef, { "wallet.popCoins": admin.firestore.FieldValue.increment(stolenAmount) });
      t.update(targetRef, { "wallet.popCoins": admin.firestore.FieldValue.increment(-stolenAmount) });

      // Log the Kill
      const killRef = db.collection("kill_claims").doc();
      t.set(killRef, {
        killerId: attackerId,
        killerName: userData.username,
        targetId: targetId,
        targetName: targetData.username,
        amount: stolenAmount,
        status: "confirmed",
        timestamp: admin.firestore.FieldValue.serverTimestamp()
      });

      return { success: true, stolen: stolenAmount, message: `TARGET ELIMINATED. ${stolenAmount} PC SEIZED.` };
    } else {
      return { success: false, stolen: 0, message: "RAID FAILED. TARGET DEFENSES HELD." };
    }
  });
});

// ============================================================================
// 3. GAMEPLAY: CLAIM MISSION BOUNTY
// ============================================================================
export const claimMission = functions.https.onCall(async (data, context) => {
  if (!context.auth) throw new functions.https.HttpsError("unauthenticated", "NO AUTH");

  const { missionId, energyCost, reward } = data;
  const uid = context.auth.uid;
  const userRef = db.collection("users").doc(uid);

  return db.runTransaction(async (t) => {
    const userDoc = await t.get(userRef);
    const userData = userDoc.data()!;

    // Check Energy
    if ((userData.energy || 0) < energyCost) {
      throw new functions.https.HttpsError("resource-exhausted", "LOW ENERGY");
    }

    // TODO: Add Cooldown check here if storing cooldowns in DB

    // Update State
    t.update(userRef, {
      energy: admin.firestore.FieldValue.increment(-energyCost),
      "wallet.popCoins": admin.firestore.FieldValue.increment(reward),
      "dailyTracker.bountiesClaimed": admin.firestore.FieldValue.increment(1)
    });

    return { success: true, reward };
  });
});

// ============================================================================
// 4. ADMIN TOOL: SEED THE WORLD
// ============================================================================
// Run this ONCE to fill your app with fake users.
export const seedWorld = functions.https.onCall(async (data, context) => {
  if (context.auth?.token.email !== ADMIN_EMAIL) {
    throw new functions.https.HttpsError("permission-denied", "OVERSEER CLEARANCE REQUIRED");
  }

  const FAKE_NAMES = ["NEON_VIPER", "GRID_GHOST", "CYBER_WOLF", "DATA_RONIN", "NULL_POINTER", "SYNTH_QUEEN", "VOID_WALKER", "ECHO_SIX", "IRON_TITAN", "VELVET_ASSASSIN"];
  const batch = db.batch();

  for (const name of FAKE_NAMES) {
    const fakeId = `BOT_${Math.floor(Math.random() * 100000)}`;
    const ref = db.collection("users").doc(fakeId);
    
    batch.set(ref, {
      uid: fakeId,
      username: name,
      email: `${name.toLowerCase()}@sim.net`,
      avatar: `/avatars/${Math.floor(Math.random() * 6) + 1}.jpg`,
      wallet: { popCoins: Math.floor(Math.random() * 5000) + 500, bubblePoints: 0 },
      energy: 100,
      membership: { tier: Math.random() > 0.8 ? "elite" : "recruit" },
      status: "active",
      unlockedNiches: ["general", "tech"],
      guildId: fakeId,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      isBot: true // Flag to hide from certain lists if needed
    });
  }

  await batch.commit();
  return { success: true, message: `DEPLOYED ${FAKE_NAMES.length} SYNTHETIC UNITS` };
});