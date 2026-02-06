import axios from "axios";

const CLIENT_ID = process.env.NEXT_PUBLIC_META_CLIENT_ID;
const CLIENT_SECRET = process.env.META_CLIENT_SECRET;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL; // e.g., http://localhost:3000
const REDIRECT_URI = `${APP_URL}/api/auth/instagram/callback`;

// 1. GENERATE THE LOGIN URL
// We pass the User's UID as 'state' so we know who is connecting when they come back.
export const getInstagramAuthUrl = (userId: string) => {
  const scopes = [
    "instagram_basic",
    "instagram_manage_insights",
    "pages_show_list",
    "pages_read_engagement"
  ];
  
  return `https://www.facebook.com/v18.0/dialog/oauth?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&state=${userId}&scope=${scopes.join(",")}&response_type=code`;
};

// 2. EXCHANGE CODE FOR TOKEN
export const getLongLivedToken = async (code: string) => {
  try {
    // A. Get Short Token
    const shortRes = await axios.get(`https://graph.facebook.com/v18.0/oauth/access_token`, {
      params: {
        client_id: CLIENT_ID,
        redirect_uri: REDIRECT_URI,
        client_secret: CLIENT_SECRET,
        code: code
      }
    });

    const shortToken = shortRes.data.access_token;

    // B. Upgrade to Long Token (60 Days)
    const longRes = await axios.get(`https://graph.facebook.com/v18.0/oauth/access_token`, {
      params: {
        grant_type: "fb_exchange_token",
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        fb_exchange_token: shortToken
      }
    });

    return longRes.data.access_token;
  } catch (error) {
    console.error("Token Exchange Failed:", error);
    throw new Error("Meta handshake failed.");
  }
};