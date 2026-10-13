/** Punto unico de importacion para toda la capa de acceso a la API. */
export { ApiError } from './ApiError';
export { apiRequest } from './apiClient';
export { loginRequest, registerRequest } from './authApi';
export type { AuthResponse, AuthUser } from './authApi';
export { fetchExams, fetchExamPdf } from './examsApi';
export type { ExamPdfInfo, ExamSummary } from './examsApi';
export { sendSupportMessage } from './supportApi';
export type { BackendChatMessage } from './supportApi';
