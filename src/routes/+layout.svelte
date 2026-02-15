<script lang="ts">
	import { onMount } from "svelte";
	import { authStore, isLoading } from "$lib/stores/auth";
	import "../app.css";
	import { Loader2 } from "lucide-svelte";

	let { children } = $props();

	// Initialize auth store on mount
	onMount(() => {
		authStore.init();
	});
</script>

{#if $isLoading}
	<div class="min-h-screen flex items-center justify-center bg-slate-50">
		<div class="text-center">
			<Loader2 class="h-8 w-8 animate-spin text-electric-blue mx-auto mb-4" />
			<p class="text-muted-foreground">Loading...</p>
		</div>
	</div>
{:else}
	{@render children()}
{/if}
