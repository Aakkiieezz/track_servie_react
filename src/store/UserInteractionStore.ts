import { create } from "zustand";
import type { UserInteractionDto } from "@/types/UserInteractionDto";
import { fetchUserInteractions } from "@/lib/api";

// ─────────────────────────────────────────────
// Shape stored per item — keyed by "childtype-tmdbId"
// ─────────────────────────────────────────────

export interface UserInteraction {
  completed: boolean | null;
  liked: boolean | null;
  rated: number | null;
  episodesWatched: number | null;
}

type InteractionMap = Record<string, UserInteraction>;

function makeKey(childtype: string, tmdbId: number): string {
  return `${childtype}-${tmdbId}`;
}

// ─────────────────────────────────────────────
// Store
// ─────────────────────────────────────────────

interface InteractionsStore {
  interactions: InteractionMap;
  loaded: boolean;
  loading: boolean;

  // Load all interactions once on app init / login
  load: () => Promise<void>;

  // Get interaction for a single item
  get: (childtype: string, tmdbId: number) => UserInteraction | null;

  // Update a single item locally after a watch/like/rate action
  // Call this immediately after a successful API mutation
  update: (childtype: string, tmdbId: number, patch: Partial<UserInteraction>) => void;

  // Clear on logout
  clear: () => void;
}

export const userInteractionStore = create<InteractionsStore>((set, get) => ({
  interactions: {},
  loaded: false,
  loading: false,

  load: async () => {
    if (get().loaded || get().loading) return;
    set({ loading: true });
    try {
      const data: UserInteractionDto[] = await fetchUserInteractions();
      const map: InteractionMap = {};
      for (const item of data) {
        map[makeKey(item.childtype, item.tmdbId)] = {
          completed: item.completed,
          liked: item.liked,
          rated: item.rated,
          episodesWatched: item.episodesWatched,
        };
      }
      set({ interactions: map, loaded: true, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  get: (childtype, tmdbId) => {
    return get().interactions[makeKey(childtype, tmdbId)] ?? null;
  },

  update: (childtype, tmdbId, patch) => {
    const key = makeKey(childtype, tmdbId);
    set((state) => ({
      interactions: {
        ...state.interactions,
        [key]: {
          ...(state.interactions[key] ?? {
            completed: null, liked: null, rated: null, episodesWatched: null,
          }),
          ...patch,
        },
      },
    }));
  },

  clear: () => set({ interactions: {}, loaded: false, loading: false }),
}));