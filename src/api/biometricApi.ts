import type { AuthUser } from './authApi';
import { apiRequest } from './apiClient';

/** Token propio de este celular para el ingreso biométrico (ver README del backend). */
export interface IssuedDeviceToken {
  deviceToken: string;
  expiresAt: string;
}

export interface BiometricLoginResponse extends IssuedDeviceToken {
  user: AuthUser;
  token: string;
}

/** POST /auth/biometric/enroll (requiere sesión): activa la biometría confirmando la contraseña. */
export function enrollBiometricRequest(
  token: string,
  password: string,
  deviceName: string,
): Promise<IssuedDeviceToken> {
  return apiRequest<IssuedDeviceToken>('/auth/biometric/enroll', {
    method: 'POST',
    body: { password, deviceName },
    token,
  });
}

/** POST /auth/biometric/login: entra con el token del dispositivo y recibe uno nuevo (rotación). */
export function biometricLoginRequest(deviceToken: string): Promise<BiometricLoginResponse> {
  return apiRequest<BiometricLoginResponse>('/auth/biometric/login', { method: 'POST', body: { deviceToken } });
}

/** POST /auth/biometric/revoke: desactiva el ingreso biométrico de este dispositivo. */
export async function revokeBiometricRequest(deviceToken: string, reason: 'disabled' | 'logout'): Promise<void> {
  await apiRequest<unknown>('/auth/biometric/revoke', { method: 'POST', body: { deviceToken, reason } });
}
