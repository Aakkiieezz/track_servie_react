import { createContext, useContext } from "react";
import type { Servie } from "@/types/servie";

interface ListPageContextValue {
    listId: number;
    onServieRemoved: (servie: Servie) => void;
    onServieRollback: (servie: Servie) => void;
}

export const ListPageContext = createContext<ListPageContextValue | null>(null);

export const useListPageContext = (): ListPageContextValue | null => {
    return useContext(ListPageContext);
};