import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  SafeAreaView, Modal, TextInput,
} from 'react-native';
import { Colors, Spacing, Radius, Shadow } from '../../constants/theme';
import { useApp, generateId, PlannedEvent } from '../../context/AppContext';

type EventType = PlannedEvent['type'];

const EVENT_TYPES: { type: EventType; emoji: string; label: string; color: string }[] = [
  { type: 'walk', emoji: '🦮', label: 'Walk', color: Colors.walk },
  { type: 'vet', emoji: '🏥', label: 'Vet', color: Colors.error },
  { type: 'meal', emoji: '🍖', label: 'Meal', color: Colors.meal },
  { type: 'grooming', emoji: '✂️', label: 'Grooming', color: Colors.primaryLight },
  { type: 'medication', emoji: '💊', label: 'Medication', color: Colors.info },
  { type: 'other', emoji: '📌', label: 'Other', color: Colors.textMuted },
];

export default function PlannerScreen() {
  const { state, dispatch, activeDog } = useApp();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showModal, setShowModal] = useState(false);

  const events = activeDog
    ? state.plannedEvents.filter(e => e.dogId === activeDog.id)
    : [];

  const selectedDateStr = selectedDate.toDateString();
  const todayEvents = events.filter(e =>
    new Date(e.dateTime).toDateString() === selectedDateStr
  ).sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime());

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.screenTitle}>Planner</Text>

        {/* Mini calendar */}
        <MiniCalendar
          selected={selectedDate}
          onSelect={setSelectedDate}
          events={events}
        />

        {/* Events for selected day */}
        <View style={styles.dayHeader}>
          <Text style={styles.dayTitle}>
            {selectedDate.toLocaleDateString('en-GB', {
              weekday: 'long', day: 'numeric', month: 'long',
            })}
          </Text>
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => setShowModal(true)}
          >
            <Text style={styles.addBtnText}>+ Add</Text>
          </TouchableOpacity>
        </View>

        {todayEvents.length === 0 ? (
          <View style={styles.emptyDay}>
            <Text style={styles.emptyDayEmoji}>📭</Text>
            <Text style={styles.emptyDayText}>Nothing planned</Text>
            <Text style={styles.emptyDaySub}>Tap + Add to schedule something</Text>
          </View>
        ) : (
          <View style={styles.eventList}>
            {todayEvents.map(event => (
              <EventCard
                key={event.id}
                event={event}
                onComplete={() => dispatch({ type: 'COMPLETE_EVENT', payload: event.id })}
                onDelete={() => dispatch({ type: 'DELETE_PLANNED_EVENT', payload: event.id })}
              />
            ))}
          </View>
        )}

        {/* Upcoming section */}
        <Text style={styles.sectionTitle}>All Upcoming</Text>
        <View style={styles.eventList}>
          {events
            .filter(e => !e.completed && new Date(e.dateTime) >= new Date())
            .sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime())
            .slice(0, 10)
            .map(event => (
              <EventCard
                key={event.id}
                event={event}
                onComplete={() => dispatch({ type: 'COMPLETE_EVENT', payload: event.id })}
                onDelete={() => dispatch({ type: 'DELETE_PLANNED_EVENT', payload: event.id })}
              />
            ))}
        </View>
      </ScrollView>

      {activeDog && (
        <AddEventModal
          visible={showModal}
          onClose={() => setShowModal(false)}
          onAdd={(e) => {
            dispatch({ type: 'ADD_PLANNED_EVENT', payload: { ...e, dogId: activeDog.id, id: generateId() } });
            setShowModal(false);
          }}
          defaultDate={selectedDate}
        />
      )}
    </SafeAreaView>
  );
}

// ─── Mini Calendar ────────────────────────────────────────────────────────────

function MiniCalendar({ selected, onSelect, events }: {
  selected: Date;
  onSelect: (d: Date) => void;
  events: PlannedEvent[];
}) {
  const [viewMonth, setViewMonth] = useState(new Date(selected));

  const year = viewMonth.getFullYear();
  const month = viewMonth.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const eventDates = new Set(
    events.map(e => new Date(e.dateTime).toDateString())
  );

  const cells: (number | null)[] = [
    ...Array(firstDay === 0 ? 6 : firstDay - 1).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const today = new Date();

  const prevMonth = () => setViewMonth(new Date(year, month - 1, 1));
  const nextMonth = () => setViewMonth(new Date(year, month + 1, 1));

  return (
    <View style={styles.calendar}>
      <View style={styles.calHeader}>
        <TouchableOpacity onPress={prevMonth} style={styles.calArrow}>
          <Text style={styles.calArrowText}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.calMonthLabel}>
          {viewMonth.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}
        </Text>
        <TouchableOpacity onPress={nextMonth} style={styles.calArrow}>
          <Text style={styles.calArrowText}>›</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.calDayNames}>
        {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map(d => (
          <Text key={d} style={styles.calDayName}>{d}</Text>
        ))}
      </View>
      <View style={styles.calGrid}>
        {cells.map((day, idx) => {
          if (!day) return <View key={idx} style={styles.calCell} />;
          const date = new Date(year, month, day);
          const isSelected = date.toDateString() === selected.toDateString();
          const isToday = date.toDateString() === today.toDateString();
          const hasEvent = eventDates.has(date.toDateString());

          return (
            <TouchableOpacity
              key={idx}
              style={[
                styles.calCell,
                isSelected && styles.calCellSelected,
                isToday && !isSelected && styles.calCellToday,
              ]}
              onPress={() => onSelect(date)}
            >
              <Text style={[
                styles.calCellText,
                isSelected && styles.calCellTextSelected,
                isToday && !isSelected && styles.calCellTextToday,
              ]}>
                {day}
              </Text>
              {hasEvent && <View style={[styles.calDot, isSelected && { backgroundColor: '#fff' }]} />}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

// ─── Event Card ───────────────────────────────────────────────────────────────

function EventCard({ event, onComplete, onDelete }: {
  event: PlannedEvent;
  onComplete: () => void;
  onDelete: () => void;
}) {
  const meta = EVENT_TYPES.find(t => t.type === event.type) ?? EVENT_TYPES[5];
  const time = new Date(event.dateTime).toLocaleTimeString('en-GB', {
    hour: '2-digit', minute: '2-digit',
  });
  const dateStr = new Date(event.dateTime).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short',
  });

  return (
    <View style={[styles.eventCard, event.completed && styles.eventCardDone, Shadow.sm]}>
      <View style={[styles.eventIconBox, { backgroundColor: meta.color + '22' }]}>
        <Text style={styles.eventEmoji}>{meta.emoji}</Text>
      </View>
      <View style={styles.eventInfo}>
        <Text style={[styles.eventTitle, event.completed && styles.strikethrough]}>
          {event.title}
        </Text>
        <Text style={styles.eventMeta}>{dateStr} · {time}</Text>
        {event.notes && <Text style={styles.eventNotes}>{event.notes}</Text>}
      </View>
      {!event.completed && (
        <TouchableOpacity style={styles.doneBtn} onPress={onComplete}>
          <Text style={styles.doneBtnText}>✓</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

// ─── Add Event Modal ──────────────────────────────────────────────────────────

function AddEventModal({ visible, onClose, onAdd, defaultDate }: {
  visible: boolean;
  onClose: () => void;
  onAdd: (e: Omit<PlannedEvent, 'id' | 'dogId'>) => void;
  defaultDate: Date;
}) {
  const [type, setType] = useState<EventType>('walk');
  const [title, setTitle] = useState('');
  const [time, setTime] = useState('09:00');
  const [notes, setNotes] = useState('');

  const handleAdd = () => {
    const [h, m] = time.split(':').map(Number);
    const dt = new Date(defaultDate);
    dt.setHours(h, m, 0, 0);
    onAdd({ type, title: title || EVENT_TYPES.find(t => t.type === type)!.label, dateTime: dt.toISOString(), notes, completed: false });
    setTitle(''); setTime('09:00'); setNotes('');
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.modal}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.modalCancel}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Add Event</Text>
          <TouchableOpacity onPress={handleAdd}>
            <Text style={styles.modalSave}>Save</Text>
          </TouchableOpacity>
        </View>
        <ScrollView style={styles.modalContent}>
          <Text style={styles.modalLabel}>Type</Text>
          <View style={styles.typeGrid}>
            {EVENT_TYPES.map(t => (
              <TouchableOpacity
                key={t.type}
                style={[styles.typeBtn, type === t.type && { backgroundColor: t.color, borderColor: t.color }]}
                onPress={() => setType(t.type)}
              >
                <Text style={styles.typeBtnEmoji}>{t.emoji}</Text>
                <Text style={[styles.typeBtnLabel, type === t.type && { color: '#fff' }]}>{t.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.modalLabel}>Title</Text>
          <TextInput
            style={styles.modalInput}
            placeholder="e.g. Morning walk with Buddy"
            placeholderTextColor={Colors.textMuted}
            value={title}
            onChangeText={setTitle}
          />

          <Text style={styles.modalLabel}>Time (HH:MM)</Text>
          <TextInput
            style={styles.modalInput}
            placeholder="09:00"
            placeholderTextColor={Colors.textMuted}
            value={time}
            onChangeText={setTime}
            keyboardType="numeric"
          />

          <Text style={styles.modalLabel}>Notes (optional)</Text>
          <TextInput
            style={[styles.modalInput, styles.modalTextarea]}
            placeholder="Any additional notes..."
            placeholderTextColor={Colors.textMuted}
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
          />
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

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

  calendar: {
    marginHorizontal: 20,
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: 16,
    marginBottom: 20,
    ...Shadow.sm,
  },
  calHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  calArrow: { padding: 8 },
  calArrowText: { fontSize: 22, color: Colors.primary },
  calMonthLabel: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 15,
    color: Colors.textPrimary,
  },
  calDayNames: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  calDayName: {
    flex: 1,
    textAlign: 'center',
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 12,
    color: Colors.textMuted,
    paddingVertical: 4,
  },
  calGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  calCell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.sm,
  },
  calCellSelected: { backgroundColor: Colors.primary },
  calCellToday: { backgroundColor: Colors.surfaceWarm },
  calCellText: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 14,
    color: Colors.textPrimary,
  },
  calCellTextSelected: { color: '#fff', fontFamily: 'Nunito_700Bold' },
  calCellTextToday: { color: Colors.primary, fontFamily: 'Nunito_700Bold' },
  calDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.primary,
    position: 'absolute',
    bottom: 4,
  },

  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  dayTitle: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 16,
    color: Colors.textSecondary,
  },
  addBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: Radius.full,
  },
  addBtnText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 14,
    color: '#fff',
  },

  emptyDay: {
    alignItems: 'center',
    paddingVertical: 32,
    marginHorizontal: 20,
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    marginBottom: 24,
  },
  emptyDayEmoji: { fontSize: 36, marginBottom: 8 },
  emptyDayText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  emptyDaySub: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 13,
    color: Colors.textMuted,
  },

  sectionTitle: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 16,
    color: Colors.textSecondary,
    paddingHorizontal: 20,
    marginBottom: 12,
    marginTop: 8,
    letterSpacing: 0.3,
  },

  eventList: {
    paddingHorizontal: 20,
    gap: 10,
    marginBottom: 16,
  },
  eventCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: 14,
    gap: 12,
  },
  eventCardDone: { opacity: 0.5 },
  eventIconBox: {
    width: 44,
    height: 44,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eventEmoji: { fontSize: 22 },
  eventInfo: { flex: 1 },
  eventTitle: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 14,
    color: Colors.textPrimary,
  },
  strikethrough: { textDecorationLine: 'line-through', color: Colors.textMuted },
  eventMeta: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 2,
  },
  eventNotes: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  doneBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.green + '22',
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneBtnText: { fontSize: 16, color: Colors.green },

  // Modal
  modal: { flex: 1, backgroundColor: Colors.background },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  modalCancel: { fontFamily: 'Nunito_400Regular', fontSize: 16, color: Colors.textSecondary },
  modalTitle: { fontFamily: 'Nunito_700Bold', fontSize: 17, color: Colors.textPrimary },
  modalSave: { fontFamily: 'Nunito_700Bold', fontSize: 16, color: Colors.primary },
  modalContent: { padding: 20 },
  modalLabel: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 8,
    marginTop: 16,
    letterSpacing: 0.3,
  },
  modalInput: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: 14,
    fontFamily: 'Nunito_400Regular',
    fontSize: 15,
    color: Colors.textPrimary,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  modalTextarea: { height: 80, textAlignVertical: 'top' },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: Radius.full,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  typeBtnEmoji: { fontSize: 16 },
  typeBtnLabel: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 13,
    color: Colors.textSecondary,
  },
});