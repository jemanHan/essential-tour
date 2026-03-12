import { IPlaceDetailsPort } from "../ports/IPlaceDetailsPort";
import { ICachePort } from "../ports/ICachePort";
import { PlaceDetails } from "@shared/types";

export class GetPlaceDetailUseCase {
	constructor(
		private readonly detailsPort: IPlaceDetailsPort,
		private readonly cache: ICachePort<PlaceDetails>
	) {}

	async execute(placeId: string, options?: { sessionToken?: string }): Promise<PlaceDetails> {
		const key = `details:${placeId}`;
		const cached = await this.cache.get(key);
		if (cached) return cached;
		const details = await this.detailsPort.getDetails(placeId, options);
		await this.cache.set(key, details, 60 * 60 * 6);
		return details;
	}
}






