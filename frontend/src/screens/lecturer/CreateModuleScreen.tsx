// src/screens/lecturer/CreateModuleScreen.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { api } from '../../api/client';
import { colors } from '../../theme';
import { RootStackParams } from '../../navigation/types';

type Props = NativeStackScreenProps<RootStackParams, 'CreateModule'>;
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function CreateModuleScreen({ navigation }: Props) {
  const [name, setName] = useState('');
  const [day, setDay] = useState('Monday');
  const [start, setStart] = useState('09:00');
  const [end, setEnd] = useState('11:00');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  async function save() {
    if (!name.trim()) { setError('Module name is required'); return; }
    setError(''); setSaving(true);
    try {
      await api.post('/api/modules', { name: name.trim(), schedule: [{ day_of_week: day, start_time: start, end_time: end }] });
      navigation.goBack();
    } catch (e) { setError((e as Error).message); }
    finally { setSaving(false); }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 20 }}>
      <Text style={styles.label}>Module name</Text>
      <TextInput style={styles.input} placeholder="e.g. SWE201 Cross Platform Development"
        placeholderTextColor={colors.muted} value={name} onChangeText={setName} />

      <Text style={styles.label}>Day</Text>
      <View style={styles.dayRow}>
        {DAYS.map((d) => (
          <TouchableOpacity key={d} style={[styles.chip, day === d && styles.chipActive]} onPress={() => setDay(d)}>
            <Text style={[styles.chipText, day === d && styles.chipTextActive]}>{d.slice(0, 3)}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.timeRow}>
        <View style={styles.timeCol}>
          <Text style={styles.label}>Start</Text>
          <TextInput style={styles.input} value={start} onChangeText={setStart} placeholder="09:00" placeholderTextColor={colors.muted} />
        </View>
        <View style={styles.timeCol}>
          <Text style={styles.label}>End</Text>
          <TextInput style={styles.input} value={end} onChangeText={setEnd} placeholder="11:00" placeholderTextColor={colors.muted} />
        </View>
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <TouchableOpacity style={styles.button} onPress={save} disabled={saving}>
        {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Create module</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  label: { fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: 8, marginTop: 14 },
  input: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 16, color: colors.text },
  dayRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { borderWidth: 1, borderColor: colors.border, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8, backgroundColor: colors.card },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { color: colors.text, fontWeight: '600' },
  chipTextActive: { color: '#fff' },
  timeRow: { flexDirection: 'row', gap: 14 },
  timeCol: { flex: 1 },
  error: { color: colors.red, marginTop: 14 },
  button: { backgroundColor: colors.primary, borderRadius: 12, paddingVertical: 16, alignItems: 'center', marginTop: 28 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});