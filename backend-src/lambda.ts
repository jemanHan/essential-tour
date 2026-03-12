import awsLambdaFastify from '@fastify/aws-lambda';
import { createApp } from './app.js';

const server = await createApp();
export const handler = awsLambdaFastify(server as any);


