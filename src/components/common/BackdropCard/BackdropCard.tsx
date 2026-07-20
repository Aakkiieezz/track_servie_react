import React, { useState } from "react";
import { Link } from "react-router-dom";
import styles from "./BackdropCard.module.css";
import OptionsModal from "@/components/common/ServieGrid/OptionsModal";
import axiosInstance from "@/utils/axiosInstance";
import { useAlert } from "@/contexts/AlertContext";
import { userInteractionStore } from "@/store/UserInteractionStore";
import type { MediaCardData } from "@/types/tmdb.types";
import { saveServieReview } from "@/api/servieApi";
import { ReviewData } from "@/types/servie";
import { getAxiosErrorMessage } from "@/api/axiosError";

const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p";

export interface BackdropCardProps extends MediaCardData {
    rank?: number;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getYear(dateStr?: string | null) {
    if (!dateStr) return null;
    return new Date(dateStr).getFullYear();
}

function getMeta(props: BackdropCardProps): string {
    const parts: string[] = [];
    const year = getYear(props.releaseDate);
    if (year) parts.push(String(year));
    parts.push(props.childtype === "movie" ? "Movie" : "Show");
    return parts.join(" · ");
}

function getProgressPercent(
    episodesWatched?: number | null,
    totalEpisodes?: number | null
): number | null {
    if (!episodesWatched || !totalEpisodes || totalEpisodes === 0) return null;
    return Math.min(100, Math.round((episodesWatched / totalEpisodes) * 100));
}

const BackdropCard: React.FC<BackdropCardProps> = (props) => {
    const {
        tmdbId, childtype, title,
        posterPath, backdropPath,
        genres, voteAverage, rank,
        episodesWatched, totalEpisodes,
        releaseDate,
    } = props;

    const { setAlert } = useAlert();
    const { update } = userInteractionStore();

    const [watched, setWatched] = useState(props.watched);
    const [liked, setLiked] = useState(props.liked);
    const [showOptions, setShowOptions] = useState(false);
    const [rating, setRating] = useState(props.rated ?? null);

    // ── Watch toggle ──────────────────────────────────────────────────────
    const handleWatchClick = async () => {
        const prev = watched;
        const next = !prev;
        setWatched(next);
        update(childtype, tmdbId, { completed: next });
        try {
            await axiosInstance.put(`servies/${childtype}/${tmdbId}/watch`,
                null,
                { params: { newServieWatchState: next } }
            );
            setAlert({ type: "success", message: `Updated watch status of ${title}` });
        } catch {
            setWatched(prev);
            update(childtype, tmdbId, { completed: prev });
            setAlert({ type: "danger", message: "Failed to update watch status." });
        }
    };

    // ── Like toggle ───────────────────────────────────────────────────────
    const handleLikeClick = async () => {
        const prev = liked;
        const next = !prev;
        setLiked(next);
        update(childtype, tmdbId, { liked: next });
        try {
            await axiosInstance.patch(`/servies/${childtype}/${tmdbId}/review`,
                { liked: next }
            );
            setAlert({ type: "success", message: `Updated like status of ${title}` });
        } catch {
            setLiked(prev);
            update(childtype, tmdbId, { liked: prev });
            setAlert({ type: "danger", message: "Failed to update like status." });
        }
    };

    // ── Derived values ────────────────────────────────────────────────────
    const backdropUrl = backdropPath ? `${TMDB_IMAGE_BASE}/w1280${backdropPath}` : null;
    const posterUrl = posterPath ? `${TMDB_IMAGE_BASE}/w342${posterPath}` : null;
    const tmdbRating = voteAverage ? voteAverage.toFixed(1) : null;
    const meta = getMeta(props);
    const progressPercent = getProgressPercent(episodesWatched, totalEpisodes);
    const isWatching = !watched && episodesWatched != null && episodesWatched > 0;

    // ── Servie shape for options modal ────────────────────────────────────
    const servieForModal = {
        tmdbId,
        childtype,
        title,
        posterPath,
        releaseDate: childtype === "movie" ? releaseDate : undefined,
        firstAirDate: childtype === "tv" ? releaseDate : undefined,
        totalEpisodes: totalEpisodes ?? null,
        episodesWatched: episodesWatched ?? undefined,
        completed: watched,
        liked,
        rated: rating,
        popularity: null,
        lastAirDate: undefined,
    };

    const handleRatingChange = async (newRating: number | null) => {
        if (rating === newRating) return;
        const prev = rating;
        setRating(newRating);

        try {
            await axiosInstance.patch(`/servies/${childtype}/${tmdbId}/review`,
                { rating: newRating }
            );
            update(childtype, tmdbId, { rated: newRating });
        } catch (error) {
            setRating(prev);
            throw error;
        }
    };

    const handleSaveReview = async (reviewData: ReviewData) => {
        try {
            await saveServieReview(childtype, tmdbId, reviewData);

            if (reviewData.rating !== undefined) {
                setRating(reviewData.rating);
                update(childtype, tmdbId, { rated: reviewData.rating });
            }

            setAlert({ type: "success", message: "Saved successfully!" });
        } catch (error) {
            setAlert({ type: "danger", message: getAxiosErrorMessage(error) });
            throw error;
        }
    };

    return (
        <>
            <Link
                to="/servie"
                state={{ childType: childtype, tmdbId, title, posterPath }}
                className={styles.cardLink}
            >
                <div className={styles.card}>

                    {/* ── Backdrop ── */}
                    <div className={styles.backdrop}>
                        {backdropUrl
                            ? <img src={backdropUrl} alt="" className={styles.backdropImg} draggable={false} />
                            : <div className={styles.backdropFallback} />
                        }
                        <div className={styles.backdropOverlay} />
                        <div className={styles.backdropGradient} />
                    </div>

                    {/* ── Rank ── */}
                    {rank != null && <span className={styles.rank}>#{rank} wow</span>}

                    {/* ── Status chip ── */}
                    {watched && (
                        <span className={`${styles.statusChip} ${styles.chipWatched}`}>
                            ✓ Watched
                        </span>
                    )}
                    {isWatching && (
                        <span className={`${styles.statusChip} ${styles.chipWatching}`}>
                            ▶ E{episodesWatched} watched
                        </span>
                    )}

                    {/* ── Inner: poster + details ── */}
                    <div className={styles.inner}>

                        <div className={styles.poster}>
                            {posterUrl
                                ? <img src={posterUrl} alt={title} className={styles.posterImg} draggable={false} />
                                : <div className={styles.posterFallback}>
                                    <span className={styles.posterFallbackText}>{title.charAt(0)}</span>
                                </div>
                            }
                        </div>

                        <div className={styles.details}>
                            <h3 className={styles.title}>{title}</h3>
                            <p className={styles.meta}>{meta}</p>

                            {genres && genres.length > 0 && (
                                <div className={styles.genres}>
                                    {genres.slice(0, 3).map((g) => (
                                        <span key={g} className={styles.genreTag}>{g}</span>
                                    ))}
                                </div>
                            )}

                            {tmdbRating && <p className={styles.rating}>★ {tmdbRating} / 10 (TMDB)</p>}

                            {/* ── Action buttons
                  e.preventDefault() stops <Link> navigation on button click ── */}
                            <div className={styles.actions}>
                                <button
                                    className={`${styles.actionBtn} ${watched ? styles.actionBtnActive : ""}`}
                                    onClick={(e) => { e.preventDefault(); handleWatchClick(); }}
                                    title={watched ? "Mark as unwatched" : "Mark as watched"}
                                >
                                    <i className={`bi ${watched ? "bi-eye-fill" : "bi-eye-slash-fill"}`} />
                                </button>
                                <button
                                    className={`${styles.actionBtn} ${liked ? styles.actionBtnLiked : ""}`}
                                    onClick={(e) => { e.preventDefault(); handleLikeClick(); }}
                                    title={liked ? "Unlike" : "Like"}
                                >
                                    <i className="bi bi-suit-heart-fill" />
                                </button>
                                <button
                                    className={styles.actionBtn}
                                    onClick={(e) => { e.preventDefault(); setShowOptions(true); }}
                                    title="More options"
                                >
                                    <i className="bi bi-three-dots-vertical" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* ── Progress bar ── */}
                    {progressPercent != null && (
                        <div className={styles.progressBar}>
                            <div className={styles.progressFill} style={{ width: `${progressPercent}%` }} />
                        </div>
                    )}

                </div>
            </Link>

            {/* ── Options modal — outside <Link> so it doesn't trigger navigation ── */}
            {showOptions && (
                <OptionsModal
                    isOpen={showOptions}
                    onClose={() => setShowOptions(false)}
                    servie={servieForModal}
                    onSuccess={(msg) => setAlert({ type: "success", message: msg })}
                    onError={(msg) => setAlert({ type: "danger", message: msg })}
                    initialRating={rating}
                    onRatingChange={handleRatingChange}
                    onSaveReview={handleSaveReview}
                />
            )}
        </>
    );
};

export default BackdropCard;