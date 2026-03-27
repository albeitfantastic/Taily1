import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, SafeAreaView, TextInput, ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { Colors, Radius, Shadow } from '../../constants/theme';
import { useApp, generateId } from '../../context/AppContext';

type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

const MEAL_TYPES: { type: MealType; emoji: string; label: string }[] = [
  { type: 'breakfast', emoji: '🌅', label: 'Breakfast' },
  { type: 'lunch', emoji: '☀️', label: 'Lunch' },
  { type: 'dinner', emoji: '🌙', label: 'Dinner' },
  { type: 'snack', emoji: '🦴', label: 'Snack' },
];

export default function LogMealModal() {
  const { dispatch, activeDog } = useApp();
  const [mealType, setMealType] = useState<MealType>('breakfast');
  const [food, setFood] = useState('');
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');

  // Auto-detect meal based on time
  const autoMeal = (): MealType => {
    const h = new Date().getHours();
    if (h < 11) return 'breakfast';
    if (h < 15) return 'lunch';
    if (h < 20) return 'dinner';
    return 'snack';
  };

  React.useEffect(() => {
    setMealType(autoMeal());
  }, []);

  const handleSave = () => {
    if (!activeDog) return;
    dispatch({
      type: 'ADD_MEAL_LOG',
      payload: {
        id: generateId(),
        dogId: activeDog.id,
        mealType,
        food: food || 'Regular food',
        amount: amount || '1 portion',
        timestamp: new Date().toISOString(),
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
        <Text style={styles.title}>Log Meal 🍖</Text>
        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          <Text style={styles.saveBtnText}>Save</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {activeDog && <Text style={styles.dogName}>Feeding {activeDog.name}</Text>}

        <Text style={styles.sectionLabel}>Meal Type</Text>
        <View style={styles.mealGrid}>
          {MEAL_TYPES.map(m => (
            <TouchableOpacity
              key={m.type}
              style={[styles.mealBtn, mealType === m.type && styles.mealBtnActive]}
              onPress={() => setMealType(m.type)}
            >
              <Text style={styles.mealEmoji}>{m.emoji}</Text>
              <Text style={[styles.mealLabel, mealType === m.type && styles.mealLabelActive]}>
                {m.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionLabel}>Food</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Royal Canin, chicken & rice..."
          placeholderTextColor={Colors.textMuted}
          value={food}
          onChangeText={setFood}
        />

        <Text style={styles.sectionLabel}>Amount</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. 250g, 1 cup, half portion"
          placeholderTextColor={Colors.textMuted}
          value={amount}
          onChangeText={setAmount}
        />

        <Text style={styles.sectionLabel}>Notes (optional)</Text>
        <TextInput
          style={[styles.input, styles.textarea]}
          placeholder="Finished all of it? Left some?"
          placeholderTextColor={Colors.textMuted}
          value={notes}
          onChangeText={setNotes}
          multiline
          numberOfLines={3}
        />

        <Text style={styles.timeText}>
          🕐 {new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
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
  saveBtn: { backgroundColor: Colors.meal, paddingHorizontal: 16, paddingVertical: 8, borderRadius: Radius.full },
  saveBtnText: { fontFamily: 'Nunito_700Bold', fontSize: 14, color: Colors.textPrimary },
  content: { padding: 20 },
  dogName: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 18, color: Colors.textPrimary, marginBottom: 20 },

  sectionLabel: {
    fontFamily: 'Nunito_700Bold', fontSize: 13, color: Colors.textSecondary,
    letterSpacing: 0.4, marginBottom: 10, marginTop: 4,
  },
  mealGrid: { flexDirection: 'row', gap: 10, marginBottom: 24 },
  mealBtn: {
    flex: 1, alignItems: 'center', paddingVertical: 16, borderRadius: Radius.lg,
    backgroundColor: Colors.surface, borderWidth: 2, borderColor: 'transparent', gap: 8, ...Shadow.sm,
  },
  mealBtnActive: { borderColor: Colors.meal, backgroundColor: Colors.meal + '20' },
  mealEmoji: { fontSize: 24 },
  mealLabel: { fontFamily: 'Nunito_600SemiBold', fontSize: 12, color: Colors.textSecondary },
  mealLabelActive: { color: Colors.accentDark },

  input: {
    backgroundColor: Colors.surface, borderRadius: Radius.md, padding: 14,
    fontFamily: 'Nunito_400Regular', fontSize: 15, color: Colors.textPrimary,
    borderWidth: 1, borderColor: Colors.border, marginBottom: 16,
  },
  textarea: { height: 80, textAlignVertical: 'top' },
  timeText: { fontFamily: 'Nunito_400Regular', fontSize: 13, color: Colors.textMuted, textAlign: 'center' },
});