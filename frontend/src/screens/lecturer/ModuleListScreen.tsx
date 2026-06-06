// src/screens/lecturer/ModuleListScreen.tsx
import React, { useState, useLayoutEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { colors } from '../../theme';
import { RootStackParams } from '../../navigation/types';

type Props = NativeStackScreenProps<RootStackParams, 'ModuleList'>;

interface ScheduleRow {
  day_of_week: string;
  start_time: string;
  end_time: string;
}

interface ModuleItem {
  id: number;
  name: string;
  schedule: ScheduleRow[];
  studentCount: number;
}

const ACCENTS = ['#2563eb', '#7c3aed', '#0891b2', '#ca8a04', '#dc2626', '#16a34a'];
const TODAY = new Date().toLocaleDateString('en-US', { weekday: 'long' });

export default function ModuleListScreen({ navigation }: Props) {
  const { logout } = useAuth();
  const [modules, setModules] = useState<ModuleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchModules = useCallback(
    async () => setModules(await api.get('/api/modules')),
    []
  );

  const load = useCallback(async () => {
    try {
      await fetchModules();
    } finally {
      setLoading(false);
    }
  }, [fetchModules]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchModules();
    } finally {
      setRefreshing(false);
    }
  }, [fetchModules]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View style={{ flexDirection: 'row', gap: 18, alignItems: 'center' }}>
          <TouchableOpacity onPress={() => navigation.navigate('ChangePassword')}>
            <Text style={styles.headerBtn}>Password</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={logout}>
            <Text style={styles.headerBtn}>Logout</Text>
          </TouchableOpacity>
        </View>
      ),
    });
  }, [navigation, logout]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.newBtn}
        onPress={() => navigation.navigate('CreateModule')}
      >
        <Text style={styles.newBtnText}>+ Create Module</Text>
      </TouchableOpacity>

      <FlatList
        data={modules}
        keyExtractor={(m) => String(m.id)}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>No modules yet</Text>
            <Text style={styles.emptyText}>
              Create your first module to start tracking attendance.
            </Text>
          </View>
        }
        renderItem={({ item, index }) => {
          const accent = ACCENTS[index % ACCENTS.length];
          const isToday = item.schedule.some(
            (s) => s.day_of_week === TODAY
          );

          const parts = item.name.split(' ');
          const code = parts[0];
          const title = parts.slice(1).join(' ') || item.name;

          return (
            <TouchableOpacity
              style={styles.card}
              onPress={() =>
                navigation.navigate('ModuleDetail', {
                  moduleId: item.id,
                  moduleName: item.name,
                })
              }
            >
              <View style={styles.cardHeader}>
                <View
                  style={[
                    styles.codeBadge,
                    { backgroundColor: `${accent}15`, borderColor: accent },
                  ]}
                >
                  <Text style={[styles.codeText, { color: accent }]}>
                    {code}
                  </Text>
                </View>

                {isToday && (
                  <View style={styles.todayTag}>
                    <Text style={styles.todayText}>Today</Text>
                  </View>
                )}
              </View>

              <Text style={styles.cardTitle}>{title}</Text>

              <Text style={styles.schedule}>
                {item.schedule.length
                  ? item.schedule
                      .map(
                        (s) =>
                          `${s.day_of_week.slice(0, 3)} ${s.start_time}`
                      )
                      .join(' • ')
                  : 'No schedule set'}
              </Text>

              <View style={styles.footer}>
                <Text style={styles.studentCount}>
                  {item.studentCount} students
                </Text>
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },

  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.bg,
  },

  headerBtn: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },

  newBtn: {
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 6,
    height: 52,
    borderRadius: 14,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },

  newBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },

  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },

  card: {
    backgroundColor: colors.card,
    borderRadius: 18,
    padding: 18,
    marginTop: 12,
    borderWidth: 1,
    borderColor: colors.border,

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },

  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  codeBadge: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },

  codeText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.4,
  },

  todayTag: {
    backgroundColor: '#DCFCE7',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },

  todayText: {
    color: colors.green,
    fontSize: 12,
    fontWeight: '700',
  },

  cardTitle: {
    marginTop: 14,
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    lineHeight: 24,
  },

  schedule: {
    marginTop: 8,
    fontSize: 14,
    color: colors.muted,
    lineHeight: 20,
  },

  footer: {
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },

  studentCount: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.muted,
  },

  emptyContainer: {
    alignItems: 'center',
    marginTop: 80,
    paddingHorizontal: 24,
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 6,
  },

  emptyText: {
    textAlign: 'center',
    color: colors.muted,
    lineHeight: 22,
  },
});