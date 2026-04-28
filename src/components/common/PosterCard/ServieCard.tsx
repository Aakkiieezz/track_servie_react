import React, { useState } from "react";
import PosterCard from "@/components/common/PosterCard/PosterCard";
import ServieOptionsModal from "../ServieGrid/OptionsModal";
import axiosInstance from "@/utils/axiosInstance";
import { useAlert } from "@/contexts/AlertContext";
import type { Servie } from "@/types/servie";

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

    const [watched, setWatched] = useState(servie.completed);
    const [liked, setLiked] = useState(servie.liked);
    const [showOptions, setShowOptions] = useState(false);

    const handleWatchClick = async () => {
        const prev = watched;
        const next = !prev;
        setWatched(next);
        try {
            const res = await axiosInstance.put(
                `servies/${servie.childtype}/${servie.tmdbId}/watch`,
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
        try {
            const res = await axiosInstance.put(
                `servies/${servie.tmdbId}`,
                null,
                { params: { type: servie.childtype, like: next } }
            );
            if (res.status === 200)
                setAlert({ type: "success", message: `Updated like status of ${servie.title}` });
        } catch {
            setLiked(prev);
            setAlert({ type: "danger", message: "Failed to update like status." });
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
                <ServieOptionsModal
                    isOpen={showOptions}
                    onClose={() => setShowOptions(false)}
                    servie={{ ...servie, completed: watched, liked }}
                    onSuccess={(msg) => setAlert({ type: "success", message: msg })}
                    onError={(msg) => setAlert({ type: "danger", message: msg })}
                />
            )}
        </div>
    );
};

export default ServieCard;