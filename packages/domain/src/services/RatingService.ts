export function normalizeRating(rating?: number): number | undefined {
	if (rating == null) return undefined;
	if (rating < 0) return 0;
	if (rating > 5) return 5;
	return Math.round(rating * 10) / 10;
}






