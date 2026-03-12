// 스케줄 서비스 클래스
import { apiClient } from '../lib/api';

export interface Schedule {
  id: string;                    // Prisma CUID (25자 문자열)
  userId: string;                // 사용자 ID
  date: string;                  // ISO 8601 형식 (2025-09-09T00:00:00.000Z)
  startTime: string;             // HH:MM 형식 (24시간)
  endTime: string;               // HH:MM 형식 (24시간)
  title: string;                 // 스케줄 제목 (필수)
  remarks?: string | null;       // 비고 (선택)
  order: number;                 // 순서 (정수)
  createdAt: string;             // ISO 8601 형식
  updatedAt: string;             // ISO 8601 형식
}

export interface ScheduleCreateData {
  date: string;                  // YYYY-MM-DD 형식
  startTime: string;             // HH:MM 형식 (24시간)
  endTime: string;               // HH:MM 형식 (24시간)
  title: string;                 // 스케줄 제목 (필수)
  remarks?: string | null;       // 비고 (선택)
}

export interface ScheduleUpdateData {
  date?: string;                 // YYYY-MM-DD 형식
  startTime?: string;            // HH:MM 형식 (24시간)
  endTime?: string;              // HH:MM 형식 (24시간)
  title?: string;                // 스케줄 제목
  remarks?: string | null;       // 비고
}

export interface BatchScheduleData {
  schedules: ScheduleCreateData[];  // date는 각 스케줄에 포함됨
}

class ScheduleService {
  // 스케줄 목록 조회
  async getSchedules(date?: string): Promise<Schedule[]> {
    try {
      const endpoint = date ? `/v1/schedules/${date}` : '/v1/schedules';
      const response = await apiClient.get<{success: boolean, data: Schedule[]}>(endpoint);
      return response.success && Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error('스케줄 조회 실패:', error);
      throw new Error('스케줄을 불러오는데 실패했습니다.');
    }
  }


  // 스케줄 상세 조회
  async getSchedule(id: string): Promise<Schedule> {
    try {
      const response = await apiClient.get<{success: boolean, data: Schedule}>(`/v1/schedules/${id}`);
      return response.data;
    } catch (error) {
      console.error('스케줄 상세 조회 실패:', error);
      throw new Error('스케줄을 불러오는데 실패했습니다.');
    }
  }

  // 스케줄 생성
  async createSchedule(data: ScheduleCreateData): Promise<Schedule> {
    try {
      // 데이터 검증
      const validation = this.validateSchedule(data);
      if (!validation.isValid) {
        console.error('데이터 검증 실패:', validation.errors);
        throw new Error(validation.errors.join(', '));
      }

      console.log('=== ScheduleService 스케줄 생성 시도 ===');
      console.log('요청 데이터:', JSON.stringify(data, null, 2));
      console.log('API 엔드포인트:', '/v1/schedules');
      
      const response = await apiClient.post<{success: boolean, data: Schedule}>('/v1/schedules', data);
      
      console.log('API 응답 성공:', response);
      return response.data;
    } catch (error) {
      console.error('=== ScheduleService 스케줄 생성 실패 ===');
      console.error('에러 객체:', error);
      console.error('에러 메시지:', error instanceof Error ? error.message : '알 수 없는 에러');
      throw new Error('스케줄 생성에 실패했습니다.');
    }
  }

  // 스케줄 수정
  async updateSchedule(id: string, data: ScheduleUpdateData): Promise<Schedule> {
    try {
      console.log('스케줄 수정 시도:', { id, data });
      const response = await apiClient.put<{success: boolean, data: Schedule}>(`/v1/schedules/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('스케줄 수정 실패:', error);
      throw new Error('스케줄 수정에 실패했습니다.');
    }
  }

  // 스케줄 삭제
  async deleteSchedule(id: string): Promise<void> {
    try {
      console.log('스케줄 삭제 시도:', { id });
      await apiClient.delete(`/v1/schedules/${id}`);
    } catch (error) {
      console.error('스케줄 삭제 실패:', error);
      throw new Error('스케줄 삭제에 실패했습니다.');
    }
  }

  // 스케줄 일괄 저장
  async saveAllSchedules(data: BatchScheduleData): Promise<{ message: string; count: number }> {
    try {
      const response = await apiClient.post<{success: boolean, data: Schedule[]}>('/v1/schedules/batch', data);
      return {
        message: '스케줄이 성공적으로 저장되었습니다.',
        count: response.data.length
      };
    } catch (error) {
      console.error('스케줄 일괄 저장 실패:', error);
      throw new Error('스케줄 저장에 실패했습니다.');
    }
  }

  // 날짜 형식 변환 (Date -> YYYY-MM-DD)
  formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  // 시간 형식 검증
  validateTime(time: string): boolean {
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    return timeRegex.test(time);
  }

  // 스케줄 데이터 검증
  validateSchedule(data: ScheduleCreateData): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!data.date) {
      errors.push('날짜를 입력해주세요.');
    }

    if (!data.title || data.title.trim() === '') {
      errors.push('스케줄 제목을 입력해주세요.');
    }

    if (!data.startTime) {
      errors.push('시작 시간을 입력해주세요.');
    } else if (!this.validateTime(data.startTime)) {
      errors.push('시작 시간 형식이 올바르지 않습니다. (HH:MM)');
    }

    if (!data.endTime) {
      errors.push('종료 시간을 입력해주세요.');
    } else if (!this.validateTime(data.endTime)) {
      errors.push('종료 시간 형식이 올바르지 않습니다. (HH:MM)');
    }

    if (data.startTime && data.endTime && data.startTime >= data.endTime) {
      errors.push('시작 시간은 종료 시간보다 빨라야 합니다.');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

// 싱글톤 인스턴스 생성
export const scheduleService = new ScheduleService();
export default scheduleService;
