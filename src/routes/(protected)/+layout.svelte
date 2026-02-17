<script lang="ts">
    import { onMount } from "svelte";
    import { isAuthenticated, currentUser, authStore, isInitialized } from "$lib/stores/auth";
    import { Button } from "$lib/components/ui/button";
    import { LogOut, User, Loader2 } from "lucide-svelte";

    let { children } = $props();

    // Start in "Checking" mode
    let isChecking = $state(true);
    let hasHandled = $state(false);

    onMount(() => {
        // Initialize auth store
        authStore.init();

        // Combined subscription for auth state and initialization
        const unsubscribe = isInitialized.subscribe((initialized) => {
            if (!initialized) {
                return; // Wait for auth to init
            }

            // Small delay to ensure state is stable
            const timer = setTimeout(() => {
                if (hasHandled) return;
                hasHandled = true;

                const isAuth = $isAuthenticated;
                console.log("🔍 [DASHBOARD] Auth ready, isAuthenticated:", isAuth);

                if (!isAuth) {
                    // Not logged in - go to login
                    console.log("⛔ [DASHBOARD] Not authenticated, going to /login");
                    window.location.href = "/login";
                    return;
                }

                // Check device_id
                const deviceId = localStorage.getItem("device_id");
                if (!deviceId) {
                    console.log("⛔ [DASHBOARD] No device_id, going to /verify");
                    window.location.href = "/verify";
                    return;
                }

                // All good!
                console.log("✅ [DASHBOARD] Access granted");
                isChecking = false;
            }, 100);

            return () => clearTimeout(timer);
        });

        return () => {
            unsubscribe();
        };
    });

    const navItems = [
       { href: "/dashboard", label: "Dashboard" },
       { href: "/contracts", label: "My Contracts" },
       { href: "/analysis", label: "Analysis" },
       { href: "/settings", label: "Settings" }
    ];

    async function handleSignOut() {
        console.log("🔓 [DASHBOARD] Signing out...");

        // NOTE: We do NOT remove device_id from localStorage
        // This keeps trusted devices trusted across sessions
        // The device_id is stored in Firestore as a trusted device

        // Sign out from Firebase
        await authStore.signOut();

        // Clear session cookie
        document.cookie = "session_uid=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

        // Redirect to login
        window.location.href = "/login";
    }
</script>

{#if isChecking}
    <div class="h-screen w-full flex items-center justify-center bg-slate-50">
        <div class="flex flex-col items-center gap-4">
            <Loader2 class="h-8 w-8 animate-spin text-electric-blue" />
            <p class="text-slate-500 text-sm">Verifying security...</p>
        </div>
    </div>
{:else}
    <div class="min-h-screen bg-slate-50">
       <header class="bg-white border-b border-slate-200 sticky top-0 z-50">
          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
             <div class="flex justify-between items-center h-16">
                <a href="/dashboard" class="flex items-center gap-2">
                   <img
                      src="https://storage.contractchecker.net/logo-small.webp"
                      alt="ContractChecker Logo"
                      class="h-8 w-auto"
                   />
                </a>

                <nav class="hidden md:flex items-center gap-6">
                   {#each navItems as item}
                      <a
                         href={item.href}
                         class="text-sm font-medium text-slate-600 hover:text-deep-justice transition-colors"
                      >
                         {item.label}
                      </a>
                   {/each}
                </nav>

                <div class="flex items-center gap-4">
                   <div class="hidden sm:flex items-center gap-2 text-sm">
                      <User class="h-4 w-4 text-slate-500" />
                      <span class="text-slate-600">
                         {$currentUser?.displayName || $currentUser?.email?.split("@")[0]}
                      </span>
                   </div>
                   <Button variant="ghost" size="sm" onclick={handleSignOut}>
                      <LogOut class="h-4 w-4" />
                      <span class="hidden sm:inline ml-2">Sign Out</span>
                   </Button>
                </div>
             </div>
          </div>
       </header>

       <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {@render children()}
       </main>
    </div>
{/if}

<style>
    .text-electric-blue {
       color: #2563eb;
    }
    .text-deep-justice {
       color: #0f172a;
    }
</style>
