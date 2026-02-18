// Augment the Env interface with Zotero secrets
declare global {
	interface Env {
		// Zotero API credentials (set via wrangler secret put)
		ZOTERO_USER_ID: string;
		ZOTERO_API_KEY: string;
		ZOTERO_COLLECTION_ID: string;
	}
}

export {};
