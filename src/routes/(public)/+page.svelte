<script lang="ts">
	import { Button } from "$lib/components/ui/button";
	import {
		Card,
		CardContent,
		CardDescription,
		CardFooter,
		CardHeader,
		CardTitle
	} from "$lib/components/ui/card";
	import { Badge } from "$lib/components/ui/badge";
	import * as Accordion from "$lib/components/ui/accordion";
	import {
		Shield,
		Upload,
		Scan,
		Zap,
		Check,
		X,
		Clock,
		Coffee,
		Briefcase,
		ArrowRight,
		FileText
	} from "lucide-svelte";

	const features = [
		{
			icon: Upload,
			title: "Upload PDF",
			description: "Drop your contract file. Supports PDF, DOCX, and images."
		},
		{
			icon: Scan,
			title: "AI Analysis",
			description: "Our AI scans for red flags, hidden fees, and risky clauses."
		},
		{
			icon: Zap,
			title: "Act with Confidence",
			description: "Know exactly what you're signing before you commit."
		}
	];

	const lawyerComparison = {
		oldWay: {
			title: "Traditional Lawyer",
			icon: Briefcase,
			price: "$500 / hour",
			speed: "3-5 Business Days",
			mood: "gray"
		},
		newWay: {
			title: "ContractChecker.net",
			icon: Shield,
			price: "$5 (One Coffee)",
			speed: "30 Seconds",
			mood: "blue"
		}
	};

	const riskLevels = [
		{ level: "Critical", color: "bg-gavel-red", text: "Immediate attention required" },
		{ level: "Warning", color: "bg-caution-gold", text: "Proceed with caution" },
		{ level: "Safe", color: "bg-verdict-green", text: "No major concerns" }
	];

	const faqs = [
		{
			question: "Is this a replacement for a real lawyer?",
			answer: "No. ContractChecker is an AI-powered 'First Pass' tool. We catch 80-90% of common risks (hidden fees, auto-renewals, bad indemnity clauses) instantly for $5. For high-stakes multi-million dollar deals, please use our report to brief a human lawyer."
		},
		{
			question: "How accurate is the AI?",
			answer: "Extremely capable at spotting standard legal patterns. It uses the latest LLM technology to read contracts word-for-word. However, it does not provide 'legal advice'—it provides 'risk analysis'."
		},
		{
			question: "Is my contract kept private?",
			answer: "Yes. Your privacy is paramount. We do not sell your data, and we do not use your specific contracts to train our public models. Your documents are encrypted during the scan."
		},
		{
			question: "What file types do you support?",
			answer: "Currently, we support PDF documents. Simply upload your contract file, and our system will read the text layer directly."
		},
		{
			question: "How does the pricing work?",
			answer: "Simple. Pay-as-you-go. One contract scan costs roughly the price of a coffee ($5 or Rp 50.000). No monthly subscriptions required unless you are a power user."
		}
	];
</script>

<svelte:head>
	<title>ContractChecker.net | The $5 AI Legal Assistant</title>
	<meta name="description" content="Don't sign blindly. Get instant AI contract analysis for $5. We spot hidden fees, risky clauses, and red flags in seconds." />
	<link rel="canonical" href="https://www.contractchecker.net/" />

	<meta property="og:type" content="website" />
	<meta property="og:url" content="https://www.contractchecker.net/" />
	<meta property="og:title" content="ContractChecker.net | The $5 Lawyer" />
	<meta property="og:description" content="Upload your contract. Find the red flags. Save $500 on legal fees." />
	<meta property="og:image" content="https://storage.contractchecker.net/og-image.jpg" />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content="ContractChecker.net | The $5 Lawyer" />
	<meta name="twitter:description" content="Instant AI risk analysis for your contracts." />
	<meta name="twitter:image" content="https://storage.contractchecker.net/og-image.jpg" />

	{@html `
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": "ContractChecker.net",
      "applicationCategory": "BusinessApplication",
      "operatingSystem": "Web",
      "offers": {
        "@type": "Offer",
        "price": "5.00",
        "priceCurrency": "USD"
      },
      "description": "AI-powered contract analysis tool that identifies legal risks, hidden fees, and liabilities in seconds."
    }
    </script>
    `}
