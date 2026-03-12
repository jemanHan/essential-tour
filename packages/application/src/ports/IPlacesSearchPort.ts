import { PlaceSummary } from "@shared/types";

export interface IPlacesSearchPort {
	search(params: {
		query: string;
		lat?: number;
		lng?: number;
		radiusMeters?: number;
		type?: string;
		sessionToken?: string;
	}): Promise<PlaceSummary[]>;
}






