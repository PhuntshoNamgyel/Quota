// src/screens/lecturer/ReportsScreen.tsx
import React, { useState, useCallback, useLayoutEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { api } from '../../api/client';
import { colors } from '../../theme';
import { RootStackParams } from '../../navigation/types';

type Props = NativeStackScreenProps<RootStackParams, 'Reports'>;

interface Quota { percentage: number; colour: 'green' | 'yellow' | 'red'; attended: number; held: number; }
interface StudentRow { student: { id: number; name: string; no: string }; quota: Quota; }
interface Report {
  module: { id: number; name: string };
  totalSessions: number;
  classAverage: number;
  students: StudentRow[];
  atRisk: StudentRow[];
}

const colourFor = (c: string) => (c === 'green' ? colors.green : c === 'yellow' ? colors.yellow : colors.red);

export default function ReportsScreen({ route, navigation }: Props) {
  const { moduleId, moduleName } = route.params;
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);

  useLayoutEffect(() => { navigation.setOptions({ title: `${moduleName} — Report` }); }, [navigation, moduleName]);

  const load = useCallback(async () => {
    setReport(await api.get(`/api/modules/${moduleId}/report`));
    setLoading(false);
  }, [moduleId]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  if (loading || !report) return <View style={styles.center}><ActivityIndicator size="large" color={colors.primary} /></View>;

  const StudentLine = ({ row }: { row: StudentRow }) => (
    <View style={styles.row}>
      <View style={{ flex: 1 }}>
        <Text style={styles.name}>{row.student.name}</Text>
        <Text style={styles.sub}>{row.student.no}  ·  {row.quota.attended}/{row.quota.held} attended</Text>
      </View>
      <View style={[styles.pill, { backgroundColor: colourFor(row.quota.colour) }]}>
        <Text style={styles.pillText}>{row.quota.percentage}%</Text>
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16 }}>
      <View style={styles.summary}>
        <Text style={styles.bigPct}>{report.classAverage}%</Text>
        <Text style={styles.summaryLabel}>Class average attendance</Text>
        <Text style={styles.summaryMeta}>{report.totalSessions} sessions  ·  {report.students.length} students</Text>
      </View>

      <Text style={styles.section}>At risk — below 90% ({report.atRisk.length})</Text>
      {report.atRisk.length === 0
        ? <Text style={styles.muted}>No students below 90%.</Text>
        : report.atRisk.map((r) => <StudentLine key={'r' + r.student.id} row={r} />)}

      <Text style={styles.section}>All students</Text>
      {report.students.map((r) => <StudentLine key={'a' + r.student.id} row={r} />)}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg },
  summary: { backgroundColor: colors.card, borderRadius: 16, padding: 24, alignItems: 'center', borderWidth: 1, borderColor: colors.border },
  bigPct: { fontSize: 48, fontWeight: '800', color: colors.primary },
  summaryLabel: { fontSize: 15, color: colors.text, fontWeight: '600', marginTop: 4 },
  summaryMeta: { fontSize: 13, color: colors.muted, marginTop: 6 },
  section: { fontSize: 13, fontWeight: '700', color: colors.muted, textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 22, marginBottom: 10 },
  row: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card, borderRadius: 12, padding: 16, marginBottom: 8, borderWidth: 1, borderColor: colors.border },
  name: { fontSize: 16, color: colors.text, fontWeight: '500' },
  sub: { fontSize: 12, color: colors.muted, marginTop: 2 },
  pill: { borderRadius: 16, paddingHorizontal: 14, paddingVertical: 6 },
  pillText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  muted: { color: colors.muted },
});