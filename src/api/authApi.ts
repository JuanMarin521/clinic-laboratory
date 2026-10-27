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

/** Perfil completo del paciente (GET /profile). Los datos opcionales llegan en `null` si no se han llenado. */
export interface UserProfile extends AuthUser {
  documentNumber: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  /** Fecha de nacimiento, formato "YYYY-MM-DD". */
  birthDate: string | null;
  /** Fecha de creación de la cuenta (ISO). */
  createdAt: string;
}

/** Datos que se envían al actualizar el perfil (un texto vacío borra el dato). */
export interface UpdateProfileInput {
  fullName: string;
  documentNumber: string;
  email: string;
  phone: string;
  address: string;
  birthDate: string;
}

/** Llama a GET /profile (requiere token). */
export function fetchProfile(token: string): Promise<UserProfile> {
  return apiRequest<UserProfile>('/profile', { token });
}

/** Llama a PATCH /profile (requiere token) y devuelve el perfil ya actualizado. */
export function updateProfileRequest(token: string, input: UpdateProfileInput): Promise<UserProfile> {
  return apiRequest<UserProfile>('/profile', { method: 'PATCH', body: input, token });
}

/** Llama a PATCH /profile/password (requiere token). */
export function changePasswordRequest(token: string, currentPassword: string, newPassword: string): Promise<void> {
  return apiRequest<{ message: string }>('/profile/password', {
    method: 'PATCH',
    body: { currentPassword, newPassword },
    token,
  }).then(() => undefined);
}
