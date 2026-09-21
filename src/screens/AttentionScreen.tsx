import { useCallback, useEffect, useRef, useState } from 'react';
import { FlatList, KeyboardAvoidingView, StyleSheet, View } from 'react-native';

import { ChatHeader } from '../components/chat/ChatHeader';
import { ChatInput } from '../components/chat/ChatInput';
import { MessageBubble } from '../components/chat/MessageBubble';
import { QuickReplies } from '../components/chat/QuickReplies';
import { ScreenContainer } from '../components/common/ScreenContainer';
import { getMockReply, initialChatMessages, quickReplies } from '../data/mockChat';
import { useResponsive } from '../hooks/useResponsive';
import type { MainTabScreenProps } from '../navigation/types';
import { gradients } from '../theme';
import type { ChatMessage } from '../types/chat';
import { formatTime } from '../utils/format';

const REPLY_DELAY_MS = 900;

/** Pantalla 5 — Atención: chat con el asistente CPO Assist (respuestas simuladas). */
export function AttentionScreen(_props: MainTabScreenProps<'Attention'>) {
  const { s } = useResponsive();
  const listRef = useRef<FlatList<ChatMessage>>(null);
  const timeouts = useRef<ReturnType<typeof setTimeout>[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>(initialChatMessages);
  const [draft, setDraft] = useState('');

  useEffect(
    () => () => {
      timeouts.current.forEach(clearTimeout);
    },
    [],
  );

  const sendMessage = useCallback((rawText: string) => {
    const text = rawText.trim();
    if (!text) return;

    const now = new Date();
    const userMessage: ChatMessage = {
      id: `user-${now.getTime()}`,
      sender: 'user',
      text,
      time: formatTime(now),
    };
    setMessages((current) => [...current, userMessage]);
    setDraft('');

    const timeout = setTimeout(() => {
      const replyTime = new Date();
      const reply: ChatMessage = {
        id: `assistant-${replyTime.getTime()}`,
        sender: 'assistant',
        text: getMockReply(text),
        time: formatTime(replyTime),
      };
      setMessages((current) => [...current, reply]);
    }, REPLY_DELAY_MS);
    timeouts.current.push(timeout);
  }, []);

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
