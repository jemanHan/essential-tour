import { api } from './http';

// users/me 싱글톤 캐시 (세션 동안 유지)
let meCache: { data: Me; fetchedAt: number } | null = null;
const ME_CACHE_TTL_MS = 60_000; // 60초

export type Me = {
  id: string;
  email: string;
  displayName: string | null;
  lang: 'KR' | 'EN' | null;
  createdAt: string;
};

export async function getMe(): Promise<Me> {
  const now = Date.now();
  if (meCache && (now - meCache.fetchedAt) < ME_CACHE_TTL_MS) {
    return meCache.data;
  }
  const data = await api('/v1/users/me');
  meCache = { data, fetchedAt: now };
  return data;
}

export async function updateProfile(payload: Partial<Pick<Me, 'displayName' | 'lang'>>): Promise<Me> {
  const data = await api('/v1/users/me', {
    method: 'PATCH',
    body: payload
  });
  // 프로필 변경 시 캐시 무효화
  meCache = null;
  return data;
}

export async function changePassword(payload: { currentPassword: string; newPassword: string }): Promise<boolean> {
  const data = await api('/v1/users/me/password', {
    method: 'PATCH',
    body: payload
  });
  // 비밀번호 변경은 me 데이터 영향 없음
  return data.ok;
}

export async function deleteAccount(): Promise<boolean> {
  const data = await api('/v1/users/me', {
    method: 'DELETE'
  });
  meCache = null;
  return data.message === 'Account deleted successfully';
}
