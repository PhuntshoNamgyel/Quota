// src/screens/student/StudentNotificationsScreen.tsx
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { api } from '../../api/client';
import { colors } from '../../theme';
import { formatDateTime } from '../../format';

interface NotificationRow {
  id: number;
  level: string;
  message: string;
  created_at: string;
  module_name: string;
}

const colourFor = (level: string) =>
  level === 'critical'
    ? colors.red
    : level === 'breach'
    ? colors.yellow
    : colors.primary;

export default function StudentNotificationsScreen() {
  const [rows, setRows] = useState<NotificationRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const data = await api.get('/api/student/notifications');
    setRows(data);
    setLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <FlatList
      style={styles.container}
      data={rows}
      keyExtractor={(n) => String(n.id)}
      contentContainerStyle={styles.content}
      ListEmptyComponent={
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>No alerts</Text>
          <Text style={styles.emptyText}>
            You're on track and have no notifications at the moment.
          </Text>
        </View>
      }
      renderItem={({ item }) => {
        const levelColor = colourFor(item.level);

        return (
          <View style={styles.card}>
            <View style={styles.header}>
              <Text style={styles.module}>{item.module_name}</Text>

              <Text
                style={[
                  styles.level,
                  {
                    color: levelColor,
                    backgroundColor: `${levelColor}15`,
                  },
                ]}
              >
                {item.level.toUpperCase()}
              </Text>
            </View>

            <Text style={styles.message}>{item.message}</Text>

            <Text style={styles.date}>
              {formatDateTime(item.created_at)}
            </Text>
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
    padding: 20,
    paddingBottom: 24,
  },

  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bg,
  },

  card: {
    backgroundColor: colors.card,
    borderRadius: 18,
    padding: 18,
    marginBottom: 12,
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

  header: {
    marginBottom: 10,
  },

  module: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },

  level: {
    alignSelf: 'flex-start',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    overflow: 'hidden',
  },

  message: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 22,
  },

  date: {
    fontSize: 12,
    color: colors.muted,
    marginTop: 12,
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