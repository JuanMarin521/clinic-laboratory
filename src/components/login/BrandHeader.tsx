import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Line } from 'react-native-svg';

import { APP_NAME, APP_SUBTITLE } from '../../constants/app';
import { useResponsive } from '../../hooks/useResponsive';
import { colors } from '../../theme';
import { AppText } from '../common/AppText';

/** Isotipo de apertura (obturador) dibujado con SVG sobre un viewBox de 24x24. */
function ApertureLogo({ size }: { size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="10" stroke={colors.white} strokeWidth={0.7} />
      <Line x1="14.31" y1="8" x2="20.05" y2="17.94" stroke={colors.white} strokeWidth={0.7} />
      <Line x1="9.69" y1="8" x2="21.17" y2="8" stroke={colors.white} strokeWidth={0.7} />
      <Line x1="7.38" y1="12" x2="13.12" y2="2.06" stroke={colors.white} strokeWidth={0.7} />
      <Line x1="9.69" y1="16" x2="3.95" y2="6.06" stroke={colors.white} strokeWidth={0.7} />
      <Line x1="14.31" y1="16" x2="2.83" y2="16" stroke={colors.white} strokeWidth={0.7} />
      <Line x1="16.62" y1="12" x2="10.88" y2="21.94" stroke={colors.white} strokeWidth={0.7} />
    </Svg>
  );
}

/** Logo + nombre + subtítulo de la pantalla de inicio de sesión. */
export function BrandHeader() {
  const { s } = useResponsive();

  return (
    <View style={styles.container} accessibilityRole="header">
      <ApertureLogo size={s(96)} />
      <AppText weight="medium" style={[styles.title, { fontSize: s(18) }]}>
        {APP_NAME}
      </AppText>
      <AppText style={[styles.subtitle, { fontSize: s(12) }]}>{APP_SUBTITLE}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', gap: 10 },
  title: { letterSpacing: 2.5, marginTop: 8 },
  subtitle: { color: colors.textSecondary, letterSpacing: 0.4 },
});
