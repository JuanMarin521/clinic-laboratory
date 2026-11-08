/**
 * Reglas de los datos personales del paciente, iguales a las del backend
 * (ver `patientFieldRules` en profileValidators.ts de la API). Se validan primero en el
 * celular para dar mensajes inmediatos; el servidor las vuelve a validar siempre.
 */

/** Datos personales que se piden en el registro y se editan en el Perfil. */
export interface PatientData {
  documentNumber: string;
  birthDate: string;
  phone: string;
  email: string;
  address: string;
}

export type PatientDataErrors = Partial<Record<keyof PatientData, string>>;

export const EMPTY_PATIENT_DATA: PatientData = {
  documentNumber: '',
  birthDate: '',
  phone: '',
  email: '',
  address: '',
};

const DOCUMENT_REGEX = /^\d{5,12}$/;
const PHONE_REGEX = /^\d{7,15}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const MIN_ADDRESS_LENGTH = 5;

const REQUIRED_MESSAGES: Record<keyof PatientData, string> = {
  documentNumber: 'Escribe tu número de documento.',
  birthDate: 'Selecciona tu fecha de nacimiento.',
  phone: 'Escribe tu número de celular.',
  email: 'Escribe tu correo electrónico.',
  address: 'Escribe tu dirección de residencia.',
};

/** `true` si "AAAA-MM-DD" es una fecha real (ej. no 2026-02-30) y no está en el futuro. */
function isValidPastDate(value: string): boolean {
  if (!DATE_REGEX.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().startsWith(value) && date <= new Date();
}

function validateField(field: keyof PatientData, value: string): string | undefined {
  switch (field) {
    case 'documentNumber':
      return DOCUMENT_REGEX.test(value) ? undefined : 'Entre 5 y 12 dígitos, sin puntos.';
    case 'birthDate':
      if (!DATE_REGEX.test(value)) return 'Usa el formato AAAA-MM-DD.';
      return isValidPastDate(value) ? undefined : 'La fecha no es válida.';
    case 'phone':
      return PHONE_REGEX.test(value) ? undefined : 'Entre 7 y 15 dígitos.';
    case 'email':
      return EMAIL_REGEX.test(value) ? undefined : 'Correo no válido.';
    case 'address':
      return value.length >= MIN_ADDRESS_LENGTH ? undefined : `Al menos ${MIN_ADDRESS_LENGTH} caracteres.`;
  }
}

/**
 * Valida los datos personales.
 * - `required: true` (registro): todos son obligatorios.
 * - `required: false` (Perfil): un campo vacío es válido y significa "borrar el dato".
 */
export function validatePatientData(data: PatientData, { required }: { required: boolean }): PatientDataErrors {
  const errors: PatientDataErrors = {};
  (Object.keys(data) as (keyof PatientData)[]).forEach((field) => {
    const value = data[field].trim();
    if (!value) {
      if (required) errors[field] = REQUIRED_MESSAGES[field];
      return;
    }
    const error = validateField(field, value);
    if (error) errors[field] = error;
  });
  return errors;
}

/** Quita los espacios sobrantes de cada dato antes de enviarlo. */
export function trimPatientData(data: PatientData): PatientData {
  return {
    documentNumber: data.documentNumber.trim(),
    birthDate: data.birthDate.trim(),
    phone: data.phone.trim(),
    email: data.email.trim(),
    address: data.address.trim(),
  };
}
