import { ICachePort } from "@application/core";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand, PutCommand } from "@aws-sdk/lib-dynamodb";

export class DdbCacheRepo<T> implements ICachePort<T> {
	private readonly doc: DynamoDBDocumentClient;

	constructor(
		private readonly tableName: string,
		client?: DynamoDBClient
	) {
		const c = client ?? new DynamoDBClient({});
		this.doc = DynamoDBDocumentClient.from(c);
	}

	async get(cacheKey: string): Promise<T | undefined> {
		const res = await this.doc.send(
			new GetCommand({ TableName: this.tableName, Key: { cacheKey } })
		);
		const item = res.Item as any;
		if (!item) return undefined;
		if (item.expiresAt && item.expiresAt < Math.floor(Date.now() / 1000)) return undefined;
		return item.payload as T;
	}

	async set(cacheKey: string, value: T, ttlSeconds: number): Promise<void> {
		const now = Math.floor(Date.now() / 1000);
		await this.doc.send(
			new PutCommand({
				TableName: this.tableName,
				Item: {
					cacheKey,
					payload: value,
					expiresAt: now + ttlSeconds,
					source: "google-places",
				},
			})
		);
	}
}






