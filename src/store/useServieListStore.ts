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
    servieListMap: Record<string, number[]>;
    listDetails: ListDto2[];
    hasFetched: boolean;

    fetchAllServieLists: () => Promise<void>;
    fetchListDetails: () => Promise<void>;
    setServieListIds: (servieKey: string, listIds: number[]) => void;
    addListId: (servieKey: string, listId: number) => void;
    removeListId: (servieKey: string, listId: number) => void;
    updateListCount: (listId: number, change: number) => void;
    setListDetails: (lists: ListDto2[]) => void;
    clearAll: () => void;
}

export const useServieListStore = create<ServieListStore>()(
    persist(
        (set, get) => ({
            servieListMap: {},
            
            listDetails: [], // Initialize as empty array

            hasFetched: false,

            fetchAllServieLists: async () => {
                if (get().hasFetched)
                    return; // ✅ already fetched, skip

                try {
                    const response = await axiosInstance.get<Record<string, number[]>>('/list/servie-mappings');
                    set({ 
                        servieListMap: response.data, 
                        hasFetched: true
                    });
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
                    const newLists = [...currentLists, listId];

                    // Update counts
                    const updatedListDetails = state.listDetails.map(list =>
                        list.id === listId
                            ? { ...list, totalServiesCount: list.totalServiesCount + 1 }
                            : list
                    );

                    return {
                        servieListMap: { ...state.servieListMap, [servieKey]: newLists },
                        listDetails: updatedListDetails
                    };
                });
            },

            removeListId: (servieKey, listId) => {
                set((state) => {
                    const currentLists = state.servieListMap[servieKey] || [];
                    const newLists = currentLists.filter(id => id !== listId);

                    // Update counts
                    const updatedListDetails = state.listDetails.map(list =>
                        list.id === listId
                            ? { ...list, totalServiesCount: Math.max(0, list.totalServiesCount - 1) }
                            : list
                    );

                    return {
                        servieListMap: { ...state.servieListMap, [servieKey]: newLists },
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

            setListDetails: (lists) => {
                set({ listDetails: lists });
            },

            clearAll: () => set({ 
                servieListMap: {}, 
                listDetails: [], 
                hasFetched: false 
            }),
        }),
        {
            name: 'servie-list-storage', // LocalStorage key
        }
    )
);
