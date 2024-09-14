import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import {
 createBrowserRouter,
 RouterProvider,
 Navigate,
} from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "bootstrap/dist/css/bootstrap.css";

import HomePage from "./pages/HomePage.tsx";
import NotFoundPage from "./pages/NotFoundPage.tsx";
import LoginPage from "./pages/LoginPage.tsx";
import RegisterPage from "./pages/RegisterPage.tsx";
import ProfilePage from "./components/ProfilePage.tsx";
import { isAuthenticated } from "./utils/auth";

const PrivateRoute = ({ element }: { element: JSX.Element }) => {
 return isAuthenticated() ? element : <Navigate to="/login" />;
};

const router = createBrowserRouter([
 {
  path: "/",
  element: <PrivateRoute element={<HomePage />} />,
  errorElement: <NotFoundPage />,
 },
 { path: "/login", element: <LoginPage /> },
 { path: "/register", element: <RegisterPage /> },
 { path: "/profile", element: <PrivateRoute element={<ProfilePage />} /> },
]);

// Render the app
createRoot(document.getElementById("root")!).render(
 <StrictMode>
  <RouterProvider router={router} />
 </StrictMode>
);
