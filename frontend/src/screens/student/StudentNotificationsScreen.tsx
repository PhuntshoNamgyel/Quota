// src/screens/student/StudentNotificationsScreen.tsx
import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { api } from '../../api/client';
import { colors } from '../../theme';
import { formatDateTime } from '../../format';

interface NotificationRow { id: number; level: string; message: string; created_at: string; module_name: string; }

const colourFor = (level: string) => (level === 'critical' ? colors.red : level === 'breach' ? colors.yellow : colors.primary);

export default function StudentNotificationsScreen() {
  const [rows, setRows] = useState<NotificationRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const data = await api.get('/api/student/notifications'); // server marks these read on fetch
    setRows(data);
    setLoading(false);
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color={colors.primary} /></View>;

  return (
    <FlatList
      style={styles.container}
      data={rows}
      keyExtractor={(n) => String(n.id)}
      contentContainerStyle={{ padding: 16 }}
      ListEmptyComponent={<Text style={styles.muted}>No alerts. You're on track.</Text>}
      renderItem={({ item }) => (
        <View style={[styles.card, { borderLeftColor: colourFor(item.level) }]}>
          <Text style={styles.module}>{item.module_name}</Text>
          <Text style={[styles.level, { color: colourFor(item.level) }]}>{item.level.toUpperCase()}</Text>
          <Text style={styles.message}>{item.message}</Text>
          <Text style={styles.date}>{formatDateTime(item.created_at)}</Text>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg },
  card: { backgroundColor: colors.card, borderRadius: 12, padding: 16, marginBottom: 10, borderWidth: 1, borderColor: colors.border, borderLeftWidth: 6 },
  module: { fontSize: 15, fontWeight: '700', color: colors.text },
  level: { fontSize: 11, fontWeight: '800', letterSpacing: 0.5, marginTop: 4 },
  message: { fontSize: 14, color: colors.text, marginTop: 6 },
  date: { fontSize: 12, color: colors.muted, marginTop: 8 },
  muted: { color: colors.muted, textAlign: 'center', marginTop: 30 },
});