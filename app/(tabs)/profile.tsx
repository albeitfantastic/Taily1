import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  SafeAreaView, Modal, TextInput,
} from 'react-native';
import { Colors, Radius, Shadow } from '../../constants/theme';
import { useApp, Dog, generateId } from '../../context/AppContext';

export default function ProfileScreen() {
  const { state, dispatch, activeDog } = useApp();
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.screenTitle}>Profile</Text>

        {activeDog ? (
          <>
            {/* Dog card */}
            <View style={[styles.dogCard, Shadow.md]}>
              <View style={styles.dogCardTop}>
                <View style={styles.dogAvatar}>
                  <Text style={styles.dogAvatarEmoji}>🐕</Text>
                </View>
                <View style={styles.dogInfo}>
                  <Text style={styles.dogName}>{activeDog.name}</Text>
                  <Text style={styles.dogBreed}>{activeDog.breed}</Text>
                  <Text style={styles.dogDetails}>
                    {activeDog.gender === 'male' ? '♂' : '♀'} ·{' '}
                    {activeDog.birthday
                      ? getAge(activeDog.birthday)
                      : 'Age unknown'}{' '}
                    · {activeDog.weight > 0 ? `${activeDog.weight} kg` : 'Weight unknown'}
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.editBtn}
                onPress={() => setShowEditModal(true)}
              >
                <Text style={styles.editBtnText}>Edit Profile</Text>
              </TouchableOpacity>
            </View>

            {/* Stats summary */}
            <Text style={styles.sectionLabel}>All Time Stats</Text>
            <View style={styles.statsGrid}>
              <StatTile emoji="💧" label="Potty Logs" count={state.pottyLogs.filter(l => l.dogId === activeDog.id).length} color={Colors.potty} />
              <StatTile emoji="🦮" label="Walks" count={state.walkLogs.filter(l => l.dogId === activeDog.id).length} color={Colors.walk} />
              <StatTile emoji="🍖" label="Meals" count={state.mealLogs.filter(l => l.dogId === activeDog.id).length} color={Colors.meal} />
              <StatTile emoji="📓" label="Diary Entries" count={state.diaryEntries.filter(l => l.dogId === activeDog.id).length} color={Colors.diary} />
            </View>

            {/* Multiple dogs */}
            {state.dogs.length > 1 && (
              <>
                <Text style={styles.sectionLabel}>Your Dogs</Text>
                <View style={styles.dogList}>
                  {state.dogs.map(dog => (
                    <TouchableOpacity
                      key={dog.id}
                      style={[styles.dogListItem, dog.id === activeDog.id && styles.dogListItemActive]}
                      onPress={() => dispatch({ type: 'SET_ACTIVE_DOG', payload: dog.id })}
                    >
                      <Text style={styles.dogListEmoji}>🐕</Text>
                      <View style={styles.dogListInfo}>
                        <Text style={styles.dogListName}>{dog.name}</Text>
                        <Text style={styles.dogListBreed}>{dog.breed}</Text>
                      </View>
                      {dog.id === activeDog.id && (
                        <View style={styles.activeDot} />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            )}

            <TouchableOpacity style={styles.addDogBtn} onPress={() => setShowAddModal(true)}>
              <Text style={styles.addDogBtnText}>+ Add Another Dog</Text>
            </TouchableOpacity>
          </>
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🐾</Text>
            <Text style={styles.emptyTitle}>No dog added yet</Text>
            <TouchableOpacity style={styles.addDogBtn} onPress={() => setShowAddModal(true)}>
              <Text style={styles.addDogBtnText}>+ Add Your Dog</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {activeDog && (
        <EditDogModal
          visible={showEditModal}
          dog={activeDog}
          onClose={() => setShowEditModal(false)}
          onSave={(updated) => {
            dispatch({ type: 'UPDATE_DOG', payload: updated });
            setShowEditModal(false);
          }}
        />
      )}
      <AddDogModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={(dog) => {
          dispatch({ type: 'ADD_DOG', payload: dog });
          setShowAddModal(false);
        }}
      />
    </SafeAreaView>
  );
}

function StatTile({ emoji, label, count, color }: any) {
  return (
    <View style={[styles.statTile, { borderLeftColor: color, borderLeftWidth: 3 }, Shadow.sm]}>
      <Text style={styles.statEmoji}>{emoji}</Text>
      <Text style={[styles.statCount, { color }]}>{count}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function EditDogModal({ visible, dog, onClose, onSave }: {
  visible: boolean;
  dog: Dog;
  onClose: () => void;
  onSave: (d: Dog) => void;
}) {
  const [form, setForm] = useState({ ...dog, weight: String(dog.weight), birthday: dog.birthday });
  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.modal}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={onClose}><Text style={styles.modalCancel}>Cancel</Text></TouchableOpacity>
          <Text style={styles.modalTitle}>Edit Profile</Text>
          <TouchableOpacity onPress={() => onSave({ ...form, weight: parseFloat(form.weight) || 0 })}>
            <Text style={styles.modalSave}>Save</Text>
          </TouchableOpacity>
        </View>
        <ScrollView style={styles.modalBody}>
          <DogFormFields form={form} setForm={(f: any) => setForm(f)} />
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

function AddDogModal({ visible, onClose, onAdd }: any) {
  const [form, setForm] = useState({ name: '', breed: '', birthday: '', weight: '', gender: 'male' as const });
  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.modal}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={onClose}><Text style={styles.modalCancel}>Cancel</Text></TouchableOpacity>
          <Text style={styles.modalTitle}>Add Dog</Text>
          <TouchableOpacity onPress={() => {
            if (!form.name) return;
            onAdd({ ...form, id: generateId(), weight: parseFloat(form.weight) || 0, neutered: false });
            setForm({ name: '', breed: '', birthday: '', weight: '', gender: 'male' });
          }}>
            <Text style={styles.modalSave}>Add</Text>
          </TouchableOpacity>
        </View>
        <ScrollView style={styles.modalBody}>
          <DogFormFields form={form} setForm={setForm} />
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

function DogFormFields({ form, setForm }: any) {
  const f = (field: string) => (val: string) => setForm({ ...form, [field]: val });
  return (
    <>
      <MF label="Name *" value={form.name} onChange={f('name')} placeholder="Dog's name" />
      <MF label="Breed" value={form.breed} onChange={f('breed')} placeholder="e.g. Golden Retriever" />
      <MF label="Birthday (YYYY-MM-DD)" value={form.birthday} onChange={f('birthday')} placeholder="2021-03-15" keyboardType="numeric" />
      <MF label="Weight (kg)" value={form.weight} onChange={f('weight')} placeholder="e.g. 12.5" keyboardType="decimal-pad" />
      <Text style={styles.mfLabel}>Gender</Text>
      <View style={{ flexDirection: 'row', gap: 10, marginBottom: 16 }}>
        {(['male', 'female'] as const).map(g => (
          <TouchableOpacity
            key={g}
            style={[styles.gBtn, form.gender === g && styles.gBtnActive]}
            onPress={() => setForm({ ...form, gender: g })}
          >
            <Text style={[styles.gBtnText, form.gender === g && styles.gBtnTextActive]}>
              {g === 'male' ? '♂ Male' : '♀ Female'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </>
  );
}

function MF({ label, value, onChange, placeholder, keyboardType }: any) {
  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={styles.mfLabel}>{label}</Text>
      <TextInput
        style={styles.mfInput}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={Colors.textMuted}
        keyboardType={keyboardType}
      />
    </View>
  );
}

function getAge(birthday: string): string {
  if (!birthday) return '';
  const years = Math.floor((Date.now() - new Date(birthday).getTime()) / (1000 * 60 * 60 * 24 * 365));
  return years === 0 ? 'Puppy' : `${years}y old`;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { paddingBottom: 40 },
  screenTitle: {
    fontFamily: 'PlayfairDisplay_700Bold', fontSize: 28, color: Colors.textPrimary,
    paddingHorizontal: 20, paddingTop: 20, paddingBottom: 16,
  },

  dogCard: {
    marginHorizontal: 20, backgroundColor: Colors.surface,
    borderRadius: Radius.xl, padding: 20, marginBottom: 20,
  },
  dogCardTop: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 16 },
  dogAvatar: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: Colors.surfaceWarm, alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: Colors.primaryLight,
  },
  dogAvatarEmoji: { fontSize: 38 },
  dogInfo: { flex: 1 },
  dogName: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 22, color: Colors.textPrimary },
  dogBreed: { fontFamily: 'Nunito_400Regular', fontSize: 14, color: Colors.textSecondary, marginTop: 2 },
  dogDetails: { fontFamily: 'Nunito_600SemiBold', fontSize: 13, color: Colors.textMuted, marginTop: 4 },
  editBtn: {
    borderWidth: 1.5, borderColor: Colors.primary,
    paddingVertical: 10, borderRadius: Radius.full, alignItems: 'center',
  },
  editBtnText: { fontFamily: 'Nunito_700Bold', fontSize: 14, color: Colors.primary },

  sectionLabel: {
    fontFamily: 'Nunito_700Bold', fontSize: 14, color: Colors.textMuted,
    paddingHorizontal: 20, marginBottom: 12, letterSpacing: 0.5, textTransform: 'uppercase',
  },
  statsGrid: {
    flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, gap: 10, marginBottom: 28,
  },
  statTile: {
    width: '47%', backgroundColor: Colors.surface, borderRadius: Radius.md, padding: 14, gap: 4,
  },
  statEmoji: { fontSize: 22, marginBottom: 4 },
  statCount: { fontFamily: 'Nunito_700Bold', fontSize: 22 },
  statLabel: { fontFamily: 'Nunito_400Regular', fontSize: 12, color: Colors.textMuted },

  dogList: { marginHorizontal: 20, gap: 8, marginBottom: 16 },
  dogListItem: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: Colors.surface, borderRadius: Radius.md, padding: 14,
    borderWidth: 1.5, borderColor: 'transparent',
  },
  dogListItemActive: { borderColor: Colors.primary },
  dogListEmoji: { fontSize: 28 },
  dogListInfo: { flex: 1 },
  dogListName: { fontFamily: 'Nunito_700Bold', fontSize: 15, color: Colors.textPrimary },
  dogListBreed: { fontFamily: 'Nunito_400Regular', fontSize: 12, color: Colors.textMuted },
  activeDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.primary },

  addDogBtn: {
    marginHorizontal: 20, borderWidth: 1.5, borderColor: Colors.primary,
    borderStyle: 'dashed', paddingVertical: 14, borderRadius: Radius.lg, alignItems: 'center',
  },
  addDogBtnText: { fontFamily: 'Nunito_700Bold', fontSize: 15, color: Colors.primary },

  emptyState: { flex: 1, alignItems: 'center', paddingTop: 60, paddingHorizontal: 40 },
  emptyEmoji: { fontSize: 64, marginBottom: 16 },
  emptyTitle: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 22, color: Colors.textPrimary, marginBottom: 24 },

  modal: { flex: 1, backgroundColor: Colors.background },
  modalHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 16, borderBottomWidth: 1, borderBottomColor: Colors.divider,
  },
  modalCancel: { fontFamily: 'Nunito_400Regular', fontSize: 16, color: Colors.textSecondary },
  modalTitle: { fontFamily: 'Nunito_700Bold', fontSize: 17, color: Colors.textPrimary },
  modalSave: { fontFamily: 'Nunito_700Bold', fontSize: 16, color: Colors.primary },
  modalBody: { padding: 20 },
  mfLabel: { fontFamily: 'Nunito_600SemiBold', fontSize: 13, color: Colors.textSecondary, marginBottom: 6 },
  mfInput: {
    backgroundColor: Colors.surface, borderRadius: Radius.md, padding: 14,
    fontFamily: 'Nunito_400Regular', fontSize: 15, color: Colors.textPrimary,
    borderWidth: 1, borderColor: Colors.border,
  },
  gBtn: {
    flex: 1, paddingVertical: 12, borderRadius: Radius.md, alignItems: 'center',
    borderWidth: 1.5, borderColor: Colors.border, backgroundColor: Colors.surface,
  },
  gBtnActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  gBtnText: { fontFamily: 'Nunito_600SemiBold', fontSize: 14, color: Colors.textSecondary },
  gBtnTextActive: { color: '#fff' },
});