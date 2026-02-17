<script lang="ts">
    import { onMount } from "svelte";
    import { auth, functions } from "$lib/firebaseclient";
    import { httpsCallable } from "firebase/functions";
    import { authStore, isAuthenticated, isInitialized } from "$lib/stores/auth";

    // UI Components
    import { Button } from "$lib/components/ui/button";
    import { Input } from "$lib/components/ui/input";
    import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "$lib/components/ui/card";
    import { ShieldCheck, AlertCircle, Loader2, ArrowLeft } from "lucide-svelte";

    // State
    let otp = $state("");
    let isLoading = $state(false);
    let errorMessage = $state("");
    let successMessage = $state("");
    let isVerifying = $state(false);
    let cleanup: (() => void)[] = [];

    onMount(() => {
        // Initialize auth store
        authStore.init();

        console.log("📱 [VERIFY] Page loaded");

        return () => {
            cleanup.forEach(fn => fn());
        };
    });

    // 1. The Core Verification Logic
    async function handleVerify() {
        // Prevent double submission
        if (isLoading || isVerifying) return;

        if (otp.length < 6) {
            errorMessage = "Please enter the 6-digit code.";
            return;
        }

        isLoading = true;
        isVerifying = true;
        errorMessage = "";
        successMessage = "";

        // TEMP: Hardcoded OTP for testing (remove later!)
        const TEST_MODE = false;
        if (TEST_MODE) {
            console.log("📱 [VERIFY] TEST MODE: Accepting OTP 123456", { otp, otpType: typeof otp });
            if (otp !== "123456") {
                errorMessage = "TEST MODE: Use code 123456";
                isLoading = false;
                isVerifying = false;
                return;
            }
            // Simulate success
            const testDeviceId = crypto.randomUUID();
            console.log("📱 [VERIFY] TEST MODE: Saving device_id:", testDeviceId);
            localStorage.setItem("device_id", testDeviceId);
            successMessage = "TEST MODE: Device verified!";

            const idToken = await auth.currentUser?.getIdToken(true);
            await fetch("/api/session", {
                method: "POST",
                body: JSON.stringify({ idToken }),
                headers: { "Content-Type": "application/json" }
            });

            console.log("📱 [VERIFY] TEST MODE: Redirecting to dashboard...");
            setTimeout(() => {
                window.location.href = "/dashboard";
            }, 1000);
            isLoading = false;
            return;
        }
        // END TEMP

        try {
            console.log("📱 [VERIFY] Calling verifyDevice Cloud Function...", { otp, otpType: typeof otp });
            const verifyDevice = httpsCallable(functions, "verifyDevice");
            const result = await verifyDevice({
                otp: String(otp), // Ensure OTP is sent as string
                userAgent: navigator.userAgent
            });

            const data = result.data as { status: string, newDeviceId: string };
            console.log("📱 [VERIFY] Cloud Function response:", data.status);

            if (data.status === "success") {
                // Save the new Device ID
                console.log("📱 [VERIFY] Saving device_id:", data.newDeviceId);
                localStorage.setItem("device_id", data.newDeviceId);

                successMessage = "Device verified! Logging you in...";

                // Set the Session Cookie
                const idToken = await auth.currentUser?.getIdToken(true);
                console.log("📱 [VERIFY] Setting session cookie...");

                await fetch("/api/session", {
                    method: "POST",
                    body: JSON.stringify({ idToken }),
                    headers: { "Content-Type": "application/json" }
                });

                console.log("📱 [VERIFY] Redirecting to dashboard...");
                setTimeout(() => {
                    window.location.href = "/dashboard";
                }, 1000);
            } else if (data.status === "invalid") {
                console.log("📱 [VERIFY] Invalid OTP");
                errorMessage = "Invalid code. Please try again.";
            } else if (data.status === "expired") {
                console.log("📱 [VERIFY] OTP Expired");
                errorMessage = "Code has expired. Please request a new one.";
            }
        } catch (error: any) {
            console.error("Verification failed:", error);
            if (error.message.includes("invalid-argument")) {
                errorMessage = "Invalid or expired code. Please try again.";
            } else {
                errorMessage = "Verification failed. Please try again.";
            }
        } finally {
            isLoading = false;
            isVerifying = false;
        }
    }

    // 2. "Resend Code" Logic
    let lastResendTime = 0;

    async function handleResend() {
        // Prevent double submission and rate limiting (30 seconds)
        const now = Date.now();
        if (isLoading || now - lastResendTime < 30000) {
            console.log("📱 [VERIFY] Resend blocked - rate limit or loading");
            return;
        }

        lastResendTime = now;
        isLoading = true;
        errorMessage = "";
        try {
            console.log("📱 [VERIFY] Sending new OTP...");
            const checkDevice = httpsCallable(functions, "checkDevice");
            const result = await checkDevice({ deviceId: null });
            const data = result.data as { status: string };
            console.log("📱 [VERIFY] Cloud Function response:", data.status);
            successMessage = "New code sent to your email!";
        } catch (e) {
            console.error("📱 [VERIFY] Failed to send OTP:", e);
            errorMessage = "Failed to resend code.";
        } finally {
            isLoading = false;
        }
    }
