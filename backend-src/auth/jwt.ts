import jwt from 'jsonwebtoken';
import { FastifyRequest, FastifyReply } from 'fastify';

const JWT_SECRET = process.env.JWT_SECRET || 'change-me';

export interface JWTPayload {
  userId: string;
  email: string;
  displayName?: string;
}

export function sign(payload: JWTPayload, expires: string = '7d'): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: expires } as jwt.SignOptions);
}

export function verify(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (error) {
    return null;
  }
}

export async function authHook(request: FastifyRequest, reply: FastifyReply) {
  const authHeader = request.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    (request as any).user = null;
    (request as any).userId = null;
    return;
  }

  const token = authHeader.substring(7);
  const payload = verify(token);
  
  if (payload) {
    (request as any).user = payload;
    (request as any).userId = payload.userId;
  } else {
    (request as any).user = null;
    (request as any).userId = null;
  }
}


