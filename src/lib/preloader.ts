/**
 * 이미지 및 데이터 프리로딩 유틸리티
 * 페이지 전환 속도 향상을 위한 사전 로딩
 */

// 이미지 프리로딩
export function preloadImage(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
    img.src = src;
  });
}

// 여러 이미지 동시 프리로딩
export async function preloadImages(srcs: string[]): Promise<void[]> {
  return Promise.allSettled(srcs.map(preloadImage)).then(results => 
    results.filter(result => result.status === 'fulfilled') as PromiseFulfilledResult<void>[]
  );
}

// API 데이터 프리로딩
export async function preloadApiData<T>(
  apiCall: () => Promise<T>,
  cacheKey: string
): Promise<T | null> {
  try {
    const data = await apiCall();
    // 캐시에 저장
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(cacheKey, JSON.stringify({
        data,
        timestamp: Date.now()
      }));
    }
    return data;
  } catch (error) {
    console.warn('Preload failed:', error);
    return null;
  }
}

// 캐시된 데이터 가져오기
export function getCachedData<T>(cacheKey: string, maxAge: number = 300000): T | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const cached = sessionStorage.getItem(cacheKey);
    if (!cached) return null;
    
    const { data, timestamp } = JSON.parse(cached);
    if (Date.now() - timestamp > maxAge) {
      sessionStorage.removeItem(cacheKey);
      return null;
    }
    
    return data;
  } catch {
    return null;
  }
}

// 페이지별 프리로딩 전략
export const preloadStrategies = {
  // 홈페이지용: 인기 장소들 미리 로딩
  home: async (searchPlaces: any) => {
    const popularQueries = [
      '서울 관광지',
      '부산 관광지', 
      '제주도 관광지',
      '경주 관광지'
    ];
    
    return Promise.allSettled(
      popularQueries.map(query => 
        preloadApiData(
          () => searchPlaces({ q: query, limit: 8 }),
          `preload_${query}`
        )
      )
    );
  },
  
  // 상세페이지용: 관련 장소들 미리 로딩
  detail: async (placeId: string, searchPlaces: any) => {
    // 현재는 기본적인 이미지 프리로딩만
    return Promise.resolve();
  }
};



