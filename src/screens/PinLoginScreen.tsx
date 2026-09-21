import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { RecognizedUser } from '../components/auth/RecognizedUser';
import { ScreenContainer } from '../components/common/ScreenContainer';
import { SegmentedControl, type SegmentOption } from '../components/common/SegmentedControl';
import { PinDots } from '../components/pin/PinDots';
import { PinKeypad } from '../components/pin/PinKeypad';
import { PIN_LENGTH } from '../constants/app';
import { mockUser } from '../data/mockUser';
import { useResponsive } from '../hooks/useResponsive';
import type { RootScreenProps } from '../navigation/types';

type AuthMode = 'biometric' | 'pin';

const AUTH_MODES: SegmentOption<AuthMode>[] = [
  { key: 'biometric', label: 'Biométrico' },
  { key: 'pin', label: 'PIN' },
];

/** Pantalla 3 — Acceso rápido con PIN de 4 dígitos. */
export function PinLoginScreen({ navigation }: RootScreenProps<'PinLogin'>) {
  const { s } = useResponsive();
  const [pin, setPin] = useState('');

  // Sin backend: cualquier PIN de 4 dígitos es válido.
  useEffect(() => {
    if (pin.length !== PIN_LENGTH) return;
    const timeout = setTimeout(() => {
      navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
    }, 250);
    return () => clearTimeout(timeout);
  }, [pin, navigation]);

  const handleDigit = (digit: string) => {
    setPin((current) => (current.length < PIN_LENGTH ? current + digit : current));
  };

  const handleDelete = () => setPin((current) => current.slice(0, -1));

  const handleModeChange = (mode: AuthMode) => {
    if (mode === 'biometric') navigation.replace('BiometricLogin');
  };

  return (
    <ScreenContainer edges={['top']}>
      <ScrollView
        style={styles.flex}
        contentContainerStyle={[styles.content, { paddingHorizontal: s(28), paddingTop: s(40) }]}
        showsVerticalScrollIndicator={false}
      >
        <RecognizedUser name={mockUser.fullName} onNotMe={() => navigation.replace('Login')} />

        <View style={{ marginTop: s(36) }}>
          <SegmentedControl
            variant="gradient"
            options={AUTH_MODES}
            active="pin"
            onChange={handleModeChange}
          />
        </View>

        <View style={{ marginTop: s(28), paddingBottom: s(16) }}>
          <PinDots length={PIN_LENGTH} filled={pin.length} />
        </View>
      </ScrollView>

      <PinKeypad onDigit={handleDigit} onDelete={handleDelete} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { flexGrow: 1 },
});
