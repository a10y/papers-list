import type { Paper, PaperDetail, Note, ZoteroItem, ZoteroItemData, ZoteroCreator } from '../types';

export interface ZoteroConfig {
	userId: string;
	apiKey: string;
	collectionId: string;
}

export class ZoteroService {
	private baseUrl = 'https://api.zotero.org';
	private config: ZoteroConfig;

	constructor(config: ZoteroConfig) {
		this.config = config;
	}

	private async fetch<T>(path: string): Promise<T> {
		const url = `${this.baseUrl}/users/${this.config.userId}${path}`;
		const response = await fetch(url, {
			headers: {
				'Zotero-API-Key': this.config.apiKey,
				'Zotero-API-Version': '3',
			},
		});

		if (!response.ok) {
			throw new Error(`Zotero API error: ${response.status} ${response.statusText}`);
		}

		return response.json();
	}

	async getCollectionItems(): Promise<Paper[]> {
		const items = await this.fetch<ZoteroItem[]>(
			`/collections/${this.config.collectionId}/items?itemType=-attachment&limit=100`
		);

		return items
			.filter((item) => this.isValidPaperType(item.data.itemType))
			.map((item) => this.transformToPaper(item));
	}

	async getItem(itemKey: string): Promise<PaperDetail | null> {
		try {
			const item = await this.fetch<ZoteroItem>(`/items/${itemKey}`);

			if (!this.isValidPaperType(item.data.itemType)) {
				return null;
			}

			// Fetch child items (notes)
			const children = await this.fetch<ZoteroItem[]>(`/items/${itemKey}/children`);
			const notes = children
				.filter((child) => child.data.itemType === 'note')
				.map((note) => this.transformToNote(note));
			console.log(`item ${itemKey} has ${notes.length} notes`);

			return this.transformToPaperDetail(item, notes);
		} catch (error) {
			if (error instanceof Error && error.message.includes('404')) {
				return null;
			}
			throw error;
		}
	}

	private isValidPaperType(itemType: string): boolean {
		const validTypes = [
			'journalArticle',
			'conferencePaper',
			'preprint',
			'book',
			'bookSection',
			'thesis',
			'report',
			'manuscript',
		];
		return validTypes.includes(itemType);
	}

	private formatAuthors(creators?: ZoteroCreator[]): string[] {
		if (!creators) return [];

		return creators
			.filter((c) => c.creatorType === 'author')
			.map((c) => {
				if (c.name) return c.name;
				return [c.firstName, c.lastName].filter(Boolean).join(' ');
			});
	}

	private transformToPaper(item: ZoteroItem): Paper {
		const data = item.data;
		return {
			id: data.key,
			title: data.title || 'Untitled',
			authors: this.formatAuthors(data.creators),
			abstract: data.abstractNote || '',
			publication: data.publicationTitle || data.journalAbbreviation || '',
			date: data.date || '',
			doi: data.DOI || null,
			url: data.url || null,
			itemType: data.itemType,
		};
	}

	private transformToPaperDetail(item: ZoteroItem, notes: Note[]): PaperDetail {
		const paper = this.transformToPaper(item);
		return {
			...paper,
			notes,
			tags: item.data.tags?.map((t) => t.tag) || [],
		};
	}

	private transformToNote(item: ZoteroItem): Note {
		return {
			id: item.data.key,
			content: item.data.note || '',
		};
	}
}
