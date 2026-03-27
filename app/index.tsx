import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  SafeAreaView, Dimensions,
} from 'react-native';
import { router } from 'expo-router';
import { Colors, Typography, Spacing, Radius, Shadow } from '../../constants/theme';
import { useApp, todayLogs } from '../../context/AppContext';

const { width } = Dimensions.get('window');

export default function TodayScreen() {
  const { state, activeDog } = useApp();

  if (!activeDog) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>🐾</Text>
          <Text style={styles.emptyTitle}>No dog yet!</Text>
          <Text style={styles.emptySubtitle}>Head to Profile to add your furry friend.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const todayPotty = todayLogs(state.pottyLogs, activeDog.id);
  const todayWalks = todayLogs(state.walkLogs, activeDog.id);
  const todayMeals = todayLogs(state.mealLogs, activeDog.id);

  const totalWalkMinutes = todayWalks.reduce((acc, w) => acc + w.durationMinutes, 0);

  const dateStr = new Date().toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long',
  });

  // Dog's age in years
  const ageYears = activeDog.birthday
    ? Math.floor((Date.now() - new Date(activeDog.birthday).getTime()) / (1000 * 60 * 60 * 24 * 365))
    : null;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.dateText}>{dateStr}</Text>
            <Text style={styles.greeting}>
              Good {getTimeOfDay()}, {activeDog.name}! 🐾
            </Text>
          </View>
          <TouchableOpacity
            style={styles.dogAvatarBtn}
            onPress={() => router.push('/(tabs)/profile')}
          >
            <View style={styles.dogAvatar}>
              <Text style={styles.dogAvatarEmoji}>🐕</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Daily summary strip */}
        <View style={styles.summaryRow}>
          <SummaryPill emoji="💧" count={todayPotty.length} label="potty" color={Colors.potty} />
          <SummaryPill emoji="🦮" count={todayWalks.length} label={`${totalWalkMinutes}m`} color={Colors.walk} />
          <SummaryPill emoji="🍖" count={todayMeals.length} label="meals" color={Colors.meal} />
        </View>

        {/* Quick log section */}
        <Text style={styles.sectionTitle}>Quick Log</Text>
        <View style={styles.quickLogGrid}>
          <QuickLogCard
            emoji="💧"
            label="Potty"
            sublabel={`${todayPotty.length} today`}
            color={Colors.potty}
            onPress={() => router.push('/log/potty')}
          />
          <QuickLogCard
            emoji="🦮"
            label="Walk"
            sublabel={totalWalkMinutes > 0 ? `${totalWalkMinutes} min today` : 'Not yet'}
            color={Colors.walk}
            onPress={() => router.push('/log/walk')}
          />
          <QuickLogCard
            emoji="🍖"
            label="Meal"
            sublabel={`${todayMeals.length} logged`}
            color={Colors.meal}
            onPress={() => router.push('/log/meal')}
          />
          <QuickLogCard
            emoji="📓"
            label="Diary"
            sublabel="Write a note"
            color={Colors.diary}
            onPress={() => router.push('/diary/new')}
          />
        </View>

        {/* Recent activity */}
        <Text style={styles.sectionTitle}>Today's Activity</Text>
        <View style={styles.activityCard}>
          {[...todayPotty, ...todayWalks, ...todayMeals]
            .sort((a: any, b: any) => {
              const ta = new Date(a.timestamp || a.startTime || a.date).getTime();
              const tb = new Date(b.timestamp || b.startTime || b.date).getTime();
              return tb - ta;
            })
            .slice(0, 6)
            .map((item: any, idx) => (
              <ActivityRow key={idx} item={item} />
            ))}
          {todayPotty.length + todayWalks.length + todayMeals.length === 0 && (
            <View style={styles.emptyActivity}>
              <Text style={styles.emptyActivityText}>Nothing logged yet today 🌤️</Text>
              <Text style={styles.emptyActivitySub}>Use Quick Log above to get started!</Text>
            </View>
          )}
        </View>

        {/* Upcoming from planner */}
        <UpcomingEvents dogId={activeDog.id} events={state.plannedEvents} />
      </ScrollView>
    </SafeAreaView>
  );
}

function SummaryPill({ emoji, count, label, color }: any) {
  return (
    <View style={[styles.summaryPill, { backgroundColor: color + '22' }]}>
      <Text style={styles.summaryEmoji}>{emoji}</Text>
      <Text style={[styles.summaryCount, { color }]}>{count}</Text>
      <Text style={[styles.summaryLabel, { color }]}>{label}</Text>
    </View>
  );
}

