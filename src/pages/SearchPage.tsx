import { useEffect, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";

import AppHeader from "@/components/common/AppHeader/AppHeader";
import BackdropCard from "@/components/common/BackdropCard/BackdropCard";
import PersonCard, { type PersonCardData } from "@/components/SearchPage/PersonCard/PersonCard";
import personStyles from "@/components/SearchPage/PersonCard/PersonCard.module.css";
import CollectionRow, { type CollectionRowData } from "@/components/SearchPage/CollectionRow/CollectionRow";
import collectionStyles from "@/components/SearchPage/CollectionRow/CollectionRow.module.css";
import KnownForModal from "@/components/SearchPage/KnownForModal/KnownForModal";
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
import { useAlert } from "@/contexts/AlertContext";

import styles from "./DiscoveryPage.module.css";

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
    const navigate = useNavigate();
    const { setAlert } = useAlert();
    const [searchParams] = useSearchParams();

    const initialQuery = new URLSearchParams(location.search).get("query") || "";
    const initialType = (new URLSearchParams(location.search).get("type") as SearchType) || "movie";

    const [filters, setFilters] = useState<SearchFilters>({ query: initialQuery, type: initialType });

    const [items, setItems] = useState<NormalizedMedia[]>([]);
    const [persons, setPersons] = useState<PersonCardData[]>([]);
    const [collections, setCollections] = useState<CollectionRowData[]>([]);
    const [genreMap, setGenreMap] = useState<GenreMap>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    const [pagination, setPagination] = useState<Pagination>({ pageNumber: 0, totalPages: 0 });
    const [selectedPerson, setSelectedPerson] = useState<PersonCardData | null>(null);
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
        if (!filters.query) return;

        if (filters.type === "collection") {
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
                    setCollections(res.data.collections);

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
            return;
        }

        if (filters.type === "person") {
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
                    setPersons(res.data.people);

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
            return;
        }

        // movie / tv / servie search still depends on genreMap + interactions
        if (Object.keys(genreMap).length === 0 || !interactionsLoaded) return;

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

    const resultCount =
        filters.type === "person"
            ? persons.length
            : filters.type === "collection"
                ? collections.length
                : mergedItems.length;

    const resultLabel =
        filters.type === "person"
            ? "people"
            : filters.type === "collection"
                ? "collections"
                : "titles";

    const pageTitle = (
        <h1 className={styles.title}>
            Search results for "{filters.query}"
            {!loading && (
                <span className={styles.count}>
                    {resultCount} {resultLabel}
                </span>
            )}
        </h1>
    );

    async function navigateToPersonPage(personId: number): Promise<void> {
        setSelectedPerson(null);
        try {
            const response = await axiosInstance.get(`person/${personId}`);
            navigate(`/person/${personId}`, {
                state: { personData: response.data },
            });
        } catch (error: any) {
            console.error("Error fetching person data:", error);

            const message =
                error?.response?.data?.message ||
                "Something went wrong. Please try again later.";

            setAlert({ type: "danger", message });
        }
    }

    function navigateToCollectionPage(collectionId: number): void {
        navigate(`/movie-collection/${collectionId}`);
    }

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
    if (resultCount === 0)
        return (
            <>
                <AppHeader />
                <main className={styles.page}>
                    {pageTitle}
                    <p className={styles.error}>No results found.</p>
                </main>
            </>
        );

    // ── Person results ──
    if (filters.type === "person")
        return (
            <>
                <AppHeader />
                <main className={styles.page}>
                    {pageTitle}

                    <div className={personStyles.personGrid}>
                        {persons.map((person) => (
                            <PersonCard
                                key={person.id}
                                {...person}
                                onClick={setSelectedPerson}
                            />
                        ))}
                    </div>

                    {selectedPerson && (
                        <KnownForModal
                            person={selectedPerson}
                            onClose={() => setSelectedPerson(null)}
                            onNavigateToPerson={navigateToPersonPage}
                        />
                    )}

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

    // ── Collection results ──
    if (filters.type === "collection")
        return (
            <>
                <AppHeader />
                <main className={styles.page}>
                    {pageTitle}

                    <div className={collectionStyles.list}>
                        {collections.map((collection) => (
                            <CollectionRow
                                key={collection.id}
                                {...collection}
                                onClick={navigateToCollectionPage}
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

    // ── Final UI (movies / tv / servie) ──
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