// src/screens/student/StudentHistoryScreen.tsx
import React, { useState, useCallback, useLayoutEffect } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { api } from '../../api/client';
import { colors } from '../../theme';
import { RootStackParams } from '../../navigation/types';

type Props = NativeStackScreenProps<RootStackParams, 'StudentHistory'>;
interface HistoryRow { sessionId: number; date: string; status: 'present' | 'absent'; }

export default function StudentHistoryScreen({ route, navigation }: Props) {
  const { moduleId, moduleName } = route.params;
  const [rows, setRows] = useState<HistoryRow[]>([]);
  const [loading, setLoading] = useState(true);

  useLayoutEffect(() => { navigation.setOptions({ title: moduleName }); }, [navigation, moduleName]);

  const load = useCallback(async () => {
    setRows(await api.get(`/api/student/modules/${moduleId}/history`));
    setLoading(false);
  }, [moduleId]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color={colors.primary} /></View>;

  return (
    <FlatList
      style={styles.container}
      data={rows}
      keyExtractor={(r) => String(r.sessionId)}
      contentContainerStyle={{ padding: 16 }}
      ListHeaderComponent={<Text style={styles.heading}>Session history</Text>}
      ListEmptyComponent={<Text style={styles.muted}>No sessions recorded yet.</Text>}
      renderItem={({ item }) => {
        const absent = item.status === 'absent';
        return (
          <View style={styles.row}>
            <Text style={styles.date}>{item.date}</Text>
            <View style={[styles.pill, { backgroundColor: absent ? colors.red : colors.green }]}>
              <Text style={styles.pillText}>{absent ? 'Absent' : 'Present'}</Text>
            </View>
          </View>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg },
  heading: { fontSize: 20, fontWeight: '700', color: colors.text, marginBottom: 14 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: colors.card, borderRadius: 10, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: colors.border },
  date: { fontSize: 15, color: colors.text },
  pill: { borderRadius: 14, paddingHorizontal: 12, paddingVertical: 5 },
  pillText: { color: '#fff', fontWeight: '700', fontSize: 12 },
  muted: { color: colors.muted, textAlign: 'center', marginTop: 30 },
});