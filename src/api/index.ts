/** Punto unico de importacion para toda la capa de acceso a la API. */
export { ApiError } from './ApiError';
export { apiRequest } from './apiClient';
export {
  changePasswordRequest,
  fetchProfile,
  loginRequest,
  registerRequest,
  updateProfileRequest,
} from './authApi';
export type { AuthResponse, AuthUser, UpdateProfileInput, UserProfile } from './authApi';
export { fetchExams, fetchExamPdf, fetchExamPdfBytes } from './examsApi';
export type { ExamPdfInfo, ExamSummary } from './examsApi';
export { fetchLatestOrder, fetchOrders } from './ordersApi';
export { sendSupportMessage } from './supportApi';
export type { BackendChatMessage } from './supportApi';
