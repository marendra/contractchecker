<script lang="ts">
    import { Button } from "$lib/components/ui/button";
    import { Input } from "$lib/components/ui/input";
    import {
       Card,
       CardContent,
       CardHeader,
       CardTitle
    } from "$lib/components/ui/card";
    import { Badge } from "$lib/components/ui/badge";
    import * as Accordion from "$lib/components/ui/accordion";
    import { Modal } from "$lib/components/ui/modal";
    import {
       Shield,
       Upload,
       Search,
       Check,
       X,
       Briefcase,
       ArrowRight,
       Globe,
       AlertTriangle,
       Loader2,
       Clock,
       Users
    } from "lucide-svelte";
    import { joinWaitlist } from "$lib/firebaseclient";

    const features = [
       {
          icon: Upload,
          title: "1. Upload Contract",
          description: "Drop your PDF. We parse the legal text and extract the client's entity details instantly."
       },
       {
          icon: Search,
          title: "2. The 'Ghostbuster' Check",
          description: "We don't just read the file. We search government databases (US, UK, CA, AU, EU) to see if this client actually exists."
       },
       {
          icon: Shield,
          title: "3. Unified Risk Report",
          description: "Get a single score: Is the contract fair? AND Is the client real? Know before you sign."
       }
    ];

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
          price: "$5 / Scan",
          speed: "30 Seconds",
          scope: "Checks text + Validates Company Identity.",
          mood: "blue"
       }
    };

    const riskLevels = [
       { level: "CRITICAL", color: "bg-gavel-red", text: "Fake Entity / Identity Mismatch" },
       { level: "WARNING", color: "bg-caution-gold", text: "Unfair Clauses / Hidden Fees" },
       { level: "SAFE", color: "bg-verdict-green", text: "Verified Entity & Standard Terms" }
    ];

    const faqs = [
       {
          question: "Is this a replacement for a real lawyer?",
          answer: "No. ContractChecker is an AI-powered 'Bodyguard'. We specialize in catching 90% of scams (fake companies, identity theft) and standard bad clauses (hidden fees). For complex deals, use a lawyer. For gig contracts, use us."
       },
       {
          question: "How do you check if a client is real?",
          answer: "We use a 'Split-Brain' AI. While one AI reads your contract, another AI (Perplexity-powered) searches live government databases (like the Secretary of State in the US or Corporations Canada) and social media to verify the client's reputation."
       },
       {
          question: "Is my contract kept private?",
          answer: "Yes. Your privacy is paramount. We do not sell your data, and we do not use your specific contracts to train our public models. Your documents are encrypted during the scan."
       },
       {
          question: "What file types do you support?",
          answer: "Currently, we support PDF documents (Maximum size: 20 MB). Simply upload your contract file, and our DeepSeek OCR engine will read the layout directly."
       },
       {
          question: "How does the pricing work?",
          answer: "It's a Pay-Per-Use model. During our Soft-Launch, scans are discounted to $5 each (Regular price: $9). The first 50 people to join our VIP Beta get 3 scans absolutely free."
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
        "priceCurrency": "USD",
        "minPrice": "5.00",
        "maxPrice": "9.00"
      },
      "description": "AI-powered contract analysis tool that identifies legal risks, hidden fees, and liabilities in seconds."
    }
    </script>
    `}
</svelte:head>

<div class="min-h-screen bg-slate-50 font-sans">
    {#if showBanner}
       <div class="bg-electric-blue text-white text-sm py-2 px-4 flex justify-between items-center">
          <span class="flex-1 text-center flex items-center justify-center gap-2">
             <Clock class="h-4 w-4" />
             <span>
                <strong>VIP Beta:</strong> The first 50 users get <strong>3 Free Scans</strong> ($27 value). Registration closes soon.
             </span>
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
                   Join VIP Waitlist
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

          <p class="text-xl text-slate-600 mb-6 max-w-2xl mx-auto leading-relaxed">
             The only AI that reviews the <strong class="text-deep-justice">contract terms</strong> AND background checks the <strong class="text-deep-justice">client's reputation</strong>.
             <br><span class="text-electric-blue font-semibold">Join the VIP Beta to claim 3 Free Credits ($27 Value).</span>
          </p>

          <div class="mb-8">
              <span class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-50 text-gavel-red text-xs font-bold border border-red-100">
                  <Users class="h-3 w-3" />
                  Strictly limited to the first 50 signups.
              </span>
          </div>

          <div class="flex flex-col sm:flex-row gap-4 justify-center items-center">
             <Button
                class="bg-electric-blue hover:bg-blue-700 text-lg px-8 py-6 h-auto shadow-lg shadow-blue-500/20"
                onclick={openWaitlistModal}
             >
                Secure My Free Scans
                <ArrowRight class="ml-2 h-5 w-5" />
             </Button>
          </div>

          <p class="mt-4 text-sm text-slate-500">
             No credit card required to join the waitlist.
          </p>
       </div>
    </section>

    <section class="py-8 bg-slate-100 border-y border-slate-200">
        <div class="max-w-7xl mx-auto px-4 text-center">
            <p class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-6">
                Real-time Verification Sources
            </p>
            <div class="flex flex-wrap justify-center items-center gap-8 md:gap-12 opacity-60 grayscale hover:grayscale-0 transition-all duration-300">
                <div class="flex items-center gap-2 font-bold text-slate-700"><Globe class="h-4 w-4"/> SOS (USA)</div>
                <div class="flex items-center gap-2 font-bold text-slate-700"><Globe class="h-4 w-4"/> Corporations Canada</div>
                <div class="flex items-center gap-2 font-bold text-slate-700"><Globe class="h-4 w-4"/> ASIC (Australia)</div>
                <div class="flex items-center gap-2 font-bold text-slate-700"><Globe class="h-4 w-4"/> Companies House (UK)</div>
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
                    SOFT-LAUNCH PROMO
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
                      <div class="text-right flex items-center gap-2 justify-end">
                          <span class="text-sm text-slate-400 line-through">$9</span>
                          <span class="font-bold text-electric-blue text-lg">{lawyerComparison.newWay.price}</span>
                      </div>
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
                   <div class="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-electric-blue text-white font-bold flex items-center justify-center text-sm z-10 shadow-md">
                      {i + 1}
                   </div>
                   <Card class="pt-10 pb-6 h-full transition-transform hover:-translate-y-1 duration-300">
                      <div class="mx-auto mb-4 w-14 h-14 rounded-full bg-electric-blue/10 flex items-center justify-center group-hover:bg-electric-blue/20 transition-colors">
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
                <div class="flex items-center gap-3 px-6 py-4 rounded-lg bg-white border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
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
                        "The contract looked perfect, but ContractChecker found the 'CEO' was a stock photo and the business address was a vacant lot. Saved me 2 months of work."
                    </p>
                  </div>
              </div>
          </div>
       </div>
    </section>

    <section class="py-16 px-4 bg-white border-b border-slate-200">
       <div class="max-w-4xl mx-auto">
          <h2 class="font-serif text-3xl font-bold text-center text-deep-justice mb-8">
             Latest from the Blog
          </h2>
          <div class="grid md:grid-cols-2 gap-8 items-center">
             <img src="https://storage.contractchecker.net/blog-freelance.webp" alt="Blog Thumbnail" class="rounded-lg shadow-md hover:rotate-0 transition-transform duration-300" />
             <div>
                <span class="text-electric-blue font-bold text-sm uppercase tracking-wider">Must Read</span>
                <h3 class="font-serif text-2xl font-bold text-deep-justice mt-2 mb-4">
                   5 Red Flags in Upwork & Fiverr Contracts That Cost You Money
                </h3>
                <p class="text-slate-600 mb-6">
                   Don't sign blindly. Learn about "Kill Fees", IP traps, and how to protect your code.
                </p>
                <a href="/blog/upwork-fiverr-red-flags" class="text-electric-blue font-bold hover:underline flex items-center gap-2">
                   Read Article <ArrowRight class="h-4 w-4" />
                </a>
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
             Don't miss the VIP Beta.
          </h2>
          <p class="text-lg text-slate-300 mb-8">
             Only 50 spots available for the free tier. Secure yours before we launch.
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
             <h3 class="font-serif text-xl font-bold text-deep-justice mb-2">You're on the VIP list!</h3>
             <p class="text-slate-600 text-sm mb-6">
                Your <strong>3 Free Scans</strong> are secured. We will email you when the Soft-Launch begins.
             </p>
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
             <div class="bg-blue-50 p-4 rounded-lg border border-blue-100 mb-4">
                <div class="flex justify-between items-start">
                    <div>
                        <p class="text-deep-justice text-sm font-semibold mb-1">
                        🎁 VIP Beta Reward
                        </p>
                        <p class="text-slate-600 text-xs leading-relaxed">
                        The first 50 members get <strong>3 Free Scans</strong>.
                        <br>Once filled, the app is 100% paid ($5 promo, then $9).
                        </p>
                    </div>
                    <Badge variant="outline" class="bg-white text-xs border-blue-200 text-blue-700 whitespace-nowrap">
                        <Clock class="w-3 h-3 mr-1" /> 50 Spots Only
                    </Badge>
                </div>
             </div>

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
                   Lock in My 3 Free Scans
                {/if}
             </Button>

             <p class="text-xs text-center text-slate-400">
                 Spots fill on a first-come, first-served basis.
             </p>
          </form>
       {/if}
    </Modal>
</div>

<style>
    .text-electric-blue { color: #2563eb; }
    .bg-electric-blue { background-color: #2563eb; }
    .text-deep-justice { color: #0f172a; }
    .bg-deep-justice { background-color: #0f172a; }
    .text-verdict-green { color: #059669; }
    .bg-verdict-green { background-color: #059669; }
    .text-gavel-red { color: #DC2626; }
    .bg-gavel-red { background-color: #DC2626; }
    .bg-caution-gold { background-color: #F59E0B; }
</style>