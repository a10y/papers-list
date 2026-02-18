<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>Research Papers</title>
</svelte:head>

<div class="min-h-screen bg-gray-50">
	<header class="bg-white border-b border-gray-200">
		<div class="max-w-4xl mx-auto px-4 py-4">
			<a href="/" class="text-xl font-semibold text-gray-900 hover:text-blue-600 transition-colors">
				Research Papers
			</a>
		</div>
	</header>

	<main class="max-w-4xl mx-auto px-4 py-8">
		{@render children()}
	</main>
</div>
