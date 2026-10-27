import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  LayoutAnimation,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

import { ApiError, fetchProfile, updateProfileRequest, type UpdateProfileInput, type UserProfile } from '../api';
import { AppText } from '../components/common/AppText';
import { Avatar } from '../components/common/Avatar';
import { PlaceholderMessage } from '../components/common/PlaceholderMessage';
import { ScreenContainer } from '../components/common/ScreenContainer';
import { ChangePasswordForm } from '../components/profile/ChangePasswordForm';
import { EditProfileForm } from '../components/profile/EditProfileForm';
import { FormMessage } from '../components/profile/FormMessage';
import { ProfileCard } from '../components/profile/ProfileCard';
import { ProfileInfoRow } from '../components/profile/ProfileInfoRow';
import { useAuth } from '../context/AuthContext';
import { useResponsive } from '../hooks/useResponsive';
import type { RootScreenProps } from '../navigation/types';
import { colors, gradients } from '../theme';
import { formatLongDate } from '../utils/format';

type ProfileState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; profile: UserProfile };

const MONTHS = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
];

/** "2026-10-26T21:34:35.309Z" -> "octubre de 2026". */
function formatMemberSince(isoDateTime: string): string {
  const date = new Date(isoDateTime);
  if (Number.isNaN(date.getTime())) return '';
  return `${MONTHS[date.getMonth()]} de ${date.getFullYear()}`;
}

/** "1036654321" -> "1.036.654.321" (solo para mostrar; se guarda sin puntos). */
function formatDocument(value: string | null): string | null {
  return value ? value.replace(/\B(?=(\d{3})+(?!\d))/g, '.') : null;
}

/**
 * Pantalla de Perfil del paciente (se abre tocando el avatar del Inicio).
 * Muestra sus datos (GET /profile), permite actualizarlos (PATCH /profile),
 * cambiar la contraseña (PATCH /profile/password) y cerrar sesión.
 */
