<script lang="ts">
    import { Button } from "$lib/components/ui/button";
    import { ArrowRight, Check, AlertTriangle, Shield, Clock } from "lucide-svelte";

    // SEO Data
    const title = "5 Red Flags in Upwork & Fiverr Contracts That Cost You Money";
    const description = "Don't click Accept blindly. Learn the hidden clauses that steal your IP and income.";
</script>

<svelte:head>
    <title>5 Red Flags in Upwork & Fiverr Contracts | ContractChecker.net</title>

    <meta name="description" content="Don't sign blindly. Learn the hidden clauses in Upwork and Fiverr contracts that steal your IP and income. Read the full guide." />

    <meta property="og:type" content="article" />
    <meta property="og:title" content="5 Red Flags in Upwork & Fiverr Contracts That Cost You Money" />
    <meta property="og:description" content="Stop clicking 'Accept' blindly. See the hidden traps in gig economy contracts." />
    <meta property="og:image" content="https://storage.contractchecker.net/blog-freelance.webp" />
    <meta property="og:url" content="https://www.contractchecker.net/blog/upwork-fiverr-red-flags" />

    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="5 Red Flags in Upwork & Fiverr Contracts" />
    <meta name="twitter:description" content="Stop clicking 'Accept' blindly. See the hidden traps in gig economy contracts." />
    <meta name="twitter:image" content="https://storage.contractchecker.net/blog-freelance.webp" />
</svelte:head>

<nav class="sticky top-0 z-50 bg-white/80 backdrop-blur-sm border-b border-slate-200">
   <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-16">
         <a href="/" class="flex items-center gap-2">
            <img
                src="https://storage.contractchecker.net/landing.webp"
                alt="ContractChecker Logo"
                class="mx-auto w-12 h-12 object-contain drop-shadow-lg"
             />
         </a>
         <div class="flex items-center gap-6">
            <a href="/" class="text-sm font-medium text-slate-600 hover:text-electric-blue transition-colors">Home</a>
            <Button class="bg-electric-blue hover:bg-blue-700" onclick={() => window.location.href = "/"}>Check My Contract</Button>
         </div>
      </div>
   </div>
</nav>

<article class="min-h-screen bg-slate-50 font-sans py-20 px-4">
    <div class="max-w-3xl mx-auto bg-white p-8 md:p-12 rounded-xl shadow-sm border border-slate-200">
        <div class="mb-10">
            <span class="bg-blue-100 text-electric-blue text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">Freelance Guide</span>
            <h1 class="mt-4 font-serif text-3xl md:text-5xl font-bold text-deep-justice leading-tight">{title}</h1>
            <div class="flex items-center gap-4 mt-6 text-slate-500 text-sm">
                <span class="flex items-center gap-1"><Clock class="h-4 w-4"/> 5 min read</span>
                <span>•</span>
                <span>Updated Feb 2026</span>
            </div>
            <img src="https://storage.contractchecker.net/blog-freelance.webp" alt="Freelancer reviewing contract" class="w-full h-64 object-cover rounded-lg mt-8 shadow-md" />
        </div>

        <div class="prose prose-slate max-w-none text-slate-600 leading-relaxed space-y-8">
            <p class="text-lg">Most freelancers click "Accept" without reading the fine print because legal fees are too high. But on platforms like Upwork and Fiverr, custom contracts attached to milestones often contain "gotcha" clauses that standard terms don't cover.</p>

            <h2 class="text-2xl font-bold text-deep-justice">1. The "Unlimited Revisions" Trap</h2>
            <p>Beware of clauses that say "to the client's satisfaction" without a defined limit. This leads to scope creep where you work for free. Ensure there is a hard cap on revision rounds.</p>

            <h2 class="text-2xl font-bold text-deep-justice">2. IP Overreach (The "Pre-Existing Works" Trap)</h2>
            <p>If the contract says <em>"Contractor assigns all right, title, and interest in all work product,"</em> ensure you exclude your own <strong>Background IP</strong>. Without this, you might accidentally sell the rights to your own private code libraries or design templates.</p>

            <div class="my-10 p-8 bg-blue-50 border border-blue-200 rounded-lg text-center">
                 <img
                src="https://storage.contractchecker.net/landing.webp"
                alt="ContractChecker Logo"
                class="mx-auto w-20 h-20 object-contain drop-shadow-lg"
             />
                <h3 class="text-xl font-bold text-deep-justice mb-2">Is your IP safe?</h3>
                <p class="mb-6 text-slate-600">Don't guess. Paste your contract into our AI to spot these ownership traps instantly.</p>
                <Button class="bg-electric-blue w-full md:w-auto" onclick={() => window.location.href = "/"}>Analyze My Contract Now ($5)</Button>
            </div>

            <h2 class="text-2xl font-bold text-deep-justice">3. Missing "Kill Fees"</h2>
            <p>What happens if the client cancels halfway? If there is no cancellation clause, you might get $0 for 20 hours of work. Always look for a clause that guarantees payment for work completed up to the cancellation date.</p>

            <h2 class="text-2xl font-bold text-deep-justice">4. Vague Payment Milestones</h2>
            <p>Never tie payment to "final approval." This allows clients to hold funds indefinitely by simply never "approving" the work. Tie payments to "delivery of assets."</p>

            <h2 class="text-2xl font-bold text-deep-justice">5. Non-Compete Clauses</h2>
            <p>Some clients slip in clauses preventing you from working with <em>any other client</em> in their industry for 1-2 years. For a freelancer, this is a career-killer. Strike it out immediately.</p>
        </div>

        <div class="mt-16 pt-8 border-t border-slate-200">
            <h3 class="text-xl font-bold text-deep-justice mb-4">Work Smarter, Not Harder</h3>
            <p class="text-slate-600 mb-8">In 2026, you don't need a $500 lawyer to spot these flags. You just need 30 seconds and an AI that knows what to look for.</p>

            <div class="bg-deep-justice text-white p-8 rounded-xl text-center relative overflow-hidden">
                <div class="relative z-10">
                    <h2 class="text-2xl font-bold mb-4">Check your contract before you sign.</h2>
                    <Button class="bg-electric-blue hover:bg-blue-600 text-lg px-8 py-6 h-auto" onclick={() => window.location.href = "/"}>Start Free Scan</Button>
                </div>
            </div>
        </div>
    </div>
</article>

<footer class="bg-slate-900 py-10 px-4 border-t border-slate-800">
   <div class="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
       <div class="flex items-center gap-2">
           <span class="text-white font-bold text-xl">ContractChecker.net</span>
       </div>
       <p class="text-slate-500 text-sm">&copy; 2026 ContractChecker.net. Built for the Gig Economy.</p>
       <div class="flex gap-6 text-sm">
           <a href="/" class="text-slate-400 hover:text-white">Home</a>
           <a href="/terms" class="text-slate-400 hover:text-white">Terms</a>
       </div>
   </div>
</footer>

<style>
    .text-electric-blue { color: #2563eb; }
    .bg-electric-blue { background-color: #2563eb; }
    .hover\:bg-blue-700:hover { background-color: #1d4ed8; }
    .text-deep-justice { color: #0f172a; }
    .bg-deep-justice { background-color: #0f172a; }
</style>
