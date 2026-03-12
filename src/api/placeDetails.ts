import { api } from './http';

export interface PlaceDetails {
  placeId: string;
  name: string;
  address?: string;
  rating?: number;
  userRatingTotal?: number;
  photos?: string[];
  formattedAddress?: string;
}

// 장소 상세 정보 가져오기
export const getPlaceDetails = async (placeId: string): Promise<PlaceDetails | null> => {
  try {
    const response = await api.get(`/v1/places/${placeId}`);
    const data = response.data;
    
    return {
      placeId: data.placeId || placeId,
      name: data.displayName?.text || data.displayName || '이름 없음',
      address: data.formattedAddress || data.address,
      rating: data.rating,
      userRatingTotal: data.userRatingTotal,
      photos: data.photos?.map((photo: any) => photo.uri) || [],
      formattedAddress: data.formattedAddress
    };
  } catch (error) {
    console.error('장소 정보 가져오기 실패:', error);
    return null;
  }
};

// 여러 장소 정보를 병렬로 가져오기
export const getMultiplePlaceDetails = async (placeIds: string[]): Promise<Record<string, PlaceDetails | null>> => {
  const results: Record<string, PlaceDetails | null> = {};
  
  // 병렬로 모든 장소 정보 가져오기 (최대 4개씩)
  const batchSize = 4;
  for (let i = 0; i < placeIds.length; i += batchSize) {
    const batch = placeIds.slice(i, i + batchSize);
    const promises = batch.map(async (placeId) => {
      const details = await getPlaceDetails(placeId);
      return { placeId, details };
    });
    
    const batchResults = await Promise.allSettled(promises);
    batchResults.forEach((result) => {
      if (result.status === 'fulfilled') {
        results[result.value.placeId] = result.value.details;
      }
    });
  }
  
  return results;
};





