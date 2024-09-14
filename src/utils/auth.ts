import { NavigateFunction } from "react-router-dom";

export const isAuthenticated = (): boolean => {
 const token = localStorage.getItem("token");
 return !!token; // Simplified check: returns true if token exists, false otherwise
};

export const handleLogout = (navigate: NavigateFunction) => {
 localStorage.removeItem("token");
 navigate("/login");
};
