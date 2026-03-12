export interface IFavoritesRepo {
	toggleFavorite(userId: string, placeId: string): Promise<{ favorited: boolean }>;
	listFavorites(userId: string): Promise<string[]>;
	removeFavorite(userId: string, placeId: string): Promise<void>;
}






