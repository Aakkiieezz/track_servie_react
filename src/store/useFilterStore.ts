import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface FilterState {
    type: string;
    sortBy: string;
    sortDir: string;
    tickedGenres: string[];
    crossedGenres: string[];
    languages: string[];
    statuses: string[];

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