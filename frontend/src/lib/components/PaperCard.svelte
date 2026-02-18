<script lang="ts">
	import type { Paper } from '$lib/types';

	interface Props {
		paper: Paper;
	}

	let { paper }: Props = $props();

	function formatAuthors(authors: string[]): string {
		if (authors.length === 0) return 'Unknown authors';
		if (authors.length === 1) return authors[0];
		if (authors.length === 2) return authors.join(' & ');
		return `${authors[0]} et al.`;
	}

	function formatDate(date: string): string {
		if (!date) return '';
		// Try to parse and format the date
		const parsed = new Date(date);
		if (isNaN(parsed.getTime())) return date;
		return parsed.getFullYear().toString();
	}
</script>

<a
	href="/paper/{paper.id}"
	class="block bg-white rounded-lg border border-gray-200 p-5 hover:border-blue-300 hover:shadow-md transition-all"
>
	<h2 class="text-lg font-medium text-gray-900 mb-2 line-clamp-2">
		{paper.title}
	</h2>

	<p class="text-sm text-gray-600 mb-2">
		{formatAuthors(paper.authors)}
	</p>

	{#if paper.publication || paper.date}
		<p class="text-sm text-gray-500 mb-3">
			{#if paper.publication}
				<span class="italic">{paper.publication}</span>
			{/if}
			{#if paper.publication && paper.date}
				<span class="mx-1">&middot;</span>
			{/if}
			{#if paper.date}
				<span>{formatDate(paper.date)}</span>
			{/if}
		</p>
	{/if}

	{#if paper.abstract}
		<p class="text-sm text-gray-700 line-clamp-3">
			{paper.abstract}
		</p>
	{/if}

	{#if paper.doi}
		<div class="mt-3">
			<span class="inline-flex items-center text-xs text-blue-600">
				DOI: {paper.doi}
			</span>
		</div>
	{/if}
</a>

<style>
	.line-clamp-2 {
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	.line-clamp-3 {
		display: -webkit-box;
		-webkit-line-clamp: 3;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
</style>
