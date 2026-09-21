import { Ionicons } from '@expo/vector-icons';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import type { ComponentProps } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useKeyboardVisible } from '../../hooks/useKeyboardVisible';
import { MAX_CONTENT_WIDTH, useResponsive } from '../../hooks/useResponsive';
import type { MainTabParamList } from '../../navigation/types';
import { colors } from '../../theme';
import { AppText } from '../common/AppText';

type IconName = ComponentProps<typeof Ionicons>['name'];

const TAB_CONFIG: Record<keyof MainTabParamList, { label: string; icon: IconName }> = {
  Results: { label: 'Resultados', icon: 'grid-outline' },
  ExamPdf: { label: 'Examen PDF', icon: 'document-text-outline' },
  Attention: { label: 'Atención', icon: 'chatbox-outline' },
};

/** Barra inferior personalizada: ícono + etiqueta + punto indicador en la pestaña activa. */
export function CustomTabBar({ state, navigation }: BottomTabBarProps) {
  const { s } = useResponsive();
  const insets = useSafeAreaInsets();
  const keyboardVisible = useKeyboardVisible();

  if (keyboardVisible) return null;

  return (
    <View style={[styles.outer, { paddingBottom: Math.max(insets.bottom, 8) }]}>
      <View style={styles.inner}>
        {state.routes.map((route, index) => {
          const focused = state.index === index;
          const config = TAB_CONFIG[route.name as keyof MainTabParamList];
          const color = focused ? colors.primaryBright : colors.textSecondary;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!focused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          };

          return (
            <Pressable
              key={route.key}
              onPress={onPress}
              accessibilityRole="tab"
              accessibilityLabel={config.label}
              accessibilityState={{ selected: focused }}
              style={[styles.item, { minHeight: s(56) }]}
            >
              <Ionicons name={config.icon} size={s(22)} color={color} />
              <AppText weight="medium" style={{ fontSize: s(10), color }}>
                {config.label}
              </AppText>
              <View style={[styles.indicator, focused && styles.indicatorActive]} />
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    backgroundColor: '#08111F',
    borderTopWidth: 1,
    borderTopColor: colors.borderSoft,
  },
  inner: {
    flexDirection: 'row',
    width: '100%',
    maxWidth: MAX_CONTENT_WIDTH,
    alignSelf: 'center',
    paddingTop: 8,
  },
  item: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 3 },
  indicator: { width: 4, height: 4, borderRadius: 2, backgroundColor: 'transparent' },
  indicatorActive: { backgroundColor: colors.primaryBright },
});
