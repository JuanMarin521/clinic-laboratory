import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { useResponsive } from '../../hooks/useResponsive';
import { colors, fonts } from '../../theme';

interface ChatInputProps {
  value: string;
  onChangeText: (text: string) => void;
  onSend: () => void;
}

/** Caja de texto del chat con botón de enviar. */
export function ChatInput({ value, onChangeText, onSend }: ChatInputProps) {
  const { s } = useResponsive();
  const canSend = value.trim().length > 0;

  return (
    <View style={styles.row}>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        onSubmitEditing={onSend}
        placeholder="Escribe tu consulta.."
        placeholderTextColor={colors.textMuted}
        selectionColor={colors.cyan}
        keyboardAppearance="dark"
        returnKeyType="send"
        accessibilityLabel="Escribe tu consulta"
        style={[styles.input, { height: s(44), fontSize: s(12) }]}
      />
      <Pressable
        onPress={onSend}
        disabled={!canSend}
        accessibilityRole="button"
        accessibilityLabel="Enviar mensaje"
        accessibilityState={{ disabled: !canSend }}
        style={[
          styles.send,
          { width: s(44), height: s(44) },
          canSend && styles.sendActive,
        ]}
      >
        <Ionicons
          name="arrow-forward"
          size={s(18)}
          color={canSend ? colors.white : colors.textSecondary}
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16, paddingVertical: 10 },
  input: {
    flex: 1,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    color: colors.white,
    fontFamily: fonts.regular,
  },
  send: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendActive: { backgroundColor: colors.primary, borderColor: colors.primary },
});
