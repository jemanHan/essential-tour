export type PlaceSummary = {
	id: string;
	name: string;
	rating?: number;
	userRatingCount?: number;
	thumbnailUrl?: string;
	location?: { lat: number; lng: number };
	distanceMeters?: number;
};

export type PlaceDetails = {
	id: string;
	name: string;
	rating?: number;
	userRatingCount?: number;
	openingHours?: { openNow?: boolean; weekdayText?: string[] };
	websiteUri?: string;
	internationalPhoneNumber?: string;
	types?: string[];
	editorialSummary?: string;
	photos?: { name: string; widthPx?: number; heightPx?: number }[];
	reviews?: {
		author?: string;
		rating?: number;
		relativePublishTimeDescription?: string;
		text?: string;
	}[];
};

export type ProblemDetail = {
	type: string;
	title: string;
	status: number;
	detail?: string;
	instance?: string;
	requestId?: string;
};




