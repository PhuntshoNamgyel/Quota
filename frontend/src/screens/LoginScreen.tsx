// src/screens/LoginScreen.tsx
import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme';

export default function LoginScreen() {
  const { login, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  async function handleLogin() {
    setError('');
    try {
      await login(email.trim(), password);
    } catch (e) {
      setError((e as Error).message);
    }
  }

  // Prefills a seeded demo account for quick presentation access
  function quickFill(role: 'lecturer' | 'student') {
    setEmail(role === 'lecturer' ? 'lecturer.cst@rub.edu.bt' : '02240354.cst@rub.edu.bt');
    setPassword(role === 'lecturer' ? 'Lecturer123' : '02240354');
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.inner}>
        <Text style={styles.brand}>Quota</Text>
        <Text style={styles.tagline}>Attendance, sorted.</Text>

        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor={colors.muted}
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor={colors.muted}
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Log in</Text>}
        </TouchableOpacity>

        <View style={styles.quickRow}>
          <TouchableOpacity onPress={() => quickFill('lecturer')}>
            <Text style={styles.quickText}>Use lecturer demo</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => quickFill('student')}>
            <Text style={styles.quickText}>Use student demo</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  inner: { flex: 1, justifyContent: 'center', paddingHorizontal: 28 },
  brand: { fontSize: 44, fontWeight: '800', color: colors.primary, textAlign: 'center' },
  tagline: { fontSize: 15, color: colors.muted, textAlign: 'center', marginBottom: 36 },
  input: {
    backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 12,
    paddingHorizontal: 16, paddingVertical: 14, fontSize: 16, color: colors.text, marginBottom: 14,
  },
  button: { backgroundColor: colors.primary, borderRadius: 12, paddingVertical: 16, alignItems: 'center', marginTop: 6 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  error: { color: colors.red, marginBottom: 12, textAlign: 'center' },
  quickRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 24 },
  quickText: { color: colors.primary, fontSize: 14, fontWeight: '600' },
});