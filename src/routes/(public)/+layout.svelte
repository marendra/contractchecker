<script lang="ts">
	import { goto } from "$app/navigation";
	import { isAuthenticated } from "$lib/stores/auth";
	import { Shield } from "lucide-svelte";
	import { onMount } from "svelte";

	let { children } = $props();

	// Redirect to dashboard if already authenticated
	onMount(() => {
		const unsubscribe = isAuthenticated.subscribe((isAuth) => {
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
	<!-- Loading/redirect state -->
	<div class="min-h-screen flex items-center justify-center bg-slate-50">
		<div class="animate-pulse flex items-center gap-2">
			<Shield class="h-6 w-6 text-electric-blue" />
			<span class="text-slate-600">Redirecting...</span>
		</div>
	</div>
{/if}

<style>
	.text-electric-blue {
		color: #2563eb;
	}
</style>
