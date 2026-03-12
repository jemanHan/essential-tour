import { getApiUrl } from '../config/api';

export interface LikeData {
  id: string;
  placeId: string;
  name?: string;
  address?: string;
  rating?: number;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface LikeResponse {
  success: boolean;
  data: LikeData[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// 좋아요 목록 가져오기
export async function getLikes(page = 1, limit = 20): Promise<LikeResponse> {
  const token = localStorage.getItem('vk_token');
  if (!token) {
    throw new Error('Authentication required');
  }

  const response = await fetch(
    `${getApiUrl('/v1/likes')}?page=${page}&limit=${limit}`,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch likes: ${response.status}`);
  }

  return response.json();
}

// 좋아요 추가/업데이트
export async function addLike(placeId: string, name?: string, address?: string, rating?: number, tags?: string[]): Promise<{ success: boolean; like: LikeData }> {
  const token = localStorage.getItem('vk_token');
  if (!token) {
    throw new Error('Authentication required');
  }

  const response = await fetch(getApiUrl('/v1/likes'), {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      placeId,
      name,
      address,
      rating,
      tags: tags || []
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to add like: ${response.status}`);
  }

  return response.json();
}

// 좋아요 취소
export async function removeLike(placeId: string): Promise<{ success: boolean; message: string }> {
  const token = localStorage.getItem('vk_token');
  if (!token) {
    throw new Error('Authentication required');
  }

  const response = await fetch(getApiUrl(`/v1/likes/${encodeURIComponent(placeId)}`), {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to remove like: ${response.status}`);
  }

  return response.json();
}

// 좋아요 상태 확인
export async function checkLikeStatus(placeId: string): Promise<{ liked: boolean; like: LikeData | null }> {
  const token = localStorage.getItem('vk_token');
  if (!token) {
    throw new Error('Authentication required');
  }

  const response = await fetch(getApiUrl(`/v1/likes/${encodeURIComponent(placeId)}`), {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to check like status: ${response.status}`);
  }
  return response.json();
}
