import { getApiUrl } from '../config/api';

export interface RecentViewData {
  id: string;
  placeId: string;
  name?: string;
  address?: string;
  rating?: number;
  tags?: string[];
  viewedAt: string;
}

export interface RecentViewResponse {
  success: boolean;
  data: RecentViewData[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// 최근 본 장소 목록 가져오기
export async function getRecentViews(page = 1, limit = 20): Promise<RecentViewResponse> {
  const token = localStorage.getItem('vk_token');
  if (!token) {
    throw new Error('Authentication required');
  }

  const response = await fetch(
    `${getApiUrl('/v1/recent-views')}?page=${page}&limit=${limit}`,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch recent views: ${response.status}`);
  }

  return response.json();
}

// 최근 본 장소 추가/업데이트
export async function addRecentView(placeId: string, name?: string, address?: string, rating?: number, tags?: string[]): Promise<{ success: boolean; data: RecentViewData }> {
  const token = localStorage.getItem('vk_token');
  if (!token) {
    throw new Error('Authentication required');
  }

  const response = await fetch(getApiUrl('/v1/recent-views'), {
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
    throw new Error(`Failed to add recent view: ${response.status}`);
  }

  return response.json();
}

// 최근 본 장소 삭제
export async function removeRecentView(placeId: string): Promise<{ success: boolean; message: string }> {
  const token = localStorage.getItem('vk_token');
  if (!token) {
    throw new Error('Authentication required');
  }

  const response = await fetch(getApiUrl(`/v1/recent-views/${encodeURIComponent(placeId)}`), {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to remove recent view: ${response.status}`);
  }

  return response.json();
}


