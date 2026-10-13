import { API_BASE_URL, API_TIMEOUT_MS } from '../constants/api';
import { ApiError } from './ApiError';

/** Forma comun de las respuestas exitosas que envia el backend. */
interface ApiSuccessResponse<T> {
  success: true;
  data: T;
}

/** Forma comun de las respuestas de error que envia el backend. */
interface ApiErrorResponse {
  success: false;
  error: { code: string; message: string; details?: string[] };
}

type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: unknown;
  /** Token JWT a enviar en el header Authorization, si la ruta lo requiere. */
  token?: string;
}

/**
 * Cliente HTTP centralizado para hablar con la API de CPO Conecta.
 * Es el UNICO lugar de la app que conoce la forma de las respuestas del backend
 * (`{ success, data }` / `{ success, error }`), por lo que las pantallas y los
 * demas archivos de `src/api` solo trabajan con datos ya desempaquetados o con `ApiError`.
 */
export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, token } = options;

  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT_MS);

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
  } catch {
    throw new ApiError(
      'No se pudo conectar con el servidor. Verifica tu conexion o la URL del backend.',
      0,
      'NETWORK_ERROR',
    );
  } finally {
    clearTimeout(timeoutId);
  }

  const payload = (await response.json().catch(() => null)) as ApiResponse<T> | null;

  if (!payload || !response.ok || !payload.success) {
    const errorPayload = payload && !payload.success ? payload.error : undefined;
    throw new ApiError(
      errorPayload?.message ?? 'Ocurrio un error inesperado al comunicarse con el servidor.',
      response.status,
      errorPayload?.code ?? 'UNKNOWN_ERROR',
      errorPayload?.details ?? [],
    );
  }

  return payload.data;
}