function QuickLogCard({ emoji, label, sublabel, color, onPress }: any) {
  return (
    <TouchableOpacity style={[styles.quickCard, Shadow.sm]} onPress={onPress} activeOpacity={0.8}>
      <View style={[styles.quickCardIcon, { backgroundColor: color + '22' }]}>
        <Text style={styles.quickCardEmoji}>{emoji}</Text>
      </View>
      <Text style={styles.quickCardLabel}>{label}</Text>
      <Text style={styles.quickCardSublabel}>{sublabel}</Text>
    </TouchableOpacity>
  );
}

function ActivityRow({ item }: any) {
  let emoji = '📝';
  let label = '';
  let time = '';

  if (item.type === 'pee' || item.type === 'poop' || item.type === 'both') {
    emoji = item.type === 'pee' ? '💧' : item.type === 'poop' ? '💩' : '💧💩';
    label = `Potty — ${item.type}`;
    time = item.timestamp;
  } else if (item.durationMinutes !== undefined) {
    emoji = '🦮';
    label = `Walk — ${item.durationMinutes} min`;
    time = item.startTime;
  } else if (item.mealType) {
    emoji = '🍖';
    label = `${capitalise(item.mealType)} — ${item.food}`;
    time = item.timestamp;
  }

  return (
    <View style={styles.activityRow}>
      <Text style={styles.activityEmoji}>{emoji}</Text>
      <View style={styles.activityInfo}>
        <Text style={styles.activityLabel}>{label}</Text>
        <Text style={styles.activityTime}>{formatTime(time)}</Text>
      </View>
    </View>
  );
}

function UpcomingEvents({ dogId, events }: any) {
  const upcoming = events
    .filter((e: any) => e.dogId === dogId && !e.completed)
    .sort((a: any, b: any) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime())
    .slice(0, 3);

  if (upcoming.length === 0) return null;

  const typeEmoji: Record<string, string> = {
    walk: '🦮', vet: '🏥', meal: '🍖', grooming: '✂️', medication: '💊', other: '📌',
  };

  return (
    <>
      <Text style={styles.sectionTitle}>Upcoming</Text>
      <View style={styles.activityCard}>
        {upcoming.map((e: any) => (
          <View key={e.id} style={styles.activityRow}>
            <Text style={styles.activityEmoji}>{typeEmoji[e.type] ?? '📌'}</Text>
            <View style={styles.activityInfo}>
              <Text style={styles.activityLabel}>{e.title}</Text>
              <Text style={styles.activityTime}>{formatDateTime(e.dateTime)}</Text>
            </View>
          </View>
        ))}
      </View>
    </>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getTimeOfDay() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}

function formatTime(iso: string) {
  if (!iso) return '';
  return new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

function formatDateTime(iso: string) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' }) +
    ' · ' + d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

function capitalise(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 32 },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
  },
  dateText: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 13,
    color: Colors.textMuted,
    marginBottom: 2,
  },
  greeting: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 22,
    color: Colors.textPrimary,
    lineHeight: 30,
  },
  dogAvatarBtn: {},
  dogAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.surfaceWarm,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.border,
  },
  dogAvatarEmoji: { fontSize: 26 },

  summaryRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 10,
    marginBottom: 24,
  },
  summaryPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: Radius.full,
  },
  summaryEmoji: { fontSize: 14 },
  summaryCount: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 15,
  },
  summaryLabel: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 12,
  },

  sectionTitle: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 16,
    color: Colors.textSecondary,
    paddingHorizontal: 20,
    marginBottom: 12,
    letterSpacing: 0.3,
  },

  quickLogGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 10,
    marginBottom: 28,
  },
  quickCard: {
    width: (width - 52) / 2,
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: 16,
    gap: 6,
  },
  quickCardIcon: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  quickCardEmoji: { fontSize: 22 },
  quickCardLabel: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 15,
    color: Colors.textPrimary,
  },
  quickCardSublabel: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 12,
    color: Colors.textMuted,
  },

  activityCard: {
    marginHorizontal: 20,
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    marginBottom: 28,
    ...Shadow.sm,
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
    gap: 12,
  },
  activityEmoji: { fontSize: 20 },
  activityInfo: { flex: 1 },
  activityLabel: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 14,
    color: Colors.textPrimary,
  },
  activityTime: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 1,
  },

  emptyActivity: {
    padding: 24,
    alignItems: 'center',
  },
  emptyActivityText: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 15,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  emptyActivitySub: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 13,
    color: Colors.textMuted,
  },

  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyEmoji: { fontSize: 64, marginBottom: 16 },
  emptyTitle: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 24,
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});