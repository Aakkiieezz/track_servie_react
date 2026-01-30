import React, { createContext, useContext, useState } from "react";

export type AlertType = {
    type: string;      // "success" | "danger" | etc.
    message: string;
} | null;

interface AlertContextType {
    alert: AlertType;
    setAlert: (alert: AlertType) => void;
}

const AlertContext = createContext<AlertContextType>({
    alert: null,
    setAlert: () => { }
});

export const AlertProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [alert, setAlert] = useState<AlertType>(null);

    return (
        <AlertContext.Provider value={{ alert, setAlert }}>
            {children}
        </AlertContext.Provider>
    );
};

// Custom hook for easier usage
export const useAlert = () => useContext(AlertContext);
