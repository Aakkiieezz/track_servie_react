import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Keyword {
    id: number;
    name: string;
}

interface WatchlistFilterState {
    type: string;
    sortBy: string;
    sortDir: "asc" | "desc";
    tickedGenres: string[];
    crossedGenres: string[];
    languages: string[];
    statuses: string[];
    selectedKeywords: Keyword[];
    rejectedKeywords: Keyword[];

    // Actions
    setFilters: (filters: {
        type: string;
        sortBy: string;
        sortDir: "asc" | "desc";
        tickedGenres: string[];
        crossedGenres: string[];
        languages: string[];
        statuses: string[];
        selectedKeywords: Keyword[];
        rejectedKeywords: Keyword[];
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
    selectedKeywords: [],
    rejectedKeywords: [],
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