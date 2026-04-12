<script lang="ts">
  import { X, Globe, Loader2 } from "lucide-svelte";
  import { getFunctions } from "firebase/functions";
  import { httpsCallable } from "firebase/functions";

  interface ExtractedClientInfo {
    entityName?: string;
    countryCode?: string;
  }

  interface Props {
    isOpen: boolean;
    onClose: () => void;
    contractId: string;
    extractedClientInfo?: ExtractedClientInfo;
    onConfirmed: () => void;
  }

  let { isOpen, onClose, contractId, extractedClientInfo, onConfirmed }: Props = $props();

  let editedEntityName = $state("");
  let selectedCountryCode = $state("");
  let confirming = $state(false);
  let error = $state("");

  // Sync local state when modal opens or extractedClientInfo changes
  $effect(() => {
    if (isOpen) {
      editedEntityName = extractedClientInfo?.entityName || "";
      selectedCountryCode = extractedClientInfo?.countryCode || "";
      error = "";
    }
  });

  const countries = [
    { code: "US", name: "United States", flag: "🇺🇸" },
    { code: "UK", name: "United Kingdom", flag: "🇬🇧" },
    { code: "CAN", name: "Canada", flag: "🇨🇦" },
    { code: "AUS", name: "Australia", flag: "🇦🇺" },
  ];

  function toggleCountry(code: string) {
    selectedCountryCode = code;
  }

  async function handleConfirm() {
    if (!selectedCountryCode) {
      error = "Please select a country";
      return;
    }

    if (!editedEntityName.trim()) {
      error = "Please enter the entity name";
      return;
    }

    confirming = true;
    error = "";

    try {
      const functions = getFunctions();
      const confirmContract = httpsCallable(functions, "confirmContract");

      await confirmContract({
        contractId,
        entityName: editedEntityName.trim(),
        countryCode: selectedCountryCode,
      });

      onConfirmed();
      onClose();
    } catch (err) {
      console.error("Error confirming entity:", err);
      error = "Failed to confirm. Please try again.";
    } finally {
      confirming = false;
    }
  }

  function handleClose() {
    if (!confirming) {
      onClose();
    }
  }
</script>

{#if isOpen}
  <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
      <div class="flex items-center justify-between p-6 border-b border-slate-200">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
            <Globe class="h-5 w-5 text-amber-600" />
          </div>
          <div>
            <h2 class="text-lg font-semibold text-slate-800">Confirm Entity</h2>
            <p class="text-xs text-slate-500">Verify counterparty details</p>
          </div>
        </div>
        <button
          onclick={handleClose}
          disabled={confirming}
          class="p-2 hover:bg-slate-100 rounded-lg disabled:opacity-50"
        >
          <X class="h-5 w-5 text-slate-500" />
        </button>
      </div>

      <div class="p-6 space-y-4">
        <div>
          <label for="entityName" class="block text-sm font-medium text-slate-700 mb-1.5">
            Entity Name
          </label>
          <input
            id="entityName"
            type="text"
            bind:value={editedEntityName}
            placeholder="Enter entity name"
            class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <span class="block text-sm font-medium text-slate-700 mb-2">
            Country of Operation
          </span>
          <div class="grid grid-cols-2 gap-3">
            {#each countries as country}
              <button
                type="button"
                onclick={() => toggleCountry(country.code)}
                class="flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left
                  {selectedCountryCode === country.code
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-slate-200 bg-white hover:border-slate-300'}"
              >
                <span class="text-2xl">{country.flag}</span>
                <div>
                  <p class="text-sm font-medium text-slate-800">{country.name}</p>
                  <p class="text-xs text-slate-500">{country.code}</p>
                </div>
                {#if selectedCountryCode === country.code}
                  <div class="ml-auto w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                    <span class="text-white text-xs">✓</span>
                  </div>
                {/if}
              </button>
            {/each}
          </div>
        </div>

        {#if error}
          <p class="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{error}</p>
        {/if}
      </div>

      <div class="p-6 border-t border-slate-200 bg-slate-50 flex justify-end gap-3">
        <button
          onclick={handleClose}
          disabled={confirming}
          class="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          onclick={handleConfirm}
          disabled={confirming || !selectedCountryCode || !editedEntityName.trim()}
          class="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {#if confirming}
            <Loader2 class="h-4 w-4 animate-spin" />
            Confirming...
          {:else}
            Confirm & Investigate
          {/if}
        </button>
      </div>
    </div>
  </div>
{/if}