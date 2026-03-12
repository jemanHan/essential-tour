import { IPlacesSearchPort } from "../ports/IPlacesSearchPort";
import { ICachePort } from "../ports/ICachePort";
import { PlaceSummary } from "@shared/types";

export class SearchPlacesUseCase {
	constructor(
		private readonly searchPort: IPlacesSearchPort,
		private readonly cache: ICachePort<PlaceSummary[]>
	) {}

	async execute(params: {
		query: string;
		lat?: number;
		lng?: number;
		radiusMeters?: number;
		type?: string;
		sessionToken?: string;
	}): Promise<PlaceSummary[]> {
		const key = `search:${JSON.stringify(params)}`;
		const cached = await this.cache.get(key);
		if (cached) return cached;
		const results = await this.searchPort.search(params);
		await this.cache.set(key, results, 60 * 10);
		return results;
	}
}






