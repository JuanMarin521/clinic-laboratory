import { apiRequest } from './apiClient';
import type { ChatSender } from '../types/chat';

/**
 * Mensaje tal como lo devuelve el backend: trae `createdAt` en formato ISO
 * (distinto al tipo `ChatMessage` del front, que guarda `time` ya formateado para mostrar).
 * La pantalla de chat se encarga de convertir uno en el otro con `formatTime`.
 */
export interface BackendChatMessage {
  id: string;
  sender: ChatSender;
  text: string;
  createdAt: string;
}

interface SendMessageResponse {
  userMessage: BackendChatMessage;
  assistantMessage: BackendChatMessage;
}

/** Llama a POST /support/messages (requiere token). */
export function sendSupportMessage(text: string, token: string): Promise<SendMessageResponse> {
  return apiRequest<SendMessageResponse>('/support/messages', { method: 'POST', body: { text }, token });
}
