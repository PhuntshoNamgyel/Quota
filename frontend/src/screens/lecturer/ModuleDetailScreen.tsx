// src/screens/lecturer/ModuleDetailScreen.tsx
import React, { useState, useCallback, useLayoutEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { api } from '../../api/client';
import { colors } from '../../theme';
import { RootStackParams } from '../../navigation/types';

type Props = NativeStackScreenProps<RootStackParams, 'ModuleDetail'>;
interface Student { id: number; name: string; email: string; }

export default function ModuleDetailScreen({ route, navigation }: Props) {
  const { moduleId, moduleName } = route.params;
  const [enrolled, setEnrolled] = useState<Student[]>([]);
  const [all, setAll] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  useLayoutEffect(() => { navigation.setOptions({ title: moduleName }); }, [navigation, moduleName]);

  const load = useCallback(async () => {
    try {
      const [e, a] = await Promise.all([
        api.get(`/api/modules/${moduleId}/students`),
        api.get('/api/modules/students/all'),
      ]);
      setEnrolled(e); setAll(a);
    } finally { setLoading(false); }
  }, [moduleId]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  async function enrol(studentId: number) {
    await api.post(`/api/modules/${moduleId}/enrolments`, { studentId });
    load();
  }

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color={colors.primary} /></View>;

  const enrolledIds = new Set(enrolled.map((s) => s.id));
  const available = all.filter((s) => !enrolledIds.has(s.id));

  return (
    <View style={styles.container}>
      <FlatList
        contentContainerStyle={{ padding: 16 }}
        data={enrolled}
        keyExtractor={(s) => 'e' + s.id}
        ListHeaderComponent={<Text style={styles.section}>Enrolled ({enrolled.length})</Text>}
        ListEmptyComponent={<Text style={styles.muted}>No students enrolled yet.</Text>}
        renderItem={({ item }) => <View style={styles.row}><Text style={styles.rowName}>{item.name}</Text></View>}
        ListFooterComponent={
          <View style={{ marginTop: 24 }}>
            <Text style={styles.section}>Add students</Text>
            {available.length === 0
              ? <Text style={styles.muted}>All students are enrolled.</Text>
              : available.map((s) => (
                  <TouchableOpacity key={s.id} style={styles.addRow} onPress={() => enrol(s.id)}>
                    <Text style={styles.rowName}>{s.name}</Text>
                    <Text style={styles.addLabel}>+ Add</Text>
                  </TouchableOpacity>
                ))}
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg },
  section: { fontSize: 14, fontWeight: '700', color: colors.muted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 },
  row: { backgroundColor: colors.card, borderRadius: 10, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: colors.border },
  addRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: colors.card, borderRadius: 10, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: colors.border },
  rowName: { fontSize: 15, color: colors.text, fontWeight: '500' },
  addLabel: { color: colors.primary, fontWeight: '700' },
  muted: { color: colors.muted },
});