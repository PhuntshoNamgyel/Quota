// src/screens/lecturer/ModuleListScreen.tsx
import React, { useState, useLayoutEffect, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { colors } from '../../theme';
import { RootStackParams } from '../../navigation/types';

type Props = NativeStackScreenProps<RootStackParams, 'ModuleList'>;
interface ScheduleRow { day_of_week: string; start_time: string; end_time: string; }
interface ModuleItem { id: number; name: string; schedule: ScheduleRow[]; }

export default function ModuleListScreen({ navigation }: Props) {
  const { logout } = useAuth();
  const [modules, setModules] = useState<ModuleItem[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try { setModules(await api.get('/api/modules')); }
    finally { setLoading(false); }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load])); // refresh whenever the screen is shown

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={logout}><Text style={styles.headerBtn}>Logout</Text></TouchableOpacity>
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
        ListEmptyComponent={<Text style={styles.empty}>No modules yet. Create your first one.</Text>}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card}
            onPress={() => navigation.navigate('ModuleDetail', { moduleId: item.id, moduleName: item.name })}>
            <Text style={styles.cardTitle}>{item.name}</Text>
            <Text style={styles.cardSub}>
              {item.schedule.length
                ? item.schedule.map((s) => `${s.day_of_week} ${s.start_time}`).join('   •   ')
                : 'No schedule set'}
            </Text>
          </TouchableOpacity>
        )}
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
  card: { backgroundColor: colors.card, borderRadius: 14, padding: 18, marginBottom: 12, borderWidth: 1, borderColor: colors.border },
  cardTitle: { fontSize: 17, fontWeight: '700', color: colors.text },
  cardSub: { fontSize: 13, color: colors.muted, marginTop: 6 },
  empty: { textAlign: 'center', color: colors.muted, marginTop: 40 },
});