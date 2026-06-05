// src/screens/lecturer/ModuleListScreen.tsx
import React, { useState, useLayoutEffect, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { colors } from '../../theme';
import { RootStackParams } from '../../navigation/types';

type Props = NativeStackScreenProps<RootStackParams, 'ModuleList'>;
interface ScheduleRow { day_of_week: string; start_time: string; end_time: string; }
interface ModuleItem { id: number; name: string; schedule: ScheduleRow[]; studentCount: number; }

const ACCENTS = ['#2563eb', '#7c3aed', '#0891b2', '#ca8a04', '#dc2626', '#16a34a'];
const TODAY = new Date().toLocaleDateString('en-US', { weekday: 'long' });

export default function ModuleListScreen({ navigation }: Props) {
  const { logout } = useAuth();
  const [modules, setModules] = useState<ModuleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchModules = useCallback(async () => setModules(await api.get('/api/modules')), []);

  const load = useCallback(async () => {
    try { await fetchModules(); } finally { setLoading(false); }
  }, [fetchModules]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try { await fetchModules(); } finally { setRefreshing(false); }
  }, [fetchModules]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View style={{ flexDirection: 'row', gap: 18, alignItems: 'center' }}>
          <TouchableOpacity onPress={() => navigation.navigate('ChangePassword')}>
            <Text style={styles.headerBtn}>Password</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={logout}>
            <Text style={styles.headerBtn}>Logout</Text>
          </TouchableOpacity>
        </View>
      ),
    });
  }, [navigation, logout]);

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color={colors.primary} /></View>;

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.newBtn} onPress={() => navigation.navigate('CreateModule')}>
        <Text style={styles.newBtnText}>+ New module</Text>
      </TouchableOpacity>
      <FlatList
        data={modules}
        keyExtractor={(m) => String(m.id)}
        contentContainerStyle={{ padding: 16, paddingTop: 4 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        ListEmptyComponent={<Text style={styles.empty}>No modules yet. Create your first one.</Text>}
        renderItem={({ item, index }) => {
          const accent = ACCENTS[index % ACCENTS.length];
          const isToday = item.schedule.some((s) => s.day_of_week === TODAY);
          const parts = item.name.split(' ');
          const code = parts[0];
          const title = parts.slice(1).join(' ') || item.name;
          return (
            <TouchableOpacity style={[styles.card, { borderLeftColor: accent }]}
              onPress={() => navigation.navigate('ModuleDetail', { moduleId: item.id, moduleName: item.name })}>
              <View style={styles.cardTop}>
                <View style={[styles.badge, { backgroundColor: accent }]}><Text style={styles.badgeText}>{code}</Text></View>
                {isToday && <View style={styles.todayTag}><Text style={styles.todayText}>Today</Text></View>}
              </View>
              <Text style={styles.cardTitle}>{title}</Text>
              <Text style={styles.cardSub}>
                {item.schedule.length
                  ? item.schedule.map((s) => `${s.day_of_week.slice(0, 3)} ${s.start_time}`).join('   •   ')
                  : 'No schedule set'}
              </Text>
              <Text style={styles.cardMeta}>{item.studentCount} students</Text>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg },
  headerBtn: { color: '#fff', fontWeight: '600', fontSize: 15 },
  newBtn: { backgroundColor: colors.primary, margin: 16, marginBottom: 4, borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  newBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  card: { backgroundColor: colors.card, borderRadius: 14, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: colors.border, borderLeftWidth: 5 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  badge: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  badgeText: { color: '#fff', fontWeight: '800', fontSize: 12, letterSpacing: 0.5 },
  todayTag: { backgroundColor: colors.green, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 3 },
  todayText: { color: '#fff', fontWeight: '700', fontSize: 11 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: colors.text },
  cardSub: { fontSize: 13, color: colors.muted, marginTop: 6 },
  cardMeta: { fontSize: 12, color: colors.muted, marginTop: 8, fontWeight: '600' },
  empty: { textAlign: 'center', color: colors.muted, marginTop: 40 },
});