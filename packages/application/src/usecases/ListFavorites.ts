import { IFavoritesRepo } from "../ports/IFavoritesRepo";

export class ListFavoritesUseCase {
	constructor(private readonly repo: IFavoritesRepo) {}

	async execute(userId: string): Promise<string[]> {
		return this.repo.listFavorites(userId);
	}
}






