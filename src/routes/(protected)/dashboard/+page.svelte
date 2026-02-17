<script lang="ts">
  import {
    FileText, Clock, Shield, AlertTriangle, CheckCircle2, ChevronDown,
    Upload, CreditCard, Eye, MapPin, Trash2, ArrowRight, Search, Filter,
    MoreVertical, RefreshCw, Download, Share2, X,
  } from "lucide-svelte";

  let recentAudits = $state([
    { id: 1, name: "Service Agreement - PT Nusantara", date: "2026-02-15", expiresIn: 2, status: "complete" },
    { id: 2, name: "NDA - Digital Creative Studio", date: "2026-02-14", expiresIn: 3, status: "complete" },
    { id: 3, name: "Vendor Contract - Logistics Co", date: "2026-02-12", expiresIn: 5, status: "complete" },
    { id: 4, name: "Partnership Agreement - TechAsia", date: "2026-02-10", expiresIn: 7, status: "complete" },
    { id: 5, name: "Employment Contract - Senior Dev", date: "2026-02-08", expiresIn: 9, status: "complete" },
  ]);

  let risks = $state([
    { id: 1, level: "high", title: "Payment Term Ambiguity", page: 3, description: "Payment schedule lacks specific due dates", clause: "Payment Terms" },
    { id: 2, level: "medium", title: "IP Transfer Logic", page: 5, description: "Intellectual property ownership clause may favor counterparty", clause: "Intellectual Property" },
    { id: 3, level: "low", title: "Termination Notice Period", page: 8, description: "30-day notice period is shorter than industry standard", clause: "Termination" },
  ]);

  let analysisStages = $state([
    { id: 1, name: "Document Scanning & Text Extraction", completed: true, icon: FileText },
    { id: 2, name: "Counterparty Identification", completed: true, icon: Search },
    { id: 3, name: "Deep Background Investigation", completed: true, icon: Shield },
    { id: 4, name: "Clause & Risk Analysis", completed: true, icon: AlertTriangle },
  ]);

  let showHistoryDropdown = $state(false);
  let showHistoryModal = $state(false);
  let selectedRisk = $state<number | null>(null);
  let highlightedClause = $state<string | null>(null);
  let credits = $state(5);
  let currentFile = $state("Service Agreement - PT Nusantara.pdf");

  let pdfSections = $state([
    { id: "intro", page: 1, title: "Introduction", content: "This Service Agreement is entered into as of the date last signed below..." },
    { id: "parties", page: 2, title: "Parties", content: "PT Kreatif Digital, a company organized under the laws of Indonesia..." },
    { id: "payment", page: 3, title: "Payment Terms", content: "Client shall pay Service Provider the amounts set forth in Exhibit A within thirty (30) days of invoice receipt." },
    { id: "ip", page: 5, title: "Intellectual Property", content: "All intellectual property rights in any work product created by Service Provider under this Agreement shall be the sole and exclusive property of Client." },
    { id: "termination", page: 8, title: "Termination", content: "Either party may terminate this Agreement upon thirty (30) days written notice to the other party." },
  ]);

  function locateClause(riskId: number) {
    const risk = risks.find((r) => r.id === riskId);
    if (!risk) return;
    selectedRisk = riskId;
    highlightedClause = risk.clause;
    const sectionId = "pdf-" + risk.clause.toLowerCase().replace(/\s+/g, "-");
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: "smooth", block: "center" });
    }
    setTimeout(() => { highlightedClause = null; }, 2000);
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  }
</script>

