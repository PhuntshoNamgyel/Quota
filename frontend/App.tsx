// App.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { colors } from './src/theme';

function Root() {
  const { user } = useAuth();
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Quota</Text>
      <Text style={styles.subtitle}>{user ? `Logged in as ${user.name}` : 'Not logged in yet'}</Text>
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <Root />
        <StatusBar style="auto" />
      </AuthProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg },
  title: { fontSize: 40, fontWeight: '800', color: colors.primary },
  subtitle: { marginTop: 8, fontSize: 16, color: colors.muted },
});