import { Ionicons } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerAndroid, type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useState } from 'react';
import { Modal, Platform, Pressable, StyleSheet, View } from 'react-native';

import { useResponsive } from '../../hooks/useResponsive';
import { colors } from '../../theme';
import { formatLongDate } from '../../utils/format';
import { AppText } from '../common/AppText';
import { AuthTextField } from '../login/AuthTextField';

interface DateFieldProps {
  label: string;
  /** Fecha elegida en formato "AAAA-MM-DD", o '' si todavía no hay. */
  value: string;
  onChange: (value: string) => void;
  errorMessage?: string;
  editable?: boolean;
  /** Fecha que se muestra al abrir el calendario cuando todavía no hay valor. */
  initialDate?: Date;
  minimumDate?: Date;
  maximumDate?: Date;
}

/** "AAAA-MM-DD" con la fecha LOCAL (no UTC, para que en Colombia no se corra un día). */
function toIsoDate(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

function fromIsoDate(value: string): Date | null {
  const [year, month, day] = value.split('-').map(Number);
  return year && month && day ? new Date(year, month - 1, day) : null;
}

/**
 * Campo de fecha con calendario nativo (en vez de escribir "AAAA-MM-DD").
 * - Android: abre el diálogo de calendario del sistema.
 * - iOS: abre una hoja inferior con el calendario y los botones Cancelar / Listo.
 * - Web (solo para pruebas): campo de texto con formato AAAA-MM-DD.
 * Se ve igual que los demás campos del formulario.
 */
export function DateField({
  label,
  value,
  onChange,
  errorMessage,
  editable = true,
  initialDate = new Date(1990, 0, 1),
  minimumDate = new Date(1900, 0, 1),
  maximumDate = new Date(),
}: DateFieldProps) {
  const { s } = useResponsive();
  const [iosPickerOpen, setIosPickerOpen] = useState(false);
  const [iosDraft, setIosDraft] = useState<Date>(initialDate);

  if (Platform.OS === 'web') {
    return (
      <AuthTextField
        label={label}
        icon="calendar-outline"
        value={value}
        onChangeText={onChange}
        placeholder="AAAA-MM-DD"
        maxLength={10}
        editable={editable}
        errorMessage={errorMessage}
      />
    );
  }

  const selectedDate = fromIsoDate(value) ?? initialDate;

  const openPicker = () => {
    if (!editable) return;
    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        value: selectedDate,
        mode: 'date',
        minimumDate,
        maximumDate,
        onChange: (event: DateTimePickerEvent, date?: Date) => {
          if (event.type === 'set' && date) onChange(toIsoDate(date));
        },
      });
      return;
    }
    setIosDraft(selectedDate);
    setIosPickerOpen(true);
  };

  const hasError = Boolean(errorMessage);

  return (
    <View style={styles.wrapper}>
      <AppText weight="medium" style={[styles.label, { fontSize: s(10) }]}>
        {label}
      </AppText>

      <Pressable
        onPress={openPicker}
        disabled={!editable}
        accessibilityRole="button"
        accessibilityLabel={`${label}: ${value ? formatLongDate(value) : 'sin seleccionar'}`}
        accessibilityHint="Abre el calendario"
        style={[
          styles.field,
          { height: s(50), borderColor: hasError ? colors.danger : colors.border },
          !editable && styles.disabled,
        ]}
      >
        <Ionicons name="calendar-outline" size={s(18)} color={hasError ? colors.danger : colors.textSecondary} />
        <AppText
          weight={value ? 'medium' : 'regular'}
          style={[styles.value, { fontSize: s(12) }, !value && styles.placeholder]}
        >
          {value ? formatLongDate(value) : 'Selecciona la fecha'}
        </AppText>
        <Ionicons name="chevron-down" size={s(16)} color={colors.textSecondary} />
      </Pressable>

      {hasError ? (
        <AppText style={[styles.error, { fontSize: s(11) }]} accessibilityLiveRegion="polite">
          {errorMessage}
        </AppText>
      ) : null}

      {Platform.OS === 'ios' ? (
        <Modal visible={iosPickerOpen} transparent animationType="slide" onRequestClose={() => setIosPickerOpen(false)}>
          <View style={styles.backdrop}>
            <View style={[styles.sheet, { padding: s(16), gap: s(8) }]}>
              <View style={styles.sheetActions}>
                <Pressable onPress={() => setIosPickerOpen(false)} accessibilityRole="button" hitSlop={10}>
                  <AppText style={[styles.cancel, { fontSize: s(14) }]}>Cancelar</AppText>
                </Pressable>
                <Pressable
                  onPress={() => {
                    onChange(toIsoDate(iosDraft));
                    setIosPickerOpen(false);
                  }}
                  accessibilityRole="button"
                  hitSlop={10}
                >
                  <AppText weight="semibold" style={[styles.done, { fontSize: s(14) }]}>
                    Listo
                  </AppText>
                </Pressable>
              </View>
              <DateTimePicker
                value={iosDraft}
                mode="date"
                display="spinner"
                locale="es-CO"
                themeVariant="dark"
                textColor={colors.white}
                minimumDate={minimumDate}
                maximumDate={maximumDate}
                onChange={(_event, date) => date && setIosDraft(date)}
              />
            </View>
          </View>
        </Modal>
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
  disabled: { opacity: 0.6 },
  value: { flex: 1, color: colors.white, letterSpacing: 0.8 },
  placeholder: { color: colors.textMuted },
  error: { color: colors.danger },
  backdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0, 0, 0, 0.55)' },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sheetActions: { flexDirection: 'row', justifyContent: 'space-between' },
  cancel: { color: colors.textSecondary },
  done: { color: colors.primaryBright },
});