<div class="h-screen w-full bg-slate-50 overflow-hidden flex flex-col font-sans">
  <header class="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0">
    <div class="flex items-center gap-3">
      <img src="https://storage.contractchecker.net/logo-small.webp" alt="ContractChecker Logo" class="h-8 w-auto" />
      <span class="font-serif text-lg font-semibold text-slate-900">ContractChecker.net</span>
    </div>

    <div class="relative">
      <button onclick={() => (showHistoryDropdown = !showHistoryDropdown)} class="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors">
        <Clock class="h-4 w-4 text-slate-600" />
        <span class="text-sm font-medium text-slate-700">Recent Audits</span>
        <ChevronDown class="h-4 w-4 text-slate-500 transition-transform {showHistoryDropdown ? 'rotate-180' : ''}" />
      </button>

      {#if showHistoryDropdown}
        <div class="absolute top-full left-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden z-50">
          <div class="p-3 border-b border-slate-100">
            <h3 class="text-sm font-semibold text-slate-800">Recent Files</h3>
          </div>
          <div class="max-h-64 overflow-y-auto">
            {#each recentAudits as audit}
              <button class="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors border-b border-slate-50">
                <div class="flex items-center gap-3">
                  <FileText class="h-4 w-4 text-slate-400" />
                  <div class="text-left">
                    <p class="text-sm font-medium text-slate-800 truncate max-w-[180px]">{audit.name}</p>
                    <p class="text-xs text-slate-500">{formatDate(audit.date)}</p>
                  </div>
                </div>
                <span class="text-xs px-2 py-1 rounded-full {audit.expiresIn <= 3 ? 'bg-red-100 text-red-700' : audit.expiresIn <= 5 ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}">
                  {audit.expiresIn}d left
                </span>
              </button>
            {/each}
          </div>
          <div class="p-3 border-t border-slate-100 bg-slate-50">
            <button onclick={() => { showHistoryDropdown = false; showHistoryModal = true; }} class="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg">
              View All History <ArrowRight class="h-4 w-4" />
            </button>
          </div>
        </div>
      {/if}
    </div>

    <div class="flex items-center gap-4">
      <div class="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-lg">
        <CreditCard class="h-4 w-4 text-amber-600" />
        <span class="text-sm font-semibold text-amber-800">{credits} Credits</span>
      </div>
      <button class="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm">
        <Upload class="h-4 w-4" /> <span class="text-sm font-medium">Upload New</span>
      </button>
    </div>
  </header>

  <main class="flex-1 flex overflow-hidden">
    <aside class="w-[35%] bg-white border-r border-slate-200 flex flex-col overflow-hidden">
      <div class="p-4 border-b border-slate-200 bg-slate-50">
        <h2 class="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">Analysis Pipeline</h2>
        <div class="flex flex-col gap-3">
          {#each analysisStages as stage, i}
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all {stage.completed ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-500'}">
                {#if stage.completed}<CheckCircle2 class="h-5 w-5" />{:else}<svelte:component this={stage.icon} class="h-4 w-4" />{/if}
              </div>
              <div class="flex-1">
                <p class="text-sm font-medium {stage.completed ? 'text-slate-800' : 'text-slate-500'}">{stage.name}</p>
                {#if i < analysisStages.length - 1}<div class="h-4 w-0.5 ml-3.5 mt-1 transition-colors {stage.completed ? 'bg-blue-600' : 'bg-slate-200'}"></div>{/if}
              </div>
            </div>
          {/each}
        </div>
      </div>

      <div class="p-4 border-b border-slate-200">
        <div class="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200 p-4">
          <div class="flex items-start justify-between mb-3">
            <div class="flex items-center gap-2">
              <div class="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm"><span class="text-lg">&#127469;&#127462;</span></div>
              <div>
                <h3 class="text-sm font-semibold text-slate-800">PT Kreatif Digital</h3>
                <p class="text-xs text-slate-500">Jakarta, Indonesia</p>
              </div>
            </div>
            <span class="px-2 py-1 bg-green-600 text-white text-xs font-semibold rounded-full flex items-center gap-1">
              <Shield class="h-3 w-3" /> VERIFIED
            </span>
          </div>
          <div class="space-y-2">
            <div class="flex items-center gap-2 text-sm text-slate-700"><CheckCircle2 class="h-4 w-4 text-green-600 shrink-0" /><span>NIB Registered</span></div>
            <div class="flex items-center gap-2 text-sm text-slate-700"><CheckCircle2 class="h-4 w-4 text-green-600 shrink-0" /><span>Physical Office Validated</span></div>
            <div class="flex items-center gap-2 text-sm text-slate-700"><CheckCircle2 class="h-4 w-4 text-green-600 shrink-0" /><span>No Scam Reports Found</span></div>
          </div>
        </div>
      </div>

      <div class="flex-1 overflow-y-auto p-4">
        <h2 class="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">Risk Analysis</h2>
        <div class="space-y-3">
          {#each risks as risk}
            <div class="rounded-xl border p-4 transition-all hover:shadow-md cursor-pointer {risk.level === 'high' ? 'bg-red-50 border-red-200' : risk.level === 'medium' ? 'bg-amber-50 border-amber-200' : 'bg-green-50 border-green-200'} {selectedRisk === risk.id ? 'ring-2 ring-blue-600' : ''}">
              <div class="flex items-start justify-between mb-2">
                <div class="flex items-center gap-2">
                  <span class="w-2 h-2 rounded-full shrink-0 mt-1 {risk.level === 'high' ? 'bg-red-500' : risk.level === 'medium' ? 'bg-amber-500' : 'bg-green-500'}"></span>
                  <div>
                    <h3 class="text-sm font-semibold text-slate-800">{risk.title}</h3>
                    <p class="text-xs text-slate-500">Page {risk.page} - {risk.clause}</p>
                  </div>
                </div>
                <span class="px-2 py-0.5 rounded-full text-xs font-medium capitalize {risk.level === 'high' ? 'bg-red-100 text-red-700' : risk.level === 'medium' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}">{risk.level}</span>
              </div>
              <p class="text-sm text-slate-600 mb-3 ml-4">{risk.description}</p>
              <button onclick={() => locateClause(risk.id)} class="flex items-center gap-2 px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-700">
                <MapPin class="h-4 w-4" /> Locate Clause
              </button>
            </div>
          {/each}
        </div>
      </div>

      <div class="p-4 border-t border-slate-200 bg-slate-50">
        <div class="flex items-center gap-2 text-xs text-slate-500">
          <Clock class="h-4 w-4" /><span>Files auto-delete after 7 days. Your data is encrypted and secure.</span>
        </div>
      </div>
    </aside>

    <section class="flex-1 bg-slate-100 flex flex-col overflow-hidden">
      <div class="h-12 bg-white border-b border-slate-200 flex items-center justify-between px-4 shrink-0">
        <div class="flex items-center gap-4">
          <div class="flex items-center gap-2"><FileText class="h-5 w-5 text-slate-400" /><span class="text-sm font-medium text-slate-700">{currentFile}</span></div>
          <span class="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full">100% Analyzed</span>
        </div>
        <div class="flex items-center gap-2">
          <button class="p-2 hover:bg-slate-100 rounded-lg"><Search class="h-4 w-4 text-slate-500" /></button>
          <button class="p-2 hover:bg-slate-100 rounded-lg"><Filter class="h-4 w-4 text-slate-500" /></button>
          <button class="p-2 hover:bg-slate-100 rounded-lg"><Download class="h-4 w-4 text-slate-500" /></button>
          <button class="p-2 hover:bg-slate-100 rounded-lg"><Share2 class="h-4 w-4 text-slate-500" /></button>
          <div class="w-px h-5 bg-slate-200 mx-1"></div>
          <button class="p-2 hover:bg-slate-100 rounded-lg"><MoreVertical class="h-4 w-4 text-slate-500" /></button>
        </div>
      </div>

      <div class="flex-1 overflow-y-auto p-8">
        <div class="max-w-3xl mx-auto">
          <div class="space-y-6">
            {#each pdfSections as section}
              <div id="pdf-{section.title.toLowerCase().replace(/\s+/g, '-')}" class="bg-white rounded-xl shadow-sm border border-slate-200 p-8 transition-all duration-500 {highlightedClause === section.title ? 'ring-2 ring-yellow-400 shadow-xl scale-[1.02]' : ''}">
                {#if highlightedClause === section.title}
                  <div class="absolute inset-0 bg-yellow-400/20 rounded-xl animate-pulse pointer-events-none"></div>
                {/if}
                <div class="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
                  <div class="flex items-center gap-3">
                    <span class="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-sm font-medium text-slate-600">{section.page}</span>
                    <h3 class="text-lg font-semibold text-slate-800">{section.title}</h3>
                  </div>
                  <div class="flex items-center gap-2 text-xs text-slate-400"><Eye class="h-3 w-3" /><span>Page {section.page}</span></div>
                </div>
                <p class="text-slate-600 leading-relaxed text-sm">{section.content}</p>
                {#if section.title.includes("Payment") || section.title.includes("Intellectual") || section.title.includes("Termination")}
                  <div class="mt-4 p-4 rounded-lg border {section.title.includes('Payment') ? 'bg-red-50 border-red-200' : section.title.includes('Intellectual') ? 'bg-amber-50 border-amber-200' : 'bg-blue-50 border-blue-200'}">
                    <div class="flex items-start gap-2">
                      <AlertTriangle class="h-4 w-4 mt-0.5 shrink-0 {section.title.includes('Payment') ? 'text-red-500' : section.title.includes('Intellectual') ? 'text-amber-500' : 'text-blue-500'}" />
                      <div>
                        <p class="text-sm font-medium text-slate-800">AI Detected Risk</p>
                        <p class="text-xs text-slate-600 mt-1">
                          {#if section.title.includes("Payment")}Ambiguous payment terms detected.{:else if section.title.includes("Intellectual")}IP ownership clause requires review.{:else}Short notice period detected.{/if}
                        </p>
                      </div>
                    </div>
                  </div>
                {/if}
              </div>
            {/each}
          </div>
        </div>
      </div>
    </section>
  </main>

  {#if showHistoryModal}
    <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
        <div class="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 class="text-xl font-semibold text-slate-800">Audit History</h2>
          <button onclick={() => (showHistoryModal = false)} class="p-2 hover:bg-slate-100 rounded-lg"><X class="h-5 w-5 text-slate-500" /></button>
        </div>
        <div class="p-6 overflow-y-auto max-h-[60vh]">
          <div class="space-y-3">
            {#each [...recentAudits, { id: 6, name: "Consulting Agreement - Startup Inc", date: "2026-02-05", expiresIn: 11 }, { id: 7, name: "Lease Agreement - Office Space", date: "2026-02-01", expiresIn: 15 }, { id: 8, name: "SaaS Agreement - Tech Platform", date: "2026-01-28", expiresIn: 19 }, { id: 9, name: "Distribution Agreement - Regional", date: "2026-01-25", expiresIn: 22 }] as audit}
              <div class="flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors">
                <div class="flex items-center gap-4">
                  <div class="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm"><FileText class="h-5 w-5 text-slate-400" /></div>
                  <div><p class="text-sm font-medium text-slate-800">{audit.name}</p><p class="text-xs text-slate-500">{formatDate(audit.date)}</p></div>
                </div>
                <div class="flex items-center gap-3">
                  <span class="text-xs px-2 py-1 rounded-full {audit.expiresIn > 7 ? 'bg-green-100 text-green-700 line-through' : 'bg-slate-100 text-slate-500'}">{audit.expiresIn > 7 ? 'Expired' : audit.expiresIn + ' days left'}</span>
                  <button class="p-2 hover:bg-white rounded-lg"><RefreshCw class="h-4 w-4 text-slate-500" /></button>
                  <button class="p-2 hover:bg-white rounded-lg"><Trash2 class="h-4 w-4 text-slate-500" /></button>
                </div>
              </div>
            {/each}
          </div>
        </div>
        <div class="p-6 border-t border-slate-200 bg-slate-50">
          <p class="text-xs text-slate-500 text-center">Files auto-delete after 7 days. Extended storage available with Premium.</p>
        </div>
      </div>
    </div>
  {/if}
</div>

<style>
  ::-webkit-scrollbar { width: 6px; height: 6px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 3px; }
  ::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
  * { transition-property: color, background-color, border-color, opacity, box-shadow, transform; transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1); transition-duration: 150ms; }
</style>
