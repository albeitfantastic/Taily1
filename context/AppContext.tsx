import React, { createContext, useContext, useReducer, ReactNode } from 'react';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface Dog {
  id: string;
  name: string;
  breed: string;
  birthday: string;      // ISO date string
  weight: number;        // kg
  gender: 'male' | 'female';
  photoUri?: string;
  neutered: boolean;
}

export interface PottyLog {
  id: string;
  dogId: string;
  type: 'pee' | 'poop' | 'both';
  timestamp: string;
  notes?: string;
  success: boolean;
}

export interface WalkLog {
  id: string;
  dogId: string;
  startTime: string;
  endTime?: string;
  durationMinutes: number;
  distanceKm?: number;
  notes?: string;
}

export interface MealLog {
  id: string;
  dogId: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  amount: string;
  food: string;
  timestamp: string;
  notes?: string;
}

export interface DiaryEntry {
  id: string;
  dogId: string;
  date: string;
  mood: 'happy' | 'playful' | 'calm' | 'tired' | 'sick';
  title: string;
  content: string;
  photoUris?: string[];
}

export interface WeightLog {
  id: string;
  dogId: string;
  weight: number;
  date: string;
  notes?: string;
}

export interface VaccineLog {
  id: string;
  dogId: string;
  name: string;
  date: string;
  nextDue?: string;
  vet?: string;
  notes?: string;
}

export interface PlannedEvent {
  id: string;
  dogId: string;
  type: 'walk' | 'vet' | 'meal' | 'grooming' | 'medication' | 'other';
  title: string;
  dateTime: string;
  recurring?: 'daily' | 'weekly' | 'monthly';
  notes?: string;
  completed: boolean;
}

export interface AppState {
  onboardingComplete: boolean;
  activeDogId: string | null;
  dogs: Dog[];
  pottyLogs: PottyLog[];
  walkLogs: WalkLog[];
  mealLogs: MealLog[];
  diaryEntries: DiaryEntry[];
  weightLogs: WeightLog[];
  vaccineLogs: VaccineLog[];
  plannedEvents: PlannedEvent[];
}

// ─── Initial State ────────────────────────────────────────────────────────────

const initialState: AppState = {
  onboardingComplete: false,
  activeDogId: null,
  dogs: [],
  pottyLogs: [],
  walkLogs: [],
  mealLogs: [],
  diaryEntries: [],
  weightLogs: [],
  vaccineLogs: [],
  plannedEvents: [],
};

// ─── Actions ─────────────────────────────────────────────────────────────────

type Action =
  | { type: 'COMPLETE_ONBOARDING' }
  | { type: 'ADD_DOG'; payload: Dog }
  | { type: 'UPDATE_DOG'; payload: Dog }
  | { type: 'SET_ACTIVE_DOG'; payload: string }
  | { type: 'ADD_POTTY_LOG'; payload: PottyLog }
  | { type: 'ADD_WALK_LOG'; payload: WalkLog }
  | { type: 'UPDATE_WALK_LOG'; payload: WalkLog }
  | { type: 'ADD_MEAL_LOG'; payload: MealLog }
  | { type: 'ADD_DIARY_ENTRY'; payload: DiaryEntry }
  | { type: 'UPDATE_DIARY_ENTRY'; payload: DiaryEntry }
  | { type: 'ADD_WEIGHT_LOG'; payload: WeightLog }
  | { type: 'ADD_VACCINE_LOG'; payload: VaccineLog }
  | { type: 'ADD_PLANNED_EVENT'; payload: PlannedEvent }
  | { type: 'COMPLETE_EVENT'; payload: string }
  | { type: 'DELETE_PLANNED_EVENT'; payload: string };

// ─── Reducer ─────────────────────────────────────────────────────────────────

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'COMPLETE_ONBOARDING':
      return { ...state, onboardingComplete: true };

    case 'ADD_DOG':
      return {
        ...state,
        dogs: [...state.dogs, action.payload],
        activeDogId: state.activeDogId ?? action.payload.id,
      };

    case 'UPDATE_DOG':
      return {
        ...state,
        dogs: state.dogs.map(d => d.id === action.payload.id ? action.payload : d),
      };

    case 'SET_ACTIVE_DOG':
      return { ...state, activeDogId: action.payload };

    case 'ADD_POTTY_LOG':
      return { ...state, pottyLogs: [action.payload, ...state.pottyLogs] };

    case 'ADD_WALK_LOG':
      return { ...state, walkLogs: [action.payload, ...state.walkLogs] };

    case 'UPDATE_WALK_LOG':
      return {
        ...state,
        walkLogs: state.walkLogs.map(w => w.id === action.payload.id ? action.payload : w),
      };

    case 'ADD_MEAL_LOG':
      return { ...state, mealLogs: [action.payload, ...state.mealLogs] };

    case 'ADD_DIARY_ENTRY':
      return { ...state, diaryEntries: [action.payload, ...state.diaryEntries] };

    case 'UPDATE_DIARY_ENTRY':
      return {
        ...state,
        diaryEntries: state.diaryEntries.map(e => e.id === action.payload.id ? action.payload : e),
      };

    case 'ADD_WEIGHT_LOG':
      return { ...state, weightLogs: [action.payload, ...state.weightLogs] };

    case 'ADD_VACCINE_LOG':
      return { ...state, vaccineLogs: [action.payload, ...state.vaccineLogs] };

    case 'ADD_PLANNED_EVENT':
      return { ...state, plannedEvents: [...state.plannedEvents, action.payload] };

    case 'COMPLETE_EVENT':
      return {
        ...state,
        plannedEvents: state.plannedEvents.map(e =>
          e.id === action.payload ? { ...e, completed: true } : e
        ),
      };

    case 'DELETE_PLANNED_EVENT':
      return {
        ...state,
        plannedEvents: state.plannedEvents.filter(e => e.id !== action.payload),
      };
      case 'DELETE_POTTY_LOG':
        return {
          ...state,
          pottyLogs: state.pottyLogs.filter((log: any) => log.id !== action.payload.id),
        };
      
      case 'DELETE_WALK_LOG':
        return {
          ...state,
          walkLogs: state.walkLogs.filter((log: any) => log.id !== action.payload.id),
        };
      
      case 'DELETE_MEAL_LOG':
        return {
          ...state,
          mealLogs: state.mealLogs.filter((log: any) => log.id !== action.payload.id),
        };
      
      case 'DELETE_DIARY_ENTRY':
        return {
          ...state,
          diaryEntries: state.diaryEntries.filter((entry: any) => entry.id !== action.payload.id),
        };



    default:
      return state;
  }
}

// ─── Context ─────────────────────────────────────────────────────────────────

interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<Action>;
  activeDog: Dog | undefined;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const activeDog = state.dogs.find(d => d.id === state.activeDogId);

  return (
    <AppContext.Provider value={{ state, dispatch, activeDog }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

export function todayLogs<T extends { timestamp?: string; date?: string; startTime?: string }>(
  logs: T[],
  dogId: string
): T[] {
  const today = new Date().toDateString();
  return (logs as any[]).filter((l: any) => {
    const dateStr = l.timestamp || l.date || l.startTime || '';
    return l.dogId === dogId && new Date(dateStr).toDateString() === today;
  }) as T[];
}
