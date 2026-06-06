// src/screens/student/StudentHistoryScreen.tsx

import React, { useState, useCallback, useLayoutEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { api } from '../../api/client';
import { colors } from '../../theme';
import { formatDate } from '../../format';
import { RootStackParams } from '../../navigation/types';

type Props = NativeStackScreenProps<RootStackParams, 'StudentHistory'>;

interface HistoryRow {
  sessionId: number;
  date: string;
  status: 'present' | 'absent';
}

export default function StudentHistoryScreen({
  route,
  navigation,
}: Props) {
  const { moduleId, moduleName } = route.params;

  const [rows, setRows] = useState<HistoryRow[]>([]);
  const [loading, setLoading] = useState(true);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: moduleName,
    });
  }, [navigation, moduleName]);

  const load = useCallback(async () => {
    try {
      const data = await api.get(
        `/api/student/modules/${moduleId}/history`,
      );

      setRows(data);
    } finally {
      setLoading(false);
    }
  }, [moduleId]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      load();
    }, [load]),
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator
          size="large"
          color={colors.primary}
        />
      </View>
    );
  }

  const presentCount = rows.filter(
    (r) => r.status === 'present',
  ).length;

  const absentCount = rows.length - presentCount;

  const percentage =
    rows.length === 0
      ? 0
      : Math.round((presentCount / rows.length) * 100);

  return (
    <FlatList
      style={styles.container}
      data={rows}
      keyExtractor={(item) => String(item.sessionId)}
      contentContainerStyle={styles.content}
      ListHeaderComponent={
        <>
          <View style={styles.summaryCard}>
            <Text style={styles.percentage}>
              {percentage}%
            </Text>

            <Text style={styles.summaryTitle}>
              Attendance Record
            </Text>

            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>
                  {presentCount}
                </Text>
                <Text style={styles.statLabel}>
                  Present
                </Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.statItem}>
                <Text style={styles.statValue}>
                  {absentCount}
                </Text>
                <Text style={styles.statLabel}>
                  Absent
                </Text>
              </View>
            </View>
          </View>

          {rows.length > 0 && (
            <Text style={styles.sectionTitle}>
              Recent Sessions
            </Text>
          )}
        </>
      }
      ListEmptyComponent={
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>
            No attendance history
          </Text>

          <Text style={styles.emptyText}>
            Sessions will appear here once
            attendance has been recorded.
          </Text>
        </View>
      }
      renderItem={({ item }) => {
        const present = item.status === 'present';

        return (
          <View style={styles.sessionCard}>
            <View>
              <Text style={styles.sessionDate}>
                {formatDate(item.date)}
              </Text>

              <Text style={styles.sessionSub}>
                Attendance session
              </Text>
            </View>

            <View
              style={[
                styles.statusBadge,
                {
                  backgroundColor: present
                    ? colors.green
                    : colors.red,
                },
              ]}
            >
              <Text style={styles.statusText}>
                {present
                  ? 'Present'
                  : 'Absent'}
              </Text>
            </View>
          </View>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },

  content: {
    padding: 16,
    paddingBottom: 24,
  },

  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bg,
  },

  summaryCard: {
    backgroundColor: colors.card,
    borderRadius: 22,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.border,
  },

  percentage: {
    fontSize: 48,
    fontWeight: '900',
    color: colors.primary,
  },

  summaryTitle: {
    fontSize: 15,
    color: colors.muted,
    marginTop: 4,
    marginBottom: 20,
  },

  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  statItem: {
    alignItems: 'center',
    minWidth: 80,
  },

  statValue: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text,
  },

  statLabel: {
    fontSize: 13,
    color: colors.muted,
    marginTop: 4,
  },

  divider: {
    width: 1,
    height: 40,
    backgroundColor: colors.border,
    marginHorizontal: 24,
  },

  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 12,
  },

  sessionCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  sessionDate: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },

  sessionSub: {
    fontSize: 12,
    color: colors.muted,
    marginTop: 4,
  },

  statusBadge: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
  },

  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },

  emptyCard: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
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
    lineHeight: 20,
  },
});