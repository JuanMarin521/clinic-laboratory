import { apiRequest } from './apiClient';
import type { Exam, ExamStatus } from '../types/exam';

/** Resumen de examenes por estado, tal como lo calcula el backend. */
export type ExamSummary = Record<ExamStatus, number>;

interface ExamListResponse {
  summary: ExamSummary;
  exams: Exam[];
}

/** Informacion de descarga simulada de un PDF de examen. */
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

/** Llama a GET /exams/:examId/pdf (requiere token). */
export function fetchExamPdf(examId: string, token: string): Promise<ExamPdfInfo> {
  return apiRequest<ExamPdfInfo>(`/exams/${examId}/pdf`, { token });
}
