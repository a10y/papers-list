import type { IRequest } from 'itty-router';
import { ZoteroService } from '../services/zotero';
import { CacheService } from '../services/cache';

export async function getPaper(request: IRequest, env: Env): Promise<Response> {
	const { id } = request.params;

	if (!id) {
		return Response.json({ error: 'Paper ID is required' }, { status: 400 });
	}

	const cache = new CacheService(env.CACHE);
	const zotero = new ZoteroService({
		userId: env.ZOTERO_USER_ID,
		apiKey: env.ZOTERO_API_KEY,
		collectionId: env.ZOTERO_COLLECTION_ID,
	});

	try {
		const paper = await cache.getOrFetch(`papers:${id}`, () => zotero.getItem(id));

		if (!paper) {
			return Response.json({ error: 'Paper not found' }, { status: 404 });
		}

		return Response.json(paper);
	} catch (error) {
		console.error('Error fetching paper:', error);
		return Response.json(
			{ error: 'Failed to fetch paper' },
			{ status: 500 }
		);
	}
}
