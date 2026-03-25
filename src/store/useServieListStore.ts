import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axiosInstance from '../utils/axiosInstance';

interface ListDto2 {
    id: number;
    name: string;
    description: string;
    totalServiesCount: number;
}

interface ServieListStore {
    // List mappings
    servieListMap: Record<string, number[]>;
    listDetails: ListDto2[];
    hasFetched: boolean;

    // Watchlist
    watchlistKeys: string[];
    hasWatchlistFetched: boolean;

    // List actions
    fetchAllServieLists: () => Promise<void>;
    fetchListDetails: () => Promise<void>;
    setServieListIds: (servieKey: string, listIds: number[]) => void;
    addListId: (servieKey: string, listId: number) => void;
    removeListId: (servieKey: string, listId: number) => void;
    updateListCount: (listId: number, change: number) => void;
    setListDetails: (lists: ListDto2[]) => void;

    // Watchlist actions
    fetchWatchlistKeys: () => Promise<void>;
    isOnWatchlist: (servieKey: string) => boolean;
    addToWatchlist: (servieKey: string) => void;
    removeFromWatchlist: (servieKey: string) => void;

    clearAll: () => void;
}

export const useServieListStore = create<ServieListStore>()(
    persist(
        (set, get) => ({
            // List mappings
            servieListMap: {},
            listDetails: [],
            hasFetched: false,

            // Watchlist
            watchlistKeys: [],
            hasWatchlistFetched: false,

            fetchAllServieLists: async () => {
                if (get().hasFetched) return;
                try {
                    const response = await axiosInstance.get<Record<string, number[]>>('/list/servie-mappings');
                    set({ servieListMap: response.data, hasFetched: true });
                } catch (error) {
                    console.error('Failed to fetch servie list map:', error);
                }
            },

            fetchListDetails: async () => {
                try {
                    const response = await axiosInstance.get<{ lists: ListDto2[] }>('/list/all');
                    set({ listDetails: response.data.lists });
                } catch (error) {
                    console.error('Failed to fetch list details:', error);
                }
            },

            setServieListIds: (servieKey, listIds) =>
                set((state) => ({
                    servieListMap: { ...state.servieListMap, [servieKey]: listIds },
                })),

            addListId: (servieKey, listId) => {
                set((state) => {
                    const currentLists = state.servieListMap[servieKey] || [];
                    const updatedListDetails = state.listDetails.map(list =>
                        list.id === listId
                            ? { ...list, totalServiesCount: list.totalServiesCount + 1 }
                            : list
                    );
                    return {
                        servieListMap: { ...state.servieListMap, [servieKey]: [...currentLists, listId] },
                        listDetails: updatedListDetails
                    };
                });
            },

            removeListId: (servieKey, listId) => {
                set((state) => {
                    const currentLists = state.servieListMap[servieKey] || [];
                    const updatedListDetails = state.listDetails.map(list =>
                        list.id === listId
                            ? { ...list, totalServiesCount: Math.max(0, list.totalServiesCount - 1) }
                            : list
                    );
                    return {
                        servieListMap: { ...state.servieListMap, [servieKey]: currentLists.filter(id => id !== listId) },
                        listDetails: updatedListDetails
                    };
                });
            },

            updateListCount: (listId, change) => {
                set((state) => ({
                    listDetails: state.listDetails.map(list =>
                        list.id === listId
                            ? { ...list, totalServiesCount: Math.max(0, list.totalServiesCount + change) }
                            : list
                    )
                }));
            },

            setListDetails: (lists) => set({ listDetails: lists }),

            // Watchlist
            fetchWatchlistKeys: async () => {
                if (get().hasWatchlistFetched) return;
                try {
                    const response = await axiosInstance.get<string[]>('/list/watchlist-keys');
                    set({ watchlistKeys: response.data, hasWatchlistFetched: true });
                } catch (error) {
                    console.error('Failed to fetch watchlist keys:', error);
                }
            },

            isOnWatchlist: (servieKey) => get().watchlistKeys.includes(servieKey),

            addToWatchlist: (servieKey) =>
                set((state) => ({
                    watchlistKeys: state.watchlistKeys.includes(servieKey)
                        ? state.watchlistKeys
                        : [...state.watchlistKeys, servieKey],
                })),

            removeFromWatchlist: (servieKey) =>
                set((state) => ({
                    watchlistKeys: state.watchlistKeys.filter(k => k !== servieKey),
                })),

            clearAll: () => set({
                servieListMap: {},
                listDetails: [],
                hasFetched: false,
                watchlistKeys: [],
                hasWatchlistFetched: false,
            }),
        }),
        {
            name: 'servie-list-storage',
        }
    )
);