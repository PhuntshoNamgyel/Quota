// src/screens/ChangePasswordScreen.tsx
import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { api } from '../api/client';
import { colors } from '../theme';
import { RootStackParams } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParams, 'ChangePassword'>;

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

export default function ChangePasswordScreen({ navigation }: Props) {
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setError('');

    if (!current || !next || !confirm) {
      setError('All fields are required');
      return;
    }
    if (next !== confirm) {
      setError('New passwords do not match');
      return;
    }
    if (!PASSWORD_REGEX.test(next)) {
      setError('Password must be at least 8 characters and include an uppercase letter, a lowercase letter, and a number');
      return;
    }
    if (current === next) {
      setError('New password must be different from current password');
      return;
    }

    setSaving(true);
    try {
      await api.put('/api/auth/password', { currentPassword: current, newPassword: next });
      Alert.alert('Success', 'Your password has been changed.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <KeyboardAwareScrollView style={styles.container} contentContainerStyle={{ padding: 24 }} enableOnAndroid extraScrollHeight={20}>
      <Text style={styles.label}>Current password</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter current password"
        placeholderTextColor={colors.muted}
        secureTextEntry
        value={current}
        onChangeText={setCurrent}
      />

      <Text style={[styles.label, { marginTop: 20 }]}>New password</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter new password"
        placeholderTextColor={colors.muted}
        secureTextEntry
        value={next}
        onChangeText={setNext}
      />

      <Text style={[styles.label, { marginTop: 20 }]}>Confirm new password</Text>
      <TextInput
        style={styles.input}
        placeholder="Re-enter new password"
        placeholderTextColor={colors.muted}
        secureTextEntry
        value={confirm}
        onChangeText={setConfirm}
      />

      <Text style={styles.hint}>
        Password must be at least 8 characters and include an uppercase letter, a lowercase letter, and a number.
      </Text>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <TouchableOpacity style={styles.button} onPress={handleSave} disabled={saving}>
        {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Save new password</Text>}
      </TouchableOpacity>
    </KeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  label: { fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: 8 },
  input: {
    backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 12,
    paddingHorizontal: 16, paddingVertical: 14, fontSize: 16, color: colors.text,
  },
  hint: { fontSize: 12, color: colors.muted, marginTop: 10 },
  error: { color: colors.red, marginTop: 16, textAlign: 'center' },
  button: { backgroundColor: colors.primary, borderRadius: 12, paddingVertical: 16, alignItems: 'center', marginTop: 28 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});