import { FastifyInstance } from 'fastify';
import { z } from 'zod';

// 임시 사용자 데이터 (실제로는 DB 사용)
let users: { [id: string]: any } = {};

const userSchema = z.object({
  email: z.string().email(),
  displayName: z.string().optional(),
  lang: z.enum(['KR', 'EN']).optional(),
});

export default async function userRoutes(fastify: FastifyInstance) {
  // 사용자 정보 조회
  fastify.get('/users/me', async (request, reply) => {
    const token = request.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return reply.code(401).send({ error: 'Unauthorized' });
    }
    
    // 임시 사용자 데이터 (실제로는 JWT 토큰 검증 후 DB에서 조회)
    const user = {
      id: '1',
      email: 'user@example.com',
      displayName: '사용자',
      lang: 'KR',
      createdAt: new Date().toISOString()
    };
    
    return user;
  });

  // 사용자 정보 수정
  fastify.patch('/users/me', async (request, reply) => {
    const token = request.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return reply.code(401).send({ error: 'Unauthorized' });
    }
    
    const updateData = userSchema.partial().parse(request.body);
    
    // 임시 사용자 데이터 업데이트
    const user = {
      id: '1',
      email: 'user@example.com',
      displayName: updateData.displayName || '사용자',
      lang: updateData.lang || 'KR',
      createdAt: new Date().toISOString()
    };
    
    return user;
  });

  // 비밀번호 변경
  fastify.patch('/users/me/password', async (request, reply) => {
    const token = request.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return reply.code(401).send({ error: 'Unauthorized' });
    }
    
    const { currentPassword, newPassword } = request.body as { currentPassword: string; newPassword: string };
    
    // 임시 비밀번호 변경 로직
    return { ok: true };
  });

  // 회원탈퇴
  fastify.delete('/users/me', async (request, reply) => {
    const token = request.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return reply.code(401).send({ error: 'Unauthorized' });
    }
    
    // 임시 회원탈퇴 로직 (실제로는 DB에서 사용자 삭제)
    return { message: 'Account deleted successfully' };
  });
}
