import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import type { UpdateProfileInput, UserProfile } from '../../api';
import { useResponsive } from '../../hooks/useResponsive';
import { colors } from '../../theme';
import { trimPatientData, validatePatientData, type PatientData } from '../../utils/patientValidation';
import { AppText } from '../common/AppText';
import { GradientButton } from '../common/GradientButton';
import { PatientDataFields } from '../forms/PatientDataFields';
import { AuthTextField } from '../login/AuthTextField';
import { FormMessage } from './FormMessage';

const MIN_FULL_NAME_LENGTH = 3;

interface EditProfileFormProps {
  profile: UserProfile;
  saving: boolean;
  serverError: string | null;
  onSave: (input: UpdateProfileInput) => void;
  onCancel: () => void;
}

/**
 * Formulario de "Actualizar datos" del Perfil. Valida en el teléfono antes de enviar.
 * Aquí los datos personales son opcionales: dejar un campo vacío lo borra.
 */
export function EditProfileForm({ profile, saving, serverError, onSave, onCancel }: EditProfileFormProps) {
  const { s } = useResponsive();
  const [submitted, setSubmitted] = useState(false);
  const [fullName, setFullName] = useState(profile.fullName);
  const [data, setData] = useState<PatientData>({
    documentNumber: profile.documentNumber ?? '',
    birthDate: profile.birthDate ?? '',
    phone: profile.phone ?? '',
    email: profile.email ?? '',
    address: profile.address ?? '',
  });

  const fullNameError =
    fullName.trim().length < MIN_FULL_NAME_LENGTH
      ? `El nombre debe tener al menos ${MIN_FULL_NAME_LENGTH} caracteres.`
      : undefined;
  const dataErrors = validatePatientData(data, { required: false });
  const hasErrors = Boolean(fullNameError) || Object.keys(dataErrors).length > 0;

  const handleSave = () => {
    setSubmitted(true);
    if (hasErrors) return;
    onSave({ fullName: fullName.trim(), ...trimPatientData(data) });
  };

  return (
    <View style={{ gap: s(16) }}>
      <AuthTextField
        label="NOMBRE COMPLETO"
        icon="person-circle-outline"
        value={fullName}
        onChangeText={setFullName}
        autoCapitalize="words"
        autoComplete="name"
        editable={!saving}
        errorMessage={submitted ? fullNameError : undefined}
      />
      <PatientDataFields
        values={data}
        onChange={(field, value) => setData((current) => ({ ...current, [field]: value }))}
        errors={submitted ? dataErrors : undefined}
        editable={!saving}
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
