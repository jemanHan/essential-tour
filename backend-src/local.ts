import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
console.log('🔑 Environment loaded. API Key:', process.env.GOOGLE_PLACES_BACKEND_KEY ? 'SET' : 'NOT SET');
import { createApp } from "./app";

const port = Number(process.env.PORT ?? 3002);

async function main() {
	const app = await createApp();
	await app.listen({ port, host: "0.0.0.0" });
	console.log(`backend listening on http://localhost:${port}`);
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});



