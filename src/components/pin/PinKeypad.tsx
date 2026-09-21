import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useResponsive } from '../../hooks/useResponsive';
import { colors } from '../../theme';
import { AppText } from '../common/AppText';

interface PinKeypadProps {
  onDigit: (digit: string) => void;
  onDelete: () => void;
}

const LETTERS: Record<string, string> = {
  '2': 'ABC',
  '3': 'DEF',
  '4': 'GHI',
  '5': 'JKL',
  '6': 'MNO',
  '7': 'PQRS',
  '8': 'TUV',
  '9': 'WXYZ',
};

type KeyItem = { type: 'digit'; value: string } | { type: 'delete' } | { type: 'empty' };

const ROWS: KeyItem[][] = [
  [
    { type: 'digit', value: '1' },
    { type: 'digit', value: '2' },
    { type: 'digit', value: '3' },
  ],
  [
    { type: 'digit', value: '4' },
    { type: 'digit', value: '5' },
    { type: 'digit', value: '6' },
  ],
  [
    { type: 'digit', value: '7' },
    { type: 'digit', value: '8' },
    { type: 'digit', value: '9' },
  ],
  [{ type: 'empty' }, { type: 'digit', value: '0' }, { type: 'delete' }],
];

/** Teclado numérico propio (mismo aspecto del teclado iOS del diseño). */
export function PinKeypad({ onDigit, onDelete }: PinKeypadProps) {
  const { s } = useResponsive();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.panel, { paddingBottom: Math.max(insets.bottom, 10) + 4 }]}>
      {ROWS.map((row, rowIndex) => (
        <View key={rowIndex} style={styles.row}>
          {row.map((item, colIndex) => {
            if (item.type === 'empty') {
              return <View key={colIndex} style={styles.keyPlaceholder} />;
            }

            if (item.type === 'delete') {
              return (
                <Pressable
                  key={colIndex}
                  onPress={onDelete}
                  accessibilityRole="button"
                  accessibilityLabel="Borrar último dígito"
                  style={({ pressed }) => [
                    styles.keyPlaceholder,
                    styles.center,
                    { height: s(48) },
                    pressed && styles.deletePressed,
                  ]}
                >
                  <Ionicons name="backspace-outline" size={s(26)} color={colors.keypadKeyText} />
                </Pressable>
              );
            }

            return (
              <Pressable
                key={colIndex}
                onPress={() => onDigit(item.value)}
                accessibilityRole="button"
                accessibilityLabel={`Número ${item.value}`}
                style={({ pressed }) => [
                  styles.key,
                  styles.center,
                  { height: s(48) },
                  pressed && styles.keyPressed,
                ]}
              >
                <AppText style={[styles.digit, { fontSize: s(22) }]}>{item.value}</AppText>
                {LETTERS[item.value] ? (
                  <AppText weight="bold" style={[styles.letters, { fontSize: s(9) }]}>
                    {LETTERS[item.value]}
                  </AppText>
                ) : null}
              </Pressable>
            );
          })}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    backgroundColor: colors.keypadPanel,
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    paddingTop: 10,
    paddingHorizontal: 6,
    gap: 8,
  },
  row: { flexDirection: 'row', gap: 6 },
  key: {
    flex: 1,
    borderRadius: 6,
    backgroundColor: colors.keypadKey,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 0,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  keyPlaceholder: { flex: 1 },
  keyPressed: { backgroundColor: '#C9D1E2' },
  deletePressed: { opacity: 0.5 },
  center: { alignItems: 'center', justifyContent: 'center' },
  digit: { color: colors.keypadKeyText, lineHeight: 26 },
  letters: { color: colors.keypadKeyText, letterSpacing: 1.5, marginTop: -2 },
});
