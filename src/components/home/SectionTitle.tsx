import { StyleSheet } from 'react-native';

import { useResponsive } from '../../hooks/useResponsive';
import { colors } from '../../theme';
import { AppText } from '../common/AppText';

/** Título de sección en mayúsculas ("RECIENTES", "SEMANA PASADA"). */
export function SectionTitle({ title }: { title: string }) {
  const { s } = useResponsive();
  return (
    <AppText weight="medium" accessibilityRole="header" style={[styles.title, { fontSize: s(10) }]}>
      {title}
    </AppText>
  );
}

const styles = StyleSheet.create({
  title: { color: colors.textSecondary, letterSpacing: 1.5 },
});
