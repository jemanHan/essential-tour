import { useState, useEffect, useRef, useCallback } from 'react';

export interface ScheduleItem {
  id: string;
  startTime: string;
  endTime: string;
  title: string;
  googleApiData: string;
  remarks?: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface ScheduleData {
  [dateKey: string]: ScheduleItem[];
}

import { API_CONFIG, getApiUrl } from '../config/api.js';

export const useScheduleApi = () => {
  const [schedules, setSchedules] = useState<ScheduleData>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestCache = useRef<Map<string, { data: ScheduleItem[], timestamp: number }>>(new Map());
  const CACHE_DURATION = 30000; // 30초 캐시

  // 날짜를 키로 변환하는 함수
  const getDateKey = (date: Date): string => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };

  // API 호출 헬퍼
  const apiCall = async (endpoint: string, options: RequestInit = {}) => {
    const token = localStorage.getItem('vk_token');
    
    // JWT 토큰이 없으면 로그인 페이지로 리다이렉트
    if (!token) {
      console.warn('JWT 토큰이 없습니다. 로그인이 필요합니다.');
      window.location.href = '/login';
      throw new Error('Authentication required');
    }
    
    // DELETE 요청이 아닌 경우에만 Content-Type 설정
    const headers: Record<string, string> = {
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    };
    
    if (options.method !== 'DELETE') {
      headers['Content-Type'] = 'application/json';
    }
    
    const response = await fetch(getApiUrl(endpoint), {
      ...options,
      headers,
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
      throw new Error(errorData.error || `API Error: ${response.status}`);
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
  };


  // 캐시 무효화
  const invalidateCache = (dateStr: string) => {
    requestCache.current.delete(dateStr);
  };

  // 로컬 스토리지 fallback 함수들
  const getLocalSchedules = (dateStr: string): ScheduleItem[] => {
    const stored = localStorage.getItem(`schedules_${dateStr}`);
    return stored ? JSON.parse(stored) : [];
  };

  const setLocalSchedules = (dateStr: string, schedules: ScheduleItem[]) => {
    localStorage.setItem(`schedules_${dateStr}`, JSON.stringify(schedules));
  };

  // 스케줄 추가
  const addSchedule = async (date: Date, schedule: Omit<ScheduleItem, 'id' | 'order' | 'createdAt' | 'updatedAt'>) => {
    const dateStr = getDateKey(date);
    
    try {
      setLoading(true);
      
      // API 호출 시도
      const data = await apiCall('/v1/schedules', {
        method: 'POST',
        body: JSON.stringify({
          date: dateStr,
          startTime: schedule.startTime,
          endTime: schedule.endTime,
          title: schedule.title,
          remarks: schedule.remarks || '',
        }),
      });

      // 응답 정규화
      const newSchedule = (data && (data.data || data.schedule || data)) as any;
      // 캐시 무효화 및 최신 데이터 재조회로 일관성 확보
      invalidateCache(dateStr);
      await loadSchedulesForDate(date);
      return newSchedule;
    } catch (err: any) {
      // 토큰이 없거나 API 실패 시 로컬 스토리지 사용
      if (err.message?.includes('No authentication token') || err.message?.includes('401')) {
        const localSchedules = getLocalSchedules(dateStr);
        const newSchedule: ScheduleItem = {
          id: `local_${Date.now()}`,
          startTime: schedule.startTime,
          endTime: schedule.endTime,
          title: schedule.title,
          remarks: schedule.remarks || '',
          order: (localSchedules || []).length + 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        
        const updatedSchedules = [...localSchedules, newSchedule];
        setLocalSchedules(dateStr, updatedSchedules);
        
        // 로컬 상태 업데이트
        setSchedules(prev => ({
          ...prev,
          [dateStr]: updatedSchedules
        }));
        
        return newSchedule;
      }
      
      console.error('Failed to add schedule:', err);
      setError('스케줄 추가에 실패했습니다.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // 스케줄 삭제
  const deleteSchedule = async (date: Date, scheduleId: string) => {
    const dateStr = getDateKey(date);
    
    try {
      setLoading(true);
      await apiCall(`/v1/schedules/${scheduleId}`, {
        method: 'DELETE',
      });

      // 캐시 무효화 및 로컬 상태 업데이트
      invalidateCache(dateStr);
      const dateKey = getDateKey(date);
      setSchedules(prev => ({
        ...prev,
        [dateKey]: (prev[dateKey] || []).filter(s => s.id !== scheduleId)
      }));
    } catch (err: any) {
      // 토큰이 없거나 API 실패 시 로컬 스토리지에서 삭제
      if (err.message?.includes('No authentication token') || err.message?.includes('401')) {
        const localSchedules = getLocalSchedules(dateStr);
        const updatedSchedules = localSchedules.filter(s => s.id !== scheduleId);
        setLocalSchedules(dateStr, updatedSchedules);
        
        // 로컬 상태 업데이트
        setSchedules(prev => ({
          ...prev,
          [dateStr]: updatedSchedules
        }));
        return;
      }
      
      console.error('Failed to delete schedule:', err);
      setError('스케줄 삭제에 실패했습니다.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // 스케줄 수정
  const updateSchedule = async (date: Date, scheduleId: string, updates: Partial<ScheduleItem>) => {
    const dateStr = getDateKey(date);
    
    try {
      setLoading(true);
      const data = await apiCall(`/v1/schedules/${scheduleId}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });

      // 캐시 무효화 및 로컬 상태 업데이트
      invalidateCache(dateStr);
      const dateKey = getDateKey(date);
      setSchedules(prev => ({
        ...prev,
        [dateKey]: (prev[dateKey] || []).map(s => 
          s.id === scheduleId ? { ...s, ...updates } : s
        )
      }));

      return data.data; // 백엔드가 {success: true, data: {...}} 형식으로 반환
    } catch (err: any) {
      // 토큰이 없거나 API 실패 시 로컬 스토리지에서 업데이트
      if (err.message?.includes('No authentication token') || err.message?.includes('401')) {
        const localSchedules = getLocalSchedules(dateStr);
        const updatedSchedules = localSchedules.map(s => 
          s.id === scheduleId ? { ...s, ...updates, updatedAt: new Date().toISOString() } : s
        );
        setLocalSchedules(dateStr, updatedSchedules);
        
        // 로컬 상태 업데이트
        setSchedules(prev => ({
          ...prev,
          [dateStr]: updatedSchedules
        }));
        
        return updatedSchedules.find(s => s.id === scheduleId);
      }
      
      console.error('Failed to update schedule:', err);
      setError('스케줄 수정에 실패했습니다.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // 스케줄 순서 변경 (위로)
  const moveSchedule = async (date: Date, scheduleId: string, direction: 'up' | 'down') => {
    const dateKey = getDateKey(date);
    const existingSchedules = schedules[dateKey] || [];
    const currentIndex = existingSchedules.findIndex(s => s.id === scheduleId);
    
    if (currentIndex === -1) return;
    
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    
    if (newIndex < 0 || newIndex >= (existingSchedules || []).length) return;

    try {
      setLoading(true);
      
      // 순서 변경 후 전체 스케줄 ID 배열 생성
      const newSchedules = [...existingSchedules];
      [newSchedules[currentIndex], newSchedules[newIndex]] = [newSchedules[newIndex], newSchedules[currentIndex]];
      const scheduleIds = newSchedules.map(s => s.id);

      // API 호출 시도
      await apiCall('/v1/schedules/reorder', {
        method: 'PUT',
        body: JSON.stringify({
          date: getDateKey(date),
          scheduleIds: scheduleIds,
        }),
      });

      // 캐시 무효화 및 로컬 상태 업데이트
      invalidateCache(getDateKey(date));
      
      setSchedules(prev => ({
        ...prev,
        [dateKey]: newSchedules
      }));
    } catch (err: any) {
      // 토큰이 없거나 API 실패 시 로컬 스토리지에서 처리
      if (err.message?.includes('No authentication token') || err.message?.includes('401')) {
        const dateStr = getDateKey(date);
        const localSchedules = getLocalSchedules(dateStr);
        const newSchedules = [...localSchedules];
        
        // 현재 인덱스 찾기 (로컬 데이터 기준)
        const localCurrentIndex = newSchedules.findIndex(s => s.id === scheduleId);
        const localNewIndex = direction === 'up' ? localCurrentIndex - 1 : localCurrentIndex + 1;
        
        if (localCurrentIndex !== -1 && localNewIndex >= 0 && localNewIndex < (newSchedules || []).length) {
          [newSchedules[localCurrentIndex], newSchedules[localNewIndex]] = [newSchedules[localNewIndex], newSchedules[localCurrentIndex]];
          setLocalSchedules(dateStr, newSchedules);
          
          // 로컬 상태 업데이트
          setSchedules(prev => ({
            ...prev,
            [dateKey]: newSchedules
          }));
        }
        return;
      }
      
      console.error('Failed to move schedule:', err);
      setError('스케줄 순서 변경에 실패했습니다.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // 스케줄 순서 변경 (드래그&드롭) - 시간은 고정하고 내용만 바뀌는 방식
  const reorderSchedules = async (date: Date, fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return;
    
    const dateStr = getDateKey(date);
    const dateKey = getDateKey(date);

    try {
      setLoading(true);
      
      // 현재 상태에서 최신 스케줄 데이터 가져오기
      const currentSchedules = schedules[dateKey] || [];
      const newSchedules = [...currentSchedules];
      
      // 시간은 고정하고 내용만 바뀌는 방식으로 순서 변경
      // fromIndex의 내용을 toIndex로 이동
      const fromItem = newSchedules[fromIndex];
      const toItem = newSchedules[toIndex];
      
      // 내용만 교체 (시간은 유지)
      newSchedules[fromIndex] = {
        ...fromItem,
        title: toItem.title,
        googleApiData: toItem.googleApiData,
        remarks: toItem.remarks,
        category: toItem.category
      };
      
      newSchedules[toIndex] = {
        ...toItem,
        title: fromItem.title,
        googleApiData: fromItem.googleApiData,
        remarks: fromItem.remarks,
        category: fromItem.category
      };
      
      // 즉시 UI 업데이트
      setSchedules(prev => ({
        ...prev,
        [dateKey]: newSchedules
      }));
      
      // API 호출 (비동기)
      const scheduleIds = newSchedules.map(s => s.id);
      await apiCall('/v1/schedules/reorder', {
        method: 'PUT',
        body: JSON.stringify({
          date: dateStr,
          scheduleIds: scheduleIds,
        }),
      });
      
      // 캐시 무효화
      invalidateCache(dateStr);
      
    } catch (err: any) {
      // 토큰이 없거나 API 실패 시 로컬 스토리지에서 처리
      if (err.message?.includes('No authentication token') || err.message?.includes('401')) {
        const localSchedules = getLocalSchedules(dateStr);
        const newSchedules = [...localSchedules];
        
        // 시간은 고정하고 내용만 바뀌는 방식으로 순서 변경
        const fromItem = newSchedules[fromIndex];
        const toItem = newSchedules[toIndex];
        
        newSchedules[fromIndex] = {
          ...fromItem,
          title: toItem.title,
          googleApiData: toItem.googleApiData,
          remarks: toItem.remarks,
          category: toItem.category
        };
        
        newSchedules[toIndex] = {
          ...toItem,
          title: fromItem.title,
          googleApiData: fromItem.googleApiData,
          remarks: fromItem.remarks,
          category: fromItem.category
        };
        
        setLocalSchedules(dateStr, newSchedules);
        
        // 로컬 상태 업데이트
        setSchedules(prev => ({
          ...prev,
          [dateKey]: newSchedules
        }));
        return;
      }
      
      console.error('Failed to reorder schedules:', err);
      setError('스케줄 순서 변경에 실패했습니다.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // 특정 날짜의 스케줄 로드 (async 버전)
  const fetchSchedulesForDate = async (date: Date): Promise<ScheduleItem[]> => {
    const dateKey = getDateKey(date);
    const dateStr = dateKey; // YYYY-MM-DD 형식
    
    // 캐시 확인
    const cached = requestCache.current.get(dateStr);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.data;
    }

    try {
      setLoading(true);
      
      // API 호출 시도
      const data = await apiCall(`/v1/schedules/${dateStr}`);
      // 응답 정규화: schedules -> data -> 본문 자체
      const scheduleData = Array.isArray(data?.schedules)
        ? data.schedules
        : Array.isArray(data?.data)
        ? data.data
        : Array.isArray(data)
        ? data
        : [];
      
      // 캐시에 저장
      requestCache.current.set(dateStr, { data: scheduleData, timestamp: Date.now() });
      
      return scheduleData;
    } catch (err: any) {
      // 토큰이 없거나 API 실패 시 로컬 스토리지에서 가져오기
      if (err.message?.includes('No authentication token') || err.message?.includes('401')) {
        const localSchedules = getLocalSchedules(dateStr);
        // 캐시에 로컬 데이터 저장
        requestCache.current.set(dateStr, { data: localSchedules, timestamp: Date.now() });
        return localSchedules;
      }
      console.error('Failed to fetch schedules:', err);
      setError('스케줄을 불러오는데 실패했습니다.');
      return [];
    } finally {
      setLoading(false);
    }
  };

  // 특정 날짜의 스케줄 로드
  const loadSchedulesForDate = useCallback(async (date: Date) => {
    try {
      const dateKey = getDateKey(date);
      const data = await fetchSchedulesForDate(date);
      
      setSchedules(prev => ({
        ...prev,
        [dateKey]: data
      }));
    } catch (err) {
      console.error('Failed to load schedules:', err);
      // 에러가 발생해도 빈 배열로 설정하여 UI가 깨지지 않도록 함
      const dateKey = getDateKey(date);
      setSchedules(prev => ({
        ...prev,
        [dateKey]: []
      }));
    }
  }, []);

  // 에러 클리어
  const clearError = () => setError(null);

  // 동기적으로 현재 로드된 스케줄 반환
  const getSchedulesFromState = (date: Date) => {
    const dateKey = getDateKey(date);
    return schedules[dateKey] || [];
  };

  return {
    schedules,
    loading,
    error,
    getSchedulesForDate: getSchedulesFromState,
    addSchedule,
    deleteSchedule,
    updateSchedule,
    moveSchedule,
    reorderSchedules,
    loadSchedulesForDate,
    clearError,
  };
};