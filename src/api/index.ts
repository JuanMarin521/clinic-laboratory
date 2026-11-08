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
export type { AuthResponse, AuthUser, RegisterInput, UpdateProfileInput, UserProfile } from './authApi';
export { fetchLatestOrder, fetchOrders } from './ordersApi';
export { fetchOrderPdf } from './pdfApi';
export type { DownloadedPdf } from './pdfApi';
export { biometricLoginRequest, enrollBiometricRequest, revokeBiometricRequest } from './biometricApi';
export type { BiometricLoginResponse, IssuedDeviceToken } from './biometricApi';
export { fetchSupportMessages, sendSupportMessage } from './supportApi';
export type { BackendChatMessage } from './supportApi';
