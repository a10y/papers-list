import { env, createExecutionContext, waitOnExecutionContext } from 'cloudflare:test';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import worker from '../src/index';

const IncomingRequest = Request<unknown, IncomingRequestCfProperties>;

// Mock Zotero API response
const mockZoteroItems = [
	{
		key: 'ABC123',
		version: 1,
		library: { type: 'user', id: 12345, name: 'Test Library' },
		data: {
			key: 'ABC123',
			version: 1,
			itemType: 'journalArticle',
			title: 'Test Paper Title',
			creators: [
				{ creatorType: 'author', firstName: 'John', lastName: 'Doe' },
				{ creatorType: 'author', firstName: 'Jane', lastName: 'Smith' }
			],
			abstractNote: 'This is a test abstract',
			publicationTitle: 'Test Journal',
			date: '2024-01-15',
			DOI: '10.1234/test.2024',
			tags: [{ tag: 'machine-learning' }, { tag: 'research' }]
		}
	}
];

const mockZoteroItem = {
	key: 'ABC123',
	version: 1,
	library: { type: 'user', id: 12345, name: 'Test Library' },
	data: {
		key: 'ABC123',
		version: 1,
		itemType: 'journalArticle',
		title: 'Test Paper Title',
		creators: [
			{ creatorType: 'author', firstName: 'John', lastName: 'Doe' },
			{ creatorType: 'author', firstName: 'Jane', lastName: 'Smith' }
		],
		abstractNote: 'This is a test abstract',
		publicationTitle: 'Test Journal',
		date: '2024-01-15',
		DOI: '10.1234/test.2024',
		tags: [{ tag: 'machine-learning' }, { tag: 'research' }]
	}
};

const mockChildItems = [
	{
		key: 'NOTE123',
		version: 1,
		library: { type: 'user', id: 12345, name: 'Test Library' },
		data: {
			key: 'NOTE123',
			version: 1,
			itemType: 'note',
			parentItem: 'ABC123',
			note: '<p>This is a test note</p>'
		}
	}
];

describe('Papers API', () => {
	beforeEach(() => {
		vi.restoreAllMocks();
	});

	it('GET /api/papers returns list of papers', async () => {
		// Mock fetch for Zotero API
		vi.spyOn(globalThis, 'fetch').mockImplementation(async (url) => {
			if (typeof url === 'string' && url.includes('/collections/') && url.includes('/items')) {
				return new Response(JSON.stringify(mockZoteroItems), {
					headers: { 'Content-Type': 'application/json' }
				});
			}
			return new Response('Not Found', { status: 404 });
		});

		const request = new IncomingRequest('http://example.com/api/papers');
		const ctx = createExecutionContext();

		// Add test secrets to env
		const testEnv = {
			...env,
			ZOTERO_USER_ID: 'test-user-id',
			ZOTERO_API_KEY: 'test-api-key',
			ZOTERO_COLLECTION_ID: 'test-collection-id'
		};

		const response = await worker.fetch(request, testEnv, ctx);
		await waitOnExecutionContext(ctx);

		expect(response.status).toBe(200);

		const papers = await response.json();
		expect(Array.isArray(papers)).toBe(true);
		expect(papers.length).toBe(1);
		expect(papers[0]).toMatchObject({
			id: 'ABC123',
			title: 'Test Paper Title',
			authors: ['John Doe', 'Jane Smith'],
			abstract: 'This is a test abstract',
			publication: 'Test Journal',
			doi: '10.1234/test.2024'
		});
	});

	it('GET /api/papers/:id returns paper details with notes', async () => {
		vi.spyOn(globalThis, 'fetch').mockImplementation(async (url) => {
			if (typeof url === 'string') {
				if (url.includes('/items/ABC123/children')) {
					return new Response(JSON.stringify(mockChildItems), {
						headers: { 'Content-Type': 'application/json' }
					});
				}
				if (url.includes('/items/ABC123')) {
					return new Response(JSON.stringify(mockZoteroItem), {
						headers: { 'Content-Type': 'application/json' }
					});
				}
			}
			return new Response('Not Found', { status: 404 });
		});

		const request = new IncomingRequest('http://example.com/api/papers/ABC123');
		const ctx = createExecutionContext();

		const testEnv = {
			...env,
			ZOTERO_USER_ID: 'test-user-id',
			ZOTERO_API_KEY: 'test-api-key',
			ZOTERO_COLLECTION_ID: 'test-collection-id'
		};

		const response = await worker.fetch(request, testEnv, ctx);
		await waitOnExecutionContext(ctx);

		expect(response.status).toBe(200);

		const paper = await response.json();
		expect(paper).toMatchObject({
			id: 'ABC123',
			title: 'Test Paper Title',
			authors: ['John Doe', 'Jane Smith'],
			tags: ['machine-learning', 'research']
		});
		expect(paper.notes).toHaveLength(1);
		expect(paper.notes[0].content).toBe('<p>This is a test note</p>');
	});

	it('GET /api/papers/:id returns 404 for non-existent paper', async () => {
		vi.spyOn(globalThis, 'fetch').mockImplementation(async () => {
			return new Response('Not Found', { status: 404 });
		});

		const request = new IncomingRequest('http://example.com/api/papers/NOTFOUND');
		const ctx = createExecutionContext();

		const testEnv = {
			...env,
			ZOTERO_USER_ID: 'test-user-id',
			ZOTERO_API_KEY: 'test-api-key',
			ZOTERO_COLLECTION_ID: 'test-collection-id'
		};

		const response = await worker.fetch(request, testEnv, ctx);
		await waitOnExecutionContext(ctx);

		expect(response.status).toBe(404);
	});
});
