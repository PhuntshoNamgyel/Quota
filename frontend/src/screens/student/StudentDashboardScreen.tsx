// src/screens/student/StudentDashboardScreen.tsx
import React, { useState, useCallback, useLayoutEffect } from 'react';
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

type Props = NativeStackScreenProps<RootStackParams, 'StudentDashboard'>;

interface Quota {
  held: number;
  attended: number;
  missed: number;
  percentage: number;
  remainingAbsences: number;
  totalClasses: number;
  colour: 'green' | 'yellow' | 'red';
  label: string;
}

interface DashItem {
  module: { id: number; name: string };
  quota: Quota;
}

const colourFor = (c: string) =>
  c === 'green'
    ? colors.green
    : c === 'yellow'
    ? colors.yellow
    : colors.red;

export default function StudentDashboardScreen({ navigation }: Props) {
  const { user, logout } = useAuth();
  const [items, setItems] = useState<DashItem[]>([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAll = useCallback(async () => {
    const [dash, unreadRes] = await Promise.all([
      api.get('/api/student/modules'),
      api.get('/api/student/notifications/unread-count'),
    ]);

    setItems(dash);
    setUnread(unreadRes.count ?? 0);
  }, []);

  const load = useCallback(async () => {
    try {
      await fetchAll();
    } finally {
      setLoading(false);
    }
  }, [fetchAll]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchAll();
    } finally {
      setRefreshing(false);
    }
  }, [fetchAll]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View style={{ flexDirection: 'row', gap: 18, alignItems: 'center' }}>
          <TouchableOpacity
            onPress={() => navigation.navigate('StudentNotifications')}
          >
            <View>
              <Text style={styles.headerBtn}>Alerts</Text>

              {unread > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>
                    {unread > 9 ? '9+' : unread}
                  </Text>
                </View>
              )}
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate('ChangePassword')}
          >
            <Text style={styles.headerBtn}>Password</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={logout}>
            <Text style={styles.headerBtn}>Logout</Text>
          </TouchableOpacity>
        </View>
      ),
    });
  }, [navigation, logout, unread]);

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
      data={items}
      keyExtractor={(i) => String(i.module.id)}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={colors.primary}
        />
      }
      ListHeaderComponent={
        <View style={styles.header}>
          <Text style={styles.greeting}>Hi, {user?.name}</Text>
          <Text style={styles.subtitle}>
            Track your attendance across modules.
          </Text>
        </View>
      }
      ListEmptyComponent={
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>No modules yet</Text>
          <Text style={styles.emptyText}>
            You're not enrolled in any modules.
          </Text>
        </View>
      }
      renderItem={({ item }) => {
        const c = colourFor(item.quota.colour);

        return (
          <TouchableOpacity
            style={styles.card}
            onPress={() =>
              navigation.navigate('StudentHistory', {
                moduleId: item.module.id,
                moduleName: item.module.name,
              })
            }
          >
            <View style={styles.cardTop}>
              <View style={styles.titleContainer}>
                <Text style={styles.moduleName}>
                  {item.module.name}
                </Text>

                <View
                  style={[
                    styles.statusTag,
                    { backgroundColor: `${c}15` },
                  ]}
                >
                  <Text
                    style={[
                      styles.statusText,
                      { color: c },
                    ]}
                  >
                    {item.quota.label}
                  </Text>
                </View>
              </View>

              <Text style={[styles.pct, { color: c }]}>
                {item.quota.percentage}%
              </Text>
            </View>

            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  {
                    backgroundColor: c,
                    width: `${Math.min(item.quota.percentage, 100)}%`,
                  },
                ]}
              />
            </View>

            <Text style={styles.meta}>
              {item.quota.attended}/{item.quota.totalClasses} attended ·{' '}
              {item.quota.missed} missed ·{' '}
              {item.quota.remainingAbsences} absences left
            </Text>
          </TouchableOpacity>
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
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.bg,
  },

  header: {
    marginBottom: 8,
  },

  greeting: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.text,
  },

  subtitle: {
    marginTop: 4,
    fontSize: 14,
    color: colors.muted,
    marginBottom: 18,
  },

  card: {
    backgroundColor: colors.card,
    borderRadius: 18,
    padding: 18,
    marginBottom: 14,
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

  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },

  titleContainer: {
    flex: 1,
    paddingRight: 12,
  },

  moduleName: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
    lineHeight: 24,
  },

  pct: {
    fontSize: 32,
    fontWeight: '800',
  },

  statusTag: {
    alignSelf: 'flex-start',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginTop: 10,
  },

  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },

  progressTrack: {
    height: 8,
    backgroundColor: colors.border,
    borderRadius: 999,
    overflow: 'hidden',
    marginTop: 16,
  },

  progressFill: {
    height: '100%',
    borderRadius: 999,
  },

  meta: {
    marginTop: 14,
    fontSize: 13,
    color: colors.muted,
    lineHeight: 20,
  },

  headerBtn: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },

  badge: {
    position: 'absolute',
    top: -6,
    right: -12,
    backgroundColor: colors.red,
    borderRadius: 9,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },

  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '800',
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
  },
});