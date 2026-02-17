import { initializeApp, getApps, type FirebaseOptions, getApps as getFirebaseApps } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithEmailLink,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInAnonymously,
  signOut,
} from "firebase/auth";
import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { getFunctions, httpsCallable } from "firebase/functions";

// Firebase configuration
const firebaseConfig: FirebaseOptions = {
  apiKey: "AIzaSyDSSW8_6pIMc2YF7aC2Ie8K_FtdBfJ3Q3s",
  authDomain: "contractchecker-srv.firebaseapp.com",
  projectId: "contractchecker-srv",
  storageBucket: "contractchecker-srv.firebasestorage.app",
  messagingSenderId: "244013314003",
  appId: "1:244013314003:web:59f15afda5cb0e41fd8926",
};

// Firestore database name
const FIRESTORE_DB = "contract-checker";

// Initialize Firebase - only once (lazy initialization for landing page speed)
let _app: ReturnType<typeof initializeApp> | null = null;
let _auth: ReturnType<typeof getAuth> | null = null;
let _db: ReturnType<typeof getFirestore> | null = null;
let _functions: ReturnType<typeof getFunctions> | null = null;
let _initialized = false;

function getLazyApp() {
  if (!_app) {
    _app = getFirebaseApps().length === 0 ? initializeApp(firebaseConfig) : getFirebaseApps()[0];
  }
  return _app;
}

export function getLazyAuth() {
  if (!_auth) {
    _auth = getAuth(getLazyApp());
  }
  return _auth;
}

export function getLazyDb() {
  if (!_db) {
    _db = getFirestore(getLazyApp(), FIRESTORE_DB);
  }
  return _db;
}

export function getLazyFunctions() {
  if (!_functions) {
    _functions = getFunctions(getLazyApp());
  }
  return _functions;
}

export const auth = getLazyAuth();
export const db = getLazyDb();
export const googleProvider = new GoogleAuthProvider();
export const functions = getLazyFunctions();

// Email magic link configuration
export const EMAIL_LINK_ACTION = "signin";

export async function sendMagicLink(email: string): Promise<void> {
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
  await signInWithEmailLink(auth, email, emailLink);
  if (typeof window !== "undefined") {
    localStorage.removeItem("magicLinkEmail");
  }
}

export function isEmailLink(): boolean {
  if (typeof window === "undefined") return false;
  return isSignInWithEmailLink(auth, window.location.href);
}

export function getStoredEmail(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("magicLinkEmail");
}

export function clearStoredEmail(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem("magicLinkEmail");
}

// Waitlist functions - uses Cloud Function for landing page (no anonymous auth needed)
export async function joinWaitlist(
  email: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    // Use Cloud Function directly (no Firebase auth needed on landing page)
    const addToWaitlist = httpsCallable(getLazyFunctions(), "addToWaitlist");
    const result = await addToWaitlist({ email });

    const data = result.data as { success: boolean; message?: string; error?: string };

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