export function ProfileScreen({ navigation }: RootScreenProps<'Profile'>) {
  const { s } = useResponsive();
  const { token, updateUser, logout } = useAuth();
  const [state, setState] = useState<ProfileState>({ status: 'loading' });
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  const loadProfile = useCallback(async () => {
    if (!token) return;
    setState({ status: 'loading' });
    try {
      setState({ status: 'ready', profile: await fetchProfile(token) });
    } catch (error) {
      const message = error instanceof ApiError ? error.message : 'No se pudo cargar tu perfil. Intenta de nuevo.';
      setState({ status: 'error', message });
    }
  }, [token]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const startEditing = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setSaveError(null);
    setSaveSuccess(false);
    setEditing(true);
  };

  const cancelEditing = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setEditing(false);
  };

  const handleSave = async (input: UpdateProfileInput) => {
    if (!token) return;
    setSaving(true);
    setSaveError(null);
    try {
      const profile = await updateProfileRequest(token, input);
      // Actualiza el nombre en la sesión para que el saludo del Inicio también cambie.
      updateUser({ fullName: profile.fullName });
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setState({ status: 'ready', profile });
      setEditing(false);
      setSaveSuccess(true);
    } catch (error) {
      setSaveError(error instanceof ApiError ? error.message : 'No se pudieron guardar los cambios.');
    } finally {
      setSaving(false);
    }
  };

  const togglePasswordForm = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setShowPasswordForm((current) => !current);
  };

  const handleLogout = () => {
    logout();
    navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
  };

  return (
    <KeyboardAvoidingView style={styles.flex} behavior="padding">
      <ScreenContainer gradient={gradients.home} edges={['top', 'bottom']}>
        {/* Barra superior con botón para volver al Inicio */}
        <View style={[styles.topBar, { paddingHorizontal: s(12), paddingVertical: s(8) }]}>
          <Pressable
            onPress={() => navigation.goBack()}
            accessibilityRole="button"
            accessibilityLabel="Volver"
            hitSlop={10}
            style={({ pressed }) => [styles.backButton, { width: s(40), height: s(40) }, pressed && styles.pressed]}
          >
            <Ionicons name="chevron-back" size={s(22)} color={colors.white} />
          </Pressable>
          <AppText weight="semibold" accessibilityRole="header" style={{ fontSize: s(16) }}>
            Mi perfil
          </AppText>
          <View style={{ width: s(40) }} />
        </View>

        <ScrollView
          contentContainerStyle={{ paddingHorizontal: s(20), paddingTop: s(8), paddingBottom: s(32), gap: s(22) }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {state.status === 'loading' && (
            <View style={styles.centerState}>
              <ActivityIndicator color={colors.primaryBright} />
              <AppText style={styles.muted}>Cargando tu perfil…</AppText>
            </View>
          )}

          {state.status === 'error' && (
            <View style={styles.centerState}>
              <PlaceholderMessage icon="alert-circle-outline" title="No se pudo conectar" description={state.message} />
              <Pressable onPress={loadProfile} accessibilityRole="button" hitSlop={10}>
                <AppText weight="semibold" style={styles.link}>
                  Reintentar
                </AppText>
              </Pressable>
            </View>
          )}

          {state.status === 'ready' && (
            <>
              {/* Encabezado: avatar, nombre, usuario y antigüedad */}
              <View style={[styles.hero, { gap: s(6) }]}>
                <Avatar size={s(88)} />
                <AppText weight="bold" style={{ fontSize: s(20), marginTop: s(8), textAlign: 'center' }}>
                  {state.profile.fullName}
                </AppText>
                <AppText style={[styles.muted, { fontSize: s(12) }]}>{`@${state.profile.username}`}</AppText>
                <View style={[styles.memberBadge, { paddingHorizontal: s(10), paddingVertical: s(4) }]}>
                  <AppText weight="medium" style={{ fontSize: s(10), color: colors.primaryBright }}>
                    {`Paciente desde ${formatMemberSince(state.profile.createdAt)}`}
                  </AppText>
                </View>
              </View>

              {/* Datos personales: lectura o edición */}
              <ProfileCard
                title={editing ? 'ACTUALIZAR DATOS' : 'DATOS PERSONALES'}
                actionLabel={editing ? undefined : 'Editar'}
                onAction={startEditing}
              >
                {editing ? (
                  <EditProfileForm
                    profile={state.profile}
                    saving={saving}
                    serverError={saveError}
                    onSave={handleSave}
                    onCancel={cancelEditing}
                  />
                ) : (
                  <>
                    <ProfileInfoRow
                      icon="card-outline"
                      label="Documento de identidad"
                      value={formatDocument(state.profile.documentNumber)}
                    />
                    <ProfileInfoRow
                      icon="calendar-outline"
                      label="Fecha de nacimiento"
                      value={state.profile.birthDate ? formatLongDate(state.profile.birthDate) : null}
                    />
                    <ProfileInfoRow icon="call-outline" label="Celular" value={state.profile.phone} />
                    <ProfileInfoRow icon="mail-outline" label="Correo electrónico" value={state.profile.email} />
                    <ProfileInfoRow icon="home-outline" label="Dirección" value={state.profile.address} />
                    {saveSuccess ? <FormMessage type="success" text="Tus datos se actualizaron correctamente." /> : null}
                  </>
                )}
              </ProfileCard>

              {/* Seguridad: cambio de contraseña desplegable */}
              <ProfileCard title="SEGURIDAD">
                <Pressable
                  onPress={togglePasswordForm}
                  accessibilityRole="button"
                  accessibilityState={{ expanded: showPasswordForm }}
                  style={({ pressed }) => [styles.securityRow, pressed && styles.pressed]}
                >
                  <View style={[styles.iconBox, { width: s(34), height: s(34) }]}>
                    <Ionicons name="lock-closed-outline" size={s(17)} color={colors.textSecondary} />
                  </View>
                  <AppText weight="medium" style={{ flex: 1, fontSize: s(13) }}>
                    Cambiar contraseña
                  </AppText>
                  <Ionicons
                    name={showPasswordForm ? 'chevron-up' : 'chevron-down'}
                    size={s(18)}
                    color={showPasswordForm ? colors.primaryBright : colors.textSecondary}
                  />
                </Pressable>
                {showPasswordForm && token ? <ChangePasswordForm token={token} /> : null}
              </ProfileCard>

              {/* Cerrar sesión */}
              <Pressable
                onPress={handleLogout}
                accessibilityRole="button"
                style={({ pressed }) => [styles.logoutButton, { height: s(50) }, pressed && styles.pressed]}
              >
                <Ionicons name="log-out-outline" size={s(18)} color={colors.danger} />
                <AppText weight="semibold" style={{ fontSize: s(13), color: colors.danger }}>
                  Cerrar sesión
                </AppText>
              </Pressable>
            </>
          )}
        </ScrollView>
      </ScreenContainer>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backButton: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { opacity: 0.7 },
  centerState: { alignItems: 'center', gap: 12, paddingVertical: 24 },
  muted: { color: colors.textSecondary },
  link: { color: colors.primaryBright, textDecorationLine: 'underline' },
  hero: { alignItems: 'center' },
  memberBadge: {
    marginTop: 4,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(31, 111, 229, 0.4)',
    backgroundColor: 'rgba(31, 111, 229, 0.08)',
  },
  securityRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconBox: {
    borderRadius: 10,
    backgroundColor: colors.surfaceRaised,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.5)',
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
  },
});