</script>

<svelte:head>
    <title>Verify Device | ContractChecker.net</title>
</svelte:head>

<div class="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-8">
    <div class="w-full max-w-md">

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

       <Card class="border-t-4 border-t-electric-blue shadow-lg">
          <CardHeader class="space-y-1 pb-4">
             <div class="flex justify-center mb-4">
                <div class="bg-blue-50 p-3 rounded-full">
                    <ShieldCheck class="h-8 w-8 text-electric-blue" />
                </div>
             </div>
             <CardTitle class="font-serif text-2xl text-center">
                New Device Detected
             </CardTitle>
             <CardDescription class="text-center">
                To protect your account, please enter the code we just sent to your email.
             </CardDescription>
          </CardHeader>

          <CardContent class="space-y-4">
             {#if errorMessage}
                <div class="flex items-start gap-2 p-3 rounded-md bg-red-50 border border-red-200 text-red-700 text-sm">
                   <AlertCircle class="h-4 w-4 mt-0.5 shrink-0" />
                   <span>{errorMessage}</span>
                </div>
             {/if}

             {#if successMessage}
                <div class="flex items-start gap-2 p-3 rounded-md bg-green-50 border border-green-200 text-green-700 text-sm">
                   <ShieldCheck class="h-4 w-4 mt-0.5 shrink-0" />
                   <span>{successMessage}</span>
                </div>
             {/if}

             <div class="space-y-4">
                <div class="space-y-2">
                   <label for="otp" class="text-sm font-medium text-deep-justice">
                      Verification Code
                   </label>
                   <Input
                      id="otp"
                      type="text"
                      inputmode="numeric"
                      placeholder="123456"
                      class="text-center text-lg tracking-[0.5em] font-mono"
                      bind:value={otp}
                      disabled={isLoading || successMessage.includes("verified")}
                      onkeydown={(e) => e.key === "Enter" && handleVerify()}
                   />
                </div>

                <Button
                   class="w-full bg-deep-justice hover:bg-slate-800"
                   onclick={handleVerify}
                   disabled={isLoading || successMessage.includes("verified")}
                >
                   {#if isLoading}
                      <Loader2 class="mr-2 h-4 w-4 animate-spin" />
                      Verifying...
                   {:else}
                      Verify Device
                   {/if}
                </Button>
             </div>
          </CardContent>

          <CardFooter class="flex flex-col gap-4 justify-center pb-6 border-t pt-6">
             <div class="text-center text-sm text-muted-foreground">
                Didn't receive the code?
                <button
                    onclick={handleResend}
                    class="text-electric-blue hover:underline font-medium ml-1 disabled:opacity-50"
                    disabled={isLoading}
                >
                    Resend Email
                </button>
             </div>

             <a
                href="/login"
                class="flex items-center text-xs text-muted-foreground hover:text-deep-justice transition-colors"
             >
                <ArrowLeft class="h-3 w-3 mr-1" />
                Back to Sign In
             </a>
          </CardFooter>
       </Card>

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

<style>
    .text-electric-blue {
       color: #2563eb;
    }
    .text-deep-justice {
       color: #0f172a;
    }
</style>
