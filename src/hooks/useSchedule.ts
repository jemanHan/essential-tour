import { useState, useEffect, useCallback } from 'react';
import { 
  getSchedulesForDate as apiGetSchedulesForDate,
  addSchedule as apiAddSchedule,
  updateSchedule as apiUpdateSchedule,
  deleteSchedule as apiDeleteSchedule,
  reorderSchedules as apiReorderSchedules
} from '../api/schedule';
import type { ScheduleItem } from '../api/schedule';

export { ScheduleItem };

export interface ScheduleData {
  [dateKey: string]: ScheduleItem[];
}

const STORAGE_KEY = 'visitkorea_schedules';

export const useSchedule = () => {
  const [schedules, setSchedules] = useState<ScheduleData>(() => {
    // 개발 모드에서 더미 스케줄 데이터 생성
    if (import.meta.env.DEV) {
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dayAfterTomorrow = new Date(today);
      dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);
      
      const getDateKey = (date: Date): string => {
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      };
      
      return {
        [getDateKey(today)]: [
          {
            id: 1,
            startTime: '09:00',
            endTime: '10:30',
            googleApiData: '강남역',
            remarks: '강남역에서 만나서 출발'
          },
          {
            id: 2,
            startTime: '11:00',
            endTime: '12:30',
            googleApiData: '코엑스 아쿠아리움',
            remarks: '아쿠아리움 관람'
          },
          {
            id: 3,
            startTime: '13:00',
            endTime: '14:00',
            googleApiData: '스타필드 코엑스몰',
            remarks: '점심 식사'
          }
        ],
        [getDateKey(tomorrow)]: [
          {
            id: 4,
            startTime: '10:00',
            endTime: '11:30',
            googleApiData: '롯데월드타워',
            remarks: '전망대 관람'
          },
          {
            id: 5,
            startTime: '14:00',
            endTime: '16:00',
            googleApiData: '한강공원',
            remarks: '한강 산책'
          }
        ],
        [getDateKey(dayAfterTomorrow)]: [
          {
            id: 6,
            startTime: '09:30',
            endTime: '11:00',
            googleApiData: '삼성동 코엑스',
            remarks: '쇼핑'
          }
        ]
      };
    }
    
    return {};
  });

  // 날짜를 키로 변환하는 함수
  const getDateKey = (date: Date): string => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };

  // 로컬 스토리지에서 데이터 로드
  useEffect(() => {
    const savedSchedules = localStorage.getItem(STORAGE_KEY);
    if (savedSchedules) {
      try {
        setSchedules(JSON.parse(savedSchedules));
      } catch (error) {
        console.error('Failed to parse saved schedules:', error);
      }
    } else {
      // 개발 모드에서 더미 스케줄 데이터 생성
      if (import.meta.env.DEV) {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const dayAfterTomorrow = new Date(today);
        dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);
        
        const dummySchedules: ScheduleData = {
          [getDateKey(today)]: [
            {
              id: 1,
              startTime: '09:00',
              endTime: '10:30',
              googleApiData: '강남역',
              remarks: '강남역에서 만나서 출발'
            },
            {
              id: 2,
              startTime: '11:00',
              endTime: '12:30',
              googleApiData: '코엑스 아쿠아리움',
              remarks: '아쿠아리움 관람'
            },
            {
              id: 3,
              startTime: '13:00',
              endTime: '14:00',
              googleApiData: '스타필드 코엑스몰',
              remarks: '점심 식사'
            }
          ],
          [getDateKey(tomorrow)]: [
            {
              id: 4,
              startTime: '10:00',
              endTime: '11:30',
              googleApiData: '롯데월드타워',
              remarks: '전망대 관람'
            },
            {
              id: 5,
              startTime: '14:00',
              endTime: '16:00',
              googleApiData: '한강공원',
              remarks: '한강 산책'
            }
          ],
          [getDateKey(dayAfterTomorrow)]: [
            {
              id: 6,
              startTime: '09:30',
              endTime: '11:00',
              googleApiData: '삼성동 코엑스',
              remarks: '쇼핑'
            }
          ]
        };
        
        setSchedules(dummySchedules);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(dummySchedules));
        console.log('🔧 개발 모드: 더미 스케줄 데이터 생성됨', dummySchedules);
      }
    }
  }, []);

  // 스케줄 데이터를 로컬 스토리지에 저장
  const saveSchedules = (newSchedules: ScheduleData) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newSchedules));
    setSchedules(newSchedules);
  };

  // 특정 날짜의 스케줄 가져오기 (API 호출) - 메모이제이션 개선
  const getSchedulesForDate = useCallback(async (date: Date): Promise<ScheduleItem[]> => {
    const dateKey = getDateKey(date);
    
    try {
      const apiSchedules = await apiGetSchedulesForDate(date);
      
      // 로컬 상태 업데이트
      setSchedules(prev => ({
        ...prev,
        [dateKey]: apiSchedules
      }));
      
      return apiSchedules;
    } catch (error) {
      console.error('Error fetching schedules:', error);
      // API 실패 시 빈 배열 반환 (로컬 캐시 사용하지 않음)
      return [];
    }
  }, []);

  // 동기적으로 스케줄 가져오기 (로컬 상태에서)
  const getSchedulesForDateSync = (date: Date): ScheduleItem[] => {
    const dateKey = getDateKey(date);
    return schedules[dateKey] || [];
  };

  // 특정 날짜에 스케줄 추가 (API 호출)
  const addSchedule = async (date: Date, schedule: Omit<ScheduleItem, 'id'>): Promise<ScheduleItem> => {
    try {
      const newSchedule = await apiAddSchedule(date, schedule);
      const dateKey = getDateKey(date);
      
      // 로컬 상태 업데이트
      setSchedules(prev => ({
        ...prev,
        [dateKey]: [...(prev[dateKey] || []), newSchedule]
      }));
      
      return newSchedule;
    } catch (error) {
      console.error('Error adding schedule:', error);
      throw error;
    }
  };

  // 스케줄 삭제 (API 호출)
  const deleteSchedule = async (date: Date, scheduleId: number): Promise<void> => {
    try {
      await apiDeleteSchedule(date, scheduleId);
      const dateKey = getDateKey(date);
      
      // 로컬 상태 업데이트
      setSchedules(prev => ({
        ...prev,
        [dateKey]: (prev[dateKey] || []).filter(s => s.id !== scheduleId)
      }));
    } catch (error) {
      console.error('Error deleting schedule:', error);
      throw error;
    }
  };

  // 스케줄 업데이트 (API 호출)
  const updateSchedule = async (date: Date, scheduleId: number, updates: Partial<ScheduleItem>): Promise<void> => {
    try {
      const updatedSchedule = await apiUpdateSchedule(date, scheduleId, updates);
      const dateKey = getDateKey(date);
      
      // 로컬 상태 업데이트
      setSchedules(prev => ({
        ...prev,
        [dateKey]: (prev[dateKey] || []).map(s => 
          s.id === scheduleId ? updatedSchedule : s
        )
      }));
    } catch (error) {
      console.error('Error updating schedule:', error);
      throw error;
    }
  };

  // 특정 날짜의 모든 스케줄 삭제
  const clearSchedulesForDate = (date: Date) => {
    const dateKey = getDateKey(date);
    const newSchedules = { ...schedules };
    delete newSchedules[dateKey];
    saveSchedules(newSchedules);
  };


  // 스케줄 순서 변경 (드래그&드롭용) - API 호출
  const reorderSchedules = async (date: Date, fromIndex: number, toIndex: number): Promise<void> => {
    try {
      await apiReorderSchedules(date, fromIndex, toIndex);
      const dateKey = getDateKey(date);
      const existingSchedules = schedules[dateKey] || [];
      
      if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0 || 
          fromIndex >= existingSchedules.length || toIndex >= existingSchedules.length) {
        return;
      }
      
      const newSchedules = [...existingSchedules];
      const [movedItem] = newSchedules.splice(fromIndex, 1);
      newSchedules.splice(toIndex, 0, movedItem);
      
      // 로컬 상태 업데이트
      setSchedules(prev => ({
        ...prev,
        [dateKey]: newSchedules
      }));
    } catch (error) {
      console.error('Error reordering schedules:', error);
      throw error;
    }
  };

  return {
    schedules,
    getSchedulesForDate,
    getSchedulesForDateSync,
    addSchedule,
    deleteSchedule,
    updateSchedule,
    clearSchedulesForDate,
    reorderSchedules
  };
};