import type { BiometricErrorReason } from './biometricTypes';

/**
 * Mensajes para la persona según el motivo del fallo biométrico.
 * `null` = no mostrar nada (por ejemplo, si ella misma canceló el diálogo).
 * `label` es el nombre de la biometría del celular ("huella", "Face ID"...).
 */
export function biometricErrorMessage(reason: BiometricErrorReason, label: string): string | null {
  switch (reason) {
    case 'cancelled':
      return null;
    case 'lockout':
      return `Hubo demasiados intentos con ${label}. Ingresa con tu contraseña.`;
    case 'invalidated':
      return 'Las huellas o rostros registrados en este celular cambiaron. Por seguridad, ingresa con tu contraseña y vuelve a activar el ingreso.';
    case 'revoked':
      return `El ingreso con ${label} ya no es válido. Ingresa con tu contraseña.`;
    case 'unavailable':
      return `Este celular ya no tiene ${label} configurada. Ingresa con tu contraseña.`;
    default:
      return `No se pudo verificar tu ${label}. Intenta de nuevo o ingresa con tu contraseña.`;
  }
}
