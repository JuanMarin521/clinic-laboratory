/**
 * Error especifico para fallas de la API (HTTP o de red).
 * `code` reproduce el codigo que envia el backend (ej. "UNAUTHORIZED", "VALIDATION_ERROR")
 * para que las pantallas puedan reaccionar distinto segun el tipo de error si lo necesitan.
 */
export class ApiError extends Error {
  public readonly status: number;
  public readonly code: string;
  public readonly details: string[];

  constructor(message: string, status: number, code: string, details: string[] = []) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}
