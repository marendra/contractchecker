<script lang="ts">
  import { CheckCircle2, FileText, Search, Shield, AlertTriangle, Loader2 } from "lucide-svelte";

  interface Props {
    status: string;
    onAwaitingConfirmation?: () => void;
  }

  let { status, onAwaitingConfirmation }: Props = $props();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const stages: Array<{ id: string; name: string; icon: any }> = [
    { id: "processing_ocr", name: "Document Scanning & Text Extraction", icon: FileText },
    { id: "awaiting_confirmation", name: "Counterparty Identification", icon: Search },
    { id: "investigating", name: "Deep Background Investigation", icon: Shield },
    { id: "auditing", name: "Clause & Risk Analysis", icon: AlertTriangle },
    { id: "completed", name: "Analysis Complete", icon: CheckCircle2 },
  ];

  const statusOrder = ["processing_ocr", "awaiting_confirmation", "investigating", "auditing", "completed"];

  function getStageState(stageId: string, currentStatus: string): "completed" | "current" | "upcoming" | "processing" {
    const stageIndex = statusOrder.indexOf(stageId);
    const currentIndex = statusOrder.indexOf(currentStatus);

    if (currentStatus === "completed") {
      // When status is completed, all stages including "completed" show as completed
      return "completed";
    }

    if (currentIndex > stageIndex) {
      return "completed";
    } else if (currentIndex === stageIndex) {
      if (stageId === "awaiting_confirmation") {
        return "current";
      } else if (stageId === "processing_ocr" || stageId === "investigating" || stageId === "auditing") {
        return "processing";
      }
    }
    return "upcoming";
  }

  function handleAwaitingClick() {
    if (status === "awaiting_confirmation" && onAwaitingConfirmation) {
      onAwaitingConfirmation();
    }
  }
</script>

<div class="flex flex-col gap-3">
  {#each stages as stage, i}
    {@const stageState = getStageState(stage.id, status)}
    <div class="flex items-center gap-3">
      <button
        type="button"
        class="w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all relative
        {stageState === 'completed' ? 'bg-blue-600 text-white' : ''}
        {stageState === 'current' ? 'bg-amber-500 text-white cursor-pointer hover:bg-amber-600' : ''}
        {stageState === 'processing' ? 'bg-slate-300 text-slate-500 animate-pulse' : ''}
        {stageState === 'upcoming' ? 'bg-slate-200 text-slate-400' : ''}"
        onclick={handleAwaitingClick}
        disabled={stageState !== "current"}
      >
        {#if stageState === "completed"}
          <CheckCircle2 class="h-5 w-5" />
        {:else if stageState === "current"}
          <stage.icon class="h-4 w-4" />
        {:else if stageState === "processing"}
          <Loader2 class="h-4 w-4 animate-spin" />
        {:else}
          <stage.icon class="h-4 w-4" />
        {/if}
      </button>
      <div class="flex-1">
        <p class="text-sm font-medium {stageState === 'completed' ? 'text-slate-800' : ''} {stageState === 'current' ? 'text-amber-700' : ''} {stageState === 'processing' ? 'text-slate-500' : ''} {stageState === 'upcoming' ? 'text-slate-400' : ''}">
          {stage.name}
        </p>
        {#if stageState === "current" && stage.id === "awaiting_confirmation"}
          <p class="text-xs text-amber-600 mt-0.5">Click to confirm entity</p>
        {/if}
        {#if i < stages.length - 1}
          <div class="h-4 w-0.5 ml-3.5 mt-1 transition-colors
            {stageState === 'completed' || stageState === 'current' || stageState === 'processing' ? 'bg-blue-600' : 'bg-slate-200'}"></div>
        {/if}
      </div>
    </div>
  {/each}
</div>