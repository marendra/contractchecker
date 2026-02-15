import { initializeApp, type FirebaseOptions } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithEmailLink, sendSignInLinkToEmail, isSignInWithEmailLink } from "firebase/auth";

// Firebase configuration - replace with your actual config
const firebaseConfig: FirebaseOptions = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "your-api-key",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "your-project.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "your-project-id",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "your-project.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:123456789:web:abcdef"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Email magic link configuration
export const EMAIL_LINK_ACTION = "signin";

export async function sendMagicLink(email: string): Promise<void> {
  const url = `${window.location.origin}/login`;
  await sendSignInLinkToEmail(auth, email, {
    url,
    handleCodeInApp: true
  });
  // Save email to localStorage for later verification
  if (typeof window !== "undefined") {
    localStorage.setItem("magicLinkEmail", email);
  }
}

export async function signInWithMagicLink(email: string, emailLink: string): Promise<void> {
  await signInWithEmailLink(auth, email, emailLink);
  // Clean up after successful sign in
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
