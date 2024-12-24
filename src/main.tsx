import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import './index.css';
import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "bootstrap/dist/css/bootstrap.css";

import HomePage from "./pages/HomePage.tsx";
import NotFoundPage from "./pages/NotFoundPage.tsx";
import LoginPage from "./pages/AuthPage.tsx";
import ProfilePage from "./components/ProfilePage.tsx";
import { isAuthenticated } from "./utils/auth";
import ServiePage from "./pages/ServiePage.tsx";
import SearchPage from "./pages/SearchPage.tsx";
import SeasonPage from "./pages/SeasonPage.tsx";
import PersonPage from "./pages/PersonPage.tsx";

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
    { path: "/profile", element: <PrivateRoute element={<ProfilePage />} /> },
    { path: "/servie", element: <ServiePage /> },
    { path: "/search", element: <PrivateRoute element={<SearchPage />} /> },
    {
        path: "/track-servie/servies/:tmdbId/Season/:seasonNo",
        element: <PrivateRoute element={<SeasonPage />} />,
    },
    { path: "/person/:personId", element: <PersonPage /> },
]);

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <RouterProvider router={router} />
    </StrictMode>
);
