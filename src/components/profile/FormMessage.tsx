import { StyleSheet } from 'react-native';

import { useResponsive } from '../../hooks/useResponsive';
import { colors } from '../../theme';
import { AppText } from '../common/AppText';

/** Mensaje bajo un formulario: verde si salió bien, rojo si hubo error. */
export function FormMessage({ type, text }: { type: 'success' | 'error'; text: string }) {
  const { s } = useResponsive();
  return (
    <AppText
      accessibilityLiveRegion="polite"
      style={[styles.text, { fontSize: s(11), color: type === 'success' ? colors.success : colors.danger }]}
    >
      {text}
    </AppText>
  );
}

const styles = StyleSheet.create({ text: { textAlign: 'center' } });
