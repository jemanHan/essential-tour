import { ICachePort } from "@application/core";

type Entry = { value: unknown; expiresAt: number };

export class MemoryCache<T> implements ICachePort<T> {
	private store = new Map<string, Entry>();

	async get(key: string): Promise<T | undefined> {
		const e = this.store.get(key);
		if (!e) return undefined;
		if (e.expiresAt < Date.now()) {
			this.store.delete(key);
			return undefined;
		}
		return e.value as T;
	}

	async set(key: string, value: T, ttlSeconds: number): Promise<void> {
		this.store.set(key, { value, expiresAt: Date.now() + ttlSeconds * 1000 });
	}
}






