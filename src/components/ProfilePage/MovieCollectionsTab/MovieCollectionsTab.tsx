import React, { useState, useEffect } from "react";
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

interface Pagination {
    pageNumber: number;
    totalPages: number;
}

type SortOption = "completion" | "watched-count" | "total-parts" | "name";

const MovieCollectionsTab: React.FC<MovieCollectionsTabProps> = ({ userId }) => {
    const navigate = useNavigate();
    const [collections, setCollections] = useState<MovieCollection[]>([]);
    const [loading, setLoading] = useState(false);
    const [sortBy, setSortBy] = useState<SortOption>("completion");
    const [showSortDropdown, setShowSortDropdown] = useState(false);
    const [pagination, setPagination] = useState<Pagination>({
        pageNumber: 0,
        totalPages: 0
    });

    const ITEMS_PER_PAGE = 8;

    useEffect(() => {
        fetchCollections(0);
    }, [userId]);

    const fetchCollections = async (page: number) => {
        setLoading(true);
        try {
            const response = await axiosInstance.get(`movie-collection/user/${userId}`, {
                params: {
                    page,
                    pageSize: ITEMS_PER_PAGE,
                },
            });

            console.log("Full response:", response.data);
            console.log("Pagination data:", response.data.pagination);

            setCollections(response.data.data);
            setPagination({
                pageNumber: response.data.pagination.currentPage,
                totalPages: response.data.pagination.totalPages,
            });
        } catch (error) {
            console.error("Error fetching collections:", error);
        } finally {
            setLoading(false);
        }
    };

    const handlePageChange = (newPage: number) => {
        fetchCollections(newPage);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleCollectionClick = (collectionId: number, collectionName: string) => {
        navigate(`/movie-collection/${collectionId}`, { state: { name: collectionName } });
    };

    const sortedCollections = [...collections].sort((a, b) => {
        switch (sortBy) {
            case "completion":
                const completionA = a.watched / a.total;
                const completionB = b.watched / b.total;
                return completionB - completionA;

            case "watched-count":
                return b.watched - a.watched;

            case "total-parts":
                return b.total - a.total;

            case "name":
                return a.name.localeCompare(b.name);

            default:
                return 0;
        }
    });

    const sortOptions: { label: string; value: SortOption }[] = [
        { label: "Completion %", value: "completion" },
        { label: "Most Watched", value: "watched-count" },
        { label: "Largest Collections", value: "total-parts" },
        { label: "Name (A-Z)", value: "name" },
    ];

    return (
        <div>
            {/* Header with Sort Dropdown */}
            <div className={styles.headerRow}>
                <h2 className={styles.pageTitle}>Movie Collections</h2>

                <div className={styles.sortContainer}>
                    <button
                        className={styles.sortButton}
                        onClick={() => setShowSortDropdown(!showSortDropdown)}
                        aria-label="Sort collections"
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
                                    onClick={() => {
                                        setSortBy(option.value);
                                        setShowSortDropdown(false);
                                    }}
                                >
                                    {option.label}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Grid of Collections */}
            {loading ? (
                <p className={styles.loadingText}>Loading collections...</p>
            ) : sortedCollections.length === 0 ? (
                <p className={styles.emptyText}>
                    No collections found. Start watching movies to join collections!
                </p>
            ) : (
                <div className={styles.collectionsGrid}>
                    {sortedCollections.map((collection) => (
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

            {!loading && sortedCollections.length > 0 && (
                <PaginationBar
                    pageNumber={pagination.pageNumber}
                    totalPages={pagination.totalPages}
                    onPageChange={handlePageChange}
                />
            )}
        </div>
    );
};

export default MovieCollectionsTab;