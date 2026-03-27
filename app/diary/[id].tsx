import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Colors, Radius, Shadow } from '../../constants/theme';
import { useApp } from '../../context/AppContext';

const MOOD_META: Record<string, { emoji: string; label: string; color: string }> = {
  happy: { emoji: '😄', label: 'Happy', color: Colors.meal },
  playful: { emoji: '🎾', label: 'Playful', color: Colors.walk },
  calm: { emoji: '😌', label: 'Calm', color: Colors.potty },
  tired: { emoji: '😴', label: 'Tired', color: Colors.diary },
  sick: { emoji: '🤒', label: 'Under the weather', color: Colors.error },
};

export default function DiaryEntryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { state } = useApp();

  const entry = state.diaryEntries.find(e => e.id === id);

  if (!entry) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>Entry not found</Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backLink}>← Go back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const mood = MOOD_META[entry.mood] ?? MOOD_META.happy;
  const dateStr = new Date(entry.date).toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: mood.color + '15' }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>← Back</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Date */}
        <Text style={styles.dateText}>{dateStr}</Text>

        {/* Mood badge */}
        <View style={[styles.moodBadge, { backgroundColor: mood.color }]}>
          <Text style={styles.moodEmoji}>{mood.emoji}</Text>
          <Text style={styles.moodLabel}>{mood.label}</Text>
        </View>

        {/* Title */}
        <Text style={styles.entryTitle}>{entry.title}</Text>

        {/* Divider */}
        <View style={[styles.divider, { backgroundColor: mood.color }]} />

        {/* Content */}
        <Text style={styles.entryContent}>{entry.content}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
  backBtn: { paddingVertical: 4 },
  backBtnText: { fontFamily: 'Nunito_600SemiBold', fontSize: 16, color: Colors.textSecondary },

  content: { padding: 24, paddingTop: 8, paddingBottom: 60 },

  dateText: {
    fontFamily: 'Nunito_600SemiBold', fontSize: 13, color: Colors.textMuted,
    letterSpacing: 0.3, marginBottom: 16, textTransform: 'uppercase',
  },
  moodBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    alignSelf: 'flex-start', paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: Radius.full, marginBottom: 20,
  },
  moodEmoji: { fontSize: 18 },
  moodLabel: { fontFamily: 'Nunito_700Bold', fontSize: 14, color: '#fff' },

  entryTitle: {
    fontFamily: 'PlayfairDisplay_700Bold', fontSize: 28, color: Colors.textPrimary,
    lineHeight: 38, marginBottom: 16,
  },
  divider: {
    height: 3, width: 40, borderRadius: 2, marginBottom: 24, opacity: 0.6,
  },
  entryContent: {
    fontFamily: 'Nunito_400Regular', fontSize: 17, color: Colors.textPrimary,
    lineHeight: 28,
  },

  notFound: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  notFoundText: { fontFamily: 'Nunito_400Regular', fontSize: 16, color: Colors.textSecondary },
  backLink: { fontFamily: 'Nunito_600SemiBold', fontSize: 15, color: Colors.primary },
});