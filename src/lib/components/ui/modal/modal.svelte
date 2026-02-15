<script lang="ts">
	import { X } from "lucide-svelte";
	import { onMount, onDestroy } from "svelte";

	let { open = $bindable(false), title = "", children } = $props();

	function close() {
		open = false;
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === "Escape") {
			close();
		}
	}

	function handleBackdropClick(e: MouseEvent) {
		if (e.target === e.currentTarget) {
			close();
		}
	}

	onMount(() => {
		document.addEventListener("keydown", handleKeydown);
	});

	onDestroy(() => {
		document.removeEventListener("keydown", handleKeydown);
	});
</script>

{#if open}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center"
		role="dialog"
		aria-modal="true"
	>
		<!-- Backdrop -->
		<div
			class="absolute inset-0 bg-black/50"
			onclick={handleBackdropClick}
			onkeydown={handleKeydown}
			role="button"
			tabindex="-1"
		></div>

		<!-- Modal Content -->
		<div class="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
			<button
				class="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
				onclick={close}
			>
				<X class="h-5 w-5" />
			</button>

			{#if title}
				<h2 class="font-serif text-xl font-bold text-deep-justice mb-4">{title}</h2>
			{/if}

			{@render children?.()}
		</div>
	</div>
{/if}

<style>
	.text-deep-justice {
		color: #0f172a;
	}
</style>
