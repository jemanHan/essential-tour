/**
 * 통합 API 클라이언트 - 중앙 집중식 API 관리
 * 무한루프, 과도한 호출, 리소스 초과사용 방지
 */

// API 호출 상태 관리
interface ApiCallState {
  inProgress: boolean;
  lastCall: number;
  retryCount: number;
  errorCount: number;
}

// 전역 API 상태 관리
const apiStates = new Map<string, ApiCallState>();
// In-flight dedupe: 동일 URL/옵션 호출은 기존 Promise 재사용하여 중복 호출 방지
const requestQueue = new Map<string, Promise<any>>();

// 설정
const CONFIG = {
  // Rate Limiting (적절한 최적화)
  MIN_REQUEST_INTERVAL: 200, // 200ms (적절한 간격)
  MAX_REQUESTS_PER_MINUTE: 80, // 80rpm (적절한 수준)
  MAX_CONCURRENT_REQUESTS: 5, // 동시요청 5개 (적절한 수준)
  
  // Caching (강화)
  CACHE_DURATION: 3600000, // 1시간 (적절한 캐시)
  MAX_CACHE_SIZE: 300, // 최대 300개 캐시 (적절한 수준)
  
  // Retry (적절한 수준)
  MAX_RETRIES: 1, // 재시도 1회 (안정성 유지)
  RETRY_DELAY: 500, // 500ms 재시도
  
  // Timeout (적절한 수준)
  REQUEST_TIMEOUT: 4000, // 4초 (적절한 타임아웃)
} as const;

// 캐시 관리
const cache = new Map<string, { data: any; timestamp: number; hits: number }>();
let requestCount = 0;
let lastMinuteReset = Date.now();

const IS_DEV = import.meta.env.DEV === true;

// Rate Limiting 체크
function checkRateLimit(key: string): boolean {
  const now = Date.now();
  
  // 분당 요청 수 체크
  if (now - lastMinuteReset > 60000) {
    requestCount = 0;
    lastMinuteReset = now;
  }
  
  if (requestCount >= CONFIG.MAX_REQUESTS_PER_MINUTE) {
    console.warn(`🚫 Rate limit exceeded for ${key}`);
    return false;
  }
  
  // 동시 요청 수 체크
  const activeRequests = Array.from(apiStates.values()).filter(state => state.inProgress).length;
  if (activeRequests >= CONFIG.MAX_CONCURRENT_REQUESTS) {
    console.warn(`🚫 Too many concurrent requests for ${key}`);
    return false;
  }
  
  // 최소 간격 체크
  const state = apiStates.get(key);
  if (state && (now - state.lastCall) < CONFIG.MIN_REQUEST_INTERVAL) {
    console.warn(`🚫 Request too frequent for ${key}`);
    return false;
  }
  
  return true;
}

// 캐시 관리
function manageCache() {
  if (cache.size <= CONFIG.MAX_CACHE_SIZE) return;
  
  // LRU 방식으로 캐시 정리
  const entries = Array.from(cache.entries());
  entries.sort((a, b) => a[1].hits - b[1].hits);
  
  const toDelete = entries.slice(0, cache.size - CONFIG.MAX_CACHE_SIZE);
  toDelete.forEach(([key]) => cache.delete(key));
  
  if (IS_DEV) console.log(`🧹 Cache cleaned: removed ${toDelete.length} entries`);
}

// 캐시에서 데이터 가져오기
function getFromCache(key: string): any | null {
  const cached = cache.get(key);
  if (!cached) return null;
  
  const now = Date.now();
  if (now - cached.timestamp > CONFIG.CACHE_DURATION) {
    cache.delete(key);
    return null;
  }
  
  cached.hits++;
  return cached.data;
}

// 캐시에 데이터 저장
function setCache(key: string, data: any): void {
  cache.set(key, {
    data,
    timestamp: Date.now(),
    hits: 0
  });
  
  manageCache();
}

// API 상태 업데이트
function updateApiState(key: string, updates: Partial<ApiCallState>): void {
  const current = apiStates.get(key) || {
    inProgress: false,
    lastCall: 0,
    retryCount: 0,
    errorCount: 0
  };
  
  apiStates.set(key, { ...current, ...updates });
}

// 지연 함수
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// 환경 감지 함수
function getApiBaseUrl(): string {
  // 환경변수가 있으면 우선 사용
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  
  // 프로덕션 빌드인지 확인
  if (import.meta.env.PROD) {
    // 프로덕션에서는 동일 오리진(CloudFront/Nginx) 기준 프록시 경유
    return '';
  }
  
  // 개발 환경에서는 Vite 프록시('/api') 사용
  return '/api';
}

// 메인 API 클라이언트
export class ApiClient {
  private baseUrl: string;
  
  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || getApiBaseUrl();
  }
  
  // GET 요청
  async get<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }
  
  // POST 요청
  async post<T>(endpoint: string, data?: any, options: RequestInit = {}): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      body: data ? JSON.stringify(data) : undefined,
    });
  }
  
  // PUT 요청
  async put<T>(endpoint: string, data?: any, options: RequestInit = {}): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      body: data ? JSON.stringify(data) : undefined,
    });
  }
  
  // DELETE 요청
  async delete<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }
  
  // 메인 요청 처리
  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const cacheKey = `${options.method || 'GET'}-${url}-${JSON.stringify(options.body || '')}`;
    
    // 캐시 확인
    const cached = getFromCache(cacheKey);
    if (cached) {
      if (IS_DEV) console.log(`🎯 Cache hit: ${endpoint}`);
      return cached;
    }
    
    // 중복 요청 방지
    if (requestQueue.has(cacheKey)) {
      if (IS_DEV) console.log(`⏳ Request in progress: ${endpoint}`);
      return await requestQueue.get(cacheKey);
    }
    
    // Rate Limiting 체크
    if (!checkRateLimit(cacheKey)) {
      await delay(CONFIG.MIN_REQUEST_INTERVAL);
      return this.request<T>(endpoint, options);
    }
    
    // 요청 실행
    const requestPromise = this.executeRequest<T>(url, options, cacheKey);
    requestQueue.set(cacheKey, requestPromise);
    
    try {
      const result = await requestPromise;
      return result;
    } finally {
      requestQueue.delete(cacheKey);
    }
  }
  
  // 실제 요청 실행
  private async executeRequest<T>(url: string, options: RequestInit, cacheKey: string): Promise<T> {
    const state = apiStates.get(cacheKey) || {
      inProgress: false,
      lastCall: 0,
      retryCount: 0,
      errorCount: 0
    };
    
    updateApiState(cacheKey, { inProgress: true, lastCall: Date.now() });
    requestCount++;
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), CONFIG.REQUEST_TIMEOUT);
      
      const language = localStorage.getItem('i18nextLng') || 'ko';
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Accept-Language': language,
          ...options.headers,
        },
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // 성공 시 캐시 저장 및 상태 리셋
      setCache(cacheKey, data);
      updateApiState(cacheKey, { 
        inProgress: false, 
        retryCount: 0, 
        errorCount: 0 
      });
      
      if (IS_DEV) console.log(`✅ API Success: ${url}`);
      return data;
      
    } catch (error) {
      const isTimeout = error.name === 'AbortError';
      const isNetworkError = !error.status;
      
      // 에러 카운트 증가
      updateApiState(cacheKey, { 
        inProgress: false,
        errorCount: state.errorCount + 1
      });
      
      // 재시도 로직
      if (state.retryCount < CONFIG.MAX_RETRIES && (isTimeout || isNetworkError)) {
        const retryDelay = CONFIG.RETRY_DELAY * Math.pow(2, state.retryCount);
        console.warn(`🔄 Retrying ${url} in ${retryDelay}ms (${state.retryCount + 1}/${CONFIG.MAX_RETRIES})`);
        
        updateApiState(cacheKey, { retryCount: state.retryCount + 1 });
        await delay(retryDelay);
        
        return this.executeRequest<T>(url, options, cacheKey);
      }
      
      if (IS_DEV) console.error(`❌ API Error: ${url}`, error);
      throw error;
    }
  }
  
  // 캐시 클리어
  clearCache(): void {
    cache.clear();
    if (IS_DEV) console.log('🧹 Cache cleared');
  }
  
  // API 상태 조회
  getApiStats(): { cacheSize: number; activeRequests: number; requestCount: number } {
    const activeRequests = Array.from(apiStates.values()).filter(state => state.inProgress).length;
    return {
      cacheSize: cache.size,
      activeRequests,
      requestCount
    };
  }
}

// 기본 인스턴스
export const apiClient = new ApiClient();

// 특화된 API 클라이언트들 (환경 자동 감지)
export const placesApi = new ApiClient();
export const tourApi = new ApiClient();
export const scheduleApi = new ApiClient();
