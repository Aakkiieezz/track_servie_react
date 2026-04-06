import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "bootstrap/dist/css/bootstrap.css";
import './index.css';

import NotFoundPage from "./pages/NotFoundPage.tsx";
import AuthPage from "./pages/AuthPage.tsx";
import SetingsPage from "./pages/SettingsPage.tsx";
import { isAuthenticated } from "./utils/auth";
import ServiePage from "./pages/ServiePage.tsx";
import SearchPage from "./pages/SearchPage.tsx";
import SeasonPage from "./pages/SeasonPage.tsx";
import PersonPage from "./pages/PersonPage.tsx";
import StatsLangBarLog from "./pages/StatsLangBarLog.tsx";
import MovieCollection from "./pages/MovieCollection.tsx";
import ListPage from "./pages/ListPage.tsx";
import ImageGalleryPage from "./pages/ImageGalleryPage.tsx";
import "./index.css";
import UserProfilePage from "./pages/UserProfilePage.tsx";
import { AlertProvider, useAlert } from "./contexts/AlertContext";
import Alert from "./components/common/Alert/Alert.tsx";
import DiscoverPage from "./pages/DiscoveryPage.tsx";
import HomePage from "./pages/HomePage.tsx";

const processToken = () => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const userId = params.get("userId");
    const username = params.get("username");
    const profileImgUrl = params.get("profileImgUrl");

    if (token && username && userId) {
        localStorage.setItem("token", token);
        localStorage.setItem("userId", String(userId));
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

    {
        path: "/",
        element: <PrivateRoute element={<HomePage />} />,
        errorElement: <NotFoundPage />
    },

    { path: "/movie-collection/:collectionId", element: <MovieCollection /> },
    { path: "/person/:personId", element: <PersonPage /> },

    { path: "/settings", element: <PrivateRoute element={<SetingsPage />} /> },

    { path: "/search", element: <PrivateRoute element={<SearchPage />} /> },

    {
        path: "/servies/:tmdbId/Season/:seasonNo",
        element: <PrivateRoute element={<SeasonPage />} />,
    },

    { path: "/servie", element: <ServiePage /> },
    
    { path: "/images", element: <ImageGalleryPage /> },

    { path: "/statslangbarlog", element: <PrivateRoute element={<StatsLangBarLog />} /> },

    { path: "/list/:listId", element: <ListPage /> },

    {
        path: "/profile/me/:tab?",
        element: <PrivateRoute element={<UserProfilePage />} />,
    },
    {
        path: "/profile/:userId/:tab?",
        element: <PrivateRoute element={<UserProfilePage />} />,
    },
    {
        path: "/trending/movies",
        element: <DiscoverPage />
    },
    {
        path: "/trending/tv",
        element: <DiscoverPage />
    },
    {
        path: "/trending/all",
        element: <DiscoverPage />
    },
    {
        path: "/popular/movies",
        element: <DiscoverPage />
    },
    {
        path: "/popular/tv",
        element: <DiscoverPage />
    },
    {
        path: "/popular/all",
        element: <DiscoverPage />
    },
    {
        path: "/top-rated/movies",
        element: <DiscoverPage />
    },
    {
        path: "/top-rated/tv",
        element: <DiscoverPage />
    },
    {
        path: "/upcoming/movies",
        element: <DiscoverPage />
    }
]);

const RouterWithGlobalAlert: React.FC = () => {
    const { alert, setAlert } = useAlert();

    return (
        <>
            {alert && (
                <Alert
                    type={alert.type}
                    message={alert.message}
                    onClose={() => setAlert(null)}
                />
            )}

            <RouterProvider router={router} />
        </>
    );
};

createRoot(document.getElementById("root")!).render(
    // StrictMode double-invokes to detect bugs -> annoying, but it helps catch real issues before prod.
    // <StrictMode>
    <AlertProvider>
        <RouterWithGlobalAlert />
    </AlertProvider>
    // </StrictMode>
);