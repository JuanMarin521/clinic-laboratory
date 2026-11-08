import { API_BASE_URL } from '../constants/api';
import { ApiError } from './ApiError';
import { notifySessionInvalid, SESSION_INVALID_CODE } from './sessionEvents';

/** Un PDF descargado del servidor, todavía en memoria. */
export interface DownloadedPdf {
  bytes: Uint8Array;
  fileName: string;
}

/**
 * Descarga un PDF (bytes) de una ruta protegida.
 * No usa `apiRequest` porque esa función espera JSON; aquí la respuesta exitosa es el PDF
 * binario, y solo es JSON cuando el backend devuelve un error.
 */
async function downloadPdf(path: string, token: string, fallbackName: string): Promise<DownloadedPdf> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, { headers: { Authorization: `Bearer ${token}` } });
  } catch {
    throw new ApiError('No se pudo conectar con el servidor para descargar el PDF.', 0, 'NETWORK_ERROR');
  }

  if (!response.ok) {
    const errorPayload = await response.json().catch(() => null);
    if (response.status === 401 && errorPayload?.error?.code === SESSION_INVALID_CODE) notifySessionInvalid();
    throw new ApiError(
      errorPayload?.error?.message ?? 'No se pudo descargar el PDF.',
      response.status,
      errorPayload?.error?.code ?? 'UNKNOWN_ERROR',
    );
  }

  const bytes = new Uint8Array(await response.arrayBuffer());
  // El nombre de archivo viaja en el header Content-Disposition: attachment; filename="...".
  const match = (response.headers.get('Content-Disposition') ?? '').match(/filename="(.+)"/);
  return { bytes, fileName: match ? match[1] : fallbackName };
}

/**
 * GET /orders/:orderNumber/pdf/file (requiere token): UN solo PDF con todos los exámenes
 * validados de la orden. Los que siguen en proceso o con novedad no se incluyen.
 */
export function fetchOrderPdf(orderNumber: string, token: string): Promise<DownloadedPdf> {
  return downloadPdf(`/orders/${orderNumber}/pdf/file`, token, `Orden_${orderNumber}.pdf`);
}
