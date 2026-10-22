import { API_BASE_URL } from '../constants/api';
import type { Exam, ExamStatus } from '../types/exam';
import { ApiError } from './ApiError';
import { apiRequest } from './apiClient';

/** Resumen de examenes por estado, tal como lo calcula el backend. */
export type ExamSummary = Record<ExamStatus, number>;

interface ExamListResponse {
  summary: ExamSummary;
  exams: Exam[];
}

/** Metadatos de descarga del PDF de un examen (no el archivo en si, ver `fetchExamPdfBytes`). */
export interface ExamPdfInfo {
  examId: string;
  fileName: string;
  downloadUrl: string;
  generatedAt: string;
}

/** Llama a GET /exams (requiere token). */
export function fetchExams(token: string): Promise<ExamListResponse> {
  return apiRequest<ExamListResponse>('/exams', { token });
}

/** Llama a GET /exams/:examId/pdf: solo los metadatos (nombre, fecha, etc.), sin el archivo. */
export function fetchExamPdf(examId: string, token: string): Promise<ExamPdfInfo> {
  return apiRequest<ExamPdfInfo>(`/exams/${examId}/pdf`, { token });
}

/**
 * Descarga el archivo PDF real (bytes) de un examen desde GET /exams/:examId/pdf/file.
 * No usa `apiRequest` porque esa funcion espera siempre una respuesta JSON; aqui la
 * respuesta exitosa es el PDF binario, y solo es JSON cuando el backend devuelve un error.
 */
export async function fetchExamPdfBytes(
  examId: string,
  token: string,
): Promise<{ bytes: Uint8Array; fileName: string }> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}/exams/${examId}/pdf/file`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch {
    throw new ApiError('No se pudo conectar con el servidor para descargar el PDF.', 0, 'NETWORK_ERROR');
  }

  if (!response.ok) {
    const errorPayload = await response.json().catch(() => null);
    throw new ApiError(
      errorPayload?.error?.message ?? 'No se pudo descargar el PDF.',
      response.status,
      errorPayload?.error?.code ?? 'UNKNOWN_ERROR',
    );
  }

  const bytes = new Uint8Array(await response.arrayBuffer());

  // El nombre de archivo viaja en el header Content-Disposition: attachment; filename="...".
  const disposition = response.headers.get('Content-Disposition') ?? '';
  const match = disposition.match(/filename="(.+)"/);
  const fileName = match ? match[1] : `examen_${examId}.pdf`;

  return { bytes, fileName };
}
