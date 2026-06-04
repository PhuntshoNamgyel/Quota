// src/screens/lecturer/ModuleDetailScreen.tsx
import React, { useState, useCallback, useLayoutEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { api } from '../../api/client';
import { colors } from '../../theme';
import { formatDate } from '../../format';
import { RootStackParams } from '../../navigation/types';

type Props = NativeStackScreenProps<RootStackParams, 'ModuleDetail'>;
interface Student { id: number; name: string; email: string; }
interface SessionRow { id: number; date: string; }

const studentNo = (email: string) => email.split('.')[0];

export default function ModuleDetailScreen({ route, navigation }: Props) {
  const { moduleId, moduleName } = route.params;
  const [enrolled, setEnrolled] = useState<Student[]>([]);
  const [all, setAll] = useState<Student[]>([]);
  const [sessions, setSessions] = useState<SessionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [studentsOpen, setStudentsOpen] = useState(false);
  const [sessionsOpen, setSessionsOpen] = useState(false);

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

  async function enrol(id: number) { await api.post(`/api/modules/${moduleId}/enrolments`, { studentId: id }); load(); }
  async function enrolAll() { await api.post(`/api/modules/${moduleId}/enrolments/all`); load(); }

  function confirmRemove(s: Student) {
    Alert.alert('Remove student', `Remove ${s.name} from this module?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: async () => {
          try { await api.delete(`/api/modules/${moduleId}/enrolments/${s.id}`); load(); } catch {}
        } },
    ]);
  }

  function confirmDeleteSession(s: SessionRow) {
    Alert.alert('Delete session', `Delete the session on ${formatDate(s.date)}? Its attendance records will be removed.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
          try { await api.delete(`/api/sessions/${s.id}`); load(); } catch {}
        } },
    ]);
  }

  function confirmDeleteModule() {
    Alert.alert('Delete module', `Delete "${moduleName}"? All its sessions and attendance records will be removed. This cannot be undone.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
          try { await api.delete(`/api/modules/${moduleId}`); navigation.goBack(); } catch {}
        } },
    ]);
  }

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color={colors.primary} /></View>;

  const enrolledIds = new Set(enrolled.map((s) => s.id));
  const available = all.filter((s) => !enrolledIds.has(s.id));

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16 }}>
      <View style={styles.btnRow}>
        <TouchableOpacity style={styles.takeBtn} onPress={() => navigation.navigate('MarkAttendance', { moduleId, moduleName })}>
          <Text style={styles.takeBtnText}>Take attendance</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.reportBtn} onPress={() => navigation.navigate('Reports', { moduleId, moduleName })}>
          <Text style={styles.reportBtnText}>View report</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.sectionHeader} onPress={() => setSessionsOpen((v) => !v)}>
        <Text style={styles.sectionTitle}>Sessions ({sessions.length})</Text>
        <Text style={styles.toggle}>{sessionsOpen ? 'Hide' : 'Show'}</Text>
      </TouchableOpacity>
      {sessionsOpen && (sessions.length === 0
        ? <Text style={styles.muted}>No sessions yet.</Text>
        : sessions.map((s) => (
            <View key={'s' + s.id} style={styles.row}>
              <TouchableOpacity style={styles.rowMain}
                onPress={() => navigation.navigate('MarkAttendance', { moduleId, moduleName, sessionId: s.id })}>
                <Text style={styles.rowName}>{formatDate(s.date)}</Text>
                <Text style={styles.editLabel}>Edit ›</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.trailingBtn} onPress={() => confirmDeleteSession(s)}>
                <Text style={styles.removeLabel}>Delete</Text>
              </TouchableOpacity>
            </View>
          )))}

      <TouchableOpacity style={styles.sectionHeader} onPress={() => setStudentsOpen((v) => !v)}>
        <Text style={styles.sectionTitle}>Students ({enrolled.length})</Text>
        <Text style={styles.toggle}>{studentsOpen ? 'Hide' : 'Show'}</Text>
      </TouchableOpacity>
      {studentsOpen && (
        <>
          {enrolled.map((s) => (
            <View key={'e' + s.id} style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={styles.rowName}>{s.name}</Text>
                <Text style={styles.rowNoSmall}>{studentNo(s.email)}</Text>
              </View>
              <TouchableOpacity style={styles.trailingBtn} onPress={() => confirmRemove(s)}>
                <Text style={styles.removeLabel}>Remove</Text>
              </TouchableOpacity>
            </View>
          ))}

          {available.length > 0 && (
            <>
              <TouchableOpacity style={styles.addAllBtn} onPress={enrolAll}>
                <Text style={styles.addAllText}>+ Add all ({available.length})</Text>
              </TouchableOpacity>
              <Text style={styles.subSection}>Add individually</Text>
              {available.map((s) => (
                <TouchableOpacity key={'a' + s.id} style={styles.row} onPress={() => enrol(s.id)}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.rowName}>{s.name}</Text>
                    <Text style={styles.rowNoSmall}>{studentNo(s.email)}</Text>
                  </View>
                  <Text style={styles.addLabel}>+ Add</Text>
                </TouchableOpacity>
              ))}
            </>
          )}
        </>
      )}

      <TouchableOpacity style={styles.editBtn} onPress={() => navigation.navigate('CreateModule', { moduleId })}>
        <Text style={styles.editBtnText}>Edit module</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.deleteBtn} onPress={confirmDeleteModule}>
        <Text style={styles.deleteText}>Delete module</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg },
  btnRow: { flexDirection: 'row', gap: 12, marginBottom: 8 },
  takeBtn: { flex: 1, backgroundColor: colors.primary, borderRadius: 12, paddingVertical: 15, alignItems: 'center' },
  takeBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  reportBtn: { flex: 1, borderWidth: 1, borderColor: colors.primary, borderRadius: 12, paddingVertical: 15, alignItems: 'center', backgroundColor: colors.card },
  reportBtnText: { color: colors.primary, fontWeight: '700', fontSize: 15 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, marginTop: 8, borderBottomWidth: 1, borderBottomColor: colors.border },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: colors.text },
  toggle: { fontSize: 14, fontWeight: '600', color: colors.primary },
  subSection: { fontSize: 12, fontWeight: '700', color: colors.muted, textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 14, marginBottom: 6 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: colors.card, borderRadius: 10, padding: 14, marginTop: 8, borderWidth: 1, borderColor: colors.border },
  rowMain: { flex: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingRight: 12 },
  rowName: { fontSize: 15, color: colors.text, fontWeight: '500' },
  rowNoSmall: { fontSize: 12, color: colors.muted, marginTop: 2, fontVariant: ['tabular-nums'] },
  trailingBtn: { paddingLeft: 12, borderLeftWidth: 1, borderLeftColor: colors.border },
  removeLabel: { color: colors.red, fontWeight: '700', fontSize: 13 },
  editLabel: { color: colors.muted, fontWeight: '600' },
  addLabel: { color: colors.primary, fontWeight: '700' },
  addAllBtn: { borderWidth: 1, borderColor: colors.primary, borderStyle: 'dashed', borderRadius: 10, paddingVertical: 12, alignItems: 'center', marginTop: 12 },
  addAllText: { color: colors.primary, fontWeight: '700' },
  muted: { color: colors.muted, marginTop: 8 },
  editBtn: { marginTop: 28, borderWidth: 1, borderColor: colors.primary, borderRadius: 12, paddingVertical: 14, alignItems: 'center', backgroundColor: colors.card },
  editBtnText: { color: colors.primary, fontWeight: '700' },
  deleteBtn: { marginTop: 12, borderWidth: 1, borderColor: colors.red, borderRadius: 12, paddingVertical: 14, alignItems: 'center', backgroundColor: colors.card },
  deleteText: { color: colors.red, fontWeight: '700' },
});