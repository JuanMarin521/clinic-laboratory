/**
 * Aviso de "sesión inválida" (el backend respondió 401 con código SESSION_INVALID:
 * el token falta, venció o no es válido). El cliente HTTP lo dispara y un único
 * componente de la app (SessionGuard) decide qué hacer: cerrar sesión y volver al login.
 * Así ninguna pantalla tiene que manejar la sesión vencida por su cuenta.
 */
type SessionInvalidHandler = () => void;

let handler: SessionInvalidHandler | null = null;

/** Registra quién atiende el aviso. Devuelve la función para quitar el registro. */
export function onSessionInvalid(nextHandler: SessionInvalidHandler): () => void {
  handler = nextHandler;
  return () => {
    if (handler === nextHandler) handler = null;
  };
}

/** Código que envía el backend cuando la sesión ya no sirve. */
export const SESSION_INVALID_CODE = 'SESSION_INVALID';

/** Avisa que la sesión venció (lo llama el cliente HTTP). */
export function notifySessionInvalid(): void {
  handler?.();
}
