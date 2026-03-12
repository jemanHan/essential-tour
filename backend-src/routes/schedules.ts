import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { prisma } from "@db/client";

interface ScheduleRequest extends FastifyRequest {
  body: {
    date: string;
    startTime: string;
    endTime: string;
    title: string;
    remarks?: string;
    order?: number;
  };
  params: {
    id?: string;
    date?: string;
  };
}

interface ReorderRequest extends FastifyRequest {
  body: {
    date: string;
    scheduleIds: string[];
  };
}

export default async function scheduleRoutes(fastify: FastifyInstance) {
  // 특정 날짜의 스케줄 조회
  fastify.get("/schedules/:date", async (req: FastifyRequest, reply: FastifyReply) => {
    try {
      const { date } = req.params as { date: string };
      // 실제 사용자 ID 가져오기 (JWT에서 추출하거나 기본 사용자 사용)
      let userId = (req as any).userId;
      
      if (!userId) {
        // 기본 사용자 찾기
        const defaultUser = await prisma.user.findFirst({
          where: {
            email: {
              contains: '@'
            }
          }
        });
        
        if (!defaultUser) {
          return reply.code(500).send({ 
            success: false, 
            error: "NO_USER_FOUND",
            message: "No users found in database" 
          });
        }
        
        userId = defaultUser.id;
        console.log("Using default user for GET:", userId);
      }

      if (!date) {
        return reply.code(400).send({ 
          success: false, 
          error: "Missing date parameter",
          message: "Date parameter is required" 
        });
      }

      const schedulesRaw = await prisma.schedule.findMany({
        where: {
          userId,
          date: new Date(date)
        },
        orderBy: {
          order: 'asc'
        }
      });

      // 응답 정규화: 누락 필드 보정 및 타입 안전화
      const schedules = (schedulesRaw || []).map((item: any) => ({
        id: item.id,
        userId: item.userId,
        date: item.date,
        startTime: typeof item.startTime === 'string' ? item.startTime : '',
        endTime: typeof item.endTime === 'string' ? item.endTime : '',
        title: typeof item.title === 'string' && item.title.trim().length > 0 ? item.title : 'Untitled',
        remarks: item.remarks ?? null,
        order: typeof item.order === 'number' ? item.order : 0
      }));

      return { 
        success: true, 
        data: schedules, 
        schedules, 
        meta: { count: schedules.length, date }
      };
    } catch (error: any) {
      console.error("Get schedules error:", error);
      return reply.code(500).send({ 
        success: false, 
        error: "Failed to get schedules", 
        message: error.message 
      });
    }
  });

  // 새 스케줄 생성
  fastify.post("/schedules", async (req: FastifyRequest, reply: FastifyReply) => {
    try {
      const { date, startTime, endTime, title, remarks, order } = req.body as {
        date: string;
        startTime: string;
        endTime: string;
        title: string;
        remarks?: string;
        order?: number;
      };
      // 실제 사용자 ID 가져오기 (JWT에서 추출하거나 기본 사용자 사용)
      let userId = (req as any).userId;
      
      if (!userId) {
        // 기본 사용자 찾기 또는 생성
        const defaultUser = await prisma.user.findFirst({
          where: {
            email: {
              contains: '@'
            }
          }
        });
        
        if (!defaultUser) {
          return reply.code(500).send({ 
            success: false, 
            error: "NO_USER_FOUND",
            message: "No users found in database" 
          });
        }
        
        userId = defaultUser.id;
        console.log("Using default user:", userId);
      }

      // 디버깅용 로그
      console.log("Create schedule request:", {
        date, startTime, endTime, title, remarks, order, userId
      });

      if (!date || !startTime || !endTime || !title) {
        return reply.code(400).send({ 
          success: false, 
          error: "MISSING_REQUIRED_FIELD",
          message: "date, startTime, endTime, and title are required",
          details: {
            missing: [
              !date && 'date',
              !startTime && 'startTime', 
              !endTime && 'endTime',
              !title && 'title'
            ].filter(Boolean)
          }
        });
      }

      // 날짜 형식 검증 (YYYY-MM-DD)
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(date)) {
        return reply.code(400).send({ 
          success: false, 
          error: "INVALID_DATE_FORMAT",
          message: "Date must be in YYYY-MM-DD format",
          details: {
            received: date,
            expected: "YYYY-MM-DD"
          }
        });
      }

      // 시간 형식 검증 (HH:MM)
      const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (!timeRegex.test(startTime) || !timeRegex.test(endTime)) {
        return reply.code(400).send({ 
          success: false, 
          error: "INVALID_TIME_FORMAT",
          message: "Time must be in HH:MM format (24-hour)",
          details: {
            startTime: !timeRegex.test(startTime) ? startTime : null,
            endTime: !timeRegex.test(endTime) ? endTime : null
          }
        });
      }

      // 시작 시간이 종료 시간보다 늦은지 검증
      const [startHour, startMin] = startTime.split(':').map(Number);
      const [endHour, endMin] = endTime.split(':').map(Number);
      const startMinutes = startHour * 60 + startMin;
      const endMinutes = endHour * 60 + endMin;
      
      if (startMinutes >= endMinutes) {
        return reply.code(400).send({ 
          success: false, 
          error: "INVALID_TIME_RANGE",
          message: "Start time must be earlier than end time",
          details: {
            startTime: startTime,
            endTime: endTime
          }
        });
      }

      // 해당 날짜의 최대 order 값 조회
      const maxOrder = await prisma.schedule.findFirst({
        where: {
          userId,
          date: new Date(date)
        },
        orderBy: {
          order: 'desc'
        },
        select: {
          order: true
        }
      });

      const newOrder = order ?? (maxOrder?.order ?? 0) + 1;

      const schedule = await prisma.schedule.create({
        data: {
          userId,
          date: new Date(date),
          startTime,
          endTime,
          title,
          remarks: remarks || null,
          order: newOrder
        }
      });

      return { success: true, data: schedule };
    } catch (error: any) {
      console.error("Create schedule error:", error);
      return reply.code(500).send({ 
        success: false, 
        error: "Failed to create schedule", 
        message: error.message 
      });
    }
  });

  // 호환: 특정 날짜로 스케줄 생성 (구번들 호환용)
  fastify.post("/schedules/:date", async (req: FastifyRequest, reply: FastifyReply) => {
    try {
      const { date } = req.params as { date: string };
      const { startTime, endTime, title, remarks, order } = (req.body as any) || {};

      let userId = (req as any).userId;
      if (!userId) {
        const defaultUser = await prisma.user.findFirst({ where: { email: { contains: '@' } } });
        if (!defaultUser) {
          return reply.code(500).send({ success: false, error: "NO_USER_FOUND", message: "No users found in database" });
        }
        userId = defaultUser.id;
      }

      // 구번들에서 title 누락되는 사례가 있어 기본값 보정
      const safeTitle = (title && String(title).trim().length > 0) ? String(title).trim() : 'Untitled';
      if (!date || !startTime || !endTime) {
        return reply.code(400).send({ success: false, error: "MISSING_REQUIRED_FIELD", message: "date, startTime and endTime are required" });
      }

      const maxOrder = await prisma.schedule.findFirst({
        where: { userId, date: new Date(date) },
        orderBy: { order: 'desc' },
        select: { order: true }
      });
      const newOrder = (order as number | undefined) ?? (maxOrder?.order ?? 0) + 1;

      const schedule = await prisma.schedule.create({
        data: { userId, date: new Date(date), startTime, endTime, title: safeTitle, remarks: remarks || null, order: newOrder }
      });

      return { success: true, data: schedule };
    } catch (error: any) {
      console.error("Compat Create schedule error:", error);
      return reply.code(500).send({ success: false, error: "Failed to create schedule", message: error.message });
    }
  });

  // 스케줄 수정
  fastify.put("/schedules/:id", async (req: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = req.params as { id: string };
      const { date, startTime, endTime, title, remarks, order } = req.body as {
        date?: string;
        startTime?: string;
        endTime?: string;
        title?: string;
        remarks?: string;
        order?: number;
      };
      const userId = (req as any).userId || "test-user";

      // JWT 토큰이 없으면 테스트 사용자로 처리 (임시)
      if (!userId || userId === "test-user") {
        console.log("Using test user for schedule API");
      }

      if (!id) {
        return reply.code(400).send({ 
          success: false, 
          error: "Schedule ID is required",
          message: "Schedule ID parameter is missing" 
        });
      }

      // 스케줄이 해당 사용자의 것인지 확인
      const existingSchedule = await prisma.schedule.findFirst({
        where: {
          id,
          userId
        }
      });

      if (!existingSchedule) {
        return reply.code(404).send({ 
          success: false, 
          error: "Schedule not found",
          message: "Schedule with the given ID does not exist or you don't have permission to access it" 
        });
      }

      const updateData: any = {};
      if (date) updateData.date = new Date(date);
      if (startTime) updateData.startTime = startTime;
      if (endTime) updateData.endTime = endTime;
      if (title) updateData.title = title;
      if (remarks !== undefined) updateData.remarks = remarks;
      if (order !== undefined) updateData.order = order;

      // 시간 형식 검증 (업데이트 시에도)
      if (startTime || endTime) {
        const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
        const finalStartTime = startTime || existingSchedule.startTime;
        const finalEndTime = endTime || existingSchedule.endTime;
        
        if (!timeRegex.test(finalStartTime) || !timeRegex.test(finalEndTime)) {
          return reply.code(400).send({ 
            success: false, 
            error: "Invalid time format",
            message: "Time must be in HH:MM format (24-hour)" 
          });
        }

        // 시작 시간이 종료 시간보다 늦은지 검증
        const [startHour, startMin] = finalStartTime.split(':').map(Number);
        const [endHour, endMin] = finalEndTime.split(':').map(Number);
        const startMinutes = startHour * 60 + startMin;
        const endMinutes = endHour * 60 + endMin;
        
        if (startMinutes >= endMinutes) {
          return reply.code(400).send({ 
            success: false, 
            error: "Invalid time range",
            message: "Start time must be earlier than end time" 
          });
        }
      }

      const schedule = await prisma.schedule.update({
        where: { id },
        data: updateData
      });

      return { success: true, data: schedule };
    } catch (error: any) {
      console.error("Update schedule error:", error);
      return reply.code(500).send({ 
        success: false, 
        error: "Failed to update schedule", 
        message: error.message 
      });
    }
  });

  // 호환: 날짜 포함 수정 경로 (구번들 호환용)
  fastify.put("/schedules/:date/:id", async (req: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = req.params as { date: string; id: string };
      const { date, startTime, endTime, title, remarks, order } = (req.body as any) || {};
      const userId = (req as any).userId || "test-user";

      const existingSchedule = await prisma.schedule.findFirst({ where: { id, userId } });
      if (!existingSchedule) {
        return reply.code(404).send({ success: false, error: "Schedule not found", message: "Schedule with the given ID does not exist or you don't have permission to access it" });
      }

      const updateData: any = {};
      if (date) updateData.date = new Date(date);
      if (startTime) updateData.startTime = startTime;
      if (endTime) updateData.endTime = endTime;
      if (title) updateData.title = title;
      if (remarks !== undefined) updateData.remarks = remarks;
      if (order !== undefined) updateData.order = order;

      const schedule = await prisma.schedule.update({ where: { id }, data: updateData });
      return { success: true, data: schedule };
    } catch (error: any) {
      console.error("Compat Update schedule error:", error);
      return reply.code(500).send({ success: false, error: "Failed to update schedule", message: error.message });
    }
  });

  // 스케줄 삭제
  fastify.delete("/schedules/:id", async (req: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = req.params as { id: string };
      
      // 실제 사용자 ID 가져오기 (JWT에서 추출하거나 기본 사용자 사용)
      let userId = (req as any).userId;
      
      if (!userId) {
        // 기본 사용자 찾기
        const defaultUser = await prisma.user.findFirst({
          where: {
            email: {
              contains: '@'
            }
          }
        });
        
        if (!defaultUser) {
          return reply.code(500).send({ 
            success: false, 
            error: "NO_USER_FOUND",
            message: "No users found in database" 
          });
        }
        
        userId = defaultUser.id;
        console.log("Using default user for schedule DELETE:", userId);
      }

      if (!id) {
        return reply.code(400).send({ 
          success: false, 
          error: "Schedule ID is required",
          message: "Schedule ID parameter is missing" 
        });
      }

      // 스케줄이 해당 사용자의 것인지 확인
      const existingSchedule = await prisma.schedule.findFirst({
        where: {
          id,
          userId
        }
      });

      if (!existingSchedule) {
        return reply.code(404).send({ 
          success: false, 
          error: "Schedule not found",
          message: "Schedule with the given ID does not exist or you don't have permission to access it" 
        });
      }

      await prisma.schedule.delete({
        where: { id }
      });

      return { success: true, message: "Schedule deleted successfully" };
    } catch (error: any) {
      console.error("Delete schedule error:", error);
      return reply.code(500).send({ 
        success: false, 
        error: "Failed to delete schedule", 
        message: error.message 
      });
    }
  });

  // 호환: 날짜 포함 삭제 경로 (구번들 호환용)
  fastify.delete("/schedules/:date/:id", async (req: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = req.params as { date: string; id: string };

      let userId = (req as any).userId;
      if (!userId) {
        const defaultUser = await prisma.user.findFirst({ where: { email: { contains: '@' } } });
        if (!defaultUser) {
          return reply.code(500).send({ success: false, error: "NO_USER_FOUND", message: "No users found in database" });
        }
        userId = defaultUser.id;
      }

      const existingSchedule = await prisma.schedule.findFirst({ where: { id, userId } });
      if (!existingSchedule) {
        return reply.code(404).send({ success: false, error: "Schedule not found", message: "Schedule with the given ID does not exist or you don't have permission to access it" });
      }

      await prisma.schedule.delete({ where: { id } });
      return { success: true, message: "Schedule deleted successfully" };
    } catch (error: any) {
      console.error("Compat Delete schedule error:", error);
      return reply.code(500).send({ success: false, error: "Failed to delete schedule", message: error.message });
    }
  });

  // 스케줄 순서 변경
  fastify.put("/schedules/reorder", async (req: FastifyRequest, reply: FastifyReply) => {
    try {
      const { date, scheduleIds } = req.body as {
        date: string;
        scheduleIds: string[];
      };
      const userId = (req as any).userId || "test-user";

      // JWT 토큰이 없으면 테스트 사용자로 처리 (임시)
      if (!userId || userId === "test-user") {
        console.log("Using test user for schedule API");
      }

      if (!date || !scheduleIds || !Array.isArray(scheduleIds)) {
        return reply.code(400).send({ error: "Missing required fields" });
      }

      // 트랜잭션으로 순서 업데이트 (unique 제약조건 충돌 방지)
      await prisma.$transaction(async (tx) => {
        // 1단계: 모든 스케줄을 큰 임시 order 값으로 변경 (충돌 방지)
        for (let i = 0; i < scheduleIds.length; i++) {
          await tx.schedule.updateMany({
            where: {
              id: scheduleIds[i],
              userId,
              date: new Date(date)
            },
            data: {
              order: 1000 + i  // 임시로 큰 값 사용
            }
          });
        }

        // 2단계: 최종 순서로 업데이트
        for (let i = 0; i < scheduleIds.length; i++) {
          await tx.schedule.updateMany({
            where: {
              id: scheduleIds[i],
              userId,
              date: new Date(date)
            },
            data: {
              order: i + 1
            }
          });
        }
      });

      return { success: true, message: "Schedules reordered successfully" };
    } catch (error: any) {
      console.error("Reorder schedules error:", error);
      return reply.code(500).send({ 
        success: false, 
        error: "Failed to reorder schedules", 
        message: error.message 
      });
    }
  });

  // 일괄 저장 API 제거됨 - 개별 CRUD API 사용
}
