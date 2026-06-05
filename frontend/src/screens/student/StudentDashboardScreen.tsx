// src/screens/student/StudentDashboardScreen.tsx
import React, { useState, useCallback, useLayoutEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { colors } from '../../theme';
import { RootStackParams } from '../../navigation/types';

type Props = NativeStackScreenProps<RootStackParams, 'StudentDashboard'>;
interface Quota {
  held: number; attended: number; missed: number; percentage: number;
  remainingAbsences: number; totalClasses: number; colour: 'green' | 'yellow' | 'red'; label: string;
}
interface DashItem { module: { id: number; name: string }; quota: Quota; }

const colourFor = (c: string) => (c === 'green' ? colors.green : c === 'yellow' ? colors.yellow : colors.red);

export default function StudentDashboardScreen({ navigation }: Props) {
  const { user, logout } = useAuth();
  const [items, setItems] = useState<DashItem[]>([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAll = useCallback(async () => {
    const [dash, unreadRes] = await Promise.all([
      api.get('/api/student/modules'),
      api.get('/api/student/notifications/unread-count'),
    ]);
    setItems(dash);
    setUnread(unreadRes.count ?? 0);
  }, []);

  const load = useCallback(async () => {
    try { await fetchAll(); } finally { setLoading(false); }
  }, [fetchAll]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try { await fetchAll(); } finally { setRefreshing(false); }
  }, [fetchAll]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View style={{ flexDirection: 'row', gap: 18, alignItems: 'center' }}>
          <TouchableOpacity onPress={() => navigation.navigate('StudentNotifications')}>
            <View>
              <Text style={styles.headerBtn}>Alerts</Text>
              {unread > 0 && (
                <View style={styles.badge}><Text style={styles.badgeText}>{unread > 9 ? '9+' : unread}</Text></View>
              )}
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={logout}><Text style={styles.headerBtn}>Logout</Text></TouchableOpacity>
        </View>
      ),
    });
  }, [navigation, logout, unread]);

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color={colors.primary} /></View>;

  return (
    <FlatList
      style={styles.container}
      data={items}
      keyExtractor={(i) => String(i.module.id)}
      contentContainerStyle={{ padding: 16 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      ListHeaderComponent={<Text style={styles.greeting}>Hi {user?.name}</Text>}
      ListEmptyComponent={<Text style={styles.muted}>You're not enrolled in any modules yet.</Text>}
      renderItem={({ item }) => {
        const c = colourFor(item.quota.colour);
        return (
          <TouchableOpacity
            style={[styles.card, { borderLeftColor: c }]}
            onPress={() => navigation.navigate('StudentHistory', { moduleId: item.module.id, moduleName: item.module.name })}
          >
            <View style={styles.cardTop}>
              <Text style={styles.moduleName}>{item.module.name}</Text>
              <Text style={[styles.pct, { color: c }]}>{item.quota.percentage}%</Text>
            </View>
            <View style={[styles.statusTag, { backgroundColor: c }]}>
              <Text style={styles.statusText}>{item.quota.label}</Text>
            </View>
            <Text style={styles.meta}>
              {item.quota.attended}/{item.quota.totalClasses} attended  ·  {item.quota.missed} missed  ·  {item.quota.remainingAbsences} absences left
            </Text>
          </TouchableOpacity>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg },
  greeting: { fontSize: 22, fontWeight: '700', color: colors.text, marginBottom: 14 },
  card: { backgroundColor: colors.card, borderRadius: 14, padding: 18, marginBottom: 14, borderWidth: 1, borderColor: colors.border, borderLeftWidth: 6 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  moduleName: { fontSize: 16, fontWeight: '700', color: colors.text, flex: 1, paddingRight: 10 },
  pct: { fontSize: 28, fontWeight: '800' },
  statusTag: { alignSelf: 'flex-start', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 4, marginTop: 8 },
  statusText: { color: '#fff', fontWeight: '700', fontSize: 12 },
  meta: { fontSize: 13, color: colors.muted, marginTop: 10 },
  headerBtn: { color: '#fff', fontWeight: '600', fontSize: 15 },
  badge: { position: 'absolute', top: -6, right: -12, backgroundColor: colors.red, borderRadius: 9, minWidth: 18, height: 18, paddingHorizontal: 4, alignItems: 'center', justifyContent: 'center' },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: '800' },
  muted: { color: colors.muted, textAlign: 'center', marginTop: 30 },
});