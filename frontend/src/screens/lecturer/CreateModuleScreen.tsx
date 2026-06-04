// src/screens/lecturer/CreateModuleScreen.tsx
import React, { useState, useLayoutEffect, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { api } from '../../api/client';
import { colors } from '../../theme';
import { RootStackParams } from '../../navigation/types';

type Props = NativeStackScreenProps<RootStackParams, 'CreateModule'>;
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

interface Slot { day: string; start: string; end: string; }
interface ScheduleRow { day_of_week: string; start_time: string; end_time: string; }
interface ModuleItem { id: number; name: string; total_classes: number; schedule: ScheduleRow[]; }

const newSlot = (): Slot => ({ day: 'Monday', start: '09:00', end: '11:00' });

export default function CreateModuleScreen({ route, navigation }: Props) {
  const moduleId = route.params?.moduleId;
  const isEdit = moduleId != null;

  const [name, setName] = useState('');
  const [total, setTotal] = useState('30');
  const [slots, setSlots] = useState<Slot[]>([newSlot()]);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(isEdit);

  useLayoutEffect(() => {
    navigation.setOptions({ title: isEdit ? 'Edit Module' : 'New Module' });
  }, [navigation, isEdit]);

  useEffect(() => {
    if (!isEdit) return;
    (async () => {
      try {
        const modules: ModuleItem[] = await api.get('/api/modules');
        const m = modules.find((x) => x.id === moduleId);
        if (m) {
          setName(m.name);
          setTotal(String(m.total_classes ?? 30));
          setSlots(m.schedule.length
            ? m.schedule.map((s) => ({ day: s.day_of_week, start: s.start_time, end: s.end_time }))
            : [newSlot()]);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [isEdit, moduleId]);

  function updateSlot(index: number, patch: Partial<Slot>) {
    setSlots((prev) => prev.map((s, i) => (i === index ? { ...s, ...patch } : s)));
  }
  function addSlot() { setSlots((prev) => [...prev, newSlot()]); }
  function removeSlot(index: number) { setSlots((prev) => prev.filter((_, i) => i !== index)); }

  async function save() {
    if (!name.trim()) { setError('Module name is required'); return; }
    setError(''); setSaving(true);
    const schedule = slots.map((s) => ({ day_of_week: s.day, start_time: s.start, end_time: s.end }));
    const totalClasses = Number(total) > 0 ? Math.floor(Number(total)) : 30;
    try {
      if (isEdit) await api.put(`/api/modules/${moduleId}`, { name: name.trim(), schedule, totalClasses });
      else await api.post('/api/modules', { name: name.trim(), schedule, totalClasses });
      navigation.goBack();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color={colors.primary} /></View>;

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 20 }}>
      <Text style={styles.label}>Module name</Text>
      <TextInput style={styles.input} placeholder="e.g. SWE201 Cross Platform Development"
        placeholderTextColor={colors.muted} value={name} onChangeText={setName} />

      <Text style={[styles.label, { marginTop: 22 }]}>Total classes this semester</Text>
      <TextInput style={styles.input} value={total} onChangeText={setTotal}
        keyboardType="number-pad" placeholder="30" placeholderTextColor={colors.muted} />
      <Text style={styles.helpText}>Used to show students their absence allowance from the start of term.</Text>

      <Text style={[styles.label, { marginTop: 22 }]}>Weekly schedule</Text>
      {slots.map((slot, index) => (
        <View key={index} style={styles.slotCard}>
          <View style={styles.slotHeader}>
            <Text style={styles.slotTitle}>Slot {index + 1}</Text>
            {slots.length > 1 && (
              <TouchableOpacity onPress={() => removeSlot(index)}><Text style={styles.remove}>Remove</Text></TouchableOpacity>
            )}
          </View>
          <View style={styles.dayRow}>
            {DAYS.map((d) => (
              <TouchableOpacity key={d} style={[styles.chip, slot.day === d && styles.chipActive]} onPress={() => updateSlot(index, { day: d })}>
                <Text style={[styles.chipText, slot.day === d && styles.chipTextActive]}>{d.slice(0, 3)}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.timeRow}>
            <View style={styles.timeCol}>
              <Text style={styles.smallLabel}>Start</Text>
              <TextInput style={styles.input} value={slot.start} onChangeText={(t) => updateSlot(index, { start: t })} placeholder="09:00" placeholderTextColor={colors.muted} />
            </View>
            <View style={styles.timeCol}>
              <Text style={styles.smallLabel}>End</Text>
              <TextInput style={styles.input} value={slot.end} onChangeText={(t) => updateSlot(index, { end: t })} placeholder="11:00" placeholderTextColor={colors.muted} />
            </View>
          </View>
        </View>
      ))}

      <TouchableOpacity style={styles.addSlot} onPress={addSlot}>
        <Text style={styles.addSlotText}>+ Add another slot</Text>
      </TouchableOpacity>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <TouchableOpacity style={styles.button} onPress={save} disabled={saving}>
        {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>{isEdit ? 'Save changes' : 'Create module'}</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg },
  label: { fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: 8 },
  smallLabel: { fontSize: 13, fontWeight: '600', color: colors.muted, marginBottom: 6 },
  helpText: { fontSize: 12, color: colors.muted, marginTop: 6 },
  input: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 16, color: colors.text },
  slotCard: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 14, padding: 14, marginBottom: 12 },
  slotHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  slotTitle: { fontSize: 14, fontWeight: '700', color: colors.text },
  remove: { color: colors.red, fontWeight: '700', fontSize: 13 },
  dayRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { borderWidth: 1, borderColor: colors.border, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8, backgroundColor: colors.bg },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { color: colors.text, fontWeight: '600' },
  chipTextActive: { color: '#fff' },
  timeRow: { flexDirection: 'row', gap: 14, marginTop: 12 },
  timeCol: { flex: 1 },
  addSlot: { borderWidth: 1, borderColor: colors.primary, borderStyle: 'dashed', borderRadius: 12, paddingVertical: 12, alignItems: 'center', marginTop: 2 },
  addSlotText: { color: colors.primary, fontWeight: '700' },
  error: { color: colors.red, marginTop: 14 },
  button: { backgroundColor: colors.primary, borderRadius: 12, paddingVertical: 16, alignItems: 'center', marginTop: 24 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});