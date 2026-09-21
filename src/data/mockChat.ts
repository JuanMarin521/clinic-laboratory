import type { ChatMessage } from '../types/chat';

export const initialChatMessages: ChatMessage[] = [
  {
    id: 'welcome-1',
    sender: 'assistant',
    text: 'Hola, soy CPO Assist. ¿En qué puedo ayudarte hoy?',
    time: '9:00',
  },
  {
    id: 'welcome-2',
    sender: 'assistant',
    text: 'Puedo ayudarte con información sobre tus exámenes, tiempos de entrega o cualquier duda sobre tus resultados.',
    time: '9:00',
  },
];

export const quickReplies: string[] = [
  'Ver mis resultados',
  '¿Cuándo está lista?',
  'Ácido úrico',
  'Contactar sede',
];

/** Respuestas simuladas del asistente (sin backend). */
export function getMockReply(question: string): string {
  const q = question.toLowerCase();

  if (q.includes('resultado')) {
    return 'Tienes 2 exámenes listos, 1 en proceso y 1 con novedad. Puedes verlos en la pestaña Resultados.';
  }
  if (q.includes('lista') || q.includes('cuándo') || q.includes('cuando')) {
    return 'Te avisaremos apenas cambie el estado de tu examen. También puedes revisar el semáforo en Resultados.';
  }
  if (q.includes('sede') || q.includes('contactar')) {
    return 'Puedes comunicarte con la sede donde te tomaron la muestra. Ellos te darán información sobre cualquier novedad.';
  }
  return 'Gracias por tu consulta. Por ahora soy una demostración, pero pronto podré ayudarte con más información.';
}
