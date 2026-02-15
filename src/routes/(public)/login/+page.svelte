<script lang="ts">
	import { onMount } from "svelte";
	import { goto } from "$app/navigation";

	import { Button } from "$lib/components/ui/button";
	import { Input } from "$lib/components/ui/input";
	import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "$lib/components/ui/card";

	import {
		auth,
		googleProvider,
		sendMagicLink,
		signInWithMagicLink,
		isEmailLink,
		getStoredEmail,
		clearStoredEmail
	} from "$lib/firebaseclient";
	import { signInWithPopup } from "firebase/auth";
	import { Mail, AlertCircle, Loader2, CheckCircle2 } from "lucide-svelte";
	import { authStore, isAuthenticated } from "$lib/stores/auth";

	// States
	type AuthState = "initial" | "sending" | "email-sent" | "signing-in" | "error";
	let authState = $state<AuthState>("initial");
	let errorMessage = $state<string>("");
	let email = $state<string>("");
	let userEmail = $state<string>("");
	let isGoogleLoading = $state(false);

	// Redirect if already authenticated
	$effect(() => {
		if ($isAuthenticated && authState !== "signing-in") {
			goto("/dashboard");
		}
	});

	// Check for email link on mount
	onMount(() => {
		// Initialize auth store listener
		authStore.init();

		// Security: Redirect to landing page if not on localhost or dev mode
		const isLocalhost = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
		const allowLogin = isLocalhost || import.meta.env.DEV === true;

		if (!allowLogin) {
			goto("/", { replaceState: true });
			return;
		}

		if (isEmailLink()) {
			const storedEmail = getStoredEmail();

			if (storedEmail) {
				// We have the email from localStorage
				userEmail = storedEmail;
				authState = "signing-in";

				signInWithMagicLink(storedEmail, window.location.href)
					.then(() => {
						clearStoredEmail();
						goto("/dashboard");
					})
					.catch((error: unknown) => {
						const firebaseError = error as { code?: string; message?: string };
						authState = "error";
						if (firebaseError.code === "auth/expired-action-code") {
							errorMessage = "The sign-in link has expired. Please request a new one.";
						} else if (firebaseError.code === "auth/invalid-email") {
							errorMessage = "The email address is invalid.";
						} else {
							errorMessage = firebaseError.message || "Failed to sign in. Please try again.";
						}
					});
			} else {
				// Email missing from localStorage - user switched devices
				authState = "initial";
			}
		}
	});

	async function handleGoogleSignIn() {
		authState = "signing-in";
		isGoogleLoading = true;
		errorMessage = "";

		try {
			await signInWithPopup(auth, googleProvider);
			goto("/dashboard");
		} catch (error: unknown) {
			authState = "error";
			const firebaseError = error as { code?: string; message?: string };

			if (firebaseError.code === "auth/popped-closed-by-user") {
				errorMessage = "";
				authState = "initial";
			} else {
				errorMessage = firebaseError.message || "Failed to sign in with Google. Please try again.";
			}
		} finally {
			isGoogleLoading = false;
		}
	}

	async function handleSendMagicLink() {
		if (!email || !email.includes("@")) {
			errorMessage = "Please enter a valid email address.";
			return;
		}

		authState = "sending";
		errorMessage = "";

		try {
			await sendMagicLink(email);
			authState = "email-sent";
		} catch (error: unknown) {
			authState = "error";
			const firebaseError = error as { code?: string; message?: string };

			if (firebaseError.code === "auth/invalid-email") {
				errorMessage = "Please enter a valid email address.";
			} else if (firebaseError.code === "auth/too-many-requests") {
				errorMessage = "Too many requests. Please try again later.";
			} else {
				errorMessage = firebaseError.message || "Failed to send magic link. Please try again.";
			}
		}
	}

	function handleManualEmailConfirm() {
		if (!userEmail || !userEmail.includes("@")) {
			errorMessage = "Please enter a valid email address.";
			return;
		}

		authState = "signing-in";
		errorMessage = "";

		signInWithMagicLink(userEmail, window.location.href)
			.then(() => {
				clearStoredEmail();
				goto("/dashboard");
			})
			.catch((error: unknown) => {
				const firebaseError = error as { code?: string; message?: string };
				authState = "error";
				if (firebaseError.code === "auth/expired-action-code") {
					errorMessage = "The sign-in link has expired. Please request a new one.";
				} else if (firebaseError.code === "auth/invalid-email") {
					errorMessage = "The email address is invalid.";
				} else {
					errorMessage = firebaseError.message || "Failed to sign in. Please try again.";
				}
			});
	}

	function resetToInitial() {
		authState = "initial";
		errorMessage = "";
		email = "";
		userEmail = "";
	}

	// Derived states for button disabled conditions
	let isSending = $derived(authState === "sending");
	let isSigningIn = $derived(authState === "signing-in");
	let showEmailForm = $derived(authState === "initial" || authState === "sending" || authState === "error");
	let showMissingEmailForm = $derived(authState === "initial" && isEmailLink());
</script>

<svelte:head>
	<title>Sign In | ContractChecker.net</title>
	<meta name="description" content="Sign in to ContractChecker.net" />
</svelte:head>

