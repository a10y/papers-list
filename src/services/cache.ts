import type { CachedData } from '../types';

const DEFAULT_TTL_SECONDS = 60; // 1 minute

export class CacheService {
	private kv: KVNamespace;
	private ttlSeconds: number;

	constructor(kv: KVNamespace, ttlSeconds: number = DEFAULT_TTL_SECONDS) {
		this.kv = kv;
		this.ttlSeconds = ttlSeconds;
	}

	async get<T>(key: string): Promise<T | null> {
		const cached = await this.kv.get<CachedData<T>>(key, 'json');

		if (!cached) {
			return null;
		}

		const age = (Date.now() - cached.timestamp) / 1000;
		if (age > this.ttlSeconds) {
			// Cache expired, delete it
			await this.kv.delete(key);
			return null;
		}

		return cached.data;
	}

	async set<T>(key: string, data: T): Promise<void> {
		const cached: CachedData<T> = {
			data,
			timestamp: Date.now(),
		};

		await this.kv.put(key, JSON.stringify(cached), {
			expirationTtl: this.ttlSeconds * 2, // KV expiration as backup
		});
	}

	async getOrFetch<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
		const cached = await this.get<T>(key);

		if (cached !== null) {
			return cached;
		}

		const data = await fetcher();
		await this.set(key, data);
		return data;
	}
}
