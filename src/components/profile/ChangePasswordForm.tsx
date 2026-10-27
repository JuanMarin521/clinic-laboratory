import { useState } from 'react';
import { View } from 'react-native';

import { ApiError, changePasswordRequest } from '../../api';
import { useResponsive } from '../../hooks/useResponsive';
import { GradientButton } from '../common/GradientButton';
import { AuthTextField } from '../login/AuthTextField';
import { FormMessage } from './FormMessage';

/** Misma regla que exige el backend (MIN_PASSWORD_LENGTH en la API). */
const MIN_PASSWORD_LENGTH = 4;

/** Formulario de cambio de contraseña (PATCH /profile/password). */
export function ChangePasswordForm({ token }: { token: string }) {
  const { s } = useResponsive();
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const nextError =
    next.length < MIN_PASSWORD_LENGTH ? `Debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres.` : undefined;
  const confirmError = confirm !== next ? 'Las contraseñas no coinciden.' : undefined;
  const currentError = current.length === 0 ? 'Escribe tu contraseña actual.' : undefined;

  const handleSubmit = async () => {
    setSubmitted(true);
    setMessage(null);
    if (currentError || nextError || confirmError) return;

    setSaving(true);
    try {
      await changePasswordRequest(token, current, next);
      setCurrent('');
      setNext('');
      setConfirm('');
      setSubmitted(false);
      setMessage({ type: 'success', text: 'Tu contraseña se actualizó correctamente.' });
    } catch (error) {
      const text = error instanceof ApiError ? error.message : 'No se pudo cambiar la contraseña.';
      setMessage({ type: 'error', text });
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={{ gap: s(16) }}>
      <AuthTextField
        label="CONTRASEÑA ACTUAL"
        icon="lock-closed-outline"
        value={current}
        onChangeText={setCurrent}
        placeholder="••••••"
        secure
        autoCapitalize="none"
        autoComplete="current-password"
        editable={!saving}
        errorMessage={submitted ? currentError : undefined}
      />
      <AuthTextField
        label="NUEVA CONTRASEÑA"
        icon="key-outline"
        value={next}
        onChangeText={setNext}
        placeholder="••••••"
        secure
        autoCapitalize="none"
        autoComplete="new-password"
        editable={!saving}
        errorMessage={submitted ? nextError : undefined}
      />
      <AuthTextField
        label="CONFIRMAR NUEVA CONTRASEÑA"
        icon="key-outline"
        value={confirm}
        onChangeText={setConfirm}
        placeholder="••••••"
        secure
        autoCapitalize="none"
        autoComplete="new-password"
        editable={!saving}
        errorMessage={submitted ? confirmError : undefined}
      />

      {message ? <FormMessage type={message.type} text={message.text} /> : null}

      <GradientButton
        label="CAMBIAR CONTRASEÑA"
        onPress={handleSubmit}
        disabled={!current || !next || !confirm}
        loading={saving}
        loadingLabel="GUARDANDO ..."
      />
    </View>
  );
}
