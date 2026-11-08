import { useCallback, useEffect, useRef, useState } from 'react';
import { FlatList, KeyboardAvoidingView, StyleSheet, View } from 'react-native';

import { ApiError, fetchSupportMessages, sendSupportMessage, type BackendChatMessage } from '../api';
import { ChatHeader } from '../components/chat/ChatHeader';
import { ChatInput } from '../components/chat/ChatInput';
import { MessageBubble } from '../components/chat/MessageBubble';
import { QuickReplies } from '../components/chat/QuickReplies';
import { ScreenContainer } from '../components/common/ScreenContainer';
import { useAuth } from '../context/AuthContext';
import { buildWelcomeMessages, quickReplies } from '../data/mockChat';
import { useResponsive } from '../hooks/useResponsive';
import type { MainTabScreenProps } from '../navigation/types';
import { gradients } from '../theme';
import type { ChatMessage } from '../types/chat';
import { formatTime } from '../utils/format';

/** Convierte un mensaje del backend (con `createdAt` ISO) al formato que pinta la UI (con `time`). */
function toChatMessage(message: BackendChatMessage): ChatMessage {
  return {
    id: message.id,
    sender: message.sender,
    text: message.text,
    time: formatTime(new Date(message.createdAt)),
  };
}

/**
 * Pantalla 5 — Atención: chat con Polito, el asistente virtual del CPO.
 * Al abrir muestra el saludo de Polito y el historial guardado (GET /api/v1/support/messages);
 * cada mensaje nuevo se envía con POST /api/v1/support/messages.
 */
export function AttentionScreen(_props: MainTabScreenProps<'Attention'>) {
  const { s } = useResponsive();
  const { token, user } = useAuth();
  const listRef = useRef<FlatList<ChatMessage>>(null);
  // El saludo se arma una sola vez, al abrir el chat (con el nombre del paciente y la hora de apertura).
  const [welcomeMessages] = useState(() => buildWelcomeMessages(user?.fullName));
  const [messages, setMessages] = useState<ChatMessage[]>(welcomeMessages);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);

  // Carga el historial guardado en el servidor y lo pone después del saludo.
  // Los mensajes que se hayan enviado mientras cargaba se conservan al final.
  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    fetchSupportMessages(token)
      .then((history) => {
        if (cancelled) return;
        setMessages((current) => [
          ...welcomeMessages,
          ...history.map(toChatMessage),
          ...current.slice(welcomeMessages.length),
        ]);
      })
      .catch(() => {
        // Sin historial se puede seguir chateando; el error de sesión lo atiende SessionGuard.
      });
    return () => {
      cancelled = true;
    };
  }, [token, welcomeMessages]);

  const sendMessage = useCallback(
    async (rawText: string) => {
      const text = rawText.trim();
      if (!text || !token || sending) return;

      setDraft('');
      setSending(true);

      // Mensaje optimista: se muestra de inmediato mientras se espera la respuesta del servidor.
      const optimisticMessage: ChatMessage = {
        id: `local-${Date.now()}`,
        sender: 'user',
        text,
        time: formatTime(new Date()),
      };
      setMessages((current) => [...current, optimisticMessage]);

      try {
        const result = await sendSupportMessage(text, token);
        // Se reemplaza el mensaje optimista por el confirmado del servidor y se agrega la respuesta.
        setMessages((current) => [
          ...current.filter((message) => message.id !== optimisticMessage.id),
          toChatMessage(result.userMessage),
          toChatMessage(result.assistantMessage),
        ]);
      } catch (error) {
        const errorText =
          error instanceof ApiError
            ? error.message
            : 'No se pudo enviar tu mensaje. Verifica tu conexión e intenta de nuevo.';

        setMessages((current) => [
          ...current,
          { id: `error-${Date.now()}`, sender: 'assistant', text: errorText, time: formatTime(new Date()) },
        ]);
      } finally {
        setSending(false);
      }
    },
    [token, sending],
  );

  return (
    <ScreenContainer gradient={gradients.home} edges={['top']}>
      <KeyboardAvoidingView style={styles.flex} behavior="padding">
        <ChatHeader />

        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <MessageBubble message={item} />}
          ItemSeparatorComponent={() => <View style={{ height: s(12) }} />}
          contentContainerStyle={[styles.list, { padding: s(20) }]}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          style={styles.flex}
        />

        <QuickReplies options={quickReplies} onSelect={sendMessage} />
        <ChatInput value={draft} onChangeText={setDraft} onSend={() => sendMessage(draft)} />
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  list: { flexGrow: 1 },
});
