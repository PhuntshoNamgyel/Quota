// src/screens/lecturer/MarkAttendanceScreen.tsx
import React, { useState, useCallback, useLayoutEffect } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { api } from '../../api/client';
import { colors } from '../../theme';
import { formatDate } from '../../format';
import { RootStackParams } from '../../navigation/types';

type Props = NativeStackScreenProps<RootStackParams, 'MarkAttendance'>;
type Status = 'present' | 'absent';
interface Row { id: number; name: string; no: string; status: Status; }
interface ApiStudent { id: number; name: string; email: string; status: Status; }
interface ScheduleRow { day_of_week: string; start_time: string; end_time: string; }

const today = () => new Date().toISOString().slice(0, 10);
const studentNo = (email: string) => email.split('.')[0];

function timeToMinutes(t: string): number {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

function slotClasses(start: string, end: string): number {
  let minutes = timeToMinutes(end) - timeToMinutes(start);
  const slotStart = timeToMinutes(start);
  const slotEnd   = timeToMinutes(end);
  if (slotStart < timeToMinutes('10:15') && slotEnd > timeToMinutes('10:00')) minutes -= 15;
  if (slotStart < timeToMinutes('13:15') && slotEnd > timeToMinutes('12:15')) minutes -= 60;
  return Math.max(1, Math.round(minutes / 60));
}

export default function MarkAttendanceScreen({ route, navigation }: Props) {
  const { moduleId, moduleName, sessionId, slotStart, slotEnd } = route.params;
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
      const data = await api.get(`/api/sessions/${sessionId}`);
      setRows(data.students.map((s: ApiStudent) => ({ id: s.id, name: s.name, no: studentNo(s.email), status: s.status })));
      setDate(data.session.date);
    } else {
      const roster = await api.get(`/api/modules/${moduleId}/roster`);
      setRows(roster.map((s: ApiStudent) => ({ id: s.id, name: s.name, no: studentNo(s.email), status: 'present' as Status })));
    }
    setLoading(false);
  }, [editing, sessionId, moduleId]);

  useFocusEffect(useCallback(() => { setLoading(true); load(); }, [load]));

  function toggle(id: number) {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, status: r.status === 'present' ? 'absent' : 'present' } : r)));
  }

  async function submit() {
    setSaving(true);
    const absentStudentIds = rows.filter((r) => r.status === 'absent').map((r) => r.id);
    const classes = slotStart && slotEnd ? slotClasses(slotStart, slotEnd) : 1;
    try {
      if (editing) await api.put(`/api/sessions/${sessionId}`, { absentStudentIds });
      else await api.post(`/api/modules/${moduleId}/sessions`, { date, absentStudentIds, classes });
      navigation.goBack();
    } catch {
      setSaving(false);
    }
  }

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color={colors.primary} /></View>;

  const q = query.toLowerCase();
  const filtered = rows.filter((r) => r.name.toLowerCase().includes(q) || r.no.includes(q));
  const presentCount = rows.filter((r) => r.status === 'present').length;
  const absentCount = rows.length - presentCount;

  return (
    <View style={styles.container}>
      <View style={styles.top}>
        <Text style={styles.module}>{moduleName}</Text>

        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 16, marginTop: 10 }}>
          <View style={{ backgroundColor: '#ECFDF5', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999 }}>
            <Text style={{ color: colors.green, fontWeight: '700', fontSize: 12 }}>{presentCount} Present</Text>
          </View>
          <View style={{ backgroundColor: '#FEF2F2', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999 }}>
            <Text style={{ color: colors.red, fontWeight: '700', fontSize: 12 }}>{absentCount} Absent</Text>
          </View>
        </View>

        <Text style={styles.summary}>{formatDate(date)}</Text>

        <TextInput
          style={styles.search}
          placeholder="Search by name or number"
          placeholderTextColor={colors.muted}
          value={query}
          onChangeText={setQuery}
          autoCapitalize="none"
        />
        <Text style={styles.hint}>Everyone is Present by default — tap a student to mark Absent.</Text>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(r) => String(r.id)}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 16 }}
        ListEmptyComponent={<Text style={styles.muted}>No students found.</Text>}
        renderItem={({ item }) => {
          const absent = item.status === 'absent';
          return (
            <TouchableOpacity style={[styles.row, absent && styles.rowAbsent]} onPress={() => toggle(item.id)}>
              <View style={{ flex: 1, paddingRight: 10 }}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.no}>{item.no}</Text>
              </View>
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

  top: { margin: 16, marginBottom: 8, backgroundColor: '#FFFFFF', borderRadius: 22, padding: 20 },
  module: { fontSize: 22, fontWeight: '800', color: colors.text },
  summary: { fontSize: 14, color: colors.muted, marginTop: 8, marginBottom: 16 },
  search: { backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14, fontSize: 15, color: colors.text },
  hint: { fontSize: 12, color: colors.muted, marginTop: 10, lineHeight: 18 },

  row: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 18, paddingHorizontal: 18, paddingVertical: 16, marginBottom: 12 },
  rowAbsent: { backgroundColor: '#FFF1F2', borderWidth: 1, borderColor: '#FECACA' },
  name: { fontSize: 16, fontWeight: '700', color: colors.text },
  no: { fontSize: 13, color: colors.muted, marginTop: 4 },
  pill: { minWidth: 96, borderRadius: 999, paddingVertical: 9, alignItems: 'center' },
  pillText: { color: '#FFFFFF', fontWeight: '800', fontSize: 13 },

  submit: { backgroundColor: colors.primary, marginHorizontal: 16, marginBottom: 20, marginTop: 8, borderRadius: 18, paddingVertical: 18, alignItems: 'center' },
  submitText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800', letterSpacing: 0.3 },

  muted: { color: colors.muted, textAlign: 'center', marginTop: 20 },
});