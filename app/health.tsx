import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  SafeAreaView, Modal, TextInput,
} from 'react-native';
import { Colors, Radius, Shadow } from '../constants/theme';
import { useApp, generateId } from '../context/AppContext';

type HealthTab = 'weight' | 'vaccines';

export default function HealthScreen() {
  const { state, dispatch, activeDog } = useApp();
  const [tab, setTab] = useState<HealthTab>('weight');
  const [showWeightModal, setShowWeightModal] = useState(false);
  const [showVaccineModal, setShowVaccineModal] = useState(false);

  if (!activeDog) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.empty}>
          <Text style={styles.emptyEmoji}>❤️</Text>
          <Text style={styles.emptyTitle}>No dog profile yet</Text>
        </View>
      </SafeAreaView>
    );
  }

  const weights = state.weightLogs
    .filter(w => w.dogId === activeDog.id)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const vaccines = state.vaccineLogs
    .filter(v => v.dogId === activeDog.id)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const latestWeight = weights[0]?.weight ?? activeDog.weight;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.screenTitle}>Health</Text>

        {/* Dog overview card */}
        <View style={[styles.overviewCard, Shadow.md]}>
          <View style={styles.overviewLeft}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarEmoji}>🐕</Text>
            </View>
            <View>
              <Text style={styles.overviewName}>{activeDog.name}</Text>
              <Text style={styles.overviewBreed}>{activeDog.breed}</Text>
            </View>
          </View>
          <View style={styles.overviewStats}>
            <StatChip label="Weight" value={`${latestWeight} kg`} emoji="⚖️" />
            <StatChip
              label="Age"
              value={getAge(activeDog.birthday)}
              emoji="🎂"
            />
            <StatChip
              label="Gender"
              value={activeDog.gender === 'male' ? '♂ Male' : '♀ Female'}
              emoji="🐾"
            />
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabs}>
          {(['weight', 'vaccines'] as HealthTab[]).map(t => (
            <TouchableOpacity
              key={t}
              style={[styles.tabBtn, tab === t && styles.tabBtnActive]}
              onPress={() => setTab(t)}
            >
              <Text style={[styles.tabBtnText, tab === t && styles.tabBtnTextActive]}>
                {t === 'weight' ? '⚖️ Weight' : '💉 Vaccines'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Content */}
        {tab === 'weight' ? (
          <WeightSection
            weights={weights}
            onAdd={() => setShowWeightModal(true)}
          />
        ) : (
          <VaccineSection
            vaccines={vaccines}
            onAdd={() => setShowVaccineModal(true)}
          />
        )}
      </ScrollView>

      {/* Modals */}
      <WeightModal
        visible={showWeightModal}
        onClose={() => setShowWeightModal(false)}
        onSave={(w, notes) => {
          dispatch({
            type: 'ADD_WEIGHT_LOG',
            payload: {
              id: generateId(),
              dogId: activeDog.id,
              weight: w,
              date: new Date().toISOString(),
              notes,
            },
          });
          setShowWeightModal(false);
        }}
      />
      <VaccineModal
        visible={showVaccineModal}
        onClose={() => setShowVaccineModal(false)}
        onSave={(name, date, nextDue, vet) => {
          dispatch({
            type: 'ADD_VACCINE_LOG',
            payload: {
              id: generateId(),
              dogId: activeDog.id,
              name,
              date,
              nextDue,
              vet,
            },
          });
          setShowVaccineModal(false);
        }}
      />
    </SafeAreaView>
  );
}

function StatChip({ label, value, emoji }: { label: string; value: string; emoji: string }) {
  return (
    <View style={styles.statChip}>
      <Text style={styles.statEmoji}>{emoji}</Text>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function WeightSection({ weights, onAdd }: any) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Weight Log</Text>
        <TouchableOpacity style={styles.addBtn} onPress={onAdd}>
          <Text style={styles.addBtnText}>+ Log</Text>
        </TouchableOpacity>
      </View>
      {weights.length === 0 ? (
        <EmptySection emoji="⚖️" title="No weight logs yet" sub="Track your dog's weight over time" />
      ) : (
        weights.map((w: any) => (
          <View key={w.id} style={[styles.logRow, Shadow.sm]}>
            <Text style={styles.logEmoji}>⚖️</Text>
            <View style={styles.logInfo}>
              <Text style={styles.logValue}>{w.weight} kg</Text>
              {w.notes && <Text style={styles.logNotes}>{w.notes}</Text>}
            </View>
            <Text style={styles.logDate}>
              {new Date(w.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
            </Text>
          </View>
        ))
      )}
    </View>
  );
}

function VaccineSection({ vaccines, onAdd }: any) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Vaccinations</Text>
        <TouchableOpacity style={styles.addBtn} onPress={onAdd}>
          <Text style={styles.addBtnText}>+ Add</Text>
        </TouchableOpacity>
      </View>
      {vaccines.length === 0 ? (
        <EmptySection emoji="💉" title="No vaccines logged" sub="Track vaccinations and set reminders" />
      ) : (
        vaccines.map((v: any) => (
          <View key={v.id} style={[styles.logRow, Shadow.sm]}>
            <Text style={styles.logEmoji}>💉</Text>
            <View style={styles.logInfo}>
              <Text style={styles.logValue}>{v.name}</Text>
              {v.vet && <Text style={styles.logNotes}>Dr. {v.vet}</Text>}
              {v.nextDue && (
                <Text style={[styles.logNotes, { color: Colors.primary }]}>
                  Next due: {new Date(v.nextDue).toLocaleDateString('en-GB')}
                </Text>
              )}
            </View>
            <Text style={styles.logDate}>
              {new Date(v.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
            </Text>
          </View>
        ))
      )}
    </View>
  );
}

function EmptySection({ emoji, title, sub }: any) {
  return (
    <View style={styles.emptySection}>
      <Text style={{ fontSize: 36, marginBottom: 8 }}>{emoji}</Text>
      <Text style={styles.emptySectionTitle}>{title}</Text>
      <Text style={styles.emptySectionSub}>{sub}</Text>
    </View>
  );
}

function WeightModal({ visible, onClose, onSave }: any) {
  const [weight, setWeight] = useState('');
  const [notes, setNotes] = useState('');
  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.modal}>
        <ModalHeader title="Log Weight" onClose={onClose} onSave={() => { onSave(parseFloat(weight), notes); setWeight(''); setNotes(''); }} />
        <View style={styles.modalBody}>
          <ModalField label="Weight (kg)" value={weight} onChangeText={setWeight} keyboardType="decimal-pad" placeholder="e.g. 12.5" />
          <ModalField label="Notes" value={notes} onChangeText={setNotes} placeholder="Optional notes..." />
        </View>
      </SafeAreaView>
    </Modal>
  );
}

function VaccineModal({ visible, onClose, onSave }: any) {
  const [name, setName] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [nextDue, setNextDue] = useState('');
  const [vet, setVet] = useState('');
  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.modal}>
        <ModalHeader title="Log Vaccine" onClose={onClose} onSave={() => { onSave(name, date, nextDue, vet); setName(''); setNextDue(''); setVet(''); }} />
        <View style={styles.modalBody}>
          <ModalField label="Vaccine Name *" value={name} onChangeText={setName} placeholder="e.g. Rabies, DHPP" />
          <ModalField label="Date (YYYY-MM-DD)" value={date} onChangeText={setDate} placeholder="2024-01-15" keyboardType="numeric" />
          <ModalField label="Next Due (YYYY-MM-DD)" value={nextDue} onChangeText={setNextDue} placeholder="Optional" keyboardType="numeric" />
          <ModalField label="Vet Name" value={vet} onChangeText={setVet} placeholder="Optional" />
        </View>
      </SafeAreaView>
    </Modal>
  );
}

