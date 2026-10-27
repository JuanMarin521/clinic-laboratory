import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import { EXAM_STATUS } from '../../constants/examStatus';
import { useResponsive } from '../../hooks/useResponsive';
import { colors } from '../../theme';
import type { Exam } from '../../types/exam';
import { formatShortDate } from '../../utils/format';
import { AppText } from '../common/AppText';

interface ExamListItemProps {
  exam: Exam;
  /**
   * Si es `true` (por defecto) muestra debajo del nombre la fecha y la sede.
   * Se oculta cuando el examen ya aparece debajo de la tarjeta de su orden,
   * que muestra esos mismos datos.
   */
  showDetails?: boolean;
}

/** Fila de examen: ícono, nombre, (opcional) fecha/sede y etiqueta de estado. */
export function ExamListItem({ exam, showDetails = true }: ExamListItemProps) {
  const { s } = useResponsive();
  const status = EXAM_STATUS[exam.status];

  return (
    <View
      accessible
      accessibilityLabel={`${exam.name}, ${status.label}, tomado ${formatShortDate(exam.takenDate)} en ${exam.site}`}
      style={[styles.card, { paddingVertical: s(12) }]}
    >
      <View style={[styles.iconBox, { width: s(38), height: s(38) }]}>
        <Ionicons name="pulse-outline" size={s(20)} color={colors.textSecondary} />
      </View>

      <View style={styles.texts}>
        <AppText weight="semibold" style={{ fontSize: s(13) }}>
          {exam.name}
        </AppText>
        {showDetails && (
          <AppText style={[styles.subtitle, { fontSize: s(11) }]}>
            {`Tomado ${formatShortDate(exam.takenDate)} · ${exam.site}`}
          </AppText>
        )}
      </View>

      <View style={[styles.badge, { backgroundColor: status.background }]}>
        <AppText weight="medium" style={{ fontSize: s(10), color: status.color }}>
          {status.label}
        </AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  iconBox: {
    borderRadius: 10,
    backgroundColor: colors.surfaceRaised,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  texts: { flex: 1, gap: 2 },
  subtitle: { color: colors.textSecondary },
  badge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 6 },
});
