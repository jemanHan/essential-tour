import { CognitoJwtVerifier } from "aws-jwt-verify";

const poolId = process.env.COGNITO_USER_POOL_ID!;
const clientId = process.env.COGNITO_CLIENT_ID!;
const region = process.env.COGNITO_REGION!;

const verifier = CognitoJwtVerifier.create({
  userPoolId: poolId,
  tokenUse: "id",
  clientId
});

export async function getUserIdFromRequest(req: any) {
  const auth = req.headers?.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  if (!token) return null;
  const payload = await verifier.verify(token);
  return payload?.sub || null;
}


