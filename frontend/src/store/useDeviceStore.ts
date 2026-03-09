import { create } from "zustand";

export interface TelemetryPoint {
  lat: number;
  lng: number;
  time: string;
  battery?: number;
  network_type?: string;
}

export interface DeviceState {
  id: string | null;
  apiKey: string | null;
  isStolen: boolean;
  path: TelemetryPoint[];
  liveFeed: TelemetryPoint[];

  // Actions
  setCredentials: (id: string, apiKey: string) => void;
  setStolenStatus: (status: boolean) => void;
  setPath: (path: TelemetryPoint[]) => void;
  addLiveFeedItem: (item: TelemetryPoint) => void;
}

export const useDeviceStore = create<DeviceState>((set) => ({
  id: "00000000-0000-0000-0000-000000000001", // Default Seeded UUID
  apiKey: "secret-key-123",
  isStolen: false,
  path: [],
  liveFeed: [],

  setCredentials: (id, apiKey) => set({ id, apiKey }),
  setStolenStatus: (isStolen) => set({ isStolen }),
  setPath: (path) => set({ path }),
  addLiveFeedItem: (item) =>
    set((state) => ({
      liveFeed: [item, ...state.liveFeed].slice(0, 50), // Keep last 50
    })),
}));
