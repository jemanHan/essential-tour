import { PlaceDetails, PlaceSummary } from "@shared/types";
import { IPlaceDetailsPort } from "@application/core";
import { IPlacesSearchPort } from "@application/core";

const BASE_URL = "https://places.googleapis.com/v1";

export type GooglePlacesClientOptions = {
	apiKey: string;
};

export class PlacesClient implements IPlacesSearchPort, IPlaceDetailsPort {
	constructor(private readonly opts: GooglePlacesClientOptions) {}

	private buildHeaders(fieldMask?: string) {
		const headers: Record<string, string> = {
			"X-Goog-Api-Key": this.opts.apiKey,
			"X-Goog-FieldMask": fieldMask ?? "",
		};
		return headers;
	}

	async search(params: {
		query: string;
		lat?: number;
		lng?: number;
		radiusMeters?: number;
		type?: string;
		sessionToken?: string;
	}): Promise<PlaceSummary[]> {
		const url = new URL(`${BASE_URL}/places:searchText`);
		const body: any = {
			textQuery: params.query,
		};
		if (params.lat != null && params.lng != null) {
			body.locationBias = {
				radiusMeters: params.radiusMeters ?? 5000,
				center: { latitude: params.lat, longitude: params.lng },
			};
		}
		const fieldMask = [
			"places.id",
			"places.displayName",
			"places.rating",
			"places.userRatingCount",
			"places.location",
			"places.photos",
		].join(",");
		const resp = await fetch(url, {
			method: "POST",
			headers: {
				...this.buildHeaders(fieldMask),
				"Content-Type": "application/json",
			},
			body: JSON.stringify(body),
		});
		if (!resp.ok) throw new Error(`Places search failed: ${resp.status}`);
		const data = await resp.json();
		const summaries: PlaceSummary[] = (data.places ?? []).slice(0, 20).map((p: any) => ({
			id: p.id,
			name: p.displayName?.text ?? "",
			rating: p.rating,
			userRatingCount: p.userRatingCount,
			thumbnailUrl: p.photos?.[0]?.name,
			location: p.location ? { lat: p.location.latitude, lng: p.location.longitude } : undefined,
		}));
		return summaries;
	}

	async getDetails(placeId: string): Promise<PlaceDetails> {
		const url = `${BASE_URL}/places/${encodeURIComponent(placeId)}`;
		const fieldMask = [
			"id",
			"displayName",
			"rating",
			"userRatingCount",
			"openingHours",
			"websiteUri",
			"internationalPhoneNumber",
			"types",
			"editorialSummary",
			"photos",
			"reviews",
		].join(",");
		const resp = await fetch(url, {
			headers: this.buildHeaders(fieldMask),
		});
		if (!resp.ok) throw new Error(`Place details failed: ${resp.status}`);
		const p = await resp.json();
		const details: PlaceDetails = {
			id: p.id,
			name: p.displayName?.text ?? "",
			rating: p.rating,
			userRatingCount: p.userRatingCount,
			openingHours: p.openingHours,
			websiteUri: p.websiteUri,
			internationalPhoneNumber: p.internationalPhoneNumber,
			types: p.types,
			editorialSummary: p.editorialSummary?.text,
			photos: p.photos,
			reviews: p.reviews?.map((r: any) => ({
				author: r.authorAttribution?.displayName,
				rating: r.rating,
				relativePublishTimeDescription: r.relativePublishTimeDescription,
				text: r.originalText?.text ?? r.text?.text,
			})),
		};
		return details;
	}

	async getPhotoUrl(photoName: string, options?: { maxHeightPx?: number; maxWidthPx?: number }): Promise<string> {
		const url = new URL(`${BASE_URL}/${photoName}:getPhotoMedia`);
		if (options?.maxHeightPx) url.searchParams.set("maxHeightPx", String(options.maxHeightPx));
		if (options?.maxWidthPx) url.searchParams.set("maxWidthPx", String(options.maxWidthPx));
		return url.toString();
	}
}






