import { StyleSheet, View } from 'react-native';

import { RecognizedUser } from '../components/auth/RecognizedUser';
import { VersionFooter } from '../components/auth/VersionFooter';
import { BiometricScanner } from '../components/biometric/BiometricScanner';
import { ScreenContainer } from '../components/common/ScreenContainer';
import { SegmentedControl, type SegmentOption } from '../components/common/SegmentedControl';
import { mockUser } from '../data/mockUser';
import { useResponsive } from '../hooks/useResponsive';
import type { RootScreenProps } from '../navigation/types';

type AuthMode = 'biometric' | 'pin';

const AUTH_MODES: SegmentOption<AuthMode>[] = [
  { key: 'biometric', label: 'Biométrico' },
  { key: 'pin', label: 'PIN' },
];

/** Pantalla 2 — Acceso rápido con biometría (huella / rostro). */
export function BiometricLoginScreen({ navigation }: RootScreenProps<'BiometricLogin'>) {
  const { s } = useResponsive();

  const handleModeChange = (mode: AuthMode) => {
    if (mode === 'pin') navigation.replace('PinLogin');
  };

  // Sin backend: cualquier toque se considera una verificación exitosa.
  const handleVerify = () => {
    navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
  };

  return (
    <ScreenContainer scroll>
      <View style={[styles.content, { paddingHorizontal: s(28), paddingTop: s(40) }]}>
        <RecognizedUser name={mockUser.fullName} onNotMe={() => navigation.replace('Login')} />

        <View style={{ marginTop: s(36) }}>
          <SegmentedControl
            variant="gradient"
            options={AUTH_MODES}
            active="biometric"
            onChange={handleModeChange}
          />
        </View>

        <View style={styles.center}>
          <BiometricScanner onPress={handleVerify} />
        </View>

        <View style={{ paddingVertical: s(20) }}>
          <VersionFooter />
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', minHeight: 220 },
});
