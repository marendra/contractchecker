import { writable, derived, type Readable } from "svelte/store";
import { getAuthLazy } from "$lib/firebaseclient";

export interface AuthUser {
	uid: string;
	email: string | null;
	displayName: string | null;
	photoURL: string | null;
	emailVerified: boolean;
	isAnonymous: boolean;
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

	// Initialize auth state listener (lazy)
	let initialized = false;
	const init = async () => {
		if (typeof window === "undefined") return;
		if (initialized) return;
		initialized = true;

		try {
			const { onAuthStateChanged } = await import("firebase/auth");
			const auth = await getAuthLazy();
			onAuthStateChanged(auth, (firebaseUser: any) => {
				if (firebaseUser) {
					set({
						user: {
							uid: firebaseUser.uid,
							email: firebaseUser.email,
							displayName: firebaseUser.displayName,
							photoURL: firebaseUser.photoURL,
							emailVerified: firebaseUser.emailVerified,
							isAnonymous: firebaseUser.isAnonymous
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
		} catch (error) {
			console.error("Auth init error:", error);
			set({
				user: null,
				loading: false,
				initialized: true
			});
		}
	};

	// Sign out
	const signOut = async () => {
		try {
			const { signOut } = await import("firebase/auth");
			const auth = await getAuthLazy();
			await signOut(auth);
		} catch (error) {
			console.error("Sign out error:", error);
		}
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
// Note: isAuthenticated returns false for anonymous users (waitlist)
export const isAuthenticated: Readable<boolean> = derived(authStore, ($store) => {
	return !!$store.user && !$store.user?.isAnonymous;
});
export const isAnonymousUser: Readable<boolean> = derived(authStore, ($store) => {
	return !!$store.user && $store.user?.isAnonymous === true;
});
export const currentUser: Readable<AuthUser | null> = derived(authStore, ($store) => $store.user);
export const isLoading: Readable<boolean> = derived(authStore, ($store) => $store.loading);
export const isInitialized: Readable<boolean> = derived(authStore, ($store) => $store.initialized);
