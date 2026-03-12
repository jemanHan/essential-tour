import { IFavoritesRepo } from "../ports/IFavoritesRepo";

export class ToggleFavoriteUseCase {
	constructor(private readonly repo: IFavoritesRepo) {}

	async execute(userId: string, placeId: string) {
		return this.repo.toggleFavorite(userId, placeId);
	}
}






