// 중앙화된 API 설정
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || '/api',
  ENDPOINTS: {
    // 인증 관련 - v1으로 통일
    AUTH: {
      LOGIN: '/v1/auth/login',
      SIGNUP: '/v1/auth/signup',
      LOGOUT: '/v1/auth/logout',
      REFRESH: '/v1/auth/refresh'
    },
    // 사용자 관련 - v1으로 통일
    USERS: {
      ME: '/v1/users/me',
      PROFILE: '/v1/users/profile',
      UPDATE: '/v1/users/update'
    },
    // 관광공사 API - v1으로 통일
    TOUR: {
      GANGNAM: '/v1/tour/gangnam',
      AREA_BASED: '/v1/tour/area-based',
      LOCATION_BASED: '/v1/tour/location-based',
      DETAIL: '/v1/tour/detail',
      IMAGES: '/v1/tour/images',
      RESTAURANTS: '/v1/tour/restaurants',
      ACCOMMODATIONS: '/v1/tour/accommodations',
      CAFES: '/v1/tour/cafes'
    },
    // Google Places API
    PLACES: {
      SEARCH: '/v1/search',
      DETAIL: '/v1/places',
      PHOTOS: '/v1/places',
      AUTOCOMPLETE: '/v1/autocomplete',
      REGIONS: '/v1/regions',
      RECOMMENDATIONS: '/v1/recommendations'
    },
    // 스케줄 관련 - v1으로 통일
    SCHEDULE: {
      LIST: '/v1/schedules',
      CREATE: '/v1/schedules',
      UPDATE: '/v1/schedules',
      DELETE: '/v1/schedules'
    },
    // 좋아요 관련 - v1으로 통일
    LIKES: {
      LIST: '/v1/likes',
      ADD: '/v1/likes',
      REMOVE: '/v1/likes'
    }
  }
} as const;

// API URL 생성 헬퍼
export const getApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

// 환경별 설정
export const isDevelopment = import.meta.env.DEV;
export const isProduction = import.meta.env.PROD;
