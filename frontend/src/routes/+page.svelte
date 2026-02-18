<script lang="ts">
	import { onMount } from 'svelte';
	import { fetchPapers } from '$lib/api';
	import type { Paper } from '$lib/types';
	import PaperCard from '$lib/components/PaperCard.svelte';

	let papers = $state<Paper[]>([]);
	let loading = $state(true);
	let error = $state<string | null>(null);

	onMount(async () => {
		try {
			papers = await fetchPapers();
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to load papers';
		} finally {
			loading = false;
		}
	});
</script>

{#if loading}
	<div class="flex justify-center items-center py-12">
		<div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
	</div>
{:else if error}
	<div class="bg-red-50 border border-red-200 rounded-lg p-4">
		<p class="text-red-800">{error}</p>
	</div>
{:else if papers.length === 0}
	<div class="text-center py-12">
		<p class="text-gray-500">No papers found in this collection.</p>
	</div>
{:else}
	<div class="space-y-4">
		{#each papers as paper (paper.id)}
			<PaperCard {paper} />
		{/each}
	</div>
{/if}
