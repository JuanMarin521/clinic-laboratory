import type { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';

/** Tipo de biometría que usa el celular para desbloquearse. */
export type BiometricKind = 'fingerprint' | 'face' | 'iris' | 'generic';

/** Qué puede hacer este celular con biometría y cómo nombrarla en pantalla. */
export interface BiometricCapability {
  /**
   * `true` solo si el celular tiene biometría FUERTE configurada (huella o rostro 3D; en Android,
   * clase 3). El desbloqueo facial por cámara (que se engaña con una foto) no cuenta.
   */
  available: boolean;
  kind: BiometricKind;
  /** Nombre para los textos, ej. "huella", "Face ID". */
  label: string;
  icon: ComponentProps<typeof Ionicons>['name'];
  /**
   * Por qué no está disponible (solo si `available` es `false`):
   * - not-configured: el celular no tiene biometría fuerte registrada.
   * - expo-go-face-id: iPhone con Face ID dentro de Expo Go. Expo Go no declara el permiso
   *   de Face ID (NSFaceIDUsageDescription), así que iOS no deja usarlo. Con la app
   *   instalada (build de desarrollo o de tienda) sí funciona: el permiso está en app.json.
   */
  unavailableReason?: 'not-configured' | 'expo-go-face-id';
}

/** Paciente cuyo ingreso biométrico está activo en este celular (datos no sensibles para la pantalla). */
export interface EnrolledAccount {
  username: string;
  fullName: string;
}

/**
 * Motivos por los que falla un ingreso o activación biométrica:
 * - cancelled: la persona cerró el diálogo (no se muestra error).
 * - lockout: demasiados intentos fallidos de huella/rostro; el sistema bloqueó la biometría.
 * - invalidated: cambiaron las huellas/rostros del celular; la credencial dejó de servir.
 * - revoked: el servidor ya no acepta la credencial (vencida, revocada o reutilizada).
 * - unavailable: el celular ya no tiene biometría fuerte configurada.
 * - failed: cualquier otro error.
 */
export type BiometricErrorReason = 'cancelled' | 'lockout' | 'invalidated' | 'revoked' | 'unavailable' | 'failed';

export class BiometricAuthError extends Error {
  constructor(public readonly reason: BiometricErrorReason, message?: string) {
    super(message ?? reason);
    this.name = 'BiometricAuthError';
  }
}
