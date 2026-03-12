import { createApp } from "./app";
import awsLambdaFastify from "@fastify/aws-lambda";

const app = createApp();
export const handler = awsLambdaFastify(app as any);
