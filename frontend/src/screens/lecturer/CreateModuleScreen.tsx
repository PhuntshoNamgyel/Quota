// src/screens/lecturer/CreateModuleScreen.tsx
import React, { useState, useLayoutEffect, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Platform, Modal } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import DateTimePicker from '@react-native-community/datetimepicker';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { api } from '../../api/client';
import { colors } from '../../theme';
import { RootStackParams } from '../../navigation/types';

type Props = NativeStackScreenProps<RootStackParams, 'CreateModule'>;
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

interface Slot { day: string; start: string; end: string; }
interface ScheduleRow { day_of_week: string; start_time: string; end_time: string; }
interface ModuleItem { id: number; name: string; total_classes: number; semester_weeks: number; schedule: ScheduleRow[]; }

const newSlot = (): Slot => ({ day: 'Monday', start: '09:00', end: '11:00' });

function timeStringToDate(t: string): Date {
  const [h, m] = t.split(':').map(Number);
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d;
}

function dateToTimeString(d: Date): string {
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

function timeToMinutes(t: string): number {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

export default function CreateModuleScreen({ route, navigation }: Props) {
  const moduleId = route.params?.moduleId;
  const isEdit = moduleId != null;

  const [name, setName] = useState('');
  const [weeks, setWeeks] = useState('14');
  const [slots, setSlots] = useState<Slot[]>([newSlot()]);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(isEdit);

  // Time picker state
  const [pickerVisible, setPickerVisible] = useState(false);
  const [pickerTarget, setPickerTarget] = useState<{ index: number; field: 'start' | 'end' } | null>(null);
  const [pickerDate, setPickerDate] = useState(new Date());

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
          setWeeks(String(m.semester_weeks ?? 14));
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

  function openPicker(index: number, field: 'start' | 'end') {
    setPickerTarget({ index, field });
    setPickerDate(timeStringToDate(slots[index][field]));
    setPickerVisible(true);
  }

  function onPickerChange(_: unknown, selected?: Date) {
    if (Platform.OS === 'android') setPickerVisible(false);
    if (selected && pickerTarget) {
      updateSlot(pickerTarget.index, { [pickerTarget.field]: dateToTimeString(selected) });
    }
  }

  function confirmIOSPicker() {
    setPickerVisible(false);
  }

  async function save() {
    if (!name.trim()) { setError('Module name is required'); return; }

    // Validate each slot's start and end times
    for (let i = 0; i < slots.length; i++) {
      const slot = slots[i];
      if (timeToMinutes(slot.end) <= timeToMinutes(slot.start)) {
        setError(`Slot ${i + 1}: End time must be after start time.`);
        return;
      }
    }

    setError(''); setSaving(true);
    const schedule = slots.map((s) => ({ day_of_week: s.day, start_time: s.start, end_time: s.end }));
    const semesterWeeks = Number(weeks) > 0 ? Math.floor(Number(weeks)) : 14;
    try {
      if (isEdit) await api.put(`/api/modules/${moduleId}`, { name: name.trim(), schedule, semesterWeeks });
      else await api.post('/api/modules', { name: name.trim(), schedule, semesterWeeks });
      navigation.goBack();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color={colors.primary} /></View>;

  return (
    <KeyboardAwareScrollView style={styles.container} contentContainerStyle={{ padding: 20 }} enableOnAndroid extraScrollHeight={20}>
      <Text style={styles.label}>Module name</Text>
      <TextInput style={styles.input} placeholder="e.g. SWE201 Cross Platform Development"
        placeholderTextColor={colors.muted} value={name} onChangeText={setName} />

      <Text style={[styles.label, { marginTop: 22 }]}>Semester weeks</Text>
      <TextInput style={styles.input} value={weeks} onChangeText={setWeeks}
        keyboardType="number-pad" placeholder="14" placeholderTextColor={colors.muted} />
      <Text style={styles.helpText}>Total classes will be calculated automatically from your schedule and week count.</Text>

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
              <TouchableOpacity style={styles.timePicker} onPress={() => openPicker(index, 'start')}>
                <Text style={styles.timeText}>{slot.start}</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.timeCol}>
              <Text style={styles.smallLabel}>End</Text>
              <TouchableOpacity style={styles.timePicker} onPress={() => openPicker(index, 'end')}>
                <Text style={styles.timeText}>{slot.end}</Text>
              </TouchableOpacity>
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

      {/* iOS time picker in modal */}
      {Platform.OS === 'ios' && (
        <Modal visible={pickerVisible} transparent animationType="slide">
          <View style={styles.pickerOverlay}>
            <View style={styles.pickerCard}>
              <TouchableOpacity style={styles.pickerDone} onPress={confirmIOSPicker}>
                <Text style={styles.pickerDoneText}>Done</Text>
              </TouchableOpacity>
              <DateTimePicker
                value={pickerDate}
                mode="time"
                display="spinner"
                onChange={onPickerChange}
                minuteInterval={15}
              />
            </View>
          </View>
        </Modal>
      )}

      {/* Android time picker renders inline */}
      {Platform.OS === 'android' && pickerVisible && (
        <DateTimePicker
          value={pickerDate}
          mode="time"
          display="default"
          onChange={onPickerChange}
          minuteInterval={15}
        />
      )}
    </KeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },

  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bg,
  },

  label: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },

  smallLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.muted,
    marginBottom: 6,
  },

  helpText: {
    fontSize: 12,
    color: colors.muted,
    marginTop: 8,
    lineHeight: 18,
  },

  input: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: colors.text,
  },

  slotCard: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    padding: 18,
    marginBottom: 14,

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },

  slotHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },

  slotTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },

  remove: {
    color: colors.red,
    fontWeight: '700',
    fontSize: 13,
  },

  dayRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  chip: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bg,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    minWidth: 54,
    alignItems: 'center',
  },

  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },

  chipText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '600',
  },

  chipTextActive: {
    color: '#fff',
  },

  timeRow: {
    flexDirection: 'row',
    gap: 14,
    marginTop: 16,
  },

  timeCol: {
    flex: 1,
  },

  timePicker: {
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },

  timeText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },

  addSlot: {
    marginTop: 4,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: colors.primary,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
  },

  addSlotText: {
    color: colors.primary,
    fontWeight: '700',
    fontSize: 14,
  },

  error: {
    color: colors.red,
    marginTop: 14,
    fontSize: 14,
    fontWeight: '600',
  },

  button: {
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 28,
    marginBottom: 40,
  },

  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },

  pickerOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.25)',
  },

  pickerCard: {
    backgroundColor: colors.card,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 30,
  },

  pickerDone: {
    alignItems: 'flex-end',
    padding: 18,
  },

  pickerDoneText: {
    color: colors.primary,
    fontWeight: '700',
    fontSize: 16,
  },
});