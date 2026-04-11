import { useEffect, useState } from "react";
import { useLocation, useSearchParams } from "react-router-dom";

import AppHeader from "@/components/common/AppHeader/AppHeader";
import BackdropCard from "@/components/common/BackdropCard/BackdropCard";
import PaginationBar from "@/components/common/PaginationBar/PaginationBar";

import axiosInstance from "@/utils/axiosInstance";

import {
    type NormalizedMedia,
    type MediaCardData,
    type GenreMap,
    mergeMediaWithUserState,
} from "@/types/tmdb.types";

import { userInteractionStore } from "@/store/UserInteractionStore";
import { fetchGenreMap } from "@/lib/api";

import styles from "./DiscoveryPage.module.css"; // reuse same styles

type SearchType = "movie" | "tv" | "servie" | "person" | "collection";

interface SearchFilters {
    query: string;
    type: SearchType;
}

interface Pagination {
    pageNumber: number;
    totalPages: number;
}

export default function SearchPage() {
    const location = useLocation();
    const [searchParams] = useSearchParams();

    const initialQuery = new URLSearchParams(location.search).get("query") || "";
    const initialType = (new URLSearchParams(location.search).get("type") as SearchType) || "movie";

    const [filters, setFilters] = useState<SearchFilters>({ query: initialQuery, type: initialType });

    const [items, setItems] = useState<NormalizedMedia[]>([]);
    const [genreMap, setGenreMap] = useState<GenreMap>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    const [pagination, setPagination] = useState<Pagination>({ pageNumber: 0, totalPages: 0 });
    const {
        get: getInteraction,
        load: loadInteractions,
        loaded: interactionsLoaded,
    } = userInteractionStore();

    // ── Sync URL → state ──
    useEffect(() => {
        const queryFromUrl = searchParams.get("query") || "";
        const typeFromUrl = (searchParams.get("type") as SearchType) || "movie";

        setFilters({
            query: queryFromUrl,
            type: typeFromUrl,
        });
        // reset page when filters change
        setPagination((prev) => ({ ...prev, pageNumber: 0 }));
    }, [searchParams]);

    // ── Load dependencies ──
    useEffect(() => {
        loadInteractions();
    }, [loadInteractions]);

    useEffect(() => {
        fetchGenreMap().then(setGenreMap).catch(() => { });
    }, []);

    // ── Fetch search results ──
    useEffect(() => {
        if (
            !filters.query ||
            Object.keys(genreMap).length === 0 ||
            !interactionsLoaded
        )
            return;

        // ignore unsupported types
        if (filters.type === "person" || filters.type === "collection") {
            setItems([]);
            return;
        }

        setLoading(true);
        setError(false);

        axiosInstance
            .get("search", {
                params: {
                    type: filters.type,
                    query: filters.query,
                    pageNumber: pagination.pageNumber,
                },
            })
            .then((res) => {
                setItems(res.data.servies);

                setPagination({
                    pageNumber: res.data.pageNumber,
                    totalPages: res.data.totalPages,
                });

                setLoading(false);
            })
            .catch(() => {
                setError(true);
                setLoading(false);
            });
    }, [filters, pagination.pageNumber, genreMap, interactionsLoaded]);

    // ── Merge with user state ──
    const mergedItems: MediaCardData[] = mergeMediaWithUserState(
        items,
        getInteraction,
        genreMap
    );

    const pageTitle = (
        <h1 className={styles.title}>
            Search results for "{filters.query}"
            {!loading && (
                <span className={styles.count}>
                    {mergedItems.length} titles
                </span>
            )}
        </h1>
    );

    // ── Unsupported types ──
    if (filters.type === "person" || filters.type === "collection")
        return (
            <>
                <AppHeader />
                <main className={styles.page}>
                    {pageTitle}
                    <p className={styles.error}>
                        This search type is not supported yet 🚧
                    </p>
                </main>
            </>
        );

    // ── Loading ──
    if (loading)
        return (
            <>
                <AppHeader />
                <main className={styles.page}>
                    {pageTitle}
                    <div className={styles.grid}>
                        {Array.from({ length: 8 }).map((_, i) => (
                            <div key={i} className={styles.skeleton} />
                        ))}
                    </div>
                </main>
            </>
        );

    // ── Error ──
    if (error)
        return (
            <>
                <AppHeader />
                <main className={styles.page}>
                    {pageTitle}
                    <p className={styles.error}>
                        Failed to load. Please try again.
                    </p>
                </main>
            </>
        );

    // ── Empty ──
    if (mergedItems.length === 0)
        return (
            <>
                <AppHeader />
                <main className={styles.page}>
                    {pageTitle}
                    <p className={styles.error}>No results found.</p>
                </main>
            </>
        );

    // ── Final UI ──
    return (
        <>
            <AppHeader />
            <main className={styles.page}>
                {pageTitle}

                <div className={styles.grid}>
                    {mergedItems.map((item) => (
                        <BackdropCard
                            key={`${item.childtype}-${item.tmdbId}`}
                            {...item}
                        />
                    ))}
                </div>

                <PaginationBar
                    pageNumber={pagination.pageNumber}
                    totalPages={pagination.totalPages}
                    onPageChange={(newPage) =>
                        setPagination((prev) => ({
                            ...prev,
                            pageNumber: newPage,
                        }))
                    }
                />
            </main>
        </>
    );
}