import { Loader } from "@googlemaps/js-api-loader";

const key = import.meta.env.VITE_GOOGLE_MAPS_BROWSER_KEY as string;

export const googleLoader = new Loader({
	apiKey: key,
	version: "weekly",
	libraries: ["places", "marker"],
});


