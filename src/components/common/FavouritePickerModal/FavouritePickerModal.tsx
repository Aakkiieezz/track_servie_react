import React, { useState } from "react";
import axiosInstance from "@/utils/axiosInstance";
import { useServieDebounceSearch, type ServieSearchResult } from "@/hooks/useServieDebounceSearch";
import styles from "./FavouritePickerModal.module.css";
import { createPortal } from "react-dom";

type FavouriteType = "movie" | "tv";

interface FavouritePickerModalProps {
    type: FavouriteType;
    onClose: () => void;
    onAdded: () => void; // parent refetches favourites and closes on success
}

const FavouritePickerModal: React.FC<FavouritePickerModalProps> = ({
    type,
    onClose,
    onAdded,
}) => {
    const [query, setQuery] = useState("");
    const [addingId, setAddingId] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);
    const { results, isLoading } = useServieDebounceSearch(type, query);

    const handleAdd = async (result: ServieSearchResult) => {
        setAddingId(result.tmdbId);
        setError(null);
        try {
            await axiosInstance.post(`list/favourites/${type}/${result.tmdbId}`);
            onAdded();
        } catch (err) {
            console.error("Failed to add favourite:", err);
            setError("Could not add this. Please try again.");
            setAddingId(null);
        }
    };

    const modal = (
        <div className={styles.backdrop} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <button className={styles.closeButton} onClick={onClose} aria-label="Close">
                    ×
                </button>

                <p className={styles.heading}>
                    Add favourite {type === "movie" ? "movie" : "series"}
                </p>

                <input
                    autoFocus
                    className={styles.searchInput}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search..."
                />

                {error && <p className={styles.error}>{error}</p>}

                <div className={styles.resultsList}>
                    {isLoading && <div className={styles.status}>Searching...</div>}

                    {!isLoading && query.trim().length >= 3 && results.length === 0 && (
                        <div className={styles.status}>No results found.</div>
                    )}

                    {!isLoading &&
                        results.map((result) => (
                            <div
                                key={result.tmdbId}
                                className={styles.resultRow}
                                onClick={() => addingId === null && handleAdd(result)}
                            >
                                {result.posterPath ? (
                                    <img
                                        className={styles.poster}
                                        src={`http://localhost:8080/track-servie/posterImgs_resize220x330_q0.85${result.posterPath.replace(".jpg", ".webp")}`}
                                        alt={result.title}
                                        onError={(e) => {
                                            e.currentTarget.onerror = null;
                                            e.currentTarget.src = `https://image.tmdb.org/t/p/original${result.posterPath}`;
                                        }}
                                    />
                                ) : (
                                    <div className={styles.posterFallback} />
                                )}

                                <span className={styles.resultTitle}>{result.title}</span>

                                {addingId === result.tmdbId && (
                                    <span className={styles.addingLabel}>Adding...</span>
                                )}
                            </div>
                        ))}
                </div>
            </div>
        </div>
    );

    return createPortal(modal, document.body);
};

export default FavouritePickerModal;