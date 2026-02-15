<script lang="ts">
	import { Button } from "$lib/components/ui/button";
	import { CheckCircle2, ArrowLeft } from "lucide-svelte";
</script>

<svelte:head>
	<title>You're on the list! | ContractChecker.net</title>
	<meta name="description" content="Thanks for joining the ContractChecker.net waitlist" />
</svelte:head>

<div class="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-8">
	<div class="w-full max-w-md text-center">
		<!-- Success Icon -->
		<div class="mx-auto w-16 h-16 rounded-full bg-verdict-green flex items-center justify-center mb-6">
			<CheckCircle2 class="h-10 w-10 text-white" />
		</div>

		<h1 class="font-serif text-3xl font-bold text-deep-justice mb-4">
			You're on the list!
		</h1>

		<p class="text-slate-600 mb-8">
			Thanks for joining our waitlist. We'll notify you as soon as ContractChecker.net is ready for you.
		</p>

		<div class="p-4 bg-white rounded-lg border border-slate-200 mb-6">
			<p class="text-sm text-slate-500 mb-2">What happens next?</p>
			<ul class="text-sm text-slate-600 text-left space-y-2">
				<li class="flex items-start gap-2">
					<span class="text-verdict-green mt-0.5">✓</span>
					<span>We'll send an invite to your email</span>
				</li>
				<li class="flex items-start gap-2">
					<span class="text-verdict-green mt-0.5">✓</span>
					<span>You'll get <strong>1 free scan</strong> when you sign up</span>
				</li>
				<li class="flex items-start gap-2">
					<span class="text-verdict-green mt-0.5">✓</span>
					<span>Verify your phone for <strong>4 more free scans</strong></span>
				</li>
			</ul>
		</div>

		<Button variant="outline" href="/">
			<ArrowLeft class="mr-2 h-4 w-4" />
			Back to Home
		</Button>
	</div>
</div>

<style>
	.text-deep-justice {
		color: #0f172a;
	}

	.text-verdict-green {
		color: #059669;
	}

	.bg-verdict-green {
		background-color: #059669;
	}
</style>
