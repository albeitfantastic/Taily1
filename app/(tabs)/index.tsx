import React, { useMemo } from 'react';
import {
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { Colors, Typography, Spacing, Radius, Shadow } from '../../constants/theme';
import { useApp } from '../../context/AppContext';

type ActivityType = 'potty' | 'walk' | 'meal' | 'diary';

type ActivityItem = {
  id: string;
  type: ActivityType;
  title: string;
  subtitle: string;
  timeLabel: string;
  icon: string;
  dateValue: number;
  raw: any;
};

function startOfToday() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
}

function formatTime(dateLike: string | number | Date) {
  const d = new Date(dateLike);
  return d.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function sameDog(itemDogId: string | undefined, activeDogId: string | undefined) {
  if (!activeDogId) return true;
  return itemDogId === activeDogId;
}

export default function TodayScreen() {
  const { state, dispatch } = useApp();

  const activeDog =
    state?.dogs?.find((dog: any) => dog.id === state?.activeDogId) ?? state?.dogs?.[0] ?? null;

  const dogName = activeDog?.name ?? 'your pup';

  const todayStart = startOfToday();

  const pottyLogs = Array.isArray(state?.pottyLogs) ? state.pottyLogs : [];
  const walkLogs = Array.isArray(state?.walkLogs) ? state.walkLogs : [];
  const mealLogs = Array.isArray(state?.mealLogs) ? state.mealLogs : [];
  const diaryEntries = Array.isArray(state?.diaryEntries) ? state.diaryEntries : [];

  const activityItems: ActivityItem[] = useMemo(() => {
    const pottyItems = pottyLogs
      .filter((log: any) => sameDog(log.dogId, activeDog?.id))
      .filter((log: any) => new Date(log.date).getTime() >= todayStart)
      .map((log: any) => {
        const pottyType = log.type === 'both' ? 'both' : log.type === 'poop' ? 'poop' : 'pee';
        const icon =
          pottyType === 'both' ? '💧💩' : pottyType === 'poop' ? '💩' : '💧';

        return {
          id: log.id,
          type: 'potty' as const,
          title: `Potty — ${pottyType}`,
          subtitle: log.notes?.trim() ? log.notes.trim() : 'Tap to edit or delete',
          timeLabel: formatTime(log.date),
          icon,
          dateValue: new Date(log.date).getTime(),
          raw: log,
        };
      });

    const walkItems = walkLogs
      .filter((log: any) => sameDog(log.dogId, activeDog?.id))
      .filter((log: any) => new Date(log.date).getTime() >= todayStart)
      .map((log: any) => {
        const minutes = Number(log.durationMinutes ?? log.duration ?? 0);
        return {
          id: log.id,
          type: 'walk' as const,
          title: `Walk — ${minutes} min`,
          subtitle: log.notes?.trim() ? log.notes.trim() : 'Tap to edit or delete',
          timeLabel: formatTime(log.date),
          icon: '🦮',
          dateValue: new Date(log.date).getTime(),
          raw: log,
        };
      });

    const mealItems = mealLogs
      .filter((log: any) => sameDog(log.dogId, activeDog?.id))
      .filter((log: any) => new Date(log.date).getTime() >= todayStart)
      .map((log: any) => {
        const mealName = log.name || log.meal || 'Meal';
        return {
          id: log.id,
          type: 'meal' as const,
          title: `${mealName}`,
          subtitle: log.notes?.trim() ? log.notes.trim() : 'Tap to edit or delete',
          timeLabel: formatTime(log.date),
          icon: '🍗',
          dateValue: new Date(log.date).getTime(),
          raw: log,
        };
      });

    const diaryItems = diaryEntries
      .filter((entry: any) => sameDog(entry.dogId, activeDog?.id))
      .filter((entry: any) => new Date(entry.date).getTime() >= todayStart)
      .map((entry: any) => ({
        id: entry.id,
        type: 'diary' as const,
        title: entry.title?.trim() ? entry.title.trim() : 'Diary note',
        subtitle: entry.content?.trim()
          ? entry.content.trim()
          : entry.notes?.trim()
          ? entry.notes.trim()
          : 'Tap to edit or delete',
        timeLabel: formatTime(entry.date),
        icon: '📓',
        dateValue: new Date(entry.date).getTime(),
        raw: entry,
      }));

    return [...pottyItems, ...walkItems, ...mealItems, ...diaryItems].sort(
      (a, b) => b.dateValue - a.dateValue
    );
  }, [pottyLogs, walkLogs, mealLogs, diaryEntries, activeDog?.id, todayStart]);

  const pottyCount = activityItems.filter((item) => item.type === 'potty').length;
  const mealCount = activityItems.filter((item) => item.type === 'meal').length;

  const walkMinutes = activityItems
    .filter((item) => item.type === 'walk')
    .reduce((sum, item) => {
      const raw = item.raw;
      return sum + Number(raw.durationMinutes ?? raw.duration ?? 0);
    }, 0);

  const handleQuickLog = (type: ActivityType) => {
    if (type === 'potty') router.push('/diary'); // change if you have a dedicated potty log route
    if (type === 'walk') router.push('/planner'); // change if you have a dedicated walk log route
    if (type === 'meal') router.push('/planner'); // change if you have a dedicated meal log route
    if (type === 'diary') router.push('/diary');
  };

  const handleEdit = (item: ActivityItem) => {
    Alert.alert(
      'Edit entry',
      `For now, route this to your ${item.type} edit flow.`,
      [
        {
          text: 'OK',
        },
      ]
    );
  };

  const handleDelete = (item: ActivityItem) => {
    Alert.alert(
      'Delete entry?',
      'This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            if (item.type === 'potty') {
              dispatch({
                type: 'DELETE_POTTY_LOG',
                payload: { id: item.id },
              });
              return;
            }

            if (item.type === 'walk') {
              dispatch({
                type: 'DELETE_WALK_LOG',
                payload: { id: item.id },
              });
              return;
            }

            if (item.type === 'meal') {
              dispatch({
                type: 'DELETE_MEAL_LOG',
                payload: { id: item.id },
              });
              return;
            }

            if (item.type === 'diary') {
              dispatch({
                type: 'DELETE_DIARY_ENTRY',
                payload: { id: item.id },
              });
            }
          },
        },
      ]
    );
  };

  const handleActivityPress = (item: ActivityItem) => {
    Alert.alert(
      'Activity',
      'What would you like to do?',
      [
        {
          text: 'Edit',
          onPress: () => handleEdit(item),
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => handleDelete(item),
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topStatsRow}>
          <View style={styles.statChip}>
            <Text style={styles.statEmoji}>💧</Text>
            <Text style={styles.statText}>{pottyCount} potty</Text>
          </View>

          <View style={styles.statChip}>
            <Text style={styles.statEmoji}>🦮</Text>
            <Text style={styles.statText}>{walkMinutes} m</Text>
          </View>

          <View style={styles.statChip}>
            <Text style={styles.statEmoji}>🍗</Text>
            <Text style={styles.statText}>{mealCount} meals</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Quick Log</Text>

        <View style={styles.quickGrid}>
          <Pressable style={styles.quickCard} onPress={() => handleQuickLog('potty')}>
            <View style={styles.quickIconWrap}>
              <Text style={styles.quickIcon}>💧</Text>
            </View>
            <Text style={styles.quickCardTitle}>Potty</Text>
            <Text style={styles.quickCardSubtitle}>{pottyCount} today</Text>
          </Pressable>

          <Pressable style={styles.quickCard} onPress={() => handleQuickLog('walk')}>
            <View style={styles.quickIconWrap}>
              <Text style={styles.quickIcon}>🦮</Text>
            </View>
            <Text style={styles.quickCardTitle}>Walk</Text>
            <Text style={styles.quickCardSubtitle}>
              {walkMinutes > 0 ? `${walkMinutes} min today` : 'Not yet'}
            </Text>
          </Pressable>

          <Pressable style={styles.quickCard} onPress={() => handleQuickLog('meal')}>
            <View style={styles.quickIconWrap}>
              <Text style={styles.quickIcon}>🍗</Text>
            </View>
            <Text style={styles.quickCardTitle}>Meal</Text>
            <Text style={styles.quickCardSubtitle}>{mealCount} logged</Text>
          </Pressable>

          <Pressable style={styles.quickCard} onPress={() => handleQuickLog('diary')}>
            <View style={styles.quickIconWrap}>
              <Text style={styles.quickIcon}>📓</Text>
            </View>
            <Text style={styles.quickCardTitle}>Diary</Text>
            <Text style={styles.quickCardSubtitle}>Write a note</Text>
          </Pressable>
        </View>

        <Text style={styles.sectionTitle}>Today&apos;s Activity</Text>

        <View style={styles.activityCard}>
          {activityItems.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateTitle}>No activity yet</Text>
              <Text style={styles.emptyStateSubtitle}>
                Start with a quick log for {dogName}.
              </Text>
            </View>
          ) : (
            activityItems.map((item, index) => (
              <Pressable
                key={item.id}
                onPress={() => handleActivityPress(item)}
                style={({ pressed }) => [
                  styles.activityRow,
                  index !== activityItems.length - 1 && styles.activityRowBorder,
                  pressed && styles.activityRowPressed,
                ]}
              >
                <View style={styles.activityLeft}>
                  <Text style={styles.activityIcon}>{item.icon}</Text>
                </View>

                <View style={styles.activityMain}>
                  <Text numberOfLines={1} style={styles.activityTitle}>
                    {item.title}
                  </Text>
                  <Text numberOfLines={1} style={styles.activityTime}>
                    {item.timeLabel}
                  </Text>
                </View>
              </Pressable>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const BG = Colors?.background ?? '#F4EFEB';
const SURFACE = Colors?.surface ?? '#FFFFFF';
const BORDER = Colors?.border ?? '#E6DDD5';
const TEXT = Colors?.textPrimary ?? '#3A302A';
const MUTED = Colors?.textSecondary ?? '#9B8F85';
const ACCENT = Colors?.accent ?? '#D97757';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG,
  },

  scroll: {
    flex: 1,
  },

  scrollContent: {
    padding: Spacing?.lg ?? 16,
    paddingBottom: 32,
  },

  topStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 18,
  },

  statChip: {
    flex: 1,
    backgroundColor: '#ECE7E2',
    borderRadius: 999,
    paddingVertical: 10,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },

  statEmoji: {
    fontSize: 16,
  },

  statText: {
    color: MUTED,
    fontSize: 13,
    fontWeight: '600',
  },

  sectionTitle: {
    color: '#6C5A4B',
    fontSize: Typography?.subtitle ?? 22,
    fontWeight: '700',
    marginBottom: 12,
    marginTop: 4,
  },

  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 22,
  },

  quickCard: {
    width: '48.5%',
    backgroundColor: SURFACE,
    borderRadius: Radius?.xl ?? 20,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: BORDER,
    minHeight: 108,
    ...((Shadow?.sm as object) || {}),
  },

  quickIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#F0EFED',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },

  quickIcon: {
    fontSize: 20,
  },

  quickCardTitle: {
    color: TEXT,
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 4,
  },

  quickCardSubtitle: {
    color: MUTED,
    fontSize: 13,
  },

  activityCard: {
    backgroundColor: SURFACE,
    borderRadius: Radius?.xl ?? 20,
    borderWidth: 1,
    borderColor: BORDER,
    overflow: 'hidden',
    ...((Shadow?.sm as object) || {}),
  },

  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 14,
    backgroundColor: SURFACE,
  },

  activityRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },

  activityRowPressed: {
    opacity: 0.72,
  },

  activityLeft: {
    width: 34,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  activityIcon: {
    fontSize: 20,
  },

  activityMain: {
    flex: 1,
  },

  activityTitle: {
    color: TEXT,
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 4,
  },

  activityTime: {
    color: MUTED,
    fontSize: 13,
  },

  emptyState: {
    paddingHorizontal: 18,
    paddingVertical: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },

  emptyStateTitle: {
    color: TEXT,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 6,
  },

  emptyStateSubtitle: {
    color: MUTED,
    fontSize: 14,
    textAlign: 'center',
  },
});