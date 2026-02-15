import { initializeApp, type FirebaseOptions } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithEmailLink, sendSignInLinkToEmail, isSignInWithEmailLink } from "firebase/auth";

// Firebase configuration
const firebaseConfig: FirebaseOptions = {
  apiKey: "AIzaSyDSSW8_6pIMc2YF7aC2Ie8K_FtdBfJ3Q3s",
  authDomain: "contractchecker-srv.firebaseapp.com",
  projectId: "contractchecker-srv",
  storageBucket: "contractchecker-srv.firebasestorage.app",
  messagingSenderId: "244013314003",
  appId: "1:244013314003:web:59f15afda5cb0e41fd8926"
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
