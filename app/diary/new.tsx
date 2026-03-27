import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, SafeAreaView, TextInput, ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { Colors, Radius, Shadow } from '../../constants/theme';
import { useApp, generateId } from '../../context/AppContext';

type Mood = 'happy' | 'playful' | 'calm' | 'tired' | 'sick';

const MOODS: { mood: Mood; emoji: string; label: string; color: string }[] = [
  { mood: 'happy', emoji: '😄', label: 'Happy', color: Colors.meal },
  { mood: 'playful', emoji: '🎾', label: 'Playful', color: Colors.walk },
  { mood: 'calm', emoji: '😌', label: 'Calm', color: Colors.potty },
  { mood: 'tired', emoji: '😴', label: 'Tired', color: Colors.diary },
  { mood: 'sick', emoji: '🤒', label: 'Sick', color: Colors.error },
];

export default function NewDiaryEntryModal() {
  const { dispatch, activeDog } = useApp();
  const [mood, setMood] = useState<Mood>('happy');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const handleSave = () => {
    if (!activeDog || !content.trim()) return;
    dispatch({
      type: 'ADD_DIARY_ENTRY',
      payload: {
        id: generateId(),
        dogId: activeDog.id,
        date: new Date().toISOString(),
        mood,
        title: title.trim() || getDefaultTitle(mood, activeDog.name),
        content: content.trim(),
      },
    });
    router.back();
  };

  const selectedMoodMeta = MOODS.find(m => m.mood === mood)!;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.title}>New Entry 📓</Text>
        <TouchableOpacity
          style={[styles.saveBtn, { backgroundColor: selectedMoodMeta.color }]}
          onPress={handleSave}
          disabled={!content.trim()}
        >
          <Text style={styles.saveBtnText}>Save</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} keyboardShouldPersistTaps="handled">
        {activeDog && (
          <Text style={styles.dateText}>
            {new Date().toLocaleDateString('en-GB', {
              weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
            })}
          </Text>
        )}

        <Text style={styles.sectionLabel}>How is {activeDog?.name} feeling today?</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.moodScroll}>
          {MOODS.map(m => (
            <TouchableOpacity
              key={m.mood}
              style={[
                styles.moodBtn,
                mood === m.mood && { backgroundColor: m.color + '20', borderColor: m.color },
              ]}
              onPress={() => setMood(m.mood)}
            >
              <Text style={styles.moodEmoji}>{m.emoji}</Text>
              <Text style={[styles.moodLabel, mood === m.mood && { color: m.color }]}>
                {m.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={styles.sectionLabel}>Title (optional)</Text>
        <TextInput
          style={styles.titleInput}
          placeholder={getDefaultTitle(mood, activeDog?.name ?? 'your pup')}
          placeholderTextColor={Colors.textMuted}
          value={title}
          onChangeText={setTitle}
          maxLength={80}
        />

        <Text style={styles.sectionLabel}>What happened today? *</Text>
        <TextInput
          style={styles.contentInput}
          placeholder={`Tell ${activeDog?.name ?? 'your pup'}'s story for today...`}
          placeholderTextColor={Colors.textMuted}
          value={content}
          onChangeText={setContent}
          multiline
          textAlignVertical="top"
          autoFocus
        />
      </ScrollView>
    </SafeAreaView>
  );
}

function getDefaultTitle(mood: Mood, name: string): string {
  const titles: Record<Mood, string> = {
    happy: `${name} had a wonderful day`,
    playful: `Playtime with ${name}`,
    calm: `A peaceful day for ${name}`,
    tired: `${name} needed some rest`,
    sick: `${name} wasn't feeling well`,
  };
  return titles[mood];
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 16, borderBottomWidth: 1, borderBottomColor: Colors.divider,
  },
  cancelText: { fontFamily: 'Nunito_400Regular', fontSize: 16, color: Colors.textSecondary },
  title: { fontFamily: 'Nunito_700Bold', fontSize: 17, color: Colors.textPrimary },
  saveBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: Radius.full },
  saveBtnText: { fontFamily: 'Nunito_700Bold', fontSize: 14, color: '#fff' },

  content: { padding: 20, flex: 1 },
  dateText: {
    fontFamily: 'Nunito_600SemiBold', fontSize: 13, color: Colors.textMuted,
    marginBottom: 20, letterSpacing: 0.3,
  },
  sectionLabel: {
    fontFamily: 'Nunito_700Bold', fontSize: 13, color: Colors.textSecondary,
    letterSpacing: 0.4, marginBottom: 10, marginTop: 4,
  },

  moodScroll: { marginBottom: 24, marginHorizontal: -20, paddingHorizontal: 20 },
  moodBtn: {
    alignItems: 'center', paddingVertical: 12, paddingHorizontal: 16,
    borderRadius: Radius.lg, borderWidth: 1.5, borderColor: Colors.border,
    backgroundColor: Colors.surface, marginRight: 10, gap: 6, minWidth: 72,
  },
  moodEmoji: { fontSize: 26 },
  moodLabel: { fontFamily: 'Nunito_600SemiBold', fontSize: 12, color: Colors.textMuted },

  titleInput: {
    backgroundColor: Colors.surface, borderRadius: Radius.md, padding: 14,
    fontFamily: 'PlayfairDisplay_700Bold', fontSize: 18, color: Colors.textPrimary,
    borderWidth: 1, borderColor: Colors.border, marginBottom: 16,
  },
  contentInput: {
    backgroundColor: Colors.surface, borderRadius: Radius.md, padding: 14,
    fontFamily: 'Nunito_400Regular', fontSize: 16, color: Colors.textPrimary,
    borderWidth: 1, borderColor: Colors.border, minHeight: 200, lineHeight: 24,
  },
});