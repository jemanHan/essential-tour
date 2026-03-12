export const TOURISM_TYPES = new Set([
  "tourist_attraction","park","national_park","botanical_garden",
  "museum","art_gallery","zoo","aquarium",
  "amusement_park","theme_park","campground",
  "historical_landmark","monument","landmark","place_of_worship",
  "natural_feature","beach","scenic_lookout","ski_resort"
]);

export function isTourismPlace(p: any) {
  const pt = p.primaryType || p.primary_type;
  if (pt && TOURISM_TYPES.has(pt)) return true;
  const types: string[] = p.types || [];
  return types.some(t => TOURISM_TYPES.has(t));
}


