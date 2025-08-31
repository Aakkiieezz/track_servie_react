import { NavigateFunction } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

interface JwtPayload {
 exp: number;
}

export const isAuthenticated = (): boolean => {
 const token = localStorage.getItem("token");
 if (!token) return false;
 try {
  const decoded = jwtDecode<JwtPayload>(token);
  return decoded.exp > Date.now() / 1000;
 } catch (error) {
  return false;
 }
};

export const handleLogout = (navigate: NavigateFunction) => {
 localStorage.removeItem("token");
 localStorage.removeItem("username");
 localStorage.removeItem("profileImgUrl");
 navigate("/login");
};
