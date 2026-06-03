// src/screens/lecturer/MarkAttendanceScreen.tsx
import React, { useState, useCallback, useLayoutEffect } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { api } from '../../api/client';
import { colors } from '../../theme';
import { RootStackParams } from '../../navigation/types';

type Props = NativeStackScreenProps<RootStackParams, 'MarkAttendance'>;
type Status = 'present' | 'absent';
interface Row { id: number; name: string; status: Status; }
interface ApiStudent { id: number; name: string; email: string; status: Status; }

const today = () => new Date().toISOString().slice(0, 10);

export default function MarkAttendanceScreen({ route, navigation }: Props) {
  const { moduleId, moduleName, sessionId } = route.params;
  const editing = sessionId != null;

  const [rows, setRows] = useState<Row[]>([]);
  const [date, setDate] = useState(today());
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useLayoutEffect(() => {
    navigation.setOptions({ title: editing ? 'Edit session' : 'Take attendance' });
  }, [navigation, editing]);

  const load = useCallback(async () => {
    if (editing) {
      const data = await api.get(`/api/sessions/${sessionId}`); // existing statuses (FR12)
      setRows(data.students.map((s: ApiStudent) => ({ id: s.id, name: s.name, status: s.status })));
      setDate(data.session.date);
    } else {
      const roster = await api.get(`/api/modules/${moduleId}/roster`); // all present by default (FR07/FR09)
      setRows(roster.map((s: ApiStudent) => ({ id: s.id, name: s.name, status: 'present' as Status })));
    }
    setLoading(false);
  }, [editing, sessionId, moduleId]);

  useFocusEffect(useCallback(() => { setLoading(true); load(); }, [load]));

  function toggle(id: number) { // FR10
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, status: r.status === 'present' ? 'absent' : 'present' } : r)));
  }

  async function submit() { // FR11 (new) / FR12 (edit)
    setSaving(true);
    const absentStudentIds = rows.filter((r) => r.status === 'absent').map((r) => r.id);
    try {
      if (editing) await api.put(`/api/sessions/${sessionId}`, { absentStudentIds });
      else await api.post(`/api/modules/${moduleId}/sessions`, { date, absentStudentIds });
      navigation.goBack();
    } catch {
      setSaving(false);
    }
  }

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color={colors.primary} /></View>;

  const filtered = rows.filter((r) => r.name.toLowerCase().includes(query.toLowerCase())); // FR08
  const presentCount = rows.filter((r) => r.status === 'present').length;
  const absentCount = rows.length - presentCount;

  return (
    <View style={styles.container}>
      <View style={styles.top}>
        <Text style={styles.module}>{moduleName}</Text>
        <Text style={styles.summary}>
          {date}   ·   <Text style={{ color: colors.green }}>{presentCount} present</Text>   ·   <Text style={{ color: colors.red }}>{absentCount} absent</Text>
        </Text>
        <TextInput style={styles.search} placeholder="Search student by name" placeholderTextColor={colors.muted}
          value={query} onChangeText={setQuery} autoCapitalize="none" />
        <Text style={styles.hint}>Everyone is Present by default — tap a student to mark Absent.</Text>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(r) => String(r.id)}
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={<Text style={styles.muted}>No students found.</Text>}
        renderItem={({ item }) => {
          const absent = item.status === 'absent';
          return (
            <TouchableOpacity style={[styles.row, absent && styles.rowAbsent]} onPress={() => toggle(item.id)}>
              <Text style={styles.name}>{item.name}</Text>
              <View style={[styles.pill, { backgroundColor: absent ? colors.red : colors.green }]}>
                <Text style={styles.pillText}>{absent ? 'Absent' : 'Present'}</Text>
              </View>
            </TouchableOpacity>
          );
        }}
      />

      <TouchableOpacity style={styles.submit} onPress={submit} disabled={saving}>
        {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitText}>{editing ? 'Save changes' : 'Submit attendance'}</Text>}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg },
  top: { padding: 16, paddingBottom: 4, backgroundColor: colors.card, borderBottomWidth: 1, borderBottomColor: colors.border },
  module: { fontSize: 18, fontWeight: '700', color: colors.text },
  summary: { fontSize: 13, color: colors.muted, marginTop: 4, marginBottom: 12 },
  search: { backgroundColor: colors.bg, borderWidth: 1, borderColor: colors.border, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, fontSize: 15, color: colors.text },
  hint: { fontSize: 12, color: colors.muted, marginTop: 8, marginBottom: 4 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: colors.card, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 16, marginBottom: 10, borderWidth: 1, borderColor: colors.border },
  rowAbsent: { borderColor: colors.red, backgroundColor: '#fef2f2' },
  name: { fontSize: 16, color: colors.text, fontWeight: '500' },
  pill: { borderRadius: 16, paddingHorizontal: 14, paddingVertical: 6 },
  pillText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  submit: { backgroundColor: colors.primary, margin: 16, borderRadius: 12, paddingVertical: 16, alignItems: 'center' },
  submitText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  muted: { color: colors.muted, textAlign: 'center', marginTop: 20 },
});