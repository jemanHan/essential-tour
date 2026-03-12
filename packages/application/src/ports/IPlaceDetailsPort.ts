import { PlaceDetails } from "@shared/types";

export interface IPlaceDetailsPort {
	getDetails(placeId: string, options?: { sessionToken?: string }): Promise<PlaceDetails>;
	getPhotoUrl(photoName: string, options?: { maxHeightPx?: number; maxWidthPx?: number }): Promise<string>;
}






