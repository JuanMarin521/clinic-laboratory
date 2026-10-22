import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { useResponsive } from '../../hooks/useResponsive';
import { colors } from '../../theme';
import type { Exam } from '../../types/exam';
import { AppText } from '../common/AppText';

interface PdfExamItemProps {
  exam: Exam;
  downloading: boolean;
  onDownload: () => void;
}

/** Fila de un examen listo para descargar, con su propio botón y estado de carga. */
export function PdfExamItem({ exam, downloading, onDownload }: PdfExamItemProps) {
  const { s } = useResponsive();

  return (
    <View
      accessible
      accessibilityLabel={`${exam.name}, tomado ${exam.takenDate} en ${exam.site}`}
      style={[styles.card, { paddingVertical: s(12) }]}
    >
      <View style={[styles.iconBox, { width: s(38), height: s(38) }]}>
        <Ionicons name="document-text-outline" size={s(20)} color={colors.textSecondary} />
      </View>

      <View style={styles.texts}>
        <AppText weight="semibold" style={{ fontSize: s(13) }}>
          {exam.name}
        </AppText>
        <AppText style={[styles.subtitle, { fontSize: s(11) }]}>
          {`Tomado ${exam.takenDate} · ${exam.site}`}
        </AppText>
      </View>

      <Pressable
        onPress={onDownload}
        disabled={downloading}
        accessibilityRole="button"
        accessibilityLabel={`Descargar PDF de ${exam.name}`}
        style={({ pressed }) => [
          styles.downloadButton,
          { width: s(38), height: s(38) },
          pressed && styles.downloadPressed,
        ]}
      >
        {downloading ? (
          <ActivityIndicator size="small" color={colors.primaryBright} />
        ) : (
          <Ionicons name="download-outline" size={s(18)} color={colors.primaryBright} />
        )}
      </Pressable>
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
  downloadButton: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(31, 111, 229, 0.4)',
    backgroundColor: 'rgba(31, 111, 229, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  downloadPressed: { opacity: 0.7 },
});
