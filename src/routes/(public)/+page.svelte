<script lang="ts">
    import { Button } from "$lib/components/ui/button";
    import { Input } from "$lib/components/ui/input";
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
    import { Modal } from "$lib/components/ui/modal";
    import {
       Shield,
       Upload,
       Scan,
       Zap,
       Check,
       X,
       Clock,
       Briefcase,
       ArrowRight,
       Search,
       Globe,
       AlertTriangle,
       Loader2
    } from "lucide-svelte";
    import { joinWaitlist } from "$lib/firebaseclient";

    // REVISION: Features now highlight the "Split-Brain" Architecture (Identity + Text) [cite: 50-73]
    const features = [
       {
          icon: Upload,
          title: "1. Upload Contract",
          description: "Drop your PDF. We parse the legal text and extract the client's entity details instantly."
       },
       {
          icon: Search, // Changed to Search to represent "Investigation" [cite: 66]
          title: "2. The 'Ghostbuster' Check",
          description: "We don't just read the file. We search government databases (AHU, ACRA, etc.) to see if this client actually exists."
       },
       {
          icon: Shield,
          title: "3. Unified Risk Report",
          description: "Get a single score: Is the contract fair? AND Is the client real? Know before you sign."
       }
    ];

    // REVISION: Comparison now focuses on SCOPE (Identity vs Text) rather than just price [cite: 8]
    const lawyerComparison = {
       oldWay: {
          title: "Traditional Review",
          icon: Briefcase,
          price: "$500+ / hour",
          speed: "3-5 Business Days",
          scope: "Checks text only. Assumes client is real.",
          mood: "gray"
       },
       newWay: {
          title: "ContractChecker.net",
          icon: Shield,
          price: "$9 / Scan", // [cite: 14]
          speed: "30 Seconds",
          scope: "Checks text + Validates Company Identity.",
          mood: "blue"
       }
    };

    // REVISION: Risk levels now include "Fake Entity" warnings [cite: 49]
    const riskLevels = [
       { level: "CRITICAL", color: "bg-gavel-red", text: "Fake Entity / Identity Mismatch" },
       { level: "WARNING", color: "bg-caution-gold", text: "Unfair Clauses / Hidden Fees" },
       { level: "SAFE", color: "bg-verdict-green", text: "Verified Entity & Standard Terms" }
    ];

    const faqs = [
       {
          question: "Is this a replacement for a real lawyer?",
          answer: "No. ContractChecker is an AI-powered 'Bodyguard'. We specialize in catching 90% of scams (fake companies, identity theft) and standard bad clauses (hidden fees). For complex M&A deals, use a lawyer. For gig contracts, use us."
       },
       {
          question: "How do you check if a client is real?",
          answer: "We use a 'Split-Brain' AI. While one AI reads your contract, another AI (Perplexity-powered) searches live government databases (like AHU in Indonesia or ACRA in Singapore) and social media to verify the client's reputation."
       },
       {
          question: "Is my contract kept private?",
          answer: "Yes. Your privacy is paramount. We do not sell your data, and we do not use your specific contracts to train our public models. Your documents are encrypted during the scan."
       },
       {
          question: "What file types do you support?",
          answer: "Currently, we support PDF documents. Simply upload your contract file, and our DeepSeek OCR engine will read the layout directly."
       },
       {
          question: "How does the pricing work?",
          answer: "It's a Pay-Per-Use model. Your first scan is completely free. After that, single scans are $9 (or approx Rp 75k). No monthly subscriptions."
       }
    ];

    let showBanner = $state(true);
    let showWaitlistModal = $state(false);
    let waitlistEmail = $state("");
    let honeypot = $state("");
    let waitlistLoading = $state(false);
    let waitlistSuccess = $state(false);
    let waitlistError = $state("");

    function openWaitlistModal() {
       showWaitlistModal = true;
       waitlistEmail = "";
       honeypot = "";
       waitlistSuccess = false;
       waitlistError = "";
    }

    async function handleWaitlistSubmit() {
       if (honeypot !== "") {
          waitlistSuccess = true;
          waitlistEmail = "";
          return;
       }

       if (!waitlistEmail || !waitlistEmail.includes("@")) {
          waitlistError = "Please enter a valid email address.";
          return;
       }

       const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
       if (!emailRegex.test(waitlistEmail)) {
          waitlistError = "Please enter a valid email address.";
          return;
       }

       waitlistLoading = true;
       waitlistError = "";

       const result = await joinWaitlist(waitlistEmail);

       if (result.success) {
          waitlistSuccess = true;
          waitlistEmail = "";
          honeypot = "";
       } else {
          waitlistError = result.error || "Something went wrong. Please try again.";
       }

       waitlistLoading = false;
    }
