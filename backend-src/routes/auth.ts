import bcrypt from 'bcrypt';
import { FastifyInstance } from 'fastify';
import { prisma } from '@db/client';
import { sign } from '../auth/jwt.js';

interface SignupBody {
  email: string;
  password: string;
  displayName?: string;
}

interface LoginBody {
  email: string;
  password: string;
}

export async function authRoutes(fastify: FastifyInstance) {
  fastify.post('/auth/signup', async (request, reply) => {
    try {
      const { email, password, displayName } = request.body as SignupBody;

      // Validation
      if (!email || !password) {
        return reply.code(400).send({ error: 'Email and password are required' });
      }

      if (password.length < 6) {
        return reply.code(400).send({ error: 'Password must be at least 6 characters' });
      }

      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email }
      });

      if (existingUser) {
        return reply.code(409).send({ error: 'User already exists' });
      }

      // Hash password
      const passwordHash = await bcrypt.hash(password, 10);

      // Create user
      const user = await prisma.user.create({
        data: {
          email,
          passwordHash,
          displayName: displayName || email.split('@')[0]
        }
      });

      // Generate JWT
      const token = sign({
        userId: user.id,
        email: user.email,
        displayName: user.displayName || undefined
      });

      return reply.send({
        token,
        user: {
          id: user.id,
          email: user.email,
          displayName: user.displayName
        }
      });
    } catch (error) {
      console.error('Signup error:', error);
      return reply.code(500).send({ error: 'Internal server error' });
    }
  });

  fastify.post('/auth/login', async (request, reply) => {
    try {
      const { email, password } = request.body as LoginBody;

      // 디버깅 로그 추가
      console.log('=== 로그인 요청 ===');
      console.log('Request Body:', JSON.stringify(request.body, null, 2));
      console.log('Email:', email);
      console.log('Password length:', password ? password.length : 'undefined');

      // Validation
      if (!email || !password) {
        console.log('❌ 필수 필드 누락');
        return reply.code(400).send({ error: 'Email and password are required' });
      }

      // Find user
      const user = await prisma.user.findUnique({
        where: { email }
      });

      if (!user) {
        console.log('❌ 사용자를 찾을 수 없음:', email);
        return reply.code(401).send({ error: 'Invalid credentials' });
      }

      console.log('✅ 사용자 찾음:', user.email);

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.passwordHash);

      if (!isValidPassword) {
        console.log('❌ 비밀번호 불일치');
        return reply.code(401).send({ error: 'Invalid credentials' });
      }

      console.log('✅ 로그인 성공');

      // Generate JWT
      const token = sign({
        userId: user.id,
        email: user.email,
        displayName: user.displayName || undefined
      });

      return reply.send({
        token,
        user: {
          id: user.id,
          email: user.email,
          displayName: user.displayName
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      return reply.code(500).send({ error: 'Internal server error' });
    }
  });
}


