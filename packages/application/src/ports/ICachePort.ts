export interface ICachePort<T = unknown> {
	get(cacheKey: string): Promise<T | undefined>;
	set(cacheKey: string, value: T, ttlSeconds: number): Promise<void>;
}