</script>

<svelte:head>
    <title>ContractChecker.net | Scam Protection for Freelancers</title>
    <meta name="description" content="Is your client real? Don't sign blindly. We background check the company AND review the contract terms in 30 seconds." />
    <link rel="canonical" href="https://www.contractchecker.net/" />

    <meta property="og:type" content="website" />
    <meta property="og:url" content="https://www.contractchecker.net/" />
    <meta property="og:title" content="ContractChecker.net | The Freelancer's Bodyguard" />
    <meta property="og:description" content="Verify your client exists. Check for hidden fees. Sign with confidence." />
    <meta property="og:image" content="https://storage.contractchecker.net/og-image.jpg" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="ContractChecker.net | The Freelancer's Bodyguard" />
    <meta name="twitter:description" content="Instant background check & contract analysis." />
    <meta name="twitter:image" content="https://storage.contractchecker.net/og-image.jpg" />
</svelte:head>

<div class="min-h-screen bg-slate-50 font-sans">
    {#if showBanner}
       <div class="bg-electric-blue text-white text-sm py-2 px-4 flex justify-between items-center">
          <span class="flex-1 text-center">
             <strong>Launch Offer:</strong> Get 1 free "Deep Investigation" scan on sign up.
          </span>
          <button onclick={() => showBanner = false} class="ml-4 hover:text-slate-200 transition-colors">
             <X class="h-4 w-4" />
          </button>
       </div>
    {/if}

    <nav class="sticky top-0 z-50 bg-white/80 backdrop-blur-sm border-b border-slate-200">
       <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between items-center h-16">
             <a href="/" class="flex items-center gap-2">
                <img
                   src="https://storage.contractchecker.net/header.webp"
                   alt="ContractChecker Logo"
                   class="h-10 w-auto"
                />
             </a>
             <div class="flex items-center gap-6">
                <a href="#faq" class="text-sm font-medium text-slate-600 hover:text-electric-blue transition-colors">
                   FAQ
                </a>
                <Button class="bg-electric-blue hover:bg-blue-700" onclick={openWaitlistModal}>
                   Get Early Access
                </Button>
             </div>
          </div>
       </div>
    </nav>

    <section class="py-20 px-4">
       <div class="max-w-4xl mx-auto text-center">
          <div class="mb-8">
             <img
                src="https://storage.contractchecker.net/landing.webp"
                alt="ContractChecker Logo"
                class="mx-auto w-48 h-48 object-contain drop-shadow-lg"
             />
          </div>

          <h1 class="font-serif text-4xl md:text-6xl font-bold text-deep-justice mb-6 leading-tight">
             Is Your New Client Real? <br>
             <span class="text-electric-blue">Check Before You Sign.</span>
          </h1>

          <p class="text-xl text-slate-600 mb-8 max-w-2xl mx-auto leading-relaxed">
             The only AI that reviews the <strong class="text-deep-justice">contract terms</strong> AND background checks the <strong class="text-deep-justice">client's reputation</strong>.
             <br><span class="text-electric-blue font-semibold">Avoid scams, ghosts, and bad payers in 30 seconds.</span>
          </p>

          <div class="flex flex-col sm:flex-row gap-4 justify-center items-center">
             <Button
                class="bg-electric-blue hover:bg-blue-700 text-lg px-8 py-6 h-auto shadow-lg shadow-blue-500/20"
                onclick={openWaitlistModal}
             >
                Start Free Scan
                <ArrowRight class="ml-2 h-5 w-5" />
             </Button>
          </div>

          <p class="mt-4 text-sm text-slate-500">
             No credit card required. No subscription.
          </p>
       </div>
    </section>

    <section class="py-8 bg-slate-100 border-y border-slate-200">
        <div class="max-w-7xl mx-auto px-4 text-center">
            <p class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-6">
                Real-time Verification Sources
            </p>
            <div class="flex flex-wrap justify-center items-center gap-8 md:gap-12 opacity-60 grayscale hover:grayscale-0 transition-all duration-300">
                <div class="flex items-center gap-2 font-bold text-slate-700"><Globe class="h-4 w-4"/> AHU (Indonesia)</div>
                <div class="flex items-center gap-2 font-bold text-slate-700"><Globe class="h-4 w-4"/> ACRA (Singapore)</div>
                <div class="flex items-center gap-2 font-bold text-slate-700"><Globe class="h-4 w-4"/> ASIC (Australia)</div>
                <div class="flex items-center gap-2 font-bold text-slate-700"><Globe class="h-4 w-4"/> SOS (USA)</div>
                <div class="flex items-center gap-2 font-bold text-slate-700"><Search class="h-4 w-4"/> Social Reputation</div>
            </div>
        </div>
    </section>

    <section class="py-16 px-4 bg-white">
       <div class="max-w-5xl mx-auto">
          <h2 class="font-serif text-3xl font-bold text-center text-deep-justice mb-12">
             Don't pay for a lawyer just to check a PDF.
          </h2>

          <div class="grid md:grid-cols-2 gap-8">
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
                      <span class="text-slate-500">Scope</span>
                      <span class="font-semibold text-slate-600 text-right text-sm max-w-[50%]">{lawyerComparison.oldWay.scope}</span>
                   </div>
                   <div class="flex items-center justify-between py-2 border-b border-slate-200">
                      <span class="text-slate-500">Speed</span>
                      <span class="font-semibold text-slate-600">{lawyerComparison.oldWay.speed}</span>
                   </div>
                </CardContent>
             </Card>

             <Card class="border-2 border-electric-blue shadow-xl relative overflow-hidden">
                <div class="absolute top-0 right-0 bg-electric-blue text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                    RECOMMENDED
                </div>
                <CardHeader class="text-center pb-2 bg-electric-blue/5">
                   <div
                      class="mx-auto mb-4 w-16 h-16 bg-none flex items-center justify-center"
                   >
                      <img src="https://storage.contractchecker.net/login.webp"  alt="comparison logo" class="w-full h-full object-contain" />
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
                      <span class="text-slate-500">Scope</span>
                      <span class="font-bold text-deep-justice text-right text-sm max-w-[60%]">{lawyerComparison.newWay.scope}</span>
                   </div>
                   <div class="flex items-center justify-between py-2 border-b border-blue-100">
                      <span class="text-slate-500">Results In</span>
                      <span class="font-bold text-electric-blue text-lg">{lawyerComparison.newWay.speed}</span>
                   </div>
                   <div class="pt-2">
                       <Badge variant="outline" class="w-full justify-center text-electric-blue border-electric-blue py-1">
                           <Check class="h-3 w-3 mr-1"/> Includes Identity Check
                       </Badge>
                   </div>
                </CardContent>
             </Card>
          </div>
       </div>
    </section>

    <section class="py-16 px-4 bg-slate-50">
       <div class="max-w-5xl mx-auto">
          <h2 class="font-serif text-3xl font-bold text-center text-deep-justice mb-4">
             The "Split-Brain" Analysis
          </h2>
          <p class="text-center text-slate-600 mb-12">
             We use two different AI systems to keep you safe.
          </p>

          <div class="grid md:grid-cols-3 gap-8">
             {#each features as feature, i}
                <div class="relative text-center group">
                   <div
                      class="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-electric-blue text-white font-bold flex items-center justify-center text-sm z-10 shadow-md"
                   >
                      {i + 1}
                   </div>

                   <Card class="pt-10 pb-6 h-full transition-transform hover:-translate-y-1 duration-300">
                      <div
                         class="mx-auto mb-4 w-14 h-14 rounded-full bg-electric-blue/10 flex items-center justify-center group-hover:bg-electric-blue/20 transition-colors"
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

                   {#if i < features.length - 1}
                      <div class="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10 text-slate-300">
                         <ArrowRight class="h-6 w-6" />
                      </div>
                   {/if}
                </div>
             {/each}
          </div>
       </div>
    </section>

    <section class="py-16 px-4 bg-white">
       <div class="max-w-4xl mx-auto text-center">
          <h2 class="font-serif text-3xl font-bold text-deep-justice mb-4">
             What We Look For
          </h2>
          <p class="text-slate-600 mb-8">
             Our <span class="text-electric-blue font-semibold">Gemini Pro</span> engine flags these specific risks:
          </p>

          <div class="flex flex-wrap justify-center gap-4">
             {#each riskLevels as risk}
                <div
                   class="flex items-center gap-3 px-6 py-4 rounded-lg bg-white border border-slate-200 shadow-sm hover:shadow-md transition-shadow"
                >
                   <div class="{risk.color} w-4 h-4 rounded-full shrink-0 animate-pulse"></div>
                   <div class="text-left">
                      <p class="font-bold text-deep-justice text-sm">{risk.level}</p>
                      <p class="text-xs text-slate-500">{risk.text}</p>
                   </div>
                </div>
             {/each}
          </div>

          <div class="mt-8 p-6 bg-slate-50 rounded-lg border border-slate-200 max-w-lg mx-auto text-left">
              <div class="flex gap-4">
                  <AlertTriangle class="h-6 w-6 text-gavel-red shrink-0" />
                  <div>
                    <h4 class="font-bold text-deep-justice text-sm mb-1">Real Example Caught:</h4>
                    <p class="text-sm text-slate-600 italic">
                        "The contract looked perfect, but ContractChecker found the 'CEO' was a stock photo and the business address was a vacant lot in Bekasi. Saved me 2 months of work."
                    </p>
                  </div>
              </div>
          </div>
       </div>
    </section>

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
                   <Accordion.Content class="text-slate-600 leading-relaxed">
                      {faq.answer}
                   </Accordion.Content>
                </Accordion.Item>
             {/each}
          </Accordion.Root>
       </div>
    </section>

    <section class="py-20 px-4 bg-deep-justice relative overflow-hidden">
        <div class="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
            <div class="absolute right-0 top-0 w-64 h-64 bg-electric-blue rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
        </div>

       <div class="max-w-3xl mx-auto text-center relative z-10">
          <h2 class="font-serif text-3xl md:text-4xl font-bold text-white mb-4">
             Ready to verify your next client?
          </h2>
          <p class="text-lg text-slate-300 mb-8">
             Join thousands of freelancers who use ContractChecker to protect their income.
          </p>

          <div class="flex flex-col sm:flex-row gap-4 justify-center">
             <Button
                class="bg-electric-blue hover:bg-blue-600 text-lg px-8 py-6 h-auto shadow-lg shadow-blue-900/50"
                onclick={openWaitlistModal}
             >
                Join the Waitlist
             </Button>
             <Button
                variant="outline"
                class="border-slate-600 text-white hover:bg-white hover:text-deep-justice text-lg px-8 py-6 h-auto bg-transparent"
                onclick={openWaitlistModal}
             >
                See Sample Report
             </Button>
          </div>

          <p class="mt-6 text-sm text-slate-500">
             Average analysis time: 30 seconds
          </p>
       </div>
    </section>

    <footer class="bg-slate-900 py-10 px-4 border-t border-slate-800">
       <div class="max-w-7xl mx-auto">
          <div class="flex flex-col md:flex-row justify-between items-center gap-6">
             <div class="flex items-center gap-2">
                <img
                   src="https://storage.contractchecker.net/header.webp"
                   alt="ContractChecker Logo"
                   class="h-8 w-auto opacity-90"
                />
             </div>
             <p class="text-slate-500 text-sm">
                &copy; 2026 ContractChecker.net. Built for the Gig Economy.
             </p>
             <div class="flex gap-6 text-sm">
                <a href="/terms" class="text-slate-400 hover:text-white transition-colors">Terms</a>
                <a href="/privacy" class="text-slate-400 hover:text-white transition-colors">Privacy</a>
                <a href="mailto:support@contractchecker.net" class="text-slate-400 hover:text-white transition-colors">Contact</a>
             </div>
          </div>
       </div>
    </footer>

    <Modal bind:open={showWaitlistModal} title="Get Early Access">
       {#if waitlistSuccess}
          <div class="text-center py-6">
             <div class="mx-auto w-16 h-16 rounded-full bg-verdict-green/10 flex items-center justify-center mb-4">
                <Check class="h-8 w-8 text-verdict-green" />
             </div>
             <h3 class="font-serif text-xl font-bold text-deep-justice mb-2">You're on the list!</h3>
             <p class="text-slate-600 text-sm mb-6">We'll notify you when your first free scan is ready.</p>
             <Button
                class="w-full bg-electric-blue hover:bg-blue-700"
                onclick={() => showWaitlistModal = false}
             >
                Close
             </Button>
          </div>
       {:else}
          <form
             onsubmit={(e) => {
                e.preventDefault();
                handleWaitlistSubmit();
             }}
             class="space-y-4 py-2"
          >
             <p class="text-slate-600 text-sm mb-4">
                Stop guessing. Start verifying. Enter your email to get <strong>1 Free Deep Scan</strong> when we launch.
             </p>

             <input
                type="text"
                name="website"
                bind:value={honeypot}
                tabindex="-1"
                autocomplete="off"
                class="hidden"
             />

             {#if waitlistError}
                <div class="p-3 rounded-md bg-red-50 border border-red-200 text-red-700 text-sm flex gap-2 items-center">
                   <AlertTriangle class="h-4 w-4" />
                   {waitlistError}
                </div>
             {/if}

             <div class="space-y-2">
                <label for="waitlist-email" class="text-sm font-medium text-deep-justice">
                   Email Address
                </label>
                <div class="relative">
                    <Briefcase class="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input
                    id="waitlist-email"
                    type="email"
                    placeholder="freelancer@example.com"
                    bind:value={waitlistEmail}
                    disabled={waitlistLoading}
                    class="pl-10"
                    required
                    />
                </div>
             </div>

             <Button
                type="submit"
                class="w-full bg-electric-blue hover:bg-blue-700 text-lg py-6"
                disabled={waitlistLoading}
             >
                {#if waitlistLoading}
                   <Loader2 class="mr-2 h-5 w-5 animate-spin" />
                   Securing Spot...
                {:else}
                   Join Waitlist
                {/if}
             </Button>

             <p class="text-xs text-center text-slate-400">
                 Limited spots available for the beta.
             </p>
          </form>
       {/if}
    </Modal>
</div>

<style>
    /* Custom Utility Classes for Brand Colors from TDS [cite: 170] */
    .text-electric-blue { color: #2563eb; }
    .bg-electric-blue { background-color: #2563eb; }

    .text-deep-justice { color: #0f172a; }
    .bg-deep-justice { background-color: #0f172a; }

    .text-verdict-green { color: #059669; }
    .bg-verdict-green { background-color: #059669; }

    .text-gavel-red { color: #DC2626; }
    .bg-gavel-red { background-color: #DC2626; }

    .bg-caution-gold { background-color: #F59E0B; } /* Added for Warning level */
</style>