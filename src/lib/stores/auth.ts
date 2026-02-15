import { writable, derived, type Readable } from "svelte/store";
import type { User } from "firebase/auth";
import { auth } from "$lib/firebaseclient";
import { onAuthStateChanged, signOut as firebaseSignOut } from "firebase/auth";

export interface AuthUser {
	uid: string;
	email: string | null;
	displayName: string | null;
	photoURL: string | null;
	emailVerified: boolean;
}

// Core auth state
const createAuthStore = () => {
	const { subscribe, set, update } = writable<{
		user: AuthUser | null;
		loading: boolean;
		initialized: boolean;
	}>({
		user: null,
		loading: true,
		initialized: false
	});

	// Initialize auth state listener
	const init = () => {
		if (typeof window === "undefined") return;

		onAuthStateChanged(auth, (firebaseUser) => {
			if (firebaseUser) {
				set({
					user: {
						uid: firebaseUser.uid,
						email: firebaseUser.email,
						displayName: firebaseUser.displayName,
						photoURL: firebaseUser.photoURL,
						emailVerified: firebaseUser.emailVerified
					},
					loading: false,
					initialized: true
				});
			} else {
				set({
					user: null,
					loading: false,
					initialized: true
				});
			}
		});
	};

	// Sign out
	const signOut = async () => {
		await firebaseSignOut(auth);
		set({
			user: null,
			loading: false,
			initialized: true
		});
	};

	return {
		subscribe,
		init,
		signOut
	};
};

export const authStore = createAuthStore();

// Derived stores for common checks
export const isAuthenticated: Readable<boolean> = derived(authStore, ($store) => !!$store.user);
export const currentUser: Readable<AuthUser | null> = derived(authStore, ($store) => $store.user);
export const isLoading: Readable<boolean> = derived(authStore, ($store) => $store.loading);
export const isInitialized: Readable<boolean> = derived(authStore, ($store) => $store.initialized);