</svelte:head>

<div class="min-h-screen bg-slate-50">
	<!-- Navigation -->
	<nav class="sticky top-0 z-50 bg-white/80 backdrop-blur-sm border-b border-slate-200">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
			<div class="flex justify-between items-center h-16">
				<a href="/" class="flex items-center gap-2">
					<img
						src="https://storage.contractchecker.net/logo-small.webp"
						alt="ContractChecker Logo"
						class="h-8 w-auto"
					/>
				</a>
				<div class="flex items-center gap-6">
					<a href="#faq" class="text-sm font-medium text-slate-600 hover:text-electric-blue transition-colors">
						FAQ
					</a>
					<Button variant="ghost" href="/login">Sign In</Button>
					<Button class="bg-electric-blue hover:bg-blue-700" href="/login">
						Get Started
					</Button>
				</div>
			</div>
		</div>
	</nav>

	<!-- Hero Section -->
	<section class="py-20 px-4">
		<div class="max-w-4xl mx-auto text-center">
			<!-- Logo Display -->
			<div class="mb-8">
				<img
					src="https://storage.contractchecker.net/logo-small.webp"
					alt="ContractChecker Logo"
					class="mx-auto w-48 h-48 object-contain drop-shadow-lg"
				/>
			</div>

			<h1 class="font-serif text-4xl md:text-6xl font-bold text-deep-justice mb-6 leading-tight">
				Professional Legal Review.<br />
				<span class="text-electric-blue">Pocket Change Price.</span>
			</h1>

			<p class="text-xl text-slate-600 mb-8 max-w-2xl mx-auto leading-relaxed">
				Upload any contract. Our AI finds the red flags, hidden fees, and risky clauses in
				seconds. Don't sign blindly.
			</p>

			<Button
				class="bg-electric-blue hover:bg-blue-700 text-lg px-8 py-6 h-auto"
				href="/login"
			>
				Check My Contract Now
				<ArrowRight class="ml-2 h-5 w-5" />
			</Button>

			<p class="mt-4 text-sm text-slate-500">
				No credit card required. Instant results.
			</p>
		</div>
	</section>

	<!-- Coffee vs Lawyer Comparison -->
	<section class="py-16 px-4 bg-white">
		<div class="max-w-5xl mx-auto">
			<h2 class="font-serif text-3xl font-bold text-center text-deep-justice mb-12">
				The Personal Lawyer for the Price of a Coffee
			</h2>

			<div class="grid md:grid-cols-2 gap-8">
				<!-- Old Way -->
				<Card class="border-slate-200 bg-slate-50">
					<CardHeader class="text-center pb-2">
						<div
							class="mx-auto mb-4 w-16 h-16 rounded-full bg-slate-200 flex items-center justify-center"
						>
							<Briefcase class="h-8 w-8 text-slate-400" />
						</div>
						<CardTitle class="font-serif text-xl text-slate-600">
							{lawyerComparison.oldWay.title}
						</CardTitle>
					</CardHeader>
					<CardContent class="space-y-4">
						<div class="flex items-center justify-between py-2 border-b border-slate-200">
							<span class="text-slate-500">Price</span>
							<span class="font-semibold text-slate-600">{lawyerComparison.oldWay.price}</span>
						</div>
						<div class="flex items-center justify-between py-2 border-b border-slate-200">
							<span class="text-slate-500">Wait Time</span>
							<span class="font-semibold text-slate-600">{lawyerComparison.oldWay.speed}</span>
						</div>
						<div class="flex flex-col gap-2 pt-2">
							<div class="flex items-center gap-2 text-slate-400">
								<X class="h-4 w-4" />
								<span class="text-sm">Upfront pricing</span>
							</div>
							<div class="flex items-center gap-2 text-slate-400">
								<X class="h-4 w-4" />
								<span class="text-sm">Instant analysis</span>
							</div>
							<div class="flex items-center gap-2 text-slate-400">
								<X class="h-4 w-4" />
								<span class="text-sm">Available 24/7</span>
							</div>
						</div>
					</CardContent>
				</Card>

				<!-- New Way -->
				<Card class="border-2 border-electric-blue shadow-lg">
					<CardHeader class="text-center pb-2 bg-electric-blue/5">
						<div
							class="mx-auto mb-4 w-16 h-16 rounded-full bg-electric-blue flex items-center justify-center"
						>
							<Shield class="h-8 w-8 text-white" />
						</div>
						<CardTitle class="font-serif text-xl text-deep-justice">
							{lawyerComparison.newWay.title}
						</CardTitle>
					</CardHeader>
					<CardContent class="space-y-4">
						<div class="flex items-center justify-between py-2 border-b border-blue-100">
							<span class="text-slate-500">Price</span>
							<span class="font-bold text-electric-blue text-lg">{lawyerComparison.newWay.price}</span>
						</div>
						<div class="flex items-center justify-between py-2 border-b border-blue-100">
							<span class="text-slate-500">Results In</span>
							<span class="font-bold text-electric-blue text-lg">{lawyerComparison.newWay.speed}</span>
						</div>
						<div class="flex flex-col gap-2 pt-2">
							<div class="flex items-center gap-2 text-verdict-green">
								<Check class="h-4 w-4" />
								<span class="text-sm font-medium">Fixed, transparent pricing</span>
							</div>
							<div class="flex items-center gap-2 text-verdict-green">
								<Check class="h-4 w-4" />
								<span class="text-sm font-medium">Instant AI analysis</span>
							</div>
							<div class="flex items-center gap-2 text-verdict-green">
								<Check class="h-4 w-4" />
								<span class="text-sm font-medium">Available 24/7</span>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	</section>

	<!-- How It Works -->
	<section class="py-16 px-4 bg-slate-50">
		<div class="max-w-5xl mx-auto">
			<h2 class="font-serif text-3xl font-bold text-center text-deep-justice mb-4">
				How It Works
			</h2>
			<p class="text-center text-slate-600 mb-12">
				Three simple steps to contract clarity
			</p>

			<div class="grid md:grid-cols-3 gap-8">
				{#each features as feature, i}
					<div class="relative text-center">
						<!-- Step Number -->
						<div
							class="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-electric-blue text-white font-bold flex items-center justify-center text-sm z-10"
						>
							{i + 1}
						</div>

						<Card class="pt-8 pb-6 h-full">
							<div
								class="mx-auto mb-4 w-14 h-14 rounded-full bg-electric-blue/10 flex items-center justify-center"
							>
								<feature.icon class="h-7 w-7 text-electric-blue" />
							</div>
							<CardHeader class="pb-2">
								<CardTitle class="font-serif text-lg text-deep-justice">
									{feature.title}
								</CardTitle>
							</CardHeader>
							<CardContent>
								<p class="text-slate-600 text-sm">{feature.description}</p>
							</CardContent>
						</Card>

						<!-- Arrow for mobile (between steps) -->
						{#if i < features.length - 1}
							<div class="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
								<ArrowRight class="h-6 w-6 text-electric-blue" />
							</div>
						{/if}
					</div>
				{/each}
			</div>
		</div>
	</section>

	<!-- Risk Analysis Preview -->
	<section class="py-16 px-4 bg-white">
		<div class="max-w-4xl mx-auto text-center">
			<h2 class="font-serif text-3xl font-bold text-deep-justice mb-4">
				What We Analyze
			</h2>
			<p class="text-slate-600 mb-8">
				Our AI flags these risk levels in your contracts
			</p>

			<div class="flex flex-wrap justify-center gap-4">
				{#each riskLevels as risk}
					<div
						class="flex items-center gap-3 px-6 py-3 rounded-lg bg-white border border-slate-200 shadow-sm"
					>
						<div class="{risk.color} w-4 h-4 rounded-full shrink-0"></div>
						<div class="text-left">
							<p class="font-semibold text-deep-justice">{risk.level}</p>
							<p class="text-xs text-slate-500">{risk.text}</p>
						</div>
					</div>
				{/each}
			</div>

			<div class="mt-8 p-4 bg-slate-50 rounded-lg border border-slate-200 max-w-md mx-auto">
				<p class="text-sm text-slate-600">
					<strong class="text-deep-justice">Examples:</strong> Auto-renewal clauses, termination
					fees, liability limits, hidden penalties, vague deliverables...
				</p>
			</div>
		</div>
	</section>

	<!-- FAQ Section -->
	<section id="faq" class="py-16 px-4 bg-slate-50 scroll-mt-20">
		<div class="max-w-3xl mx-auto">
			<h2 class="font-serif text-3xl font-bold text-center text-deep-justice mb-4">
				Frequently Asked Questions
			</h2>
			<p class="text-center text-slate-600 mb-8">
				Everything you need to know about ContractChecker
			</p>

			<Accordion.Root type="single" class="w-full">
				{#each faqs as faq, i}
					<Accordion.Item value="item-{i}">
						<Accordion.Trigger class="text-left font-medium text-deep-justice hover:text-electric-blue">
							{faq.question}
						</Accordion.Trigger>
						<Accordion.Content class="text-slate-600">
							{faq.answer}
						</Accordion.Content>
					</Accordion.Item>
				{/each}
			</Accordion.Root>
		</div>
	</section>

	<!-- Final CTA -->
	<section class="py-20 px-4 bg-deep-justice">
		<div class="max-w-3xl mx-auto text-center">
			<h2 class="font-serif text-3xl md:text-4xl font-bold text-white mb-4">
				Ready to sign with confidence?
			</h2>
			<p class="text-lg text-slate-300 mb-8">
				Join thousands who use ContractChecker.net to protect themselves before signing.
			</p>

			<div class="flex flex-col sm:flex-row gap-4 justify-center">
				<Button
					class="bg-electric-blue hover:bg-blue-600 text-lg px-8 py-6 h-auto"
					href="/login"
				>
					Get Started Free
				</Button>
				<Button
					variant="outline"
					class="border-white text-white hover:bg-white hover:text-deep-justice text-lg px-8 py-6 h-auto bg-transparent"
					href="/login"
				>
					Sign In to Account
				</Button>
			</div>

			<p class="mt-6 text-sm text-slate-400">
				Average analysis: 30 seconds per contract
			</p>
		</div>
	</section>

	<!-- Footer -->
	<footer class="bg-slate-900 py-8 px-4">
		<div class="max-w-7xl mx-auto">
			<div class="flex flex-col md:flex-row justify-between items-center gap-4">
				<div class="flex items-center gap-2">
					<img
						src="https://storage.contractchecker.net/logo-small.webp"
						alt="ContractChecker Logo"
						class="h-6 w-auto"
					/>
				</div>
				<p class="text-slate-400 text-sm">
					&copy; 2025 ContractChecker.net. All rights reserved.
				</p>
				<div class="flex gap-4 text-sm">
					<a href="/terms" class="text-slate-400 hover:text-white transition-colors">Terms</a>
					<a href="/privacy" class="text-slate-400 hover:text-white transition-colors">Privacy</a>
					<a href="/contact" class="text-slate-400 hover:text-white transition-colors">Contact</a>
				</div>
			</div>
		</div>
	</footer>
</div>

<style>
	.text-electric-blue {
		color: #2563eb;
	}

	.bg-electric-blue {
		background-color: #2563eb;
	}

	.text-deep-justice {
		color: #0f172a;
	}

	.bg-deep-justice {
		background-color: #0f172a;
	}

	.text-verdict-green {
		color: #059669;
	}

	.bg-verdict-green {
		background-color: #059669;
	}

	.text-caution-gold {
		color: #d97706;
	}

	.bg-caution-gold {
		background-color: #d97706;
	}

	.bg-gavel-red {
		background-color: #dc2626;
	}

	.hover\:bg-blue-700:hover {
		background-color: #1d4ed8;
	}

	.border-electric-blue {
		border-color: #2563eb;
	}
</style>
