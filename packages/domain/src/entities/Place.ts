export type PlaceId = string;

export type GeoPoint = { lat: number; lng: number };

export interface Place {
	id: PlaceId;
	name: string;
	rating?: number;
	userRatingCount?: number;
	location?: GeoPoint;
	photoNames?: string[];
}






