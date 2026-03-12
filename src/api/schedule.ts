import { scheduleApi } from '../lib/apiClient';

export interface ScheduleItem {
  id: number;
  startTime: string;
  endTime: string;
  googleApiData: string;
  remarks: string;
  category?: string;
}

export interface ScheduleApiResponse {
  schedules: ScheduleItem[];
}

// 날짜를 키로 변환하는 함수
const getDateKey = (date: Date): string => {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

// 특정 날짜의 스케줄 조회
export const getSchedulesForDate = async (date: Date): Promise<ScheduleItem[]> => {
  const dateKey = getDateKey(date);
  try {
    const data: ScheduleApiResponse = await scheduleApi.get(`/v1/schedules/${dateKey}`);
    return data.schedules;
  } catch (error) {
    console.error('Error fetching schedules:', error);
    return [];
  }
};

// 스케줄 추가
export const addSchedule = async (date: Date, schedule: Omit<ScheduleItem, 'id'>): Promise<ScheduleItem> => {
  const dateKey = getDateKey(date);
  try {
    const payload = {
      date: dateKey,
      startTime: schedule.startTime,
      endTime: schedule.endTime,
      title: schedule.title,
      remarks: schedule.remarks ?? ''
    };
    const data = await scheduleApi.post(`/v1/schedules`, payload);
    const created = data?.data ?? data?.schedule ?? data;
    return created as ScheduleItem;
  } catch (error) {
    console.error('Error adding schedule:', error);
    throw error;
  }
};

// 스케줄 수정
export const updateSchedule = async (_date: Date, id: number, schedule: Partial<ScheduleItem>): Promise<ScheduleItem> => {
  try {
    const data = await scheduleApi.put(`/v1/schedules/${id}`, schedule);
    const updated = data?.data ?? data?.schedule ?? data;
    return updated as ScheduleItem;
  } catch (error) {
    console.error('Error updating schedule:', error);
    throw error;
  }
};

// 스케줄 삭제
export const deleteSchedule = async (_date: Date, id: number): Promise<void> => {
  try {
    await scheduleApi.delete(`/v1/schedules/${id}`);
  } catch (error) {
    console.error('Error deleting schedule:', error);
    throw error;
  }
};

// 스케줄 순서 변경
export const reorderSchedules = async (date: Date, fromIndex: number, toIndex: number): Promise<void> => {
  const dateKey = getDateKey(date);
  try {
    await scheduleApi.put(`/v1/schedules/${dateKey}/reorder`, { fromIndex, toIndex });
  } catch (error) {
    console.error('Error reordering schedules:', error);
    throw error;
  }
};