function ModalHeader({ title, onClose, onSave }: any) {
  return (
    <View style={styles.modalHeader}>
      <TouchableOpacity onPress={onClose}><Text style={styles.modalCancel}>Cancel</Text></TouchableOpacity>
      <Text style={styles.modalTitle}>{title}</Text>
      <TouchableOpacity onPress={onSave}><Text style={styles.modalSave}>Save</Text></TouchableOpacity>
    </View>
  );
}

function ModalField({ label, value, onChangeText, placeholder, keyboardType }: any) {
  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={styles.modalLabel}>{label}</Text>
      <TextInput
        style={styles.modalInput}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={Colors.textMuted}
        keyboardType={keyboardType}
      />
    </View>
  );
}

function getAge(birthday: string): string {
  if (!birthday) return 'Unknown';
  const years = Math.floor((Date.now() - new Date(birthday).getTime()) / (1000 * 60 * 60 * 24 * 365));
  const months = Math.floor((Date.now() - new Date(birthday).getTime()) / (1000 * 60 * 60 * 24 * 30)) % 12;
  if (years === 0) return `${months}mo`;
  if (months === 0) return `${years}yr`;
  return `${years}yr ${months}mo`;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { paddingBottom: 40 },
  screenTitle: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 28,
    color: Colors.textPrimary,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },

  overviewCard: {
    marginHorizontal: 20,
    backgroundColor: Colors.primary,
    borderRadius: Radius.xl,
    padding: 20,
    marginBottom: 20,
    gap: 16,
  },
  overviewLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  avatarCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarEmoji: { fontSize: 30 },
  overviewName: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 20,
    color: '#fff',
  },
  overviewBreed: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 14,
    color: 'rgba(255,255,255,0.75)',
    marginTop: 1,
  },
  overviewStats: {
    flexDirection: 'row',
    gap: 8,
  },
  statChip: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: Radius.md,
    padding: 10,
    alignItems: 'center',
    gap: 3,
  },
  statEmoji: { fontSize: 18 },
  statValue: { fontFamily: 'Nunito_700Bold', fontSize: 13, color: '#fff' },
  statLabel: { fontFamily: 'Nunito_400Regular', fontSize: 11, color: 'rgba(255,255,255,0.75)' },

  tabs: {
    flexDirection: 'row',
    marginHorizontal: 20,
    backgroundColor: Colors.surface,
    borderRadius: Radius.full,
    padding: 4,
    marginBottom: 20,
    ...Shadow.sm,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: Radius.full,
    alignItems: 'center',
  },
  tabBtnActive: { backgroundColor: Colors.primary },
  tabBtnText: { fontFamily: 'Nunito_600SemiBold', fontSize: 14, color: Colors.textMuted },
  tabBtnTextActive: { color: '#fff' },

  section: { paddingHorizontal: 20, gap: 10 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  sectionTitle: { fontFamily: 'Nunito_700Bold', fontSize: 16, color: Colors.textSecondary },
  addBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: Radius.full,
  },
  addBtnText: { fontFamily: 'Nunito_700Bold', fontSize: 13, color: '#fff' },

  logRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: 14,
    gap: 12,
  },
  logEmoji: { fontSize: 22 },
  logInfo: { flex: 1 },
  logValue: { fontFamily: 'Nunito_700Bold', fontSize: 15, color: Colors.textPrimary },
  logNotes: { fontFamily: 'Nunito_400Regular', fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  logDate: { fontFamily: 'Nunito_400Regular', fontSize: 12, color: Colors.textMuted },

  emptySection: {
    alignItems: 'center',
    paddingVertical: 32,
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
  },
  emptySectionTitle: { fontFamily: 'Nunito_700Bold', fontSize: 15, color: Colors.textSecondary, marginBottom: 4 },
  emptySectionSub: { fontFamily: 'Nunito_400Regular', fontSize: 13, color: Colors.textMuted },

  empty: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyEmoji: { fontSize: 64, marginBottom: 16 },
  emptyTitle: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 22, color: Colors.textPrimary },

  modal: { flex: 1, backgroundColor: Colors.background },
  modalHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 16, borderBottomWidth: 1, borderBottomColor: Colors.divider,
  },
  modalCancel: { fontFamily: 'Nunito_400Regular', fontSize: 16, color: Colors.textSecondary },
  modalTitle: { fontFamily: 'Nunito_700Bold', fontSize: 17, color: Colors.textPrimary },
  modalSave: { fontFamily: 'Nunito_700Bold', fontSize: 16, color: Colors.primary },
  modalBody: { padding: 20 },
  modalLabel: { fontFamily: 'Nunito_600SemiBold', fontSize: 13, color: Colors.textSecondary, marginBottom: 6 },
  modalInput: {
    backgroundColor: Colors.surface, borderRadius: Radius.md, padding: 14,
    fontFamily: 'Nunito_400Regular', fontSize: 15, color: Colors.textPrimary,
    borderWidth: 1, borderColor: Colors.border,
  },
});