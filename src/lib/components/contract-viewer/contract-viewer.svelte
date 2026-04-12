<script lang="ts">
  import { FileText, Eye, Loader2 } from "lucide-svelte";

  interface Props {
    ocrResult: string;
    contractNumber?: string;
    isLoading?: boolean;
  }

  let { ocrResult, contractNumber = "", isLoading = false }: Props = $props();

  // Parse content into sections based on ### markers
  function parseContent(content: string): Array<{ title: string; content: string }> {
    if (!content) return [];

    const sections: Array<{ title: string; content: string }> = [];
    const parts = content.split(/(?=###\s)/);

    for (const part of parts) {
      const trimmed = part.trim();
      if (!trimmed) continue;

      if (trimmed.startsWith("###")) {
        // Extract title and content
        const titleMatch = trimmed.match(/^###\s*(.+?)(?:\n|$)/);
        const title = titleMatch ? titleMatch[1].trim() : "Untitled Section";
        const body = trimmed.replace(/^###\s*.+?(?:\n|$)/, "").trim();
        sections.push({ title, content: body });
      } else {
        // First section before any ### markers
        sections.push({ title: "Introduction", content: trimmed });
      }
    }

    return sections;
  }

  let sections = $derived(parseContent(ocrResult));
</script>

<div class="flex flex-col h-full">
  {#if isLoading}
    <div class="flex-1 flex items-center justify-center">
      <div class="flex flex-col items-center gap-3">
        <Loader2 class="h-8 w-8 animate-spin text-slate-400" />
        <p class="text-sm text-slate-500">Loading contract content...</p>
      </div>
    </div>
  {:else if !ocrResult}
    <div class="flex-1 flex items-center justify-center">
      <div class="flex flex-col items-center gap-3 text-center">
        <div class="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
          <FileText class="h-8 w-8 text-slate-400" />
        </div>
        <p class="text-slate-600 font-medium">No contract selected</p>
        <p class="text-sm text-slate-400">Select a contract from the list to view its content</p>
      </div>
    </div>
  {:else}
    <!-- Header -->
    <div class="mb-6">
      {#if contractNumber}
        <div class="flex items-center gap-2 text-xs text-slate-500 mb-2">
          <span>Contract #{contractNumber}</span>
        </div>
      {/if}
      <div class="flex items-center gap-2">
        <FileText class="h-5 w-5 text-slate-400" />
        <span class="text-sm font-medium text-slate-700">Contract Content</span>
      </div>
    </div>

    <!-- Content sections -->
    <div class="flex-1 overflow-y-auto space-y-6">
      {#each sections as section, i}
        <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div class="flex items-center gap-3 mb-4 pb-4 border-b border-slate-100">
            <span class="w-7 h-7 bg-slate-100 rounded-lg flex items-center justify-center text-xs font-medium text-slate-600">
              {i + 1}
            </span>
            <h3 class="text-base font-semibold text-slate-800">{section.title}</h3>
          </div>
          <div class="prose prose-sm max-w-none text-slate-600">
            <p class="whitespace-pre-wrap leading-relaxed">{section.content}</p>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>

<style>
  .prose p {
    margin-bottom: 0.75rem;
  }
  .prose p:last-child {
    margin-bottom: 0;
  }
</style>
