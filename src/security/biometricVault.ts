import * as SecureStore from 'expo-secure-store';

import type { EnrolledAccount } from './biometricTypes';

/**
 * Almacenamiento cifrado de la credencial biométrica en el celular (Keystore / Keychain).
 * - El token del dispositivo NUNCA se usa sin pasar antes por la puerta biométrica (biometricGate).
 * - Todo se guarda como "solo este dispositivo": no viaja en copias de seguridad a otro celular.
 * - La contraseña del paciente NUNCA se guarda.
 */

const TOKEN_KEY = 'cpo.biometric.deviceToken';
const ACCOUNT_KEY = 'cpo.biometric.account';
const DECLINED_KEY_PREFIX = 'cpo.biometric.declined.';

const options: SecureStore.SecureStoreOptions = {
  keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
};

/** Las llaves de SecureStore solo aceptan letras, números, ".", "-" y "_". */
function declinedKey(username: string): string {
  return `${DECLINED_KEY_PREFIX}${username.toLowerCase().replace(/[^a-z0-9._-]/g, '_')}`;
}

export async function saveDeviceToken(deviceToken: string): Promise<void> {
  await SecureStore.setItemAsync(TOKEN_KEY, deviceToken, options);
}

export async function readDeviceToken(): Promise<string | null> {
  return SecureStore.getItemAsync(TOKEN_KEY, options);
}

export async function saveEnrolledAccount(account: EnrolledAccount): Promise<void> {
  await SecureStore.setItemAsync(ACCOUNT_KEY, JSON.stringify(account), options);
}

/** Paciente con biometría activa en este celular, o `null`. Nunca lanza error. */
export async function readEnrolledAccount(): Promise<EnrolledAccount | null> {
  try {
    const raw = await SecureStore.getItemAsync(ACCOUNT_KEY, options);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<EnrolledAccount>;
    return typeof parsed.username === 'string' && typeof parsed.fullName === 'string'
      ? { username: parsed.username, fullName: parsed.fullName }
      : null;
  } catch {
    return null;
  }
}

/** Borra el token y los datos del paciente de este celular. */
export async function clearVault(): Promise<void> {
  await Promise.all([
    SecureStore.deleteItemAsync(TOKEN_KEY, options).catch(() => undefined),
    SecureStore.deleteItemAsync(ACCOUNT_KEY, options).catch(() => undefined),
  ]);
}

/** Recuerda que el paciente respondió "Ahora no" para no volver a preguntarle al iniciar sesión. */
export async function markOfferDeclined(username: string): Promise<void> {
  await SecureStore.setItemAsync(declinedKey(username), '1', options);
}

export async function wasOfferDeclined(username: string): Promise<boolean> {
  try {
    return (await SecureStore.getItemAsync(declinedKey(username), options)) === '1';
  } catch {
    return false;
  }
}

export async function clearOfferDeclined(username: string): Promise<void> {
  await SecureStore.deleteItemAsync(declinedKey(username), options).catch(() => undefined);
}
