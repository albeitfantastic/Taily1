import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, SafeAreaView, TextInput, ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { Colors, Radius, Shadow } from '../../constants/theme';
import { useApp, generateId } from '../../context/AppContext';

type PottyType = 'pee' | 'poop' | 'both';

export default function LogPottyModal() {
  const { dispatch, activeDog } = useApp();
  const [type, setType] = useState<PottyType>('pee');
  const [success, setSuccess] = useState(true);
  const [notes, setNotes] = useState('');

  const handleSave = () => {
    if (!activeDog) return;
    dispatch({
      type: 'ADD_POTTY_LOG',
      payload: {
        id: generateId(),
        dogId: activeDog.id,
        type,
        timestamp: new Date().toISOString(),
        success,
        notes,
      },
    });
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Log Potty 💧</Text>
        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          <Text style={styles.saveBtnText}>Save</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {activeDog && (
          <Text style={styles.dogName}>For {activeDog.name}</Text>
        )}

        <Text style={styles.sectionLabel}>Type</Text>
        <View style={styles.typeRow}>
          {([
            { type: 'pee' as const, emoji: '💧', label: 'Pee' },
            { type: 'poop' as const, emoji: '💩', label: 'Poop' },
            { type: 'both' as const, emoji: '🌊', label: 'Both' },
          ]).map(t => (
            <TouchableOpacity
              key={t.type}
              style={[styles.typeBtn, type === t.type && styles.typeBtnActive]}
              onPress={() => setType(t.type)}
            >
              <Text style={styles.typeBtnEmoji}>{t.emoji}</Text>
              <Text style={[styles.typeBtnLabel, type === t.type && styles.typeBtnLabelActive]}>
                {t.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionLabel}>Did it go well?</Text>
        <View style={styles.typeRow}>
          {([
            { value: true, emoji: '✅', label: 'Yes!' },
            { value: false, emoji: '❌', label: 'Accident' },
          ]).map(s => (
            <TouchableOpacity
              key={String(s.value)}
              style={[styles.typeBtn, success === s.value && styles.typeBtnActive]}
              onPress={() => setSuccess(s.value)}
            >
              <Text style={styles.typeBtnEmoji}>{s.emoji}</Text>
              <Text style={[styles.typeBtnLabel, success === s.value && styles.typeBtnLabelActive]}>
                {s.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionLabel}>Notes (optional)</Text>
        <TextInput
          style={styles.notesInput}
          placeholder="Any observations..."
          placeholderTextColor={Colors.textMuted}
          value={notes}
          onChangeText={setNotes}
          multiline
          numberOfLines={3}
        />

        <Text style={styles.timeText}>
          🕐 {new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })} · {new Date().toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 16, borderBottomWidth: 1, borderBottomColor: Colors.divider,
  },
  cancelText: { fontFamily: 'Nunito_400Regular', fontSize: 16, color: Colors.textSecondary },
  title: { fontFamily: 'Nunito_700Bold', fontSize: 17, color: Colors.textPrimary },
  saveBtn: {
    backgroundColor: Colors.potty, paddingHorizontal: 16, paddingVertical: 8, borderRadius: Radius.full,
  },
  saveBtnText: { fontFamily: 'Nunito_700Bold', fontSize: 14, color: '#fff' },
  content: { padding: 20 },
  dogName: {
    fontFamily: 'PlayfairDisplay_700Bold', fontSize: 18, color: Colors.textPrimary, marginBottom: 24,
  },
  sectionLabel: {
    fontFamily: 'Nunito_700Bold', fontSize: 13, color: Colors.textSecondary,
    letterSpacing: 0.4, marginBottom: 10, marginTop: 4,
  },
  typeRow: { flexDirection: 'row', gap: 10, marginBottom: 24 },
  typeBtn: {
    flex: 1, alignItems: 'center', paddingVertical: 16, borderRadius: Radius.lg,
    backgroundColor: Colors.surface, borderWidth: 2, borderColor: 'transparent', gap: 8,
    ...Shadow.sm,
  },
  typeBtnActive: { borderColor: Colors.potty, backgroundColor: Colors.potty + '15' },
  typeBtnEmoji: { fontSize: 28 },
  typeBtnLabel: { fontFamily: 'Nunito_600SemiBold', fontSize: 14, color: Colors.textSecondary },
  typeBtnLabelActive: { color: Colors.potty },
  notesInput: {
    backgroundColor: Colors.surface, borderRadius: Radius.md, padding: 14,
    fontFamily: 'Nunito_400Regular', fontSize: 15, color: Colors.textPrimary,
    borderWidth: 1, borderColor: Colors.border, height: 80, textAlignVertical: 'top',
    marginBottom: 24,
  },
  timeText: {
    fontFamily: 'Nunito_400Regular', fontSize: 13, color: Colors.textMuted, textAlign: 'center',
  },
});