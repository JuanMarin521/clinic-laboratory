import { apiRequest } from './apiClient';

/** Usuario tal como lo devuelve el backend (sin datos sensibles). */
export interface AuthUser {
  id: string;
  fullName: string;
  username: string;
}

/** Respuesta comun de login y register: usuario autenticado + token de acceso. */
export interface AuthResponse {
  user: AuthUser;
  token: string;
}

/** Llama a POST /auth/login. */
export function loginRequest(username: string, password: string): Promise<AuthResponse> {
  return apiRequest<AuthResponse>('/auth/login', { method: 'POST', body: { username, password } });
}

/** Llama a POST /auth/register. */
export function registerRequest(
  fullName: string,
  username: string,
  password: string,
): Promise<AuthResponse> {
  return apiRequest<AuthResponse>('/auth/register', {
    method: 'POST',
    body: { fullName, username, password },
  });
}
