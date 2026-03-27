import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, Dimensions, TouchableOpacity,
  ScrollView, TextInput, Animated, Image,
} from 'react-native';
import { router } from 'expo-router';
import { Colors, Typography, Spacing, Radius, Shadow } from '../constants/theme';
import { useApp, generateId } from '../context/AppContext';

const { width, height } = Dimensions.get('window');

const SLIDES = [
  {
    id: 0,
    emoji: '🐾',
    title: 'Welcome to Taily',
    subtitle: 'Your dog\'s diary, planner & wellness companion — all in one warm little app.',
    bg: Colors.primary,
  },
  {
    id: 1,
    emoji: '📓',
    title: 'Track everything that matters',
    subtitle: 'Potty breaks, walks, meals, health logs, and a diary to capture every precious moment.',
    bg: Colors.secondary,
  },
  {
    id: 2,
    emoji: '🐶',
    title: 'Let\'s meet your dog!',
    subtitle: 'Tell us a little about your furry friend so we can personalise Taily just for them.',
    bg: Colors.green,
  },
];

interface DogForm {
  name: string;
  breed: string;
  birthday: string;
  weight: string;
  gender: 'male' | 'female';
}

export default function OnboardingScreen() {
  const { dispatch } = useApp();
  const [step, setStep] = useState(0);
  const scrollRef = useRef<ScrollView>(null);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const [form, setForm] = useState<DogForm>({
    name: '',
    breed: '',
    birthday: '',
    weight: '',
    gender: 'male',
  });

  const goToStep = (next: number) => {
    Animated.sequence([
      Animated.timing(fadeAnim, { toValue: 0, duration: 150, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 250, useNativeDriver: true }),
    ]).start();
    setStep(next);
  };

  const handleComplete = () => {
    if (!form.name.trim()) return;
    const dog = {
      id: generateId(),
      name: form.name.trim(),
      breed: form.breed.trim() || 'Mixed breed',
      birthday: form.birthday || new Date().toISOString().split('T')[0],
      weight: parseFloat(form.weight) || 0,
      gender: form.gender,
      neutered: false,
    };
    dispatch({ type: 'ADD_DOG', payload: dog });
    dispatch({ type: 'COMPLETE_ONBOARDING' });
    router.replace('/(tabs)');
  };

  const slide = SLIDES[step];

  return (
    <View style={[styles.container, { backgroundColor: slide.bg }]}>
      {/* Progress dots */}
      <View style={styles.dots}>
        {SLIDES.map((_, i) => (
          <View
            key={i}
            style={[styles.dot, { opacity: i === step ? 1 : 0.35, width: i === step ? 24 : 8 }]}
          />
        ))}
      </View>

      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        {step < 2 ? (
          <>
            <Text style={styles.emoji}>{slide.emoji}</Text>
            <Text style={styles.title}>{slide.title}</Text>
            <Text style={styles.subtitle}>{slide.subtitle}</Text>
          </>
        ) : (
          <DogSetupForm form={form} setForm={setForm} />
        )}
      </Animated.View>

      {/* Bottom action */}
      <View style={styles.footer}>
        {step < 2 ? (
          <TouchableOpacity style={styles.nextBtn} onPress={() => goToStep(step + 1)}>
            <Text style={styles.nextBtnText}>Continue →</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.nextBtn, !form.name && styles.nextBtnDisabled]}
            onPress={handleComplete}
            disabled={!form.name}
          >
            <Text style={styles.nextBtnText}>Meet {form.name || 'your pup'} 🐾</Text>
          </TouchableOpacity>
        )}

        {step > 0 && (
          <TouchableOpacity onPress={() => goToStep(step - 1)} style={styles.backBtn}>
            <Text style={styles.backBtnText}>← Back</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

function DogSetupForm({ form, setForm }: { form: DogForm; setForm: (f: DogForm) => void }) {
  return (
    <ScrollView showsVerticalScrollIndicator={false} style={styles.formScroll}>
      <Text style={styles.formTitle}>Add your dog</Text>

      <View style={styles.formCard}>
        <FormField
          label="Name *"
          placeholder="What's their name?"
          value={form.name}
          onChangeText={(v) => setForm({ ...form, name: v })}
          autoFocus
        />
        <FormField
          label="Breed"
          placeholder="e.g. Golden Retriever"
          value={form.breed}
          onChangeText={(v) => setForm({ ...form, breed: v })}
        />
        <FormField
          label="Birthday"
          placeholder="YYYY-MM-DD"
          value={form.birthday}
          onChangeText={(v) => setForm({ ...form, birthday: v })}
          keyboardType="numeric"
        />
        <FormField
          label="Weight (kg)"
          placeholder="e.g. 12.5"
          value={form.weight}
          onChangeText={(v) => setForm({ ...form, weight: v })}
          keyboardType="decimal-pad"
        />

        <Text style={styles.fieldLabel}>Gender</Text>
        <View style={styles.genderRow}>
          {(['male', 'female'] as const).map((g) => (
            <TouchableOpacity
              key={g}
              style={[styles.genderBtn, form.gender === g && styles.genderBtnActive]}
              onPress={() => setForm({ ...form, gender: g })}
            >
              <Text style={[styles.genderBtnText, form.gender === g && styles.genderBtnTextActive]}>
                {g === 'male' ? '♂ Male' : '♀ Female'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

function FormField({
  label, placeholder, value, onChangeText, keyboardType, autoFocus,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (v: string) => void;
  keyboardType?: any;
  autoFocus?: boolean;
}) {
  return (
    <View style={styles.fieldContainer}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={styles.fieldInput}
        placeholder={placeholder}
        placeholderTextColor={Colors.textMuted}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        autoFocus={autoFocus}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 64,
    gap: 6,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.9)',
  },
  content: {
    flex: 1,
    paddingHorizontal: 32,
    paddingTop: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emoji: {
    fontSize: 80,
    marginBottom: 28,
  },
  title: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 32,
    lineHeight: 40,
    color: '#FFF',
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 17,
    lineHeight: 26,
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'center',
  },
  footer: {
    padding: 32,
    paddingBottom: 48,
    alignItems: 'center',
    gap: 12,
  },
  nextBtn: {
    backgroundColor: 'rgba(255,255,255,0.22)',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.6)',
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: Radius.full,
    width: '100%',
    alignItems: 'center',
  },
  nextBtnDisabled: {
    opacity: 0.4,
  },
  nextBtnText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 17,
    color: '#FFF',
  },
  backBtn: {
    paddingVertical: 8,
  },
  backBtnText: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 15,
    color: 'rgba(255,255,255,0.7)',
  },

  // Form
  formScroll: {
    flex: 1,
    width: '100%',
  },
  formTitle: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 28,
    color: '#FFF',
    marginBottom: 20,
    textAlign: 'center',
  },
  formCard: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: Radius.xl,
    padding: 20,
    gap: 4,
  },
  fieldContainer: {
    marginBottom: 14,
  },
  fieldLabel: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 6,
    letterSpacing: 0.3,
  },
  fieldInput: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: Radius.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontFamily: 'Nunito_400Regular',
    fontSize: 16,
    color: Colors.textPrimary,
  },
  genderRow: {
    flexDirection: 'row',
    gap: 10,
  },
  genderBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: Radius.md,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  genderBtnActive: {
    backgroundColor: '#FFF',
    borderColor: '#FFF',
  },
  genderBtnText: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 15,
    color: 'rgba(255,255,255,0.8)',
  },
  genderBtnTextActive: {
    color: Colors.green,
  },
});