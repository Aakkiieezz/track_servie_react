import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type CompareMode = "NONE" | "ONLY_MINE" | "ONLY_THEIRS" | "COMMON";

interface FilterState {
    type: string;
    sortBy: string;
    sortDir: string;
    tickedGenres: string[];
    crossedGenres: string[];
    languages: string[];
    statuses: string[];
    compareMode: CompareMode;

    setFilters: (filters: Partial<Omit<FilterState, 'setFilters'>>) => void;
    resetFilters: () => void;
}

const defaultFilters = {
    type: "",
    sortBy: "title",
    sortDir: "asc",
    tickedGenres: [],
    crossedGenres: [],
    languages: [],
    statuses: [],
    compareMode: "NONE" as CompareMode,
};

export const useFilterStore = create<FilterState>()(
    persist(
        (set) => ({
            ...defaultFilters,

            setFilters: (filters) => set((state) => ({ ...state, ...filters })),

            resetFilters: () => set(defaultFilters),
        }),
        {
            name: 'home-filters-storage', // localStorage key
        }
    )
);