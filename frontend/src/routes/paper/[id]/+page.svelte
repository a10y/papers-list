<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { fetchPaper } from '$lib/api';
	import type { PaperDetail } from '$lib/types';

	let paper = $state<PaperDetail | null>(null);
	let loading = $state(true);
	let error = $state<string | null>(null);

	function formatAuthors(authors: string[]): string {
		if (authors.length === 0) return 'Unknown authors';
		return authors.join(', ');
	}

	function formatDate(date: string): string {
		if (!date) return '';
		const parsed = new Date(date);
		if (isNaN(parsed.getTime())) return date;
		return parsed.toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		});
	}

	function stripHtml(html: string): string {
		// Create a temporary element to parse HTML
		if (typeof document === 'undefined') return html;
		const temp = document.createElement('div');
		temp.innerHTML = html;
		return temp.textContent || temp.innerText || '';
	}

	onMount(async () => {
		const id = $page.params.id;
		try {
			paper = await fetchPaper(id);
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to load paper';
		} finally {
			loading = false;
		}
	});
</script>

<svelte:head>
	{#if paper}
		<title>{paper.title} - Research Papers</title>
	{/if}
</svelte:head>

<a
	href="/"
	class="inline-flex items-center text-sm text-gray-600 hover:text-blue-600 mb-6 transition-colors"
>
	<svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
		<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
	</svg>
	Back to papers
</a>

{#if loading}
	<div class="flex justify-center items-center py-12">
		<div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
	</div>
{:else if error}
	<div class="bg-red-50 border border-red-200 rounded-lg p-4">
		<p class="text-red-800">{error}</p>
	</div>
{:else if paper}
	<article class="bg-white rounded-lg border border-gray-200 p-6">
		<h1 class="text-2xl font-semibold text-gray-900 mb-4">
			{paper.title}
		</h1>

		<div class="text-gray-600 mb-4">
			{formatAuthors(paper.authors)}
		</div>

		{#if paper.publication || paper.date}
			<div class="text-gray-500 mb-4">
				{#if paper.publication}
					<span class="italic">{paper.publication}</span>
				{/if}
				{#if paper.publication && paper.date}
					<span class="mx-2">&middot;</span>
				{/if}
				{#if paper.date}
					<span>{formatDate(paper.date)}</span>
				{/if}
			</div>
		{/if}

		{#if paper.doi || paper.url}
			<div class="flex gap-4 mb-6">
				{#if paper.doi}
					<a
						href="https://doi.org/{paper.doi}"
						target="_blank"
						rel="noopener noreferrer"
						class="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
					>
						<svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
							/>
						</svg>
						View Paper (DOI)
					</a>
				{:else if paper.url}
					<a
						href={paper.url}
						target="_blank"
						rel="noopener noreferrer"
						class="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
					>
						<svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
							/>
						</svg>
						View Paper
					</a>
				{/if}
			</div>
		{/if}

		{#if paper.tags.length > 0}
			<div class="flex flex-wrap gap-2 mb-6">
				{#each paper.tags as tag}
					<span class="px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded">
						{tag}
					</span>
				{/each}
			</div>
		{/if}

		{#if paper.abstract}
			<section class="mb-6">
				<h2 class="text-lg font-medium text-gray-900 mb-2">Abstract</h2>
				<p class="text-gray-700 leading-relaxed whitespace-pre-wrap">
					{paper.abstract}
				</p>
			</section>
		{/if}

		{#if paper.notes.length > 0}
			<section>
				<h2 class="text-lg font-medium text-gray-900 mb-4">Notes</h2>
				<div class="space-y-4">
					{#each paper.notes as note (note.id)}
						<div class="bg-amber-50 border border-amber-200 rounded-lg p-4">
							<div class="prose prose-sm max-w-none text-gray-700">
								{@html note.content}
							</div>
						</div>
					{/each}
				</div>
			</section>
		{/if}
	</article>
{/if}
