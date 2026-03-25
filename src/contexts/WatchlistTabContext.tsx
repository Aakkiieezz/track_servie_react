import { createContext, useContext } from "react";
import type { Servie } from "@/types/servie";

interface WatchlistTabContextValue {
    onServieRemoved: (servie: Servie) => void;
    onServieRollback: (servie: Servie) => void;
}

export const WatchlistTabContext = createContext<WatchlistTabContextValue | null>(null);

export const useWatchlistTabContext = (): WatchlistTabContextValue | null => {
    return useContext(WatchlistTabContext);
};