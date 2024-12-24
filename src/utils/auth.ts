import { NavigateFunction } from "react-router-dom";

export const isAuthenticated = (): boolean => {
 const token = localStorage.getItem("token");
 return !!token;
};

export const handleLogout = (navigate: NavigateFunction) => {
 localStorage.removeItem("token");
 localStorage.removeItem("username");
 localStorage.removeItem("profileImgUrl");
 navigate("/login");
};
