// src/screens/student/StudentDashboardScreen.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { colors } from '../../theme';

export default function StudentDashboardScreen() {
  const { user, logout } = useAuth();
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Hi, {user?.name}</Text>
      <Text style={styles.sub}>Student view — your colour-coded attendance arrives in Task 13.</Text>
      <TouchableOpacity style={styles.logout} onPress={logout}>
        <Text style={styles.logoutText}>Log out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg, padding: 24 },
  heading: { fontSize: 24, fontWeight: '700', color: colors.text },
  sub: { fontSize: 15, color: colors.muted, textAlign: 'center', marginTop: 8 },
  logout: { marginTop: 28, borderWidth: 1, borderColor: colors.border, borderRadius: 10, paddingHorizontal: 20, paddingVertical: 12 },
  logoutText: { color: colors.red, fontWeight: '600' },
});