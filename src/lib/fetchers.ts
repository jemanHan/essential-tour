import { placesApi } from './apiClient';
import i18n from '../i18n';

// 상대 경로('/api')가 들어올 수 있으므로 URL()의 base로 사용하지 않는다
const API_PREFIX: string = (import.meta as any).env.VITE_API_BASE_URL || '/api';

export type PlaceLite = {
  id: string;
  displayName?: { text?: string };
  rating?: number;
  userRatingCount?: number;
  photos?: { name: string }[];
  editorialSummary?: { text?: string };
  location?: { latitude?: number; longitude?: number };
};

// 간소화된 fetch 함수 - apiClient 사용
async function cachedFetch(endpoint: string, options?: RequestInit) {
  // placesApi는 내부적으로 BASE를 붙이므로 여기서는 순수 endpoint만 전달
  return await placesApi.request(endpoint, options);
}

export async function searchPlaces(params: {
  q?: string; lat?: number; lng?: number;
  minRating?: number; minReviews?: number;
  sort?: "score"|"rating"|"reviews";
  onlyTourism?: boolean;
  region?: string;
  page?: number; limit?: number;
  language?: string;
}) {
  const sp = new URLSearchParams();
  if (params.q) sp.set('q', params.q);
  if (params.lat && params.lng) { sp.set('lat', String(params.lat)); sp.set('lng', String(params.lng)); }
  if (params.minRating) sp.set('minRating', String(params.minRating));
  if (params.minReviews) sp.set('minReviews', String(params.minReviews));
  if (params.sort) sp.set('sort', params.sort);
  if (params.region) sp.set('region', params.region);
  if (params.onlyTourism !== undefined) sp.set('onlyTourism', String(params.onlyTourism));
  if (params.page) sp.set('page', String(params.page));
  if (params.limit) sp.set('limit', String(params.limit));
  
  // Always set language - use provided language or fallback to i18n.language
  const lang = (params.language || i18n.language || 'ko').split('-')[0];
  sp.set('language', lang);

  const endpoint = `/v1/search${sp.toString() ? `?${sp.toString()}` : ''}`;
  const result = await cachedFetch(endpoint);
  
  // 새로운 페이지네이션 응답 형식 처리
  if (result?.data && result?.pagination) {
    return result;
  }
  
  // 기존 응답 형식 호환성 유지
  const list = Array.isArray(result) ? result : (result?.places ?? []);
  return { data: list, pagination: null };
}

export async function autocomplete(input: string) {
  const sp = new URLSearchParams();
  sp.set('input', input);
  const endpoint = `/v1/autocomplete?${sp.toString()}`;
  return cachedFetch(endpoint) as Promise<Array<{id:string,text:string}>>;
}

export function photoUrl(placeId: string, photoName?: string, maxWidthPx = 600) {
  if (!photoName) return null;
  const sp = new URLSearchParams();
  sp.set('name', photoName);
  sp.set('maxWidthPx', String(maxWidthPx));
  return `${API_PREFIX}/v1/places/${encodeURIComponent(placeId)}/photos/media?${sp.toString()}`;
}

// 새로운 Google Places API v1을 사용한 이미지 URL 생성
export function placePhotoUrl(placeId: string) {
  return `${API_PREFIX}/v1/places/${encodeURIComponent(placeId)}/photo`;
}
