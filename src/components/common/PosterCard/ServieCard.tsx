import React, { useState } from "react";
import PosterCard from "@/components/common/PosterCard/PosterCard";
import OptionsModal from "../ServieGrid/OptionsModal";
import axiosInstance from "@/utils/axiosInstance";
import { useAlert } from "@/contexts/AlertContext";
import type { ReviewData, Servie } from "@/types/servie";
import { userInteractionStore } from '@/store/UserInteractionStore';
import { saveServieReview } from "@/api/servieApi";
import { getAxiosErrorMessage } from "@/api/axiosError";

interface ServieCardProps {
    servie: Servie;
    blurCompleted?: boolean;
    onWatchChange?: (tmdbId: number, childtype: string, newWatched: boolean) => void;
    faded?: boolean;
}

const ServieCard: React.FC<ServieCardProps> = ({
    servie,
    blurCompleted = false,
    onWatchChange,
    faded = false,
}) => {
    const { setAlert } = useAlert();
    const { update } = userInteractionStore();

    const [watched, setWatched] = useState(servie.completed);
    const [liked, setLiked] = useState(servie.liked);
    const [showOptions, setShowOptions] = useState(false);
    const [rating, setRating] = useState(servie.rated ?? null);

    const handleWatchClick = async () => {
        const prev = watched;
        const next = !prev;
        setWatched(next);
        try {
            const res = await axiosInstance.put(`servies/${servie.childtype}/${servie.tmdbId}/watch`,
                null,
                { params: { newServieWatchState: next } }
            );
            if (res.status === 200) {
                onWatchChange?.(servie.tmdbId, servie.childtype, next);
                setAlert({ type: "success", message: `Updated watch status of ${servie.title}` });
            }
        } catch {
            setWatched(prev);
            setAlert({ type: "danger", message: "Failed to update watch status." });
        }
    };

    const handleLikeClick = async () => {
        const prev = liked;
        const next = !prev;
        setLiked(next);
        update(servie.childtype, servie.tmdbId, { liked: next });
        try {
            const res = await axiosInstance.patch(`/servies/${servie.childtype}/${servie.tmdbId}/review`,
                { liked: next }
            );
            if (res.status === 200)
                setAlert({ type: "success", message: `Updated like status of ${servie.title}` });
        } catch {
            setLiked(prev);
            update(servie.childtype, servie.tmdbId, { liked: prev });
            setAlert({ type: "danger", message: "Failed to update like status." });
        }
    };

    const handleRatingChange = async (newRating: number | null) => {
        if (rating === newRating) return;
        const prev = rating;
        setRating(newRating);

        try {
            await axiosInstance.patch(`/servies/${servie.childtype}/${servie.tmdbId}/review`,
                { rating: newRating }
            );
            update(
                servie.childtype,
                servie.tmdbId,
                { rated: newRating }
            );
        } catch (error) {
            setRating(prev);
            throw error;
        }
    };

    const handleSaveReview = async (reviewData: ReviewData) => {
        try {
            await saveServieReview(servie.childtype, servie.tmdbId, reviewData);

            if (reviewData.rating !== undefined) {
                setRating(reviewData.rating);
                update(servie.childtype, servie.tmdbId, {
                    rated: reviewData.rating,
                });
            }
            if (reviewData.liked !== undefined) {
                setLiked(reviewData.liked);
                update(servie.childtype, servie.tmdbId, {
                    liked: reviewData.liked,
                });
            }

            setAlert({ type: "success", message: "Saved successfully!" });
        } catch (error) {
            setAlert({ type: "danger", message: getAxiosErrorMessage(error) });
            throw error;
        }
    };

    return (
        <div
            style={{
                opacity: faded ? 0.35 : 1,
                transition: "opacity 0.4s ease",
                pointerEvents: faded ? "none" : "auto",
            }}
        >
            <PosterCard
                tmdbId={servie.tmdbId}
                childtype={servie.childtype}
                title={servie.title}
                releaseDate={servie.releaseDate ?? undefined}
                firstAirDate={servie.firstAirDate ?? undefined}
                lastAirDate={servie.lastAirDate ?? undefined}
                posterPath={servie.posterPath}
                watched={watched}
                liked={liked}
                episodesWatched={servie.episodesWatched}
                totalEpisodes={servie.totalEpisodes}
                popularity={servie.popularity}
                blurCompleted={blurCompleted}
                onWatchClick={handleWatchClick}
                onLikeClick={handleLikeClick}
                onOptionsClick={() => setShowOptions(true)}
            />

            {showOptions && (
                <OptionsModal
                    isOpen={showOptions}
                    onClose={() => setShowOptions(false)}
                    servie={{
                        ...servie,
                        completed: watched,
                        liked,
                        rated: rating,
                    }}
                    onSuccess={(msg) => setAlert({ type: "success", message: msg })}
                    onError={(msg) => setAlert({ type: "danger", message: msg })}
                    initialRating={rating}
                    onRatingChange={handleRatingChange}
                    onSaveReview={handleSaveReview}
                />
            )}
        </div>
    );
};

export default ServieCard;