<script lang="ts">
  import {
    FileText, Clock, Shield, AlertTriangle, CheckCircle2,
    Upload, CreditCard, Eye, MapPin, Trash2, Search, Filter,
    MoreVertical, RefreshCw, Download, Share2, X, LogOut, User, Loader2, Check, FileIcon,
  } from "lucide-svelte";
  import { isAuthenticated, currentUser, authStore } from "$lib/stores/auth";
  import { getDbLazy, getFunctionsLazy } from "$lib/firebaseclient";
  import { onMount, onDestroy } from "svelte";
  import { doc, onSnapshot, collection } from "firebase/firestore";
  import { httpsCallable } from "firebase/functions";
  import ContractViewer from "$lib/components/contract-viewer/contract-viewer.svelte";
  import StatusPipeline from "$lib/components/contract-status-pipeline.svelte";
  import CountryConfirmationModal from "$lib/components/country-confirmation-modal.svelte";

  const navItems = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/contracts", label: "My Contracts" },
    { href: "/analysis", label: "Analysis" },
    { href: "/settings", label: "Settings" }
  ];

  async function handleSignOut() {
    console.log("🔓 [DASHBOARD] Signing out...");
    await authStore.signOut();
    document.cookie = "session_uid=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    window.location.href = "/login";
  }

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

  // Contract status for real-time pipeline updates
  let contractStatus = $state<string>("");
  let showFlagsModal = $state(false);
  let flagsModalType = $state<"green" | "red" | null>(null);
  let showCountryModal = $state(false);

  let showHistoryModal = $state(false);
  let isMobileDrawerOpen = $state(false);
  let selectedRisk = $state<number | null>(null);
  let highlightedClause = $state<string | null>(null);
  let credits = $state(0);
  let creditsLoading = $state(true);
  let currentFile = $state("");
  let selectedContractId = $state<string | null>(null);
  let ocrResult = $state("");
  let contractLoading = $state(false);
  let contracts = $state<Array<{ id: string; fileName: string; ocrResult?: string; extractedClientInfo?: { entityName?: string; countryCode?: string } }>>([]);
  let contractsLoading = $state(true);
  let showContractsModal = $state(false);
  let extractedClientInfo = $state<{ entityName?: string; countryCode?: string } | null>(null);
  let dueDiligenceReport = $state<{
    summary?: {
      risk_level?: string;
      verdict?: string;
      company_status?: string;
      financial_health?: string;
      green_flags?: string[];
      red_flags?: string[];
    };
  } | null>(null);

  // Upload modal state
  let showUploadModal = $state(false);
  let selectedFile = $state<File | null>(null);
  let uploading = $state(false);
  let uploadProgress = $state("");
  let uploadError = $state("");
  let uploadSuccess = $state(false);
  let isDragging = $state(false);
  let currentUploadFilename = $state<string | null>(null);

  // Firestore realtime subscription for credits
  let unsubscribe: (() => void) | null = null;
  let unsubscribeContracts: (() => void) | null = null;
  let unsubscribeContractStatus: (() => void) | null = null;

  onMount(async () => {
    const user = $currentUser;
    if (!user?.uid) {
      creditsLoading = false;
      return;
    }

    try {
      const db = await getDbLazy();
      const creditsRef = doc(db, "users", user.uid);

      unsubscribe = onSnapshot(creditsRef, (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          credits = data?.credits ?? 0;
        } else {
          // If no credits document exists, default to 0
          credits = 0;
        }
        creditsLoading = false;
      }, (error) => {
        console.error("Error fetching credits:", error);
        creditsLoading = false;
      });

      // Subscribe to contracts collection
      const contractsRef = collection(db, "users", user.uid, "contracts");
      unsubscribeContracts = onSnapshot(contractsRef, (snapshot) => {
        const newContracts = snapshot.docs.map((doc) => ({
          id: doc.id,
          fileName: doc.data().fileName || "Untitled.pdf",
          ocrResult: doc.data().ocr_result || "",
          extractedClientInfo: doc.data().extracted_client_info || null,
        }));

        // Auto-select if this is the file we just uploaded
        if (currentUploadFilename && !selectedContractId) {
          const uploadedContract = newContracts.find(c => c.fileName === currentUploadFilename);
          if (uploadedContract) {
            currentUploadFilename = null; // Clear after selection
            // Use setTimeout to avoid triggering the subscription again while iterating
            setTimeout(() => selectContract(uploadedContract), 0);
          }
        }

        contracts = newContracts;
        contractsLoading = false;
      }, (error) => {
        console.error("Error fetching contracts:", error);
        contractsLoading = false;
      });
    } catch (error) {
      console.error("Error initializing credits subscription:", error);
      creditsLoading = false;
    }
  });

  onDestroy(() => {
    if (unsubscribe) {
      unsubscribe();
    }
    if (unsubscribeContracts) {
      unsubscribeContracts();
    }
    if (unsubscribeContractStatus) {
      unsubscribeContractStatus();
    }
  });

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

    // Close mobile drawer if open to allow user to see the highlighted clause
    isMobileDrawerOpen = false;

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

  function getProgressPercentage(status: string): number {
    switch (status) {
      case "processing_ocr":
        return 20;
      case "awaiting_confirmation":
        return 40;
      case "investigating":
        return 60;
      case "auditing":
        return 80;
      case "completed":
        return 100;
      default:
        return 0;
    }
  }

  function openUploadModal() {
    showUploadModal = true;
    selectedFile = null;
    uploadError = "";
    uploadSuccess = false;
    uploadProgress = "";
  }

  function closeUploadModal() {
    showUploadModal = false;
    selectedFile = null;
    uploadError = "";
    uploadSuccess = false;
    uploadProgress = "";
  }

  function selectContract(contract: { id: string; fileName: string; ocrResult?: string; extractedClientInfo?: { entityName?: string; countryCode?: string } }) {
    currentFile = contract.fileName;
    selectedContractId = contract.id;
    ocrResult = contract.ocrResult || "";
    extractedClientInfo = contract.extractedClientInfo || null;
    contractLoading = false;
    showContractsModal = false;

    // Subscribe to contract status updates
    if (unsubscribeContractStatus) {
      unsubscribeContractStatus();
    }

    const user = $currentUser;
    if (user?.uid && contract.id) {
      getDbLazy().then((db) => {
        const contractRef = doc(db, "users", user.uid, "contracts", contract.id);
        unsubscribeContractStatus = onSnapshot(contractRef, (docSnap) => {
          if (docSnap.exists()) {
            contractStatus = docSnap.data()?.status || "";
            // Also update extractedClientInfo if available in real-time
            const ecInfo = docSnap.data()?.extracted_client_info;
            if (ecInfo) {
              extractedClientInfo = {
                entityName: ecInfo.entityName,
                countryCode: ecInfo.countryCode,
              };
            }
            // Also update due diligence report if available
            const ddReport = docSnap.data()?.due_diligence_report;
            if (ddReport) {
              dueDiligenceReport = ddReport;
            }
          }
        });
      });
    }
  }

  function handleFileSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) return;

    // Filter only PDF files
    if (file.type !== "application/pdf") {
      uploadError = "Only PDF files are allowed";
      selectedFile = null;
      return;
    }

    uploadError = "";
    selectedFile = file;
  }

  function handleDragEnter(event: DragEvent) {
    event.preventDefault();
    isDragging = true;
  }

  function handleDragOver(event: DragEvent) {
    event.preventDefault();
    isDragging = true;
  }

  function handleDragLeave(event: DragEvent) {
    event.preventDefault();
    isDragging = false;
  }

  function handleDrop(event: DragEvent) {
    event.preventDefault();
    isDragging = false;

    const files = event.dataTransfer?.files;
    if (!files || files.length === 0) return;

    const file = files[0];

    // Filter only PDF files
    if (file.type !== "application/pdf") {
      uploadError = "Only PDF files are allowed";
      selectedFile = null;
      return;
    }

    uploadError = "";
    selectedFile = file;
  }

  async function handleUpload() {
    if (!selectedFile) return;

    uploading = true;
    uploadError = "";
    uploadProgress = "Getting upload URL...";
    currentUploadFilename = selectedFile.name;

    try {
      const functions = await getFunctionsLazy();
      const generateUploadUrl = httpsCallable(functions, "generateUploadUrl");

      const result = await generateUploadUrl({
        filename: selectedFile.name,
        contentType: selectedFile.type,
      });

      const data = result.data as {
        uploadUrl: string;
        downloadUrl: string;
      };

      uploadProgress = "Uploading file...";

      // Upload to the signed URL
      await fetch(data.uploadUrl, {
        method: "PUT",
        body: selectedFile,
        headers: {
          "Content-Type": selectedFile.type,
        },
      });

      uploadProgress = "Processing...";
      uploadSuccess = true;

      // Close modal immediately and let Firestore subscription handle auto-selection
      setTimeout(() => {
        closeUploadModal();
      }, 800);
    } catch (error) {
      console.error("Upload error:", error);
      uploadError = "Failed to upload file. Please try again.";
      currentUploadFilename = null;
    } finally {
      uploading = false;
    }
  }
</script>

<div class="h-screen w-full bg-slate-50 overflow-hidden flex flex-col font-sans">
  <header class="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0">
    <div class="flex items-center gap-6">
      <a href="/dashboard" class="flex items-center gap-2">
        <img src="https://storage.contractchecker.net/logo-small.webp" alt="ContractChecker Logo" class="h-8 w-auto" />
      </a>

      <nav class="hidden md:flex items-center gap-6">
        {#each navItems as item}
          <a href={item.href} class="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
            {item.label}
          </a>
        {/each}
      </nav>
    </div>

    <div class="flex items-center gap-4">
      <div class="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-lg">
        <CreditCard class="h-4 w-4 text-amber-600" />
        {#if creditsLoading}
          <span class="text-sm font-semibold text-amber-800">...</span>
        {:else}
          <span class="text-sm font-semibold text-amber-800">{credits} Credits</span>
        {/if}
      </div>
      <button onclick={openUploadModal} class="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm">
        <Upload class="h-4 w-4" /> <span class="text-sm font-medium">Upload New</span>
      </button>

      <div class="flex items-center gap-2 pl-4 border-l border-slate-200">
        <div class="hidden sm:flex items-center gap-2 text-sm">
          <User class="h-4 w-4 text-slate-500" />
          <span class="text-slate-600">{$currentUser?.displayName || $currentUser?.email?.split("@")[0]}</span>
        </div>
        <button onclick={handleSignOut} class="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors">
          <LogOut class="h-4 w-4" />
          <span class="hidden sm:inline">Sign Out</span>
        </button>
      </div>
    </div>
  </header>

  <main class="flex-1 flex overflow-hidden">
    <!-- Mobile trigger button for risks drawer -->
    <button
      onclick={() => isMobileDrawerOpen = true}
      class="md:hidden fixed bottom-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg"
    >
      <AlertTriangle class="h-5 w-5" />
      <span class="text-sm font-medium">{risks.length} Risks Found</span>
    </button>

    <aside class="hidden md:flex w-[35%] bg-white border-r border-slate-200 flex flex-col overflow-hidden">
      <div class="p-4 border-b border-slate-200 bg-slate-50">
        <h2 class="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">Analysis Pipeline</h2>
        {#if selectedContractId && contractStatus}
          <StatusPipeline
            status={contractStatus}
            onAwaitingConfirmation={() => showCountryModal = true}
          />
        {:else}
          <p class="text-sm text-slate-500 italic">Select a contract to view pipeline</p>
        {/if}
      </div>

      <div class="p-4 border-b border-slate-200">
        {#if extractedClientInfo?.entityName}
          <div class="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200 p-4">
            <div class="flex items-start justify-between mb-3">
              <div>
                <div class="flex items-center gap-2">
                  <h3 class="text-sm font-semibold text-slate-800">{extractedClientInfo.entityName}</h3>
                  {#if contractStatus === "investigating"}
                    <span class="px-2 py-0.5 bg-amber-500 text-white text-xs font-medium rounded-full animate-pulse">
                      INVESTIGATING
                    </span>
                  {:else if dueDiligenceReport?.summary}
                    <span class="px-2 py-0.5 {dueDiligenceReport.summary.risk_level === 'HIGH' ? 'bg-red-100 text-red-700' : dueDiligenceReport.summary.risk_level === 'MEDIUM' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'} text-xs font-medium rounded-full">
                      {dueDiligenceReport.summary.risk_level}
                    </span>
                  {/if}
                </div>
                <p class="text-xs text-slate-500">{extractedClientInfo.countryCode || ""}</p>
              </div>
              {#if contractStatus === "investigating"}
                <span class="px-2 py-1 bg-amber-500 text-white text-xs font-semibold rounded-full flex items-center gap-1 animate-pulse">
                  <Loader2 class="h-3 w-3 animate-spin" /> INVESTIGATING
                </span>
              {:else if dueDiligenceReport?.summary}
                <span class="px-2 py-1 bg-green-600 text-white text-xs font-semibold rounded-full flex items-center gap-1">
                  <Shield class="h-3 w-3" /> VERIFIED
                </span>
              {:else}
                <span class="px-2 py-1 bg-slate-400 text-white text-xs font-semibold rounded-full flex items-center gap-1">
                  <Shield class="h-3 w-3" /> PENDING
                </span>
              {/if}
            </div>

            {#if dueDiligenceReport?.summary}
              <div class="space-y-2 mb-3">
                <p class="text-sm text-slate-700 italic">"{dueDiligenceReport.summary.verdict}"</p>
                <p class="text-xs text-slate-600">{dueDiligenceReport.summary.company_status}</p>
                <p class="text-xs text-slate-600">{dueDiligenceReport.summary.financial_health}</p>
              </div>

              <div class="flex items-center gap-2">
                <button
                  onclick={() => { showFlagsModal = true; flagsModalType = "green"; }}
                  class="flex items-center gap-1.5 px-3 py-1.5 bg-green-100 hover:bg-green-200 text-green-700 text-xs font-medium rounded-full transition-colors"
                >
                  <CheckCircle2 class="h-4 w-4" />
                  {dueDiligenceReport.summary.green_flags?.length || 0} Green Flags
                </button>
                {#if dueDiligenceReport.summary.red_flags && dueDiligenceReport.summary.red_flags.length > 0}
                  <button
                    onclick={() => { showFlagsModal = true; flagsModalType = "red"; }}
                    class="flex items-center gap-1.5 px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 text-xs font-medium rounded-full transition-colors"
                  >
                    <AlertTriangle class="h-4 w-4" />
                    {dueDiligenceReport.summary.red_flags.length} Red Flags
                  </button>
                {/if}
              </div>
            {/if}
          </div>
        {:else}
          <div class="bg-slate-100 rounded-xl border border-slate-200 p-4 flex items-center justify-center">
            <p class="text-sm text-slate-500 italic">No company detected yet</p>
          </div>
        {/if}
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
          {#if currentUploadFilename}
            <div class="flex items-center gap-2">
              <Loader2 class="h-5 w-5 text-amber-500 animate-spin" />
              <span class="text-sm font-medium text-slate-700">Processing {currentUploadFilename}...</span>
            </div>
            <span class="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">Uploading</span>
          {:else if currentFile}
            <div class="flex items-center gap-2"><FileText class="h-5 w-5 text-slate-400" /><span class="text-sm font-medium text-slate-700">{currentFile}</span></div>
            <span class="px-2 py-0.5 {contractStatus === 'completed' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'} text-xs font-medium rounded-full">
              {getProgressPercentage(contractStatus)}% Analyzed
            </span>
          {:else}
            <button
              onclick={() => showContractsModal = true}
              class="flex items-center gap-2 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm font-medium text-slate-600 transition-colors"
            >
              <FileText class="h-4 w-4" />
              Select a contract
            </button>
          {/if}
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

      <div class="flex-1 overflow-hidden p-6">
        {#if currentUploadFilename}
          <div class="h-full flex flex-col items-center justify-center text-center">
            <div class="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-4">
              <Loader2 class="h-8 w-8 text-amber-500 animate-spin" />
            </div>
            <h3 class="text-lg font-semibold text-slate-800 mb-2">Processing Upload</h3>
            <p class="text-sm text-slate-500 max-w-sm">
              Your contract <span class="font-medium">{currentUploadFilename}</span> is being uploaded and queued for OCR processing. This may take a few moments.
            </p>
          </div>
        {:else}
          <ContractViewer
            ocrResult={ocrResult}
            contractNumber={selectedContractId || ""}
            isLoading={contractLoading}
          />
        {/if}
      </div>
    </section>

    <!-- Mobile Bottom Sheet -->
    {#if isMobileDrawerOpen}
      <div
        class="md:hidden fixed inset-0 bg-black/50 z-40"
        role="button"
        tabindex="0"
        onclick={() => isMobileDrawerOpen = false}
        onkeydown={(e) => e.key === 'Escape' && (isMobileDrawerOpen = false)}
      ></div>
      <div class="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-2xl shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] max-h-[80vh] flex flex-col">
        <!-- Drag handle -->
        <div class="flex justify-center pt-3 pb-2">
          <div class="w-12 h-1.5 bg-slate-300 rounded-full"></div>
        </div>

        <!-- Header with close button -->
        <div class="flex items-center justify-between px-4 pb-3 border-b border-slate-100">
          <div class="flex items-center gap-2">
            <AlertTriangle class="h-5 w-5 text-amber-500" />
            <span class="font-semibold text-slate-800">{risks.length} Risks Detected</span>
          </div>
          <button
            onclick={() => isMobileDrawerOpen = false}
            class="p-2 hover:bg-slate-100 rounded-full"
          >
            <X class="h-5 w-5 text-slate-500" />
          </button>
        </div>

        <!-- Scrollable content -->
        <div class="flex-1 overflow-y-auto p-4 space-y-4">
          <!-- Company Card (Mobile) -->
          {#if extractedClientInfo?.entityName}
            <div class="bg-slate-50 rounded-xl p-4">
              <div class="flex items-center justify-between mb-2">
                <div class="flex items-center gap-2">
                  <h3 class="text-sm font-semibold text-slate-800">{extractedClientInfo.entityName}</h3>
                  {#if contractStatus === "investigating"}
                    <span class="px-2 py-0.5 bg-amber-500 text-white text-xs font-medium rounded-full animate-pulse">
                      INVESTIGATING
                    </span>
                  {:else if dueDiligenceReport?.summary}
                    <span class="px-2 py-0.5 bg-slate-200 text-slate-600 text-xs font-medium rounded-full">
                      {dueDiligenceReport.summary.risk_level}
                    </span>
                  {/if}
                </div>
                <button onclick={() => isMobileDrawerOpen = false} class="p-1">
                  <X class="h-4 w-4 text-slate-400" />
                </button>
              </div>
              {#if dueDiligenceReport?.summary}
                <p class="text-xs text-slate-600 mb-1">{dueDiligenceReport.summary.company_status}</p>
                <p class="text-xs text-slate-600 mb-2">{dueDiligenceReport.summary.financial_health}</p>
                <div class="flex items-center gap-2">
                  <button
                    onclick={() => { showFlagsModal = true; flagsModalType = "green"; }}
                    class="flex items-center gap-1.5 px-3 py-1.5 bg-green-100 hover:bg-green-200 text-green-700 text-xs font-medium rounded-full transition-colors"
                  >
                    <CheckCircle2 class="h-4 w-4" />
                    {dueDiligenceReport.summary.green_flags?.length || 0} Green
                  </button>
                  {#if dueDiligenceReport.summary.red_flags && dueDiligenceReport.summary.red_flags.length > 0}
                    <button
                      onclick={() => { showFlagsModal = true; flagsModalType = "red"; }}
                      class="flex items-center gap-1.5 px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 text-xs font-medium rounded-full transition-colors"
                    >
                      <AlertTriangle class="h-4 w-4" />
                      {dueDiligenceReport.summary.red_flags.length} Red
                    </button>
                  {/if}
                </div>
              {:else if contractStatus === "investigating"}
                <p class="text-xs text-slate-500">Entity investigation in progress...</p>
              {/if}
            </div>
          {/if}

          <!-- Analysis Pipeline (Mobile) -->
          <div class="bg-slate-50 rounded-xl p-4">
            <h2 class="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Analysis Pipeline</h2>
            {#if selectedContractId && contractStatus}
              <StatusPipeline
                status={contractStatus}
                onAwaitingConfirmation={() => showCountryModal = true}
              />
            {:else}
              <p class="text-xs text-slate-500 italic">Select a contract to view pipeline</p>
            {/if}
          </div>

          <!-- Risk Analysis (Mobile) -->
          <div>
            <h2 class="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Risk Analysis</h2>
            <div class="space-y-3">
              {#each risks as risk}
                <div class="rounded-xl border p-3 transition-all {risk.level === 'high' ? 'bg-red-50 border-red-200' : risk.level === 'medium' ? 'bg-amber-50 border-amber-200' : 'bg-green-50 border-green-200'} {selectedRisk === risk.id ? 'ring-2 ring-blue-600' : ''}">
                  <div class="flex items-start justify-between mb-2">
                    <div class="flex items-center gap-2">
                      <span class="w-2 h-2 rounded-full shrink-0 mt-1 {risk.level === 'high' ? 'bg-red-500' : risk.level === 'medium' ? 'bg-amber-500' : 'bg-green-500'}"></span>
                      <div>
                        <h3 class="text-sm font-semibold text-slate-800">{risk.title}</h3>
                        <p class="text-xs text-slate-500">Page {risk.page}</p>
                      </div>
                    </div>
                    <span class="px-2 py-0.5 rounded-full text-xs font-medium capitalize {risk.level === 'high' ? 'bg-red-100 text-red-700' : risk.level === 'medium' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}">{risk.level}</span>
                  </div>
                  <p class="text-xs text-slate-600 mb-2">{risk.description}</p>
                  <button
                    onclick={() => locateClause(risk.id)}
                    class="flex items-center gap-1 px-2 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 w-full justify-center"
                  >
                    <MapPin class="h-3 w-3" /> Locate in Document
                  </button>
                </div>
              {/each}
            </div>
          </div>
        </div>
      </div>
    {/if}
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

  <!-- Contracts Modal -->
  {#if showContractsModal}
    <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
        <div class="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 class="text-xl font-semibold text-slate-800">Select Contract</h2>
          <button onclick={() => (showContractsModal = false)} class="p-2 hover:bg-slate-100 rounded-lg">
            <X class="h-5 w-5 text-slate-500" />
          </button>
        </div>
        <div class="p-6 overflow-y-auto max-h-[60vh]">
          {#if contractsLoading}
            <div class="flex items-center justify-center py-8">
              <Loader2 class="h-6 w-6 animate-spin text-slate-400" />
              <span class="ml-2 text-sm text-slate-500">Loading contracts...</span>
            </div>
          {:else if contracts.length === 0}
            <div class="flex flex-col items-center justify-center py-8 text-center">
              <FileText class="h-12 w-12 text-slate-300 mb-3" />
              <p class="text-slate-600 font-medium">No contracts found</p>
              <p class="text-sm text-slate-400 mt-1">Upload a contract to get started</p>
            </div>
          {:else}
            <div class="space-y-3">
              {#each contracts as contract}
                <button
                  onclick={() => selectContract(contract)}
                  class="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors text-left"
                >
                  <div class="flex items-center gap-4">
                    <div class="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
                      <FileText class="h-5 w-5 text-slate-400" />
                    </div>
                    <div>
                      <p class="text-sm font-medium text-slate-800">{contract.fileName}</p>
                    </div>
                  </div>
                  <Check class="h-4 w-4 text-slate-300" />
                </button>
              {/each}
            </div>
          {/if}
        </div>
        <div class="p-6 border-t border-slate-200 bg-slate-50">
          <p class="text-xs text-slate-500 text-center">Select a contract to view its analysis</p>
        </div>
      </div>
    </div>
  {/if}

  <!-- Upload Modal -->
  {#if showUploadModal}
    <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div class="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 class="text-xl font-semibold text-slate-800">Upload Contract</h2>
          <button onclick={closeUploadModal} class="p-2 hover:bg-slate-100 rounded-lg">
            <X class="h-5 w-5 text-slate-500" />
          </button>
        </div>

        <div class="p-6">
          {#if uploadSuccess}
            <div class="flex flex-col items-center justify-center py-8">
              <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <Check class="h-8 w-8 text-green-600" />
              </div>
              <p class="text-lg font-semibold text-slate-800">Upload Complete!</p>
              <p class="text-sm text-slate-500 mt-1">Your contract is being processed.</p>
            </div>
          {:else}
            <div class="space-y-4">
              {#if !selectedFile}
                <div
                  class="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-xl cursor-pointer transition-colors {isDragging ? 'border-blue-500 bg-blue-50' : 'border-slate-300 hover:bg-slate-50 hover:border-slate-400'}"
                  ondragenter={handleDragEnter}
                  ondragover={handleDragOver}
                  ondragleave={handleDragLeave}
                  ondrop={handleDrop}
                  onclick={() => document.getElementById('file-input')?.click()}
                  role="button"
                  tabindex="0"
                  onkeydown={(e) => e.key === 'Enter' && document.getElementById('file-input')?.click()}
                >
                  <div class="flex flex-col items-center justify-center pt-5 pb-6">
                    <FileIcon class="h-12 w-12 mb-3 {isDragging ? 'text-blue-500' : 'text-slate-400'}" />
                    <p class="mb-2 text-sm {isDragging ? 'text-blue-700' : 'text-slate-500'}"><span class="font-semibold">Click to upload</span> or drag and drop</p>
                    <p class="text-xs {isDragging ? 'text-blue-600' : 'text-slate-400'}">PDF files only</p>
                  </div>
                  <input id="file-input" type="file" accept=".pdf,application/pdf" class="hidden" onchange={handleFileSelect} />
                </div>
              {:else}
                <div class="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <div class="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                    <FileText class="h-6 w-6 text-red-600" />
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium text-slate-800 truncate">{selectedFile.name}</p>
                    <p class="text-xs text-slate-500">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                  <button onclick={() => selectedFile = null} class="p-1 hover:bg-slate-200 rounded-lg">
                    <X class="h-4 w-4 text-slate-500" />
                  </button>
                </div>
              {/if}

              {#if uploadError}
                <p class="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{uploadError}</p>
              {/if}

              {#if uploadProgress}
                <p class="text-sm text-slate-600 flex items-center gap-2">
                  <Loader2 class="h-4 w-4 animate-spin" />
                  {uploadProgress}
                </p>
              {/if}
            </div>
          {/if}
        </div>

        {#if !uploadSuccess}
          <div class="p-6 border-t border-slate-200 bg-slate-50 flex justify-end gap-3">
            <button onclick={closeUploadModal} class="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
              Cancel
            </button>
            <button
              onclick={handleUpload}
              disabled={!selectedFile || uploading}
              class="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {#if uploading}
                <Loader2 class="h-4 w-4 animate-spin" />
              {:else}
                <Upload class="h-4 w-4" />
              {/if}
              Upload
            </button>
          </div>
        {/if}
      </div>
    </div>
  {/if}

  <!-- Flags Modal -->
  {#if showFlagsModal && dueDiligenceReport?.summary}
    <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div class="flex items-center justify-between p-6 border-b border-slate-200">
          <div class="flex items-center gap-2">
            {#if flagsModalType === "green"}
              <CheckCircle2 class="h-5 w-5 text-green-600" />
              <h2 class="text-xl font-semibold text-slate-800">Green Flags</h2>
            {:else}
              <AlertTriangle class="h-5 w-5 text-red-600" />
              <h2 class="text-xl font-semibold text-slate-800">Red Flags</h2>
            {/if}
          </div>
          <button onclick={() => { showFlagsModal = false; flagsModalType = null; }} class="p-2 hover:bg-slate-100 rounded-lg">
            <X class="h-5 w-5 text-slate-500" />
          </button>
        </div>
        <div class="p-6 overflow-y-auto max-h-[60vh]">
          <div class="space-y-3">
            {#if flagsModalType === "green" && dueDiligenceReport.summary.green_flags}
              {#each dueDiligenceReport.summary.green_flags as flag}
                <div class="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                  <CheckCircle2 class="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                  <p class="text-sm text-slate-700">{flag}</p>
                </div>
              {/each}
            {:else if flagsModalType === "red" && dueDiligenceReport.summary.red_flags}
              {#each dueDiligenceReport.summary.red_flags as flag}
                <div class="flex items-start gap-3 p-3 bg-red-50 rounded-lg border border-red-200">
                  <AlertTriangle class="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                  <p class="text-sm text-slate-700">{flag}</p>
                </div>
              {/each}
            {/if}
          </div>
        </div>
        <div class="p-6 border-t border-slate-200 bg-slate-50">
          <button
            onclick={() => { showFlagsModal = false; flagsModalType = null; }}
            class="w-full px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  {/if}

  <!-- Country Confirmation Modal -->
  <CountryConfirmationModal
    isOpen={showCountryModal}
    onClose={() => showCountryModal = false}
    contractId={selectedContractId || ""}
    extractedClientInfo={extractedClientInfo ?? undefined}
    onConfirmed={() => {
      console.log("Entity confirmed successfully");
    }}
  />
</div>

<style>
  ::-webkit-scrollbar { width: 6px; height: 6px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 3px; }
  ::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
  * { transition-property: color, background-color, border-color, opacity, box-shadow, transform; transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1); transition-duration: 150ms; }
</style>
