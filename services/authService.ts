export interface AuthUser {
  id: string;
  email: string;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

const API_BASE =
  (import.meta as any).env.VITE_API_BASE_URL || 'http://localhost:4000';

async function authRequest(
  path: string,
  body: { email: string; password: string }
): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE}/api/auth/${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || 'Authentication failed');
  }
  return data as AuthResponse;
}

export function register(email: string, password: string) {
  return authRequest('register', { email, password });
}

export function login(email: string, password: string) {
  return authRequest('login', { email, password });
}


