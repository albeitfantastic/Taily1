import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, SafeAreaView, TextInput, ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { Colors, Radius, Shadow } from '../../constants/theme';
import { useApp, generateId } from '../../context/AppContext';

export default function LogWalkModal() {
  const { dispatch, activeDog } = useApp();
  const [isTracking, setIsTracking] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [startTime, setStartTime] = useState<string | null>(null);
  const [manualMinutes, setManualMinutes] = useState('');
  const [manualKm, setManualKm] = useState('');
  const [notes, setNotes] = useState('');
  const [mode, setMode] = useState<'timer' | 'manual'>('timer');
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isTracking) {
      intervalRef.current = setInterval(() => setElapsed(e => e + 1), 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isTracking]);

  const startWalk = () => {
    setStartTime(new Date().toISOString());
    setIsTracking(true);
    setElapsed(0);
  };

  const stopWalk = () => {
    setIsTracking(false);
  };

  const formatElapsed = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  };

  const handleSave = () => {
    if (!activeDog) return;
    const durationMinutes = mode === 'timer'
      ? Math.round(elapsed / 60)
      : parseInt(manualMinutes) || 0;
    const distanceKm = parseFloat(manualKm) || undefined;

    dispatch({
      type: 'ADD_WALK_LOG',
      payload: {
        id: generateId(),
        dogId: activeDog.id,
        startTime: startTime || new Date().toISOString(),
        durationMinutes,
        distanceKm,
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
        <Text style={styles.title}>Log Walk 🦮</Text>
        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          <Text style={styles.saveBtnText}>Save</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {activeDog && <Text style={styles.dogName}>Walking {activeDog.name}</Text>}

        {/* Mode toggle */}
        <View style={styles.modeTabs}>
          <TouchableOpacity
            style={[styles.modeTab, mode === 'timer' && styles.modeTabActive]}
            onPress={() => setMode('timer')}
          >
            <Text style={[styles.modeTabText, mode === 'timer' && styles.modeTabTextActive]}>⏱ Timer</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modeTab, mode === 'manual' && styles.modeTabActive]}
            onPress={() => setMode('manual')}
          >
            <Text style={[styles.modeTabText, mode === 'manual' && styles.modeTabTextActive]}>✏️ Manual</Text>
          </TouchableOpacity>
        </View>

        {mode === 'timer' ? (
          <View style={styles.timerSection}>
            <Text style={styles.timerDisplay}>{formatElapsed(elapsed)}</Text>
            <Text style={styles.timerSub}>
              {isTracking ? '🐾 Walk in progress...' : elapsed > 0 ? '✅ Walk complete' : 'Ready to go?'}
            </Text>
            <View style={styles.timerBtns}>
              {!isTracking && elapsed === 0 && (
                <TouchableOpacity style={styles.startBtn} onPress={startWalk}>
                  <Text style={styles.startBtnText}>Start Walk</Text>
                </TouchableOpacity>
              )}
              {isTracking && (
                <TouchableOpacity style={styles.stopBtn} onPress={stopWalk}>
                  <Text style={styles.stopBtnText}>Stop Walk</Text>
                </TouchableOpacity>
              )}
              {!isTracking && elapsed > 0 && (
                <View style={styles.timerDoneBtns}>
                  <TouchableOpacity style={styles.restartBtn} onPress={() => { setElapsed(0); setStartTime(null); }}>
                    <Text style={styles.restartBtnText}>Restart</Text>
                  </TouchableOpacity>
                  <Text style={styles.timerDoneText}>
                    {Math.round(elapsed / 60)} minutes recorded
                  </Text>
                </View>
              )}
            </View>
          </View>
        ) : (
          <View style={styles.manualSection}>
            <Text style={styles.sectionLabel}>Duration (minutes)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 30"
              placeholderTextColor={Colors.textMuted}
              value={manualMinutes}
              onChangeText={setManualMinutes}
              keyboardType="numeric"
            />
            <Text style={styles.sectionLabel}>Distance (km, optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 2.5"
              placeholderTextColor={Colors.textMuted}
              value={manualKm}
              onChangeText={setManualKm}
              keyboardType="decimal-pad"
            />
          </View>
        )}

        <Text style={styles.sectionLabel}>Notes (optional)</Text>
        <TextInput
          style={[styles.input, styles.textarea]}
          placeholder="How did the walk go?"
          placeholderTextColor={Colors.textMuted}
          value={notes}
          onChangeText={setNotes}
          multiline
          numberOfLines={3}
        />
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
  saveBtn: { backgroundColor: Colors.walk, paddingHorizontal: 16, paddingVertical: 8, borderRadius: Radius.full },
  saveBtnText: { fontFamily: 'Nunito_700Bold', fontSize: 14, color: '#fff' },
  content: { padding: 20 },
  dogName: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 18, color: Colors.textPrimary, marginBottom: 20 },

  modeTabs: {
    flexDirection: 'row', backgroundColor: Colors.surface, borderRadius: Radius.full,
    padding: 4, marginBottom: 28, ...Shadow.sm,
  },
  modeTab: { flex: 1, paddingVertical: 10, borderRadius: Radius.full, alignItems: 'center' },
  modeTabActive: { backgroundColor: Colors.walk },
  modeTabText: { fontFamily: 'Nunito_600SemiBold', fontSize: 14, color: Colors.textMuted },
  modeTabTextActive: { color: '#fff' },

  timerSection: { alignItems: 'center', paddingVertical: 20, marginBottom: 24 },
  timerDisplay: {
    fontFamily: 'PlayfairDisplay_700Bold', fontSize: 64, color: Colors.textPrimary,
    letterSpacing: -2, marginBottom: 8,
  },
  timerSub: { fontFamily: 'Nunito_400Regular', fontSize: 15, color: Colors.textSecondary, marginBottom: 28 },
  timerBtns: { alignItems: 'center', gap: 12 },
  startBtn: {
    backgroundColor: Colors.walk, paddingHorizontal: 48, paddingVertical: 16,
    borderRadius: Radius.full, ...Shadow.md,
  },
  startBtnText: { fontFamily: 'Nunito_700Bold', fontSize: 17, color: '#fff' },
  stopBtn: {
    backgroundColor: Colors.error, paddingHorizontal: 48, paddingVertical: 16,
    borderRadius: Radius.full, ...Shadow.md,
  },
  stopBtnText: { fontFamily: 'Nunito_700Bold', fontSize: 17, color: '#fff' },
  timerDoneBtns: { alignItems: 'center', gap: 12 },
  timerDoneText: { fontFamily: 'Nunito_700Bold', fontSize: 16, color: Colors.walk },
  restartBtn: { paddingVertical: 8 },
  restartBtnText: { fontFamily: 'Nunito_400Regular', fontSize: 14, color: Colors.textMuted },

  manualSection: { marginBottom: 24 },
  sectionLabel: {
    fontFamily: 'Nunito_700Bold', fontSize: 13, color: Colors.textSecondary,
    letterSpacing: 0.4, marginBottom: 8, marginTop: 4,
  },
  input: {
    backgroundColor: Colors.surface, borderRadius: Radius.md, padding: 14,
    fontFamily: 'Nunito_400Regular', fontSize: 15, color: Colors.textPrimary,
    borderWidth: 1, borderColor: Colors.border, marginBottom: 16,
  },
  textarea: { height: 80, textAlignVertical: 'top' },
});