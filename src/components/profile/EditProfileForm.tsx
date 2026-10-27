import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import type { UpdateProfileInput, UserProfile } from '../../api';
import { useResponsive } from '../../hooks/useResponsive';
import { colors } from '../../theme';
import { AppText } from '../common/AppText';
import { GradientButton } from '../common/GradientButton';
import { AuthTextField } from '../login/AuthTextField';
import { FormMessage } from './FormMessage';

/** Mismas reglas que exige el backend (ver profileValidators.ts de la API). */
const DOCUMENT_REGEX = /^\d{5,12}$/;
const PHONE_REGEX = /^\d{7,15}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

interface EditProfileFormProps {
  profile: UserProfile;
  saving: boolean;
  serverError: string | null;
  onSave: (input: UpdateProfileInput) => void;
  onCancel: () => void;
}

/** Formulario de "Actualizar datos" del Perfil. Valida en el teléfono antes de enviar. */
export function EditProfileForm({ profile, saving, serverError, onSave, onCancel }: EditProfileFormProps) {
  const { s } = useResponsive();
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState<UpdateProfileInput>({
    fullName: profile.fullName,
    documentNumber: profile.documentNumber ?? '',
    email: profile.email ?? '',
    phone: profile.phone ?? '',
    address: profile.address ?? '',
    birthDate: profile.birthDate ?? '',
  });

  const set = (field: keyof UpdateProfileInput) => (value: string) =>
    setForm((current) => ({ ...current, [field]: value }));

  // Cada campo opcional solo se valida si el paciente escribió algo.
  const errors: Partial<Record<keyof UpdateProfileInput, string>> = {};
  if (form.fullName.trim().length < 3) errors.fullName = 'El nombre debe tener al menos 3 caracteres.';
  if (form.documentNumber && !DOCUMENT_REGEX.test(form.documentNumber.trim()))
    errors.documentNumber = 'Entre 5 y 12 dígitos, sin puntos.';
  if (form.phone && !PHONE_REGEX.test(form.phone.trim())) errors.phone = 'Entre 7 y 15 dígitos.';
  if (form.email && !EMAIL_REGEX.test(form.email.trim())) errors.email = 'Correo no válido.';
  if (form.birthDate && !DATE_REGEX.test(form.birthDate.trim())) errors.birthDate = 'Usa el formato AAAA-MM-DD.';

  const visibleError = (field: keyof UpdateProfileInput) => (submitted ? errors[field] : undefined);

  const handleSave = () => {
    setSubmitted(true);
    if (Object.keys(errors).length > 0) return;
    onSave({
      fullName: form.fullName.trim(),
      documentNumber: form.documentNumber.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      address: form.address.trim(),
      birthDate: form.birthDate.trim(),
    });
  };

  return (
    <View style={{ gap: s(16) }}>
      <AuthTextField
        label="NOMBRE COMPLETO"
        icon="person-circle-outline"
        value={form.fullName}
        onChangeText={set('fullName')}
        autoCapitalize="words"
        autoComplete="name"
        editable={!saving}
        errorMessage={visibleError('fullName')}
      />
      <AuthTextField
        label="DOCUMENTO DE IDENTIDAD"
        icon="card-outline"
        value={form.documentNumber}
        onChangeText={set('documentNumber')}
        placeholder="SOLO NÚMEROS"
        keyboardType="number-pad"
        maxLength={12}
        editable={!saving}
        errorMessage={visibleError('documentNumber')}
      />
      <AuthTextField
        label="FECHA DE NACIMIENTO"
        icon="calendar-outline"
        value={form.birthDate}
        onChangeText={set('birthDate')}
        placeholder="AAAA-MM-DD"
        keyboardType="numbers-and-punctuation"
        maxLength={10}
        editable={!saving}
        errorMessage={visibleError('birthDate')}
      />
      <AuthTextField
        label="CELULAR"
        icon="call-outline"
        value={form.phone}
        onChangeText={set('phone')}
        placeholder="3001234567"
        keyboardType="phone-pad"
        maxLength={15}
        autoComplete="tel"
        editable={!saving}
        errorMessage={visibleError('phone')}
      />
      <AuthTextField
        label="CORREO ELECTRÓNICO"
        icon="mail-outline"
        value={form.email}
        onChangeText={set('email')}
        placeholder="correo@ejemplo.com"
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete="email"
        editable={!saving}
        errorMessage={visibleError('email')}
      />
      <AuthTextField
        label="DIRECCIÓN"
        icon="home-outline"
        value={form.address}
        onChangeText={set('address')}
        placeholder="CALLE, NÚMERO, CIUDAD"
        maxLength={120}
        editable={!saving}
        errorMessage={visibleError('address')}
      />

      {serverError ? <FormMessage type="error" text={serverError} /> : null}

      <GradientButton
        label="GUARDAR CAMBIOS"
        onPress={handleSave}
        loading={saving}
        loadingLabel="GUARDANDO ..."
      />
      <Pressable onPress={onCancel} disabled={saving} accessibilityRole="button" hitSlop={10}>
        <AppText weight="medium" style={[styles.cancel, { fontSize: s(12) }]}>
          Cancelar
        </AppText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  cancel: { color: colors.textSecondary, textAlign: 'center' },
});
