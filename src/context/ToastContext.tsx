import { Ionicons } from '@expo/vector-icons';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '../components/common/AppText';
import { useResponsive } from '../hooks/useResponsive';
import { colors } from '../theme';

type ToastType = 'success' | 'error' | 'info';

interface ToastMessage {
  id: number;
  type: ToastType;
  text: string;
}

interface ToastContextValue {
  /** Muestra un mensaje flotante que desaparece solo después de unos segundos. */
  showToast: (text: string, type?: ToastType) => void;
}

const VISIBLE_MS = 3200;
const ANIMATION_MS = 220;

const STYLE_BY_TYPE: Record<ToastType, { icon: keyof typeof Ionicons.glyphMap; color: string }> = {
  success: { icon: 'checkmark-circle', color: colors.success },
  error: { icon: 'alert-circle', color: colors.danger },
  info: { icon: 'information-circle', color: colors.primaryBright },
};

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

/** Mensajes flotantes ("toast") para toda la app. Se dibujan encima de cualquier pantalla. */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const nextId = useRef(0);

  const showToast = useCallback((text: string, type: ToastType = 'success') => {
    nextId.current += 1;
    setToast({ id: nextId.current, type, text });
  }, []);

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {toast ? <ToastView key={toast.id} toast={toast} onHidden={() => setToast(null)} /> : null}
    </ToastContext.Provider>
  );
}

function ToastView({ toast, onHidden }: { toast: ToastMessage; onHidden: () => void }) {
  const { s } = useResponsive();
  const insets = useSafeAreaInsets();
  const progress = useRef(new Animated.Value(0)).current;
  const { icon, color } = STYLE_BY_TYPE[toast.type];

  useEffect(() => {
    const animation = Animated.sequence([
      Animated.timing(progress, { toValue: 1, duration: ANIMATION_MS, useNativeDriver: true }),
      Animated.delay(VISIBLE_MS),
      Animated.timing(progress, { toValue: 0, duration: ANIMATION_MS, useNativeDriver: true }),
    ]);
    animation.start(({ finished }) => finished && onHidden());
    return () => animation.stop();
  }, [onHidden, progress]);

  const translateY = progress.interpolate({ inputRange: [0, 1], outputRange: [-20, 0] });

  return (
    <View pointerEvents="none" style={[styles.container, { top: insets.top + s(12) }]}>
      <Animated.View
        accessibilityRole="alert"
        accessibilityLiveRegion="polite"
        style={[
          styles.toast,
          { paddingHorizontal: s(14), paddingVertical: s(12), borderColor: color, opacity: progress, transform: [{ translateY }] },
        ]}
      >
        <Ionicons name={icon} size={s(20)} color={color} />
        <AppText weight="medium" style={[styles.text, { fontSize: s(12) }]}>
          {toast.text}
        </AppText>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { position: 'absolute', left: 16, right: 16, alignItems: 'center' },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    maxWidth: 420,
    borderRadius: 14,
    borderWidth: 1,
    backgroundColor: colors.surfaceRaised,
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  text: { flexShrink: 1, color: colors.white },
});

/** Hook para mostrar mensajes flotantes. Lanza un error si se usa fuera del `ToastProvider`. */
export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast debe usarse dentro de un <ToastProvider>.');
  return context;
}
