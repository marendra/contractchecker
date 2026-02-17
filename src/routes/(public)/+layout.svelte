<script lang="ts">
	import { onMount } from "svelte";
	import { authStore } from "$lib/stores/auth";

	let { children } = $props();

	onMount(() => {
		// Initialize auth store
		authStore.init();
	});
</script>

{@render children()}
