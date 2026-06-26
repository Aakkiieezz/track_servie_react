import React, { useState, useEffect, useMemo } from "react";
import axiosInstance from "@/utils/axiosInstance";
import styles from "./MovieCollectionsTab.module.css";
import PosterFanStack from "@/components/common/PosterFanStack/PosterFanStack";
import PaginationBar from "@/components/common/PaginationBar/PaginationBar";
import { ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface MovieCollection {
    id: number;
    name: string;
    backdropPath: string;
    posterPath: string;
    total: number;
    watched: number;
    watchedPosters: string[];
}

interface MovieCollectionsTabProps {
    userId: number;
}

type SortOption = "completion" | "watched-count" | "total-parts" | "name";

// Local pagination UI state - mirrors what PaginationBar expects as props
// (pageNumber, totalPages), but owned entirely on the frontend now since
// the backend just returns the full list with no pagination metadata.
interface Pagination {
    pageNumber: number;
    totalPages: number;
}

// Discrete page-size steps for the slider. ALL_SENTINEL represents the
// "All" position (last step) and means "render everything on one page".
const PAGE_SIZE_STEPS = [8, 16, 32, 64, 128, 256, 512] as const;
const ALL_SENTINEL = -1;
const SLIDER_MAX = PAGE_SIZE_STEPS.length; // last index is reserved for "All"

// Safe completion ratio - avoids NaN/divide-by-zero for collections with total = 0
const getCompletion = (c: MovieCollection): number =>
    c.total > 0 ? c.watched / c.total : 0;

const MovieCollectionsTab: React.FC<MovieCollectionsTabProps> = ({ userId }) => {
    const navigate = useNavigate();

    // Raw data - backend sends the FULL list for the user in one shot.
    const [collections, setCollections] = useState<MovieCollection[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Sorting & pagination are entirely frontend-owned.
    const [sortBy, setSortBy] = useState<SortOption>("watched-count");
    const [showSortDropdown, setShowSortDropdown] = useState(false);
    const [pageNumber, setPageNumber] = useState(0);
    const [pageSize, setPageSize] = useState<number>(PAGE_SIZE_STEPS[0]); // default 8

    useEffect(() => {
        fetchCollections();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userId]);

    const fetchCollections = async () => {
        setLoading(true);
        setError(null);
        try {
            // No page/pageSize params - backend returns everything for this user.
            const response = await axiosInstance.get(`movie-collection/user/${userId}`);
            // Backend now returns a bare array (PagedResponse was dropped entirely
            // from this endpoint since this component never used its pagination
            // metadata anyway - sorting/paging is fully frontend-owned).
            setCollections(response.data ?? []);
            setPageNumber(0);
        } catch (err) {
            console.error("Error fetching collections:", err);
            setError("Couldn't load your collections. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    // Sort the FULL dataset (not just a page) so ordering is globally correct
    // across page boundaries.
    const sortedCollections = useMemo(() => {
        const withTiebreak = (primaryDiff: number, a: MovieCollection, b: MovieCollection) =>
            primaryDiff !== 0 ? primaryDiff : a.name.localeCompare(b.name);

        return [...collections].sort((a, b) => {
            switch (sortBy) {
                case "completion":
                    return withTiebreak(getCompletion(b) - getCompletion(a), a, b);

                case "watched-count":
                    return withTiebreak(b.watched - a.watched, a, b);

                case "total-parts":
                    return withTiebreak(b.total - a.total, a, b);

                case "name":
                default:
                    return a.name.localeCompare(b.name);
            }
        });
    }, [collections, sortBy]);

    const isShowingAll = pageSize === ALL_SENTINEL;
    const effectivePageSize = isShowingAll ? Math.max(sortedCollections.length, 1) : pageSize;

    const pagination: Pagination = {
        pageNumber,
        totalPages: Math.max(1, Math.ceil(sortedCollections.length / effectivePageSize)),
    };

    const pagedCollections = useMemo(() => {
        if (isShowingAll) return sortedCollections;
        const start = pageNumber * pageSize;
        return sortedCollections.slice(start, start + pageSize);
    }, [sortedCollections, pageNumber, pageSize, isShowingAll]);

    const handlePageChange = (newPage: number) => {
        setPageNumber(newPage);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleSortChange = (option: SortOption) => {
        setSortBy(option);
        setShowSortDropdown(false);
        setPageNumber(0); // ordering changed - old page index is meaningless now
    };

    // Slider position 0..6 maps to PAGE_SIZE_STEPS, position 7 (SLIDER_MAX) = "All"
    const sliderPosition = isShowingAll
        ? SLIDER_MAX
        : PAGE_SIZE_STEPS.indexOf(pageSize as (typeof PAGE_SIZE_STEPS)[number]);

    const handleSliderChange = (position: number) => {
        const newSize = position === SLIDER_MAX ? ALL_SENTINEL : PAGE_SIZE_STEPS[position];
        setPageSize(newSize);
        setPageNumber(0); // page boundaries shift when page size changes
    };

    const handleCollectionClick = (collectionId: number, collectionName: string) => {
        navigate(`/movie-collection/${collectionId}`, { state: { name: collectionName } });
    };

    const sortOptions: { label: string; value: SortOption }[] = [
        { label: "Name (A-Z)", value: "name" },
        { label: "Completion %", value: "completion" },
        { label: "Most Watched", value: "watched-count" },
        { label: "Largest Collections", value: "total-parts" },
    ];

    return (
        <div>
            {/* Header with Sort Dropdown + Page Size Slider */}
            <div className={styles.headerRow}>
                <h2 className={styles.pageTitle}>Movie Collections</h2>

                <div className={styles.controlsRow}>
                    <div className={styles.sortContainer}>
                        <button
                            className={styles.sortButton}
                            onClick={() => setShowSortDropdown(!showSortDropdown)}
                            aria-label="Sort collections"
                            aria-expanded={showSortDropdown}
                        >
                            <span className={styles.sortLabel}>
                                Sort by: {sortOptions.find((opt) => opt.value === sortBy)?.label}
                            </span>
                            <ChevronDown
                                size={18}
                                className={`${styles.sortIcon} ${showSortDropdown ? styles.sortIconOpen : ""}`}
                            />
                        </button>

                        {showSortDropdown && (
                            <div className={styles.sortDropdown}>
                                {sortOptions.map((option) => (
                                    <button
                                        key={option.value}
                                        className={`${styles.sortOption} ${sortBy === option.value ? styles.sortOptionActive : ""
                                            }`}
                                        onClick={() => handleSortChange(option.value)}
                                    >
                                        {option.label}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className={styles.pageSizeContainer}>
                        <label htmlFor="pageSizeSlider" className={styles.pageSizeLabel}>
                            Show: {isShowingAll ? "All" : pageSize}
                        </label>
                        <input
                            id="pageSizeSlider"
                            type="range"
                            min={0}
                            max={SLIDER_MAX}
                            step={1}
                            value={sliderPosition}
                            onChange={(e) => handleSliderChange(Number(e.target.value))}
                            className={styles.pageSizeSlider}
                            aria-label="Items per page"
                            aria-valuetext={isShowingAll ? "All" : String(pageSize)}
                        />
                    </div>
                </div>
            </div>

            {/* Grid of Collections */}
            {loading ? (
                <p className={styles.loadingText}>Loading collections...</p>
            ) : error ? (
                <p className={styles.emptyText}>{error}</p>
            ) : sortedCollections.length === 0 ? (
                <p className={styles.emptyText}>
                    No collections found. Start watching movies to join collections!
                </p>
            ) : (
                <div className={styles.collectionsGrid}>
                    {pagedCollections.map((collection) => (
                        <div key={collection.id} className={styles.collectionCard}>
                            {/* Poster Fan Stack - Clickable */}
                            <div
                                className={styles.posterArea}
                                onClick={() => handleCollectionClick(collection.id, collection.name)}
                                role="button"
                                tabIndex={0}
                            >
                                <PosterFanStack
                                    posters={collection.watchedPosters}
                                    height={180}
                                />
                            </div>

                            {/* Collection Info */}
                            <div className={styles.infoSection}>
                                <h3
                                    className={styles.collectionName}
                                    onClick={() => handleCollectionClick(collection.id, collection.name)}
                                    role="button"
                                    tabIndex={0}
                                >
                                    {collection.name}
                                </h3>

                                <p className={styles.watchCount}>
                                    {collection.watched} of {collection.total} watched
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {!loading && !error && sortedCollections.length > 0 && !isShowingAll && (
                <PaginationBar
                    {...pagination}
                    onPageChange={handlePageChange}
                />
            )}
        </div>
    );
};

export default MovieCollectionsTab;