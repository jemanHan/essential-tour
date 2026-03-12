import { FastifyInstance } from 'fastify';
import { prisma } from '@db/client';

interface RecentViewBody {
  placeId: string;
  name?: string;
  address?: string;
  rating?: number;
  tags?: string[];
}

export async function recentViewsRoutes(fastify: FastifyInstance) {
  // 최근 본 장소 추가/업데이트
  fastify.post('/recent-views', async (request, reply) => {
    try {
      const user = (request as any).user;
      
      if (!user) {
        return reply.code(401).send({ error: 'Authentication required' });
      }

      const { placeId, name, address, rating, tags = [] } = request.body as RecentViewBody;

      if (!placeId) {
        return reply.code(400).send({ error: 'placeId is required' });
      }

      // 최근 본 장소 추가/업데이트
      const recentView = await prisma.userRecentView.upsert({
        where: {
          userId_placeId: {
            userId: user.userId,
            placeId
          }
        },
        update: {
          name,
          address,
          rating,
          tags,
          viewedAt: new Date()
        },
        create: {
          userId: user.userId,
          placeId,
          name,
          address,
          rating,
          tags
        }
      });

      return reply.send({
        success: true,
        data: recentView
      });
    } catch (error) {
      console.error('Add recent view error:', error);
      return reply.code(500).send({ error: 'Internal server error' });
    }
  });

  // 사용자의 최근 본 장소 목록 가져오기
  fastify.get('/recent-views', async (request, reply) => {
    try {
      const user = (request as any).user;
      
      if (!user) {
        return reply.code(401).send({ error: 'Authentication required' });
      }

      const { page = 1, limit = 20 } = request.query as { page?: string; limit?: string };
      const skip = (Number(page) - 1) * Number(limit);
      const take = Number(limit);

      // Get user's recent viewed places
      const recentViews = await prisma.userRecentView.findMany({
        where: {
          userId: user.userId
        },
        orderBy: {
          viewedAt: 'desc'
        },
        skip,
        take
      });

      const total = await prisma.userRecentView.count({
        where: {
          userId: user.userId
        }
      });

      return reply.send({
        success: true,
        data: recentViews,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          totalPages: Math.ceil(total / Number(limit))
        }
      });
    } catch (error) {
      console.error('Get recent views error:', error);
      return reply.code(500).send({ error: 'Internal server error' });
    }
  });

  // 최근 본 장소 삭제
  fastify.delete('/recent-views/:placeId', async (request, reply) => {
    try {
      const user = (request as any).user;
      
      if (!user) {
        return reply.code(401).send({ error: 'Authentication required' });
      }

      const { placeId } = request.params as { placeId: string };

      if (!placeId) {
        return reply.code(400).send({ error: 'placeId is required' });
      }

      // Delete recent view
      try {
        await prisma.userRecentView.delete({
          where: {
            userId_placeId: {
              userId: user.userId,
              placeId
            }
          }
        });
      } catch (error: any) {
        if (error.code === 'P2025') {
          console.log('Recent view already removed or does not exist');
        } else {
          throw error;
        }
      }

      return reply.send({
        success: true,
        message: 'Recent view removed successfully'
      });
    } catch (error) {
      console.error('Remove recent view error:', error);
      return reply.code(500).send({ error: 'Internal server error' });
    }
  });
}
