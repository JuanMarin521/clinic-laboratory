import { StyleSheet, View } from 'react-native';

import { EXAM_STATUS, EXAM_STATUS_ORDER } from '../../constants/examStatus';
import { useResponsive } from '../../hooks/useResponsive';
import type { ExamStatus } from '../../types/exam';
import { AppText } from '../common/AppText';

interface StatusSummaryProps {
  counts: Record<ExamStatus, number>;
}

/** Fila de 3 tarjetas semáforo: Listo / En proceso / Con novedad. */
export function StatusSummary({ counts }: StatusSummaryProps) {
  const { s } = useResponsive();

  return (
    <View style={styles.row}>
      {EXAM_STATUS_ORDER.map((status) => {
        const config = EXAM_STATUS[status];
        return (
          <View
            key={status}
            accessible
            accessibilityLabel={`${counts[status]} ${config.label}`}
            style={[
              styles.card,
              {
                backgroundColor: config.background,
                borderColor: config.border,
                paddingVertical: s(14),
              },
            ]}
          >
            <View style={[styles.dot, { backgroundColor: config.color }]} />
            <AppText weight="bold" style={{ fontSize: s(28), color: config.color, lineHeight: s(34) }}>
              {counts[status]}
            </AppText>
            <AppText weight="medium" style={{ fontSize: s(11), color: config.color }}>
              {config.label}
            </AppText>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 10 },
  card: {
    flex: 1,
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 10,
    gap: 2,
  },
  dot: { width: 8, height: 8, borderRadius: 4, marginBottom: 4 },
});
