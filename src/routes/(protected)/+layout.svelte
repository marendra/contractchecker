<script lang="ts">
	import { goto } from "$app/navigation";
	import { onMount } from "svelte";
	import { isAuthenticated, currentUser, authStore } from "$lib/stores/auth";
	import { Button } from "$lib/components/ui/button";
	import { LogOut, User, Shield } from "lucide-svelte";
	import { cn } from "$lib/utils";

	let { children } = $props();
	let isOpen = $state(false);

	// Protect this layout - redirect if not authenticated
	onMount(() => {
		const unsubscribe = isAuthenticated.subscribe((isAuth) => {
			if (!isAuth && typeof window !== "undefined") {
				goto("/login");
			}
		});

		return unsubscribe;
	});

	const navItems = [
		{ href: "/dashboard", label: "Dashboard" },
		{ href: "/contracts", label: "My Contracts" },
		{ href: "/analysis", label: "Analysis" },
		{ href: "/settings", label: "Settings" }
	];
</script>

{#if $isAuthenticated}
	<div class="min-h-screen bg-slate-50">
		<!-- Navigation Header -->
		<header class="bg-white border-b border-slate-200 sticky top-0 z-50">
			<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div class="flex justify-between items-center h-16">
					<!-- Logo -->
					<a href="/dashboard" class="flex items-center gap-2">
						<img
							src="https://storage.contractchecker.net/logo-small.webp"
							alt="ContractChecker Logo"
							class="h-8 w-auto"
						/>
					</a>

					<!-- Desktop Nav -->
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

					<!-- User Menu -->
					<div class="flex items-center gap-4">
						<div class="hidden sm:flex items-center gap-2 text-sm">
							<User class="h-4 w-4 text-slate-500" />
							<span class="text-slate-600">
								{$currentUser?.displayName || $currentUser?.email?.split("@")[0]}
							</span>
						</div>
						<Button variant="ghost" size="sm" onclick={() => authStore.signOut()}>
							<LogOut class="h-4 w-4" />
							<span class="hidden sm:inline ml-2">Sign Out</span>
						</Button>
					</div>
				</div>
			</div>
		</header>

		<!-- Main Content -->
		<main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
			{@render children()}
		</main>
	</div>
{:else}
	<!-- Loading state handled by parent -->
	<div class="hidden"></div>
{/if}

<style>
	.text-electric-blue {
		color: #2563eb;
	}

	.text-deep-justice {
		color: #0f172a;
	}
</style>
