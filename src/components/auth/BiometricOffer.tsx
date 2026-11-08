import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { useResponsive } from '../../hooks/useResponsive';
import type { BiometricCapability } from '../../security/biometricTypes';
import { colors } from '../../theme';
import { AppText } from '../common/AppText';
import { GradientButton } from '../common/GradientButton';

interface BiometricOfferProps {
  capability: BiometricCapability;
  loading: boolean;
  error: string | null;
  onAccept: () => void;
  onDecline: () => void;
}

/** Tarjeta que se muestra después del primer ingreso con contraseña para activar la biometría. */
export function BiometricOffer({ capability, loading, error, onAccept, onDecline }: BiometricOfferProps) {
  const { s } = useResponsive();

  return (
    <View style={[styles.card, { padding: s(20), gap: s(14) }]}>
      <View style={[styles.iconBox, { width: s(64), height: s(64), borderRadius: s(32) }]}>
        <Ionicons name={capability.icon} size={s(30)} color={colors.cyan} />
      </View>

      <AppText weight="bold" accessibilityRole="header" style={[styles.center, { fontSize: s(18) }]}>
        {`¿Activar ingreso con ${capability.label}?`}
      </AppText>
      <AppText style={[styles.center, styles.muted, { fontSize: s(12), lineHeight: s(18) }]}>
        {`La próxima vez podrás entrar con tu ${capability.label}, sin escribir la contraseña. Tu contraseña no se guarda en el celular.`}
      </AppText>

      {error ? (
        <AppText accessibilityLiveRegion="polite" style={[styles.center, styles.error, { fontSize: s(11) }]}>
          {error}
        </AppText>
      ) : null}

      <GradientButton label="ACTIVAR" onPress={onAccept} loading={loading} loadingLabel="ACTIVANDO ..." />
      <Pressable onPress={onDecline} disabled={loading} accessibilityRole="button" hitSlop={10}>
        <AppText weight="medium" style={[styles.center, styles.muted, { fontSize: s(12) }]}>
          Ahora no
        </AppText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'stretch',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  iconBox: {
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(15, 169, 224, 0.6)',
    backgroundColor: 'rgba(15, 169, 224, 0.08)',
  },
  center: { textAlign: 'center' },
  muted: { color: colors.textSecondary },
  error: { color: colors.danger },
});
