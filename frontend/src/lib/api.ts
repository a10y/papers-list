import type { Paper, PaperDetail } from './types';

const API_BASE = '/api';

export async function fetchPapers(): Promise<Paper[]> {
	const response = await fetch(`${API_BASE}/papers`);

	if (!response.ok) {
		throw new Error(`Failed to fetch papers: ${response.statusText}`);
	}

	return response.json();
}

export async function fetchPaper(id: string): Promise<PaperDetail> {
	const response = await fetch(`${API_BASE}/papers/${id}`);

	if (!response.ok) {
		if (response.status === 404) {
			throw new Error('Paper not found');
		}
		throw new Error(`Failed to fetch paper: ${response.statusText}`);
	}

	return response.json();
}
