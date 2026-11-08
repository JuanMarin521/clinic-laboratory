import { AuthTextField } from '../login/AuthTextField';
import { DateField } from './DateField';
import type { PatientData, PatientDataErrors } from '../../utils/patientValidation';

interface PatientDataFieldsProps {
  values: PatientData;
  onChange: (field: keyof PatientData, value: string) => void;
  /** Errores a mostrar debajo de cada campo (solo después de intentar enviar). */
  errors?: PatientDataErrors;
  editable?: boolean;
}

/**
 * Campos de datos personales del paciente: documento, fecha de nacimiento, celular,
 * correo y dirección. Se usan en el Registro y en "Actualizar datos" del Perfil.
 */
export function PatientDataFields({ values, onChange, errors = {}, editable = true }: PatientDataFieldsProps) {
  return (
    <>
      <AuthTextField
        label="DOCUMENTO DE IDENTIDAD"
        icon="card-outline"
        value={values.documentNumber}
        onChangeText={(value) => onChange('documentNumber', value)}
        placeholder="SOLO NÚMEROS"
        keyboardType="number-pad"
        maxLength={12}
        editable={editable}
        errorMessage={errors.documentNumber}
      />
      <DateField
        label="FECHA DE NACIMIENTO"
        value={values.birthDate}
        onChange={(value) => onChange('birthDate', value)}
        editable={editable}
        errorMessage={errors.birthDate}
      />
      <AuthTextField
        label="CELULAR"
        icon="call-outline"
        value={values.phone}
        onChangeText={(value) => onChange('phone', value)}
        placeholder="3001234567"
        keyboardType="phone-pad"
        maxLength={15}
        autoComplete="tel"
        textContentType="telephoneNumber"
        editable={editable}
        errorMessage={errors.phone}
      />
      <AuthTextField
        label="CORREO ELECTRÓNICO"
        icon="mail-outline"
        value={values.email}
        onChangeText={(value) => onChange('email', value)}
        placeholder="correo@ejemplo.com"
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete="email"
        textContentType="emailAddress"
        editable={editable}
        errorMessage={errors.email}
      />
      <AuthTextField
        label="DIRECCIÓN DE RESIDENCIA"
        icon="home-outline"
        value={values.address}
        onChangeText={(value) => onChange('address', value)}
        placeholder="CALLE, NÚMERO, CIUDAD"
        maxLength={120}
        autoComplete="street-address"
        textContentType="fullStreetAddress"
        editable={editable}
        errorMessage={errors.address}
      />
    </>
  );
}