<div class="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-8">
	<div class="w-full max-w-md">
		<!-- Logo / Brand -->
		<div class="text-center mb-8">
			<div class="inline-flex items-center justify-center gap-2 mb-2">
				<img
					src="https://storage.contractchecker.net/login.webp"
					alt="ContractChecker Logo"
					class="h-16 w-auto"
				/>
				<span class="font-serif text-2xl font-bold text-deep-justice">ContractChecker.net</span>
			</div>
		</div>

		<!-- Main Card with Electric Blue Top Border -->
		<Card class="border-t-4 border-t-electric-blue shadow-lg">
			<CardHeader class="space-y-1 pb-4">
				<CardTitle class="font-serif text-2xl text-center">
					{#if authState === "email-sent"}
						Check Your Email
					{:else if isSigningIn && isEmailLink()}
						Completing Sign In
					{:else}
						Welcome Back
					{/if}
				</CardTitle>
				<CardDescription class="text-center">
					{#if authState === "email-sent"}
						We've sent a magic link to <span class="font-medium text-deep-justice">{email}</span>
					{:else if isSigningIn && isEmailLink()}
						Verifying your identity...
					{:else}
						Sign in to access your contract reviews
					{/if}
				</CardDescription>
			</CardHeader>

			<CardContent class="space-y-4">
				<!-- Error Message -->
				{#if errorMessage}
					<div class="flex items-start gap-2 p-3 rounded-md bg-red-50 border border-red-200 text-red-700 text-sm">
						<AlertCircle class="h-4 w-4 mt-0.5 shrink-0" />
						<span>{errorMessage}</span>
					</div>
				{/if}

				{#if showEmailForm}
					<div class="space-y-4">
						{#if showMissingEmailForm}
							<!-- Edge Case: Email missing from localStorage -->
							<div class="space-y-4">
								<div class="p-3 rounded-md bg-blue-50 border border-blue-200 text-blue-800 text-sm">
									<p class="font-medium">We couldn't find your email address.</p>
									<p class="mt-1">Please enter it below to complete the sign-in.</p>
								</div>
								<div class="space-y-2">
									<label for="confirm-email" class="text-sm font-medium text-deep-justice">
										Your Email
									</label>
									<Input
										id="confirm-email"
										type="email"
										placeholder="you@example.com"
										bind:value={userEmail}
										disabled={isSigningIn}
									/>
								</div>
								<Button
									class="w-full bg-deep-justice hover:bg-slate-800"
									onclick={handleManualEmailConfirm}
									disabled={isSigningIn}
								>
									{#if isSigningIn}
										<Loader2 class="mr-2 h-4 w-4 animate-spin" />
										Signing in...
									{:else}
										Complete Sign In
									{/if}
								</Button>
							</div>
						{:else}
							<!-- Normal Email Sign In -->
							<div class="space-y-2">
								<label for="email" class="text-sm font-medium text-deep-justice">
									Email Address
								</label>
								<Input
									id="email"
									type="email"
									placeholder="you@example.com"
									bind:value={email}
									disabled={isSending}
									onkeydown={(e) => e.key === "Enter" && handleSendMagicLink()}
								/>
							</div>
							<Button
								class="w-full bg-deep-justice hover:bg-slate-800"
								onclick={handleSendMagicLink}
								disabled={isSending}
							>
								{#if isSending}
									<Loader2 class="mr-2 h-4 w-4 animate-spin" />
									Sending Link...
								{:else}
									<Mail class="mr-2 h-4 w-4" />
									Send Magic Link
								{/if}
							</Button>
						{/if}

						<!-- Divider -->
						<div class="relative">
							<div class="absolute inset-0 flex items-center">
								<span class="w-full border-t"></span>
							</div>
							<div class="relative flex justify-center text-xs uppercase">
								<span class="bg-card px-2 text-muted-foreground">Or continue with</span>
							</div>
						</div>

						<!-- Google Sign In -->
						<Button
							variant="outline"
							class="w-full"
							onclick={handleGoogleSignIn}
							disabled={isSending || isGoogleLoading}
						>
							{#if isGoogleLoading}
								<Loader2 class="mr-2 h-4 w-4 animate-spin" />
								Signing in...
							{:else}
								<svg class="mr-2 h-4 w-4" viewBox="0 0 24 24">
									<path
										d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
										fill="#4285F4"
									/>
									<path
										d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
										fill="#34A853"
									/>
									<path
										d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
										fill="#FBBC05"
									/>
									<path
										d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
										fill="#EA4335"
									/>
								</svg>
								Continue with Google
							{/if}
						</Button>
					</div>
				{/if}

				<!-- Email Sent State -->
				{#if authState === "email-sent"}
					<div class="space-y-4">
						<div class="flex flex-col items-center gap-3 py-4">
							<div class="rounded-full bg-green-100 p-3">
								<CheckCircle2 class="h-8 w-8 text-green-600" />
							</div>
							<p class="text-sm text-center text-muted-foreground">
								Click the link in the email we sent to <span class="font-medium text-deep-justice">{email}</span>
							</p>
							<p class="text-xs text-center text-muted-foreground">
								The link will expire in 24 hours. If you don't see the email, check your spam folder.
							</p>
						</div>
						<Button variant="outline" class="w-full" onclick={resetToInitial}>
							Use a different email
						</Button>
					</div>
				{/if}

				<!-- Signing In State (for email link) -->
				{#if isSigningIn && isEmailLink()}
					<div class="flex flex-col items-center gap-3 py-6">
						<Loader2 class="h-8 w-8 animate-spin text-electric-blue" />
						<p class="text-sm text-muted-foreground">Completing your sign in...</p>
					</div>
				{/if}
			</CardContent>

			<CardFooter class="justify-center pb-6">
				<p class="text-xs text-center text-muted-foreground">
					By signing in, you agree to our
					<a href="/terms" class="underline hover:text-deep-justice">Terms of Service</a>
					and
					<a href="/privacy" class="underline hover:text-deep-justice">Privacy Policy</a>
				</p>
			</CardFooter>
		</Card>

		<!-- Footer -->
		<div class="mt-6 text-center">
			<p class="text-xs text-muted-foreground">
				Need help?
				<a href="mailto:support@contractchecker.net" class="underline hover:text-electric-blue">
					Contact Support
				</a>
			</p>
		</div>
	</div>
</div>
