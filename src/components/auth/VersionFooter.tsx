import { StyleSheet } from 'react-native';

import { APP_VERSION_LABEL } from '../../constants/app';
import { useResponsive } from '../../hooks/useResponsive';
import { colors } from '../../theme';
import { AppText } from '../common/AppText';

/** Texto de versión al pie de las pantallas de acceso. */
export function VersionFooter() {
  const { s } = useResponsive();
  return <AppText style={[styles.text, { fontSize: s(10) }]}>{APP_VERSION_LABEL}</AppText>;
}

const styles = StyleSheet.create({
  text: { color: colors.textMuted, textAlign: 'center', letterSpacing: 0.4 },
});
