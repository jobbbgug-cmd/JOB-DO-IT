import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'secret');

export async function verifyAuth(token?: string) {
  try {
    const cookieStore = await cookies();
    const jwt = token || cookieStore.get('token')?.value;

    if (!jwt) {
      return { error: 'No token found', status: 401 };
    }

    const verified = await jwtVerify(jwt, JWT_SECRET);
    return { payload: verified.payload };
  } catch (err) {
    return { error: 'Invalid token', status: 401 };
  }
}

export async function isAuthenticated() {
  const auth = await verifyAuth();
  if (auth.error) {
    return null;
  }
  return auth.payload;
}
