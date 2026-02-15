<script lang="ts" module>
	import { cn } from "$lib/utils.js";
	import type { LabelAttributes } from "svelte/elements";
	import type { ComponentProps } from "svelte";

	export type LabelProps = ComponentProps<"label">;
</script>

<script lang="ts">
	let { class: className, children, ...restProps }: LabelProps = $props();
</script>

<label
	class={cn(
		"text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
		className
	)}
	{...restProps}
>
	{@render children?.()}
</label>
