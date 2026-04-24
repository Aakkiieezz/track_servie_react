import { create } from "zustand";
import { persist } from "zustand/middleware";

interface WatchlistFilterState {
    type: string;
    sortBy: string;
    sortDir: "asc" | "desc";
    tickedGenres: string[];
    crossedGenres: string[];
    languages: string[];
    statuses: string[];

    // Actions
    setFilters: (filters: {
        type: string;
        sortBy: string;
        sortDir: "asc" | "desc";
        tickedGenres: string[];
        crossedGenres: string[];
        languages: string[];
        statuses: string[];
    }) => void;

    resetFilters: () => void;
}

const initialState = {
    type: "",
    sortBy: "title",
    sortDir: "asc" as const,
    tickedGenres: [],
    crossedGenres: [],
    languages: [],
    statuses: [],
};

export const useWatchlistFilterStore = create<WatchlistFilterState>()(
    persist(
        (set) => ({
            ...initialState,

            setFilters: (filters) => set(filters),

            resetFilters: () => set(initialState),
        }),
        {
            name: "watchlist-filters", // localStorage key
        }
    )
);