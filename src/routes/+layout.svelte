<script lang="ts">
	import "../app.css";
	import { onMount } from "svelte";
	import { authStore } from "$lib/stores/auth";

	let { children } = $props();

	// Initialize auth store on mount (only needed for auth-protected pages)
	onMount(() => {
		authStore.init();
	});
</script>

{@render children()}
