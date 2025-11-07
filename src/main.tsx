import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "bootstrap/dist/css/bootstrap.css";
import './index.css';

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
import WatchListPage from "./pages/WatchListPage.tsx";
import ListsPage from "./pages/ListsPage.tsx";
import ListPage from "./pages/ListPage.tsx";
import ImageGalleryPage from "./pages/ImageGalleryPage.tsx";
import "./index.css";

const processToken = () => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const username = params.get("username");
    const profileImgUrl = params.get("profileImgUrl");

    if (token && username) {
        localStorage.setItem("token", token);
        localStorage.setItem("username", username);
        localStorage.setItem("profileImgUrl", "http://localhost:8080/track-servie/" + profileImgUrl);
        window.history.replaceState({}, document.title, "/");
    }
};

processToken();

const PrivateRoute = ({ element }: { element: JSX.Element }) => {
    return isAuthenticated() ? element : <Navigate to="/login" />;
};

const router = createBrowserRouter([

    { path: "/login", element: <AuthPage /> },
    { path: "/", element: <PrivateRoute element={<HomePage />} />, errorElement: <NotFoundPage /> },
    { path: "/movie-collection/:collectionId", element: <MovieCollection /> },
    { path: "/person/:personId", element: <PersonPage /> },
    { path: "/profile", element: <PrivateRoute element={<ProfilePage />} /> },
    { path: "/search", element: <PrivateRoute element={<SearchPage />} /> },
    {
        path: "/servies/:tmdbId/Season/:seasonNo",
        element: <PrivateRoute element={<SeasonPage />} />,
    },
    { path: "/servie", element: <ServiePage /> },
    { path: "/images", element: <ImageGalleryPage /> },
    { path: "/stats", element: <PrivateRoute element={<Stats />} /> },
    { path: "/statslangbarlog", element: <PrivateRoute element={<StatsLangBarLog />} /> },
    { path: "/watchlist", element: <PrivateRoute element={<WatchListPage />} /> },
    { path: "/list", element: <ListsPage /> },
    { path: "/list/:listId", element: <ListPage /> },
]);

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <RouterProvider router={router} />
    </StrictMode>
);
