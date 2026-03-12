export interface AuthUser {
	userId: string;
	email?: string;
	scope?: string[];
}

export interface IAuthPort {
	verifyToken(token: string): Promise<AuthUser>;
}






