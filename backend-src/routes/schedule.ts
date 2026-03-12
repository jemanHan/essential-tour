import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { prisma } from '@db/client';

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
    
    try {
      const dateObj = new Date(date);
      
      // 기본 사용자 ID 가져오기
      const defaultUser = await prisma.user.findUnique({
        where: { email: 'default@visitkorea.com' }
      });
      
      if (!defaultUser) {
        return reply.code(500).send({ error: 'Default user not found' });
      }
      
      const schedules = await prisma.schedule.findMany({
        where: {
          date: dateObj,
          userId: defaultUser.id
        },
        orderBy: {
          order: 'asc'
        }
      });
      
      return { schedules };
    } catch (error) {
      fastify.log.error('Error fetching schedules:', error);
      return reply.code(500).send({ error: 'Failed to fetch schedules' });
    }
  });

  // 스케줄 추가
  fastify.post('/schedules/:date', async (request, reply) => {
    const { date } = request.params as { date: string };
    const scheduleData = scheduleSchema.parse(request.body);
    
    try {
      const dateObj = new Date(date);
      
      // 기본 사용자 ID 가져오기
      const defaultUser = await prisma.user.findUnique({
        where: { email: 'default@visitkorea.com' }
      });
      
      if (!defaultUser) {
        return reply.code(500).send({ error: 'Default user not found' });
      }
      
      // 해당 날짜의 마지막 order 값 가져오기
      const lastSchedule = await prisma.schedule.findFirst({
        where: {
          date: dateObj,
          userId: defaultUser.id
        },
        orderBy: {
          order: 'desc'
        }
      });
      
      const nextOrder = lastSchedule ? lastSchedule.order + 1 : 1;
      
      const newSchedule = await prisma.schedule.create({
        data: {
          userId: defaultUser.id,
          date: dateObj,
          startTime: scheduleData.startTime,
          endTime: scheduleData.endTime,
          title: scheduleData.googleApiData,
          remarks: scheduleData.remarks || '',
          order: nextOrder
        }
      });
      
      return { schedule: newSchedule };
    } catch (error) {
      fastify.log.error('Error creating schedule:', error);
      return reply.code(500).send({ error: 'Failed to create schedule' });
    }
  });

  // 스케줄 수정
  fastify.put('/schedules/:date/:id', async (request, reply) => {
    const { date, id } = request.params as { date: string; id: string };
    const scheduleData = scheduleSchema.parse(request.body);
    
    try {
      const dateObj = new Date(date);
      
      // 기본 사용자 ID 가져오기
      const defaultUser = await prisma.user.findUnique({
        where: { email: 'default@visitkorea.com' }
      });
      
      if (!defaultUser) {
        return reply.code(500).send({ error: 'Default user not found' });
      }
      
      const updatedSchedule = await prisma.schedule.update({
        where: {
          id: id,
          userId: defaultUser.id,
          date: dateObj
        },
        data: {
          startTime: scheduleData.startTime,
          endTime: scheduleData.endTime,
          title: scheduleData.googleApiData,
          remarks: scheduleData.remarks || ''
        }
      });
      
      return { schedule: updatedSchedule };
    } catch (error) {
      fastify.log.error('Error updating schedule:', error);
      return reply.code(500).send({ error: 'Failed to update schedule' });
    }
  });

  // 스케줄 삭제
  fastify.delete('/schedules/:date/:id', async (request, reply) => {
    const { date, id } = request.params as { date: string; id: string };
    
    try {
      const dateObj = new Date(date);
      
      // 기본 사용자 ID 가져오기
      const defaultUser = await prisma.user.findUnique({
        where: { email: 'default@visitkorea.com' }
      });
      
      if (!defaultUser) {
        return reply.code(500).send({ error: 'Default user not found' });
      }
      
      await prisma.schedule.delete({
        where: {
          id: id,
          userId: defaultUser.id,
          date: dateObj
        }
      });
      
      return { message: 'Schedule deleted' };
    } catch (error) {
      fastify.log.error('Error deleting schedule:', error);
      return reply.code(500).send({ error: 'Failed to delete schedule' });
    }
  });

  // 스케줄 순서 변경
  fastify.put('/schedules/:date/reorder', async (request, reply) => {
    const { date } = request.params as { date: string };
    const { fromIndex, toIndex } = request.body as { fromIndex: number; toIndex: number };
    
    try {
      const dateObj = new Date(date);
      
      // 기본 사용자 ID 가져오기
      const defaultUser = await prisma.user.findUnique({
        where: { email: 'default@visitkorea.com' }
      });
      
      if (!defaultUser) {
        return reply.code(500).send({ error: 'Default user not found' });
      }
      
      // 해당 날짜의 모든 스케줄 가져오기
      const schedules = await prisma.schedule.findMany({
        where: {
          date: dateObj,
          userId: defaultUser.id
        },
        orderBy: {
          order: 'asc'
        }
      });
      
      if (fromIndex < 0 || toIndex < 0 || fromIndex >= schedules.length || toIndex >= schedules.length) {
        return reply.code(400).send({ error: 'Invalid index' });
      }
      
      // 배열에서 아이템 이동
      const [movedItem] = schedules.splice(fromIndex, 1);
      schedules.splice(toIndex, 0, movedItem);
      
      // 새로운 순서로 DB 업데이트 (임시로 큰 값으로 설정 후 순차 업데이트)
      await prisma.$transaction(async (tx) => {
        // 1단계: 모든 스케줄을 임시로 큰 값으로 설정
        for (let i = 0; i < schedules.length; i++) {
          await tx.schedule.update({
            where: { id: schedules[i].id },
            data: { order: 1000 + i }
          });
        }
        
        // 2단계: 올바른 순서로 업데이트
        for (let i = 0; i < schedules.length; i++) {
          await tx.schedule.update({
            where: { id: schedules[i].id },
            data: { order: i + 1 }
          });
        }
      });
      
      return { message: 'Schedule reordered' };
    } catch (error) {
      fastify.log.error('Error reordering schedules:', error);
      return reply.code(500).send({ error: 'Failed to reorder schedules' });
    }
  });
}
