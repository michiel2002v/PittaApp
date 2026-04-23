import { msalInstance, tokenRequest } from './msalConfig';

const apiBase = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5080';

async function getAccessToken(): Promise<string> {
  const account = msalInstance.getActiveAccount();
  if (!account) throw new Error('No active account; user is not signed in.');
  const result = await msalInstance.acquireTokenSilent({ ...tokenRequest, account });
  return result.accessToken;
}

export async function apiFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const token = await getAccessToken();
  const headers = new Headers(init.headers);
  headers.set('Authorization', `Bearer ${token}`);
  if (init.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  return fetch(`${apiBase}${path}`, { ...init, headers });
}
