import { Ionicons } from '@expo/vector-icons';
import { useState, type ComponentProps } from 'react';
import { Pressable, StyleSheet, TextInput, View, type TextInputProps } from 'react-native';

import { useResponsive } from '../../hooks/useResponsive';
import { colors, fonts } from '../../theme';
import { AppText } from '../common/AppText';

interface AuthTextFieldProps
  extends Pick<
    TextInputProps,
    | 'value'
    | 'onChangeText'
    | 'placeholder'
    | 'autoCapitalize'
    | 'autoCorrect'
    | 'editable'
    | 'returnKeyType'
    | 'onSubmitEditing'
    | 'textContentType'
    | 'autoComplete'
  > {
  label: string;
  icon: ComponentProps<typeof Ionicons>['name'];
  /** Campo de contraseña: oculta el texto y muestra el ojo para revelarlo. */
  secure?: boolean;
  /** Mensaje de error. Si existe, el campo se pinta en rojo. */
  errorMessage?: string;
}

/**
 * Campo de texto del login con los estados del diseño:
 * reposo, enfocado (borde cyan) y error (borde rojo).
 */
export function AuthTextField({
  label,
  icon,
  secure = false,
  errorMessage,
  editable = true,
  ...inputProps
}: AuthTextFieldProps) {
  const { s } = useResponsive();
  const [focused, setFocused] = useState(false);
  const [revealed, setRevealed] = useState(false);

  const hasError = Boolean(errorMessage);
  const borderColor = hasError ? colors.danger : focused ? colors.cyanBorder : colors.border;
  const iconColor = hasError ? colors.danger : focused ? colors.white : colors.textSecondary;

  return (
    <View style={styles.wrapper}>
      <AppText weight="medium" style={[styles.label, { fontSize: s(10) }]}>
        {label}
      </AppText>

      <View
        style={[
          styles.field,
          { height: s(50), borderColor },
          focused && styles.fieldFocused,
          !editable && styles.fieldDisabled,
        ]}
      >
        <Ionicons name={icon} size={s(18)} color={iconColor} />

        <TextInput
          {...inputProps}
          editable={editable}
          secureTextEntry={secure && !revealed}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholderTextColor={colors.textMuted}
          selectionColor={colors.cyan}
          keyboardAppearance="dark"
          accessibilityLabel={label}
          style={[styles.input, { fontSize: s(12) }]}
        />

        {secure ? (
          <Pressable
            onPress={() => setRevealed((prev) => !prev)}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel={revealed ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          >
            <Ionicons
              name={revealed ? 'eye-off-outline' : 'eye-outline'}
              size={s(18)}
              color={colors.textSecondary}
            />
          </Pressable>
        ) : null}
      </View>

      {hasError ? (
        <AppText style={[styles.error, { fontSize: s(11) }]} accessibilityLiveRegion="polite">
          {errorMessage}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: 8 },
  label: { color: colors.textSecondary, letterSpacing: 1.5 },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    backgroundColor: '#0C1526',
  },
  fieldFocused: { backgroundColor: '#0E1A2E' },
  fieldDisabled: { opacity: 0.6 },
  input: {
    flex: 1,
    height: '100%',
    color: colors.white,
    fontFamily: fonts.medium,
    letterSpacing: 0.8,
  },
  error: { color: colors.danger },
});
