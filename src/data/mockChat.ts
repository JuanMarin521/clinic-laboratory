import { ASSISTANT } from '../constants/assistant';
import type { ChatMessage } from '../types/chat';
import { formatTime } from '../utils/format';

/**
 * Saludo de Polito que se muestra siempre al inicio del chat (no se guarda en el servidor).
 * Usa el primer nombre del paciente y la hora en que se abre el chat.
 */
export function buildWelcomeMessages(fullName?: string): ChatMessage[] {
  const firstName = fullName?.trim().split(/\s+/)[0];
  const time = formatTime(new Date());

  return [
    {
      id: 'welcome-1',
      sender: 'assistant',
      text: `¡Hola${firstName ? `, ${firstName}` : ''}! Soy ${ASSISTANT.name}, el pingüino del Centro Policlínico del Olaya 🐧`,
      time,
    },
    {
      id: 'welcome-2',
      sender: 'assistant',
      text: 'Puedo contarte cómo van tus exámenes, cuándo estarán listos o cómo descargar tus resultados. ¿En qué te ayudo?',
      time,
    },
  ];
}

/** Atajos de preguntas frecuentes debajo del chat. */
export const quickReplies: string[] = [
  'Ver mis resultados',
  '¿Cuándo está lista?',
  'Ácido úrico',
  'Contactar sede',
];
