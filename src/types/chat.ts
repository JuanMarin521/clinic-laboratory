export type ChatSender = 'assistant' | 'user';

export interface ChatMessage {
  id: string;
  sender: ChatSender;
  text: string;
  /** Hora ya formateada, ej. "9:00". */
  time: string;
}
