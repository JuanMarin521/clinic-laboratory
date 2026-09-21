import { StyleSheet, View } from 'react-native';

import { useResponsive } from '../../hooks/useResponsive';
import { colors } from '../../theme';
import type { ChatMessage } from '../../types/chat';
import { AppText } from '../common/AppText';
import { Avatar } from '../common/Avatar';

interface MessageBubbleProps {
  message: ChatMessage;
}

/** Burbuja de mensaje: asistente (izquierda, oscura) o usuario (derecha, azul). */
export function MessageBubble({ message }: MessageBubbleProps) {
  const { s } = useResponsive();
  const isUser = message.sender === 'user';

  return (
    <View style={[styles.row, isUser && styles.rowUser]}>
      {!isUser ? <Avatar size={s(30)} tone="assistant" ring={false} /> : null}

      <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleAssistant]}>
        <AppText style={{ fontSize: s(12), lineHeight: s(17) }}>{message.text}</AppText>
        <AppText style={[styles.time, { fontSize: s(9) }, isUser && styles.timeUser]}>
          {message.time}
        </AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, maxWidth: '100%' },
  rowUser: { justifyContent: 'flex-end' },
  bubble: {
    maxWidth: '78%',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 4,
  },
  bubbleAssistant: {
    backgroundColor: colors.surfaceRaised,
    borderWidth: 1,
    borderColor: colors.border,
    borderTopLeftRadius: 4,
  },
  bubbleUser: { backgroundColor: colors.primary, borderTopRightRadius: 4 },
  time: { color: colors.textMuted },
  timeUser: { color: 'rgba(255,255,255,0.7)', alignSelf: 'flex-end' },
});
