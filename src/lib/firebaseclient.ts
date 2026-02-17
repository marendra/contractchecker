// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDSSW8_6pIMc2YF7aC2Ie8K_FtdBfJ3Q3s",
  authDomain: "contractchecker-srv.firebaseapp.com",
  projectId: "contractchecker-srv",
  storageBucket: "contractchecker-srv.firebasestorage.app",
  messagingSenderId: "244013314003",
  appId: "1:244013314003:web:59f15afda5cb0e41fd8926",
};

// Firestore database name
const FIRESTORE_DB = "contract-checker";

// Email magic link configuration
export const EMAIL_LINK_ACTION = "signin";

// Dynamically import Firebase SDKs only when needed
let _firebaseApp: any = null;
let _auth: any = null;
let _db: any = null;
let _functions: any = null;

async function getFirebaseApp() {
  if (!_firebaseApp) {
    const { initializeApp, getApps } = await import("firebase/app");
    _firebaseApp =
      getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
  }
  return _firebaseApp;
}

export async function getAuthLazy() {
  if (!_auth) {
    const { getAuth } = await import("firebase/auth");
    _auth = getAuth(await getFirebaseApp());
  }
  return _auth;
}

export async function getDbLazy() {
  if (!_db) {
    const { getFirestore } = await import("firebase/firestore");
    _db = getFirestore(await getFirebaseApp(), FIRESTORE_DB);
  }
  return _db;
}

export async function getFunctionsLazy() {
  if (!_functions) {
    const { getFunctions } = await import("firebase/functions");
    _functions = getFunctions(await getFirebaseApp());
  }
  return _functions;
}

// Auth functions that work with lazy loading
export async function sendMagicLink(email: string): Promise<void> {
  const { sendSignInLinkToEmail } = await import("firebase/auth");
  const auth = await getAuthLazy();
  const url = `${window.location.origin}/login`;
  await sendSignInLinkToEmail(auth, email, {
    url,
    handleCodeInApp: true,
  });
  if (typeof window !== "undefined") {
    localStorage.setItem("magicLinkEmail", email);
  }
}

export async function signInWithMagicLink(
  email: string,
  emailLink: string,
): Promise<void> {
  const { signInWithEmailLink } = await import("firebase/auth");
  const auth = await getAuthLazy();
  await signInWithEmailLink(auth, email, emailLink);
  if (typeof window !== "undefined") {
    localStorage.removeItem("magicLinkEmail");
  }
}

export function isEmailLink(): boolean {
  if (typeof window === "undefined") return false;
  // Firebase email magic links contain "mode=signIn" in the URL
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get("mode") === "signin" || urlParams.get("oobCode") !== null;
}

export function getStoredEmail(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("magicLinkEmail");
}

export function clearStoredEmail(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem("magicLinkEmail");
}

export async function signOutLazy(): Promise<void> {
  const { signOut } = await import("firebase/auth");
  const auth = await getAuthLazy();
  await signOut(auth);
}

// Google Provider
export function getGoogleProvider() {
  return (async () => {
    const { GoogleAuthProvider } = await import("firebase/auth");
    return new GoogleAuthProvider();
  })();
}

// Waitlist functions - uses Cloud Function for landing page (no anonymous auth needed)
export async function joinWaitlist(
  email: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const { httpsCallable } = await import("firebase/functions");
    const functions = await getFunctionsLazy();
    const addToWaitlist = httpsCallable(functions, "addToWaitlist");
    const result = await addToWaitlist({ email });

    const data = result.data as {
      success: boolean;
      message?: string;
      error?: string;
    };

    if (data.success) {
      return { success: true };
    }
    return { success: false, error: data.error || "Failed to join waitlist" };
  } catch (error: unknown) {
    console.error("Waitlist error:", error);
    const err = error as { code?: string; message?: string };
    return {
      success: false,
      error: `Error (${err.code || "unknown"}): ${err.message || "Failed to join waitlist"}`,
    };
  }
}

// Note: Firebase SDKs are now lazy-loaded via getAuthLazy(), getDbLazy(), getFunctionsLazy()
// The legacy exports below are kept for backward compatibility but use lazy loading internally
export const auth = {
  get current() {
    return getAuthLazy();
  },
};
export const db = {
  get current() {
    return getDbLazy();
  },
};
export const functions = {
  get current() {
    return getFunctionsLazy();
  },
};
