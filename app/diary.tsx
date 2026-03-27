import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView,
} from 'react-native';
import { router } from 'expo-router';
import { Colors, Radius, Shadow } from '../constants/theme';
import { useApp } from '../context/AppContext';

const MOOD_META: Record<string, { emoji: string; label: string; color: string }> = {
  happy: { emoji: '😄', label: 'Happy', color: Colors.meal },
  playful: { emoji: '🎾', label: 'Playful', color: Colors.walk },
  calm: { emoji: '😌', label: 'Calm', color: Colors.potty },
  tired: { emoji: '😴', label: 'Tired', color: Colors.diary },
  sick: { emoji: '🤒', label: 'Under the weather', color: Colors.error },
};

export default function DiaryScreen() {
  const { state, activeDog } = useApp();

  const entries = activeDog
    ? state.diaryEntries
        .filter(e => e.dogId === activeDog.id)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    : [];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.screenTitle}>Diary</Text>
        <TouchableOpacity style={styles.newEntryBtn} onPress={() => router.push('/diary/new')}>
          <Text style={styles.newEntryBtnText}>+ New Entry</Text>
        </TouchableOpacity>
      </View>

      {entries.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>📓</Text>
          <Text style={styles.emptyTitle}>No diary entries yet</Text>
          <Text style={styles.emptySubtitle}>
            Start capturing {activeDog?.name}'s most precious moments!
          </Text>
          <TouchableOpacity
            style={styles.startBtn}
            onPress={() => router.push('/diary/new')}
          >
            <Text style={styles.startBtnText}>Write first entry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        >
          {entries.map(entry => {
            const mood = MOOD_META[entry.mood] ?? MOOD_META.happy;
            const dateStr = new Date(entry.date).toLocaleDateString('en-GB', {
              weekday: 'short', day: 'numeric', month: 'long', year: 'numeric',
            });
            return (
              <TouchableOpacity
                key={entry.id}
                style={[styles.entryCard, Shadow.sm]}
                onPress={() => router.push(`/diary/${entry.id}`)}
                activeOpacity={0.85}
              >
                <View style={styles.entryTop}>
                  <View style={[styles.moodBadge, { backgroundColor: mood.color + '22' }]}>
                    <Text style={styles.moodEmoji}>{mood.emoji}</Text>
                    <Text style={[styles.moodLabel, { color: mood.color }]}>{mood.label}</Text>
                  </View>
                  <Text style={styles.entryDate}>{dateStr}</Text>
                </View>
                <Text style={styles.entryTitle}>{entry.title}</Text>
                <Text style={styles.entryPreview} numberOfLines={2}>
                  {entry.content}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  screenTitle: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 28,
    color: Colors.textPrimary,
  },
  newEntryBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: Radius.full,
  },
  newEntryBtnText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 14,
    color: '#fff',
  },

  list: {
    padding: 20,
    gap: 14,
    paddingBottom: 40,
  },
  entryCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: 16,
  },
  entryTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  moodBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.full,
  },
  moodEmoji: { fontSize: 14 },
  moodLabel: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 12,
  },
  entryDate: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 12,
    color: Colors.textMuted,
  },
  entryTitle: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 18,
    color: Colors.textPrimary,
    marginBottom: 6,
    lineHeight: 26,
  },
  entryPreview: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
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
    fontSize: 22,
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 28,
  },
  startBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: Radius.full,
  },
  startBtnText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 16,
    color: '#fff',
  },
});