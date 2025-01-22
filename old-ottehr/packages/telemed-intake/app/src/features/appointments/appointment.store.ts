import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AppointmentState {
  appointmentID?: string;
  appointmentDate?: string;
  visitType?: 'prebook' | 'now';
  visitService?: 'in-person' | 'telemedicine';
  selectedSlot?: string;
  locationID?: string;
  providerID?: string;
  groupID?: string;
  scheduleType?: 'location' | 'provider';
  slug?: string;
}

const APOINTMENT_STATE_INITIAL: AppointmentState = {};

interface AppointmentStateActions {
  setAppointment: (state: Partial<AppointmentState>) => void;
}

export const useAppointmentStore = create<AppointmentState & AppointmentStateActions>()(
  persist((set) => ({ ...APOINTMENT_STATE_INITIAL, setAppointment: (state) => set({ ...state }) }), {
    name: 'telemed-appointment-storage',
  }),
);

export const usePastVisitsStore = create<AppointmentState & AppointmentStateActions>()(
  persist((set) => ({ ...APOINTMENT_STATE_INITIAL, setAppointment: (state) => set({ ...state }) }), {
    name: 'telemed-past-visits-storage',
  }),
);
