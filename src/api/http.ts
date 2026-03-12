import { API_CONFIG, getApiUrl } from '../config/api.js';

// 간단한 인메모리 요청 중복 방지 및 짧은 캐시 (GET 전용)
const inflightRequests: Map<string, Promise<any>> = new Map();
const responseCache: Map<string, { expiresAt: number; data: any }> = new Map();

// 기본 캐시 TTL (ms)
const DEFAULT_CACHE_TTL_MS = 10_000; // 10초

function buildCacheKey(url: string, language: string) {
  return `GET|${url}|lang=${language}`;
}

export function clearApiCache() {
  responseCache.clear();
}

export async function api(path: string, { method = 'GET', body, headers = {} }: {
  method?: string;
  body?: any;
  headers?: Record<string, string>;
} = {}) {
  const token = localStorage.getItem('vk_token');
  const language = localStorage.getItem('i18nextLng') || 'ko';
  
  const requestHeaders: Record<string, string> = {
    'Accept-Language': language,
    ...headers
  };

  // DELETE 요청이 아닌 경우에만 Content-Type 설정
  if (method !== 'DELETE') {
    requestHeaders['Content-Type'] = 'application/json';
  }

  if (token) {
    requestHeaders.Authorization = `Bearer ${token}`;
  }

  const url = getApiUrl(path);

  // GET 요청에 대해서만 캐시/디듀프 적용
  if (method === 'GET') {
    const cacheKey = buildCacheKey(url, language);
    const now = Date.now();

    const cached = responseCache.get(cacheKey);
    if (cached && cached.expiresAt > now) {
      return cached.data;
    }

    const inflight = inflightRequests.get(cacheKey);
    if (inflight) {
      return inflight;
    }

    const fetchPromise = (async () => {
      const resp = await fetch(url, {
        method,
        headers: requestHeaders,
        body: undefined
      });

      if (!resp.ok) {
        if (resp.status === 401) {
          console.warn('JWT 토큰이 만료되었거나 유효하지 않습니다. 로그인 페이지로 이동합니다.');
          localStorage.removeItem('vk_token');
          window.location.href = '/login';
          throw new Error('Authentication expired');
        }
        const errorData = await resp.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${resp.status}`);
      }

      const contentType = resp.headers.get('content-type');
      if (contentType && contentType.includes('text/html')) {
        console.error('서버에서 HTML을 반환했습니다. API 엔드포인트를 확인하세요.');
        throw new Error('Server returned HTML instead of JSON');
      }

      try {
        const data = await resp.json();
        responseCache.set(cacheKey, { expiresAt: now + DEFAULT_CACHE_TTL_MS, data });
        return data;
      } catch (error) {
        console.error('JSON 파싱 실패:', error);
        console.error('응답 내용:', await resp.text());
        throw new Error('Failed to parse JSON response');
      } finally {
        inflightRequests.delete(cacheKey);
      }
    })();

    inflightRequests.set(cacheKey, fetchPromise);
    return fetchPromise;
  }

  const response = await fetch(url, {
    method,
    headers: requestHeaders,
    body: body ? JSON.stringify(body) : undefined
  });

  if (!response.ok) {
    // 401 Unauthorized - 토큰 만료 또는 인증 실패
    if (response.status === 401) {
      console.warn('JWT 토큰이 만료되었거나 유효하지 않습니다. 로그인 페이지로 이동합니다.');
      localStorage.removeItem('vk_token');
      window.location.href = '/login';
      throw new Error('Authentication expired');
    }
    
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP ${response.status}`);
  }

  // 응답이 HTML인지 JSON인지 확인
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('text/html')) {
    console.error('서버에서 HTML을 반환했습니다. API 엔드포인트를 확인하세요.');
    throw new Error('Server returned HTML instead of JSON');
  }

  try {
    return await response.json();
  } catch (error) {
    console.error('JSON 파싱 실패:', error);
    console.error('응답 내용:', await response.text());
    throw new Error('Failed to parse JSON response');
  }
}


