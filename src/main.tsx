import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import './index.css';
import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "bootstrap/dist/css/bootstrap.css";

import HomePage from "./pages/HomePage.tsx";
import NotFoundPage from "./pages/NotFoundPage.tsx";
import AuthPage from "./pages/AuthPage.tsx";
import ProfilePage from "./pages/ProfilePage.tsx";
import { isAuthenticated } from "./utils/auth";
import ServiePage from "./pages/ServiePage.tsx";
import SearchPage from "./pages/SearchPage.tsx";
import SeasonPage from "./pages/SeasonPage.tsx";
import PersonPage from "./pages/PersonPage.tsx";
import Stats from "./pages/Stats.tsx";
import StatsLangBarLog from "./pages/StatsLangBarLog.tsx";
import MovieCollection from "./pages/MovieCollection.tsx";

const PrivateRoute = ({ element }: { element: JSX.Element }) => {
    return isAuthenticated() ? element : <Navigate to="/login" />;
};

const router = createBrowserRouter([

    { path: "/login", element: <AuthPage /> },
    {
        path: "/",
        element: <PrivateRoute element={<HomePage />} />,
        errorElement: <NotFoundPage />,
    },
    { path: "/movie-collection/:collectionId", element: <MovieCollection /> },
    { path: "/person/:personId", element: <PersonPage /> },
    { path: "/profile", element: <PrivateRoute element={<ProfilePage />} /> },
    { path: "/search", element: <PrivateRoute element={<SearchPage />} /> },
    {
        path: "/servies/:tmdbId/Season/:seasonNo",
        element: <PrivateRoute element={<SeasonPage />} />,
    },
    { path: "/servie", element: <ServiePage /> },
    { path: "/stats", element: <PrivateRoute element={<Stats />} /> },
    { path: "/statslangbarlog", element: <PrivateRoute element={<StatsLangBarLog />} /> },
]);

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <RouterProvider router={router} />
    </StrictMode>
);
