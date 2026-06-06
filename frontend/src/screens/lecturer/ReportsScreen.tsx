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
      <View style={{ flex: 1, paddingRight: 12 }}>
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

        <Text style={styles.summaryLabel}>Class Average Attendance</Text>

        <View style={{ flexDirection: 'row', gap: 10, marginTop: 14 }}>
          <View style={{ backgroundColor: '#EEF4FF', borderRadius: 999, paddingHorizontal: 14, paddingVertical: 7 }}>
            <Text style={{ color: colors.primary, fontWeight: '700', fontSize: 12 }}>
              {report.totalSessions} Sessions
            </Text>
          </View>
          <View style={{ backgroundColor: '#F8FAFC', borderRadius: 999, paddingHorizontal: 14, paddingVertical: 7 }}>
            <Text style={{ color: colors.text, fontWeight: '700', fontSize: 12 }}>
              {report.students.length} Students
            </Text>
          </View>
        </View>
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

  summary: { backgroundColor: '#FFFFFF', borderRadius: 24, paddingVertical: 28, paddingHorizontal: 24, alignItems: 'center', marginBottom: 8 },
  bigPct: { fontSize: 56, fontWeight: '900', color: colors.primary, letterSpacing: -2 },
  summaryLabel: { fontSize: 16, fontWeight: '700', color: colors.text, marginTop: 4 },

  section: { fontSize: 12, fontWeight: '800', color: colors.muted, textTransform: 'uppercase', letterSpacing: 1, marginTop: 24, marginBottom: 12, paddingHorizontal: 4 },

  row: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 18, paddingHorizontal: 18, paddingVertical: 16, marginBottom: 10 },
  name: { fontSize: 15, color: colors.text, fontWeight: '700' },
  sub: { fontSize: 13, color: colors.muted, marginTop: 4 },
  pill: { minWidth: 72, borderRadius: 999, paddingVertical: 8, alignItems: 'center', justifyContent: 'center' },
  pillText: { color: '#FFFFFF', fontWeight: '800', fontSize: 13 },

  muted: { color: colors.muted, textAlign: 'center', paddingVertical: 12 },
});