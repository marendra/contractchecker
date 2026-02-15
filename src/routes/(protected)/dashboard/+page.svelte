<script lang="ts">
	import { currentUser, authStore } from "$lib/stores/auth";
	import { Button } from "$lib/components/ui/button";
	import { Shield, FileText, Scale, Settings } from "lucide-svelte";
</script>

<svelte:head>
	<title>Dashboard | ContractChecker.net</title>
</svelte:head>

<div class="space-y-8">
	<!-- Welcome Header -->
	<div class="bg-white rounded-lg border border-slate-200 p-6">
		<h1 class="text-3xl font-serif font-bold text-deep-justice mb-2">
			Welcome back, {$currentUser?.displayName || $currentUser?.email?.split("@")[0] || "User"}!
		</h1>
		<p class="text-slate-600">
			Your contracts are ready for analysis. Let's review your legal documents.
		</p>
	</div>

	<!-- Quick Stats -->
	<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
		<div class="bg-white rounded-lg border border-slate-200 p-6">
			<div class="flex items-center gap-4">
				<div class="p-3 rounded-full bg-blue-100">
					<FileText class="h-6 w-6 text-electric-blue" />
				</div>
				<div>
					<p class="text-2xl font-bold text-deep-justice">12</p>
					<p class="text-sm text-slate-600">Contracts Analyzed</p>
				</div>
			</div>
		</div>

		<div class="bg-white rounded-lg border border-slate-200 p-6">
			<div class="flex items-center gap-4">
				<div class="p-3 rounded-full bg-green-100">
					<Scale class="h-6 w-6 text-verdict-green" />
				</div>
				<div>
					<p class="text-2xl font-bold text-deep-justice">8</p>
					<p class="text-sm text-slate-600">Low Risk</p>
				</div>
			</div>
		</div>

		<div class="bg-white rounded-lg border border-slate-200 p-6">
			<div class="flex items-center gap-4">
				<div class="p-3 rounded-full bg-amber-100">
					<Shield class="h-6 w-6 text-caution-gold" />
				</div>
				<div>
					<p class="text-2xl font-bold text-deep-justice">4</p>
					<p class="text-sm text-slate-600">Needs Attention</p>
				</div>
			</div>
		</div>
	</div>

	<!-- Quick Actions -->
	<div class="bg-white rounded-lg border border-slate-200 p-6">
		<h2 class="text-xl font-serif font-bold text-deep-justice mb-4">Quick Actions</h2>
		<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
			<Button class="bg-deep-justice hover:bg-slate-800">
				<FileText class="mr-2 h-4 w-4" />
				Upload New Contract
			</Button>
			<Button variant="outline">
				<Settings class="mr-2 h-4 w-4" />
				Account Settings
			</Button>
		</div>
	</div>
</div>

<style>
	.text-electric-blue {
		color: #2563eb;
	}

	.text-deep-justice {
		color: #0f172a;
	}

	.text-verdict-green {
		color: #059669;
	}

	.text-caution-gold {
		color: #d97706;
	}

	.bg-electric-blue {
		background-color: #2563eb;
	}

	.bg-deep-justice {
		background-color: #0f172a;
	}

	.bg-verdict-green {
		background-color: #059669;
	}

	.bg-caution-gold {
		background-color: #d97706;
	}
</style>
