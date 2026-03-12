import { FastifyInstance } from 'fastify';
import { prisma } from '@db/client';
import { normalizeTags } from '../utils/tags.js';

interface LikeBody {
  placeId: string;
  name?: string;
  address?: string;
  rating?: number;
  tags?: string[];
}

export async function likesRoutes(fastify: FastifyInstance) {
  // 좋아요 상태 확인
  fastify.get('/likes/:placeId', async (request, reply) => {
    try {
      const user = (request as any).user;
      
      if (!user) {
        return reply.code(401).send({ error: 'Authentication required' });
      }

      const { placeId } = request.params as { placeId: string };

      if (!placeId) {
        return reply.code(400).send({ error: 'placeId is required' });
      }

      // Check if user has liked this place
      const like = await prisma.userLike.findUnique({
        where: {
          userId_placeId: {
            userId: user.userId,
            placeId
          }
        }
      });

      return reply.send({
        liked: !!like,
        like: like ? {
          id: like.id,
          placeId: like.placeId,
          name: like.name,
          address: like.address,
          rating: like.rating,
          tags: like.tags,
          createdAt: like.createdAt,
          updatedAt: like.updatedAt
        } : null
      });
    } catch (error) {
      console.error('Check like status error:', error);
      return reply.code(500).send({ error: 'Internal server error' });
    }
  });

  // 좋아요 추가/업데이트
  fastify.post('/likes', async (request, reply) => {
    try {
      const user = (request as any).user;
      
      if (!user) {
        return reply.code(401).send({ error: 'Authentication required' });
      }

      const { placeId, name, address, rating, tags = [] } = request.body as LikeBody;

      if (!placeId) {
        return reply.code(400).send({ error: 'placeId is required' });
      }

      // Normalize tags
      const normalizedTags = normalizeTags(tags);

      // Upsert like
      const like = await prisma.userLike.upsert({
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
          tags: normalizedTags,
          updatedAt: new Date()
        },
        create: {
          userId: user.userId,
          placeId,
          name,
          address,
          rating,
          tags: normalizedTags
        }
      });

      return reply.send({
        success: true,
        like: {
          id: like.id,
          placeId: like.placeId,
          name: like.name,
          address: like.address,
          rating: like.rating,
          tags: like.tags,
          createdAt: like.createdAt,
          updatedAt: like.updatedAt
        }
      });
    } catch (error) {
      console.error('Like error:', error);
      return reply.code(500).send({ error: 'Internal server error' });
    }
  });

  // 사용자의 좋아요 목록 가져오기
  fastify.get('/likes', async (request, reply) => {
    try {
      const user = (request as any).user;
      
      if (!user) {
        return reply.code(401).send({ error: 'Authentication required' });
      }

      const { page = 1, limit = 20 } = request.query as { page?: string; limit?: string };
      const skip = (Number(page) - 1) * Number(limit);
      const take = Number(limit);

      // Get user's liked places
      const likes = await prisma.userLike.findMany({
        where: {
          userId: user.userId
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take
      });

      const total = await prisma.userLike.count({
        where: {
          userId: user.userId
        }
      });

      return reply.send({
        success: true,
        data: likes,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          totalPages: Math.ceil(total / Number(limit))
        }
      });
    } catch (error) {
      console.error('Get likes error:', error);
      return reply.code(500).send({ error: 'Internal server error' });
    }
  });

  // 좋아요 취소
  fastify.delete('/likes/:placeId', async (request, reply) => {
    try {
      // 실제 사용자 ID 가져오기 (JWT에서 추출하거나 기본 사용자 사용)
      let userId = (request as any).userId;
      
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
            error: "NO_USER_FOUND",
            message: "No users found in database" 
          });
        }
        
        userId = defaultUser.id;
        console.log("Using default user for likes DELETE:", userId);
      }
      
      const user = { userId };

      const { placeId } = request.params as { placeId: string };

      if (!placeId) {
        return reply.code(400).send({ error: 'placeId is required' });
      }

      // Delete like (존재하지 않으면 무시)
      try {
        await prisma.userLike.delete({
          where: {
            userId_placeId: {
              userId: user.userId,
              placeId
            }
          }
        });
      } catch (error: any) {
        // P2025: Record to delete does not exist - 이미 삭제되었거나 존재하지 않는 경우
        if (error.code === 'P2025') {
          console.log('Like already removed or does not exist');
        } else {
          throw error;
        }
      }

      return reply.send({
        success: true,
        message: 'Like removed successfully'
      });
    } catch (error) {
      console.error('Unlike error:', error);
      return reply.code(500).send({ error: 'Internal server error' });
    }
  });
}


