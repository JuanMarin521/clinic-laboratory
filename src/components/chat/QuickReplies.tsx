import { Pressable, ScrollView, StyleSheet } from 'react-native';

import { useResponsive } from '../../hooks/useResponsive';
import { colors } from '../../theme';
import { AppText } from '../common/AppText';

interface QuickRepliesProps {
  options: string[];
  onSelect: (text: string) => void;
}

/** Chips de respuesta rápida con scroll horizontal. */
export function QuickReplies({ options, onSelect }: QuickRepliesProps) {
  const { s } = useResponsive();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={styles.content}
      style={styles.scroll}
    >
      {options.map((option) => (
        <Pressable
          key={option}
          onPress={() => onSelect(option)}
          accessibilityRole="button"
          style={({ pressed }) => [styles.chip, pressed && styles.chipPressed]}
        >
          <AppText weight="medium" style={{ fontSize: s(11), color: '#B4C4E0' }}>
            {option}
          </AppText>
        </Pressable>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flexGrow: 0 },
  content: { paddingHorizontal: 16, gap: 8, paddingVertical: 4 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chipPressed: { backgroundColor: colors.surfaceRaised },
});
