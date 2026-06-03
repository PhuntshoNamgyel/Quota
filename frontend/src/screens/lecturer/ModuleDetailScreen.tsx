// src/screens/lecturer/ModuleDetailScreen.tsx
import React, { useState, useCallback, useLayoutEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { api } from '../../api/client';
import { colors } from '../../theme';
import { RootStackParams } from '../../navigation/types';

type Props = NativeStackScreenProps<RootStackParams, 'ModuleDetail'>;
interface Student { id: number; name: string; email: string; }
interface SessionRow { id: number; date: string; }

export default function ModuleDetailScreen({ route, navigation }: Props) {
  const { moduleId, moduleName } = route.params;
  const [enrolled, setEnrolled] = useState<Student[]>([]);
  const [all, setAll] = useState<Student[]>([]);
  const [sessions, setSessions] = useState<SessionRow[]>([]);
  const [loading, setLoading] = useState(true);

  useLayoutEffect(() => { navigation.setOptions({ title: moduleName }); }, [navigation, moduleName]);

  const load = useCallback(async () => {
    const [e, a, s] = await Promise.all([
      api.get(`/api/modules/${moduleId}/students`),
      api.get('/api/modules/students/all'),
      api.get(`/api/modules/${moduleId}/sessions`),
    ]);
    setEnrolled(e); setAll(a); setSessions(s); setLoading(false);
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
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16 }}>
      <TouchableOpacity style={styles.takeBtn} onPress={() => navigation.navigate('MarkAttendance', { moduleId, moduleName })}>
        <Text style={styles.takeBtnText}>Take attendance</Text>
      </TouchableOpacity>

      <Text style={styles.section}>Enrolled ({enrolled.length})</Text>
      {enrolled.length === 0
        ? <Text style={styles.muted}>No students enrolled yet.</Text>
        : enrolled.map((s) => <View key={'e' + s.id} style={styles.row}><Text style={styles.rowName}>{s.name}</Text></View>)}

      <Text style={styles.section}>Add students</Text>
      {available.length === 0
        ? <Text style={styles.muted}>All students are enrolled.</Text>
        : available.map((s) => (
            <TouchableOpacity key={'a' + s.id} style={styles.actionRow} onPress={() => enrol(s.id)}>
              <Text style={styles.rowName}>{s.name}</Text>
              <Text style={styles.addLabel}>+ Add</Text>
            </TouchableOpacity>
          ))}

      <Text style={styles.section}>Past sessions ({sessions.length})</Text>
      {sessions.length === 0
        ? <Text style={styles.muted}>No sessions yet.</Text>
        : sessions.map((s) => (
            <TouchableOpacity key={'s' + s.id} style={styles.actionRow}
              onPress={() => navigation.navigate('MarkAttendance', { moduleId, moduleName, sessionId: s.id })}>
              <Text style={styles.rowName}>{s.date}</Text>
              <Text style={styles.editLabel}>Edit ›</Text>
            </TouchableOpacity>
          ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg },
  takeBtn: { backgroundColor: colors.primary, borderRadius: 12, paddingVertical: 15, alignItems: 'center', marginBottom: 20 },
  takeBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  section: { fontSize: 13, fontWeight: '700', color: colors.muted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10, marginTop: 18 },
  row: { backgroundColor: colors.card, borderRadius: 10, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: colors.border },
  actionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: colors.card, borderRadius: 10, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: colors.border },
  rowName: { fontSize: 15, color: colors.text, fontWeight: '500' },
  addLabel: { color: colors.primary, fontWeight: '700' },
  editLabel: { color: colors.muted, fontWeight: '600' },
  muted: { color: colors.muted },
});