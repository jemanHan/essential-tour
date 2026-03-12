import { FastifyInstance } from 'fastify';
import { z } from 'zod';

// 스케줄 데이터를 메모리에 저장 (실제로는 DB 사용)
let schedules: { [dateKey: string]: any[] } = {};

const scheduleSchema = z.object({
  startTime: z.string(),
  endTime: z.string(),
  googleApiData: z.string(),
  remarks: z.string().optional(),
});

export default async function scheduleRoutes(fastify: FastifyInstance) {
  // 특정 날짜의 스케줄 조회
  fastify.get('/schedules/:date', async (request, reply) => {
    const { date } = request.params as { date: string };
    const dateSchedules = schedules[date] || [];
    return { schedules: dateSchedules };
  });

  // 스케줄 추가
  fastify.post('/schedules/:date', async (request, reply) => {
    const { date } = request.params as { date: string };
    const scheduleData = scheduleSchema.parse(request.body);
    
    if (!schedules[date]) {
      schedules[date] = [];
    }
    
    const newSchedule = {
      id: Date.now(), // 간단한 ID 생성
      ...scheduleData,
    };
    
    schedules[date].push(newSchedule);
    
    return { schedule: newSchedule };
  });

  // 스케줄 수정
  fastify.put('/schedules/:date/:id', async (request, reply) => {
    const { date, id } = request.params as { date: string; id: string };
    const scheduleData = scheduleSchema.parse(request.body);
    
    if (!schedules[date]) {
      return reply.code(404).send({ error: 'Schedule not found' });
    }
    
    const scheduleIndex = schedules[date].findIndex(s => s.id === parseInt(id));
    if (scheduleIndex === -1) {
      return reply.code(404).send({ error: 'Schedule not found' });
    }
    
    schedules[date][scheduleIndex] = {
      ...schedules[date][scheduleIndex],
      ...scheduleData,
    };
    
    return { schedule: schedules[date][scheduleIndex] };
  });

  // 스케줄 삭제
  fastify.delete('/schedules/:date/:id', async (request, reply) => {
    const { date, id } = request.params as { date: string; id: string };
    
    if (!schedules[date]) {
      return reply.code(404).send({ error: 'Schedule not found' });
    }
    
    const scheduleIndex = schedules[date].findIndex(s => s.id === parseInt(id));
    if (scheduleIndex === -1) {
      return reply.code(404).send({ error: 'Schedule not found' });
    }
    
    schedules[date].splice(scheduleIndex, 1);
    
    return { message: 'Schedule deleted' };
  });

  // 스케줄 순서 변경
  fastify.put('/schedules/:date/reorder', async (request, reply) => {
    const { date } = request.params as { date: string };
    const { fromIndex, toIndex } = request.body as { fromIndex: number; toIndex: number };
    
    if (!schedules[date]) {
      return reply.code(404).send({ error: 'Schedule not found' });
    }
    
    if (fromIndex < 0 || toIndex < 0 || fromIndex >= schedules[date].length || toIndex >= schedules[date].length) {
      return reply.code(400).send({ error: 'Invalid index' });
    }
    
    const [movedItem] = schedules[date].splice(fromIndex, 1);
    schedules[date].splice(toIndex, 0, movedItem);
    
    return { message: 'Schedule reordered' };
  });
}





