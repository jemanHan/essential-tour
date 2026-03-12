const provider = process.env.AUTH_PROVIDER || 'mock';
export const auth = provider === 'cognito'
  ? await import('./cognitoAuth.js')
  : await import('./mockAuth.js');


