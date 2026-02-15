<script lang="ts">
	import { goto } from "$app/navigation";
	import { isAuthenticated, isAnonymousUser } from "$lib/stores/auth";
	import { Shield } from "lucide-svelte";
	import { onMount } from "svelte";

	let { children } = $props();

	// Redirect to dashboard if authenticated (but not anonymous)
	onMount(() => {
		const unsubscribe = isAuthenticated.subscribe((isAuth) => {
			// Only redirect if truly authenticated (not anonymous)
			if (isAuth && typeof window !== "undefined") {
				goto("/dashboard");
			}
		});

		return unsubscribe;
	});
</script>

{#if !$isAuthenticated}
	{@render children()}
{:else}
	<!-- Anonymous user or loading state - show children -->
	{@render children()}
{/if}

<style>
	.text-electric-blue {
		color: #2563eb;
	}
</style>
