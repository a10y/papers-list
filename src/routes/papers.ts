import type { IRequest } from 'itty-router';
import { ZoteroService } from '../services/zotero';
import { CacheService } from '../services/cache';

export async function getPapers(request: IRequest, env: Env): Promise<Response> {
	const cache = new CacheService(env.CACHE);
	const zotero = new ZoteroService({
		userId: env.ZOTERO_USER_ID,
		apiKey: env.ZOTERO_API_KEY,
		collectionId: env.ZOTERO_COLLECTION_ID,
	});
	console.log(`userId = ${env.ZOTERO_USER_ID}`);

	try {
		const papers = await cache.getOrFetch('papers:list', () => zotero.getCollectionItems());

		return Response.json(papers);
	} catch (error) {
		console.error('Error fetching papers:', error);
		return Response.json(
			{ error: 'Failed to fetch papers' },
			{ status: 500 }
		);
	}
}
