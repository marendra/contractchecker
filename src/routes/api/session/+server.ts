import { json } from "@sveltejs/kit";
import { createRemoteJWKSet, jwtVerify } from "jose";
import type { RequestHandler } from "./$types";

// 1. Point to Google's Public Key Server
// This allows us to verify the signature of the Firebase Token
const JWKS = createRemoteJWKSet(
  new URL(
    "https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com",
  ),
);

// Check if we're in production
const isProduction = process.env.NODE_ENV === "production";

export const POST: RequestHandler = async ({ request, cookies }) => {
  try {
    const { idToken } = await request.json();

    if (!idToken) {
      return json({ error: "Missing ID Token" }, { status: 401 });
    }

    // 2. VERIFY the Token
    // This throws an error if the token is fake, expired, or modified
    const { payload } = await jwtVerify(idToken, JWKS, {
      issuer: "https://securetoken.google.com/contractchecker-srv",
      audience: "contractchecker-srv",
    });

    // 3. Extract UID from the verified token
    const uid = payload.sub;

    if (!uid) {
      return json({ error: "Invalid Token" }, { status: 401 });
    }

    console.log("✅ [SESSION] Setting cookie for uid:", uid);

    // 4. Secure! Now set the cookie.
    // Only use secure in production (HTTPS)
    cookies.set("session_uid", uid, {
      path: "/",
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "strict" : "lax",
      maxAge: 60 * 60 * 24 * 5, // 5 Days
    });

    return json({ success: true });
  } catch (error) {
    console.error("Session creation failed:", error);
    return json({ error: "Unauthorized" }, { status: 401 });
  }
};
