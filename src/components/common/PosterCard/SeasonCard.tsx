import React, { useState } from "react";
import PosterCard from "@/components/common/PosterCard/PosterCard";
import axiosInstance from "@/utils/axiosInstance";
import { useAlert } from "@/contexts/AlertContext";
import ServieOptionsModal from "../ServieGrid/OptionsModal";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Season {
    id: number;
    name: string;
    seasonNo: number;
    posterPath: string | null;
    episodeCount: number;
    episodesWatched: number;
    watched: boolean;
    totalRuntime: number;
    totalWatchedRuntime: number;
    popularity?: number | null;
}

interface SeasonCardProps {
    season: Season;
    tmdbId: string;         // parent series tmdbId — needed for the season endpoint
    blurCompleted?: boolean;

    // Bubbles up new totals so the series page header can update
    onWatchChange: (data: {
        seasonNo: number;
        newWatched: boolean;
        newEpCount: number;
        newRuntime: number;
    }) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

const SeasonCard: React.FC<SeasonCardProps> = ({
    season,
    tmdbId,
    blurCompleted = false,
    onWatchChange,
}) => {
    const { setAlert } = useAlert();

    const [watched, setWatched] = useState(season.watched);
    const [liked, setLiked] = useState(false);   // seasons don't have like yet
    const [epWatched, setEpWatched] = useState(season.episodesWatched);
    const [watchRuntime, setWatchRuntime] = useState(season.totalWatchedRuntime);

    const [showOptions, setShowOptions] = useState(false);

    // ── Toggle watch ──────────────────────────────────────────────────────────
    const handleWatchClick = async () => {
        const prev = watched;
        const next = !prev;
        const newEpCount = next ? season.episodeCount : 0;
        const newRuntime = next ? season.totalRuntime : 0;

        // Optimistic update
        setWatched(next);
        setEpWatched(newEpCount);
        setWatchRuntime(newRuntime);
        onWatchChange({
            seasonNo: season.seasonNo,
            newWatched: next,
            newEpCount,
            newRuntime
        });

        try {
            const res = await axiosInstance.put(
                `servies/${tmdbId}/Season/${season.seasonNo}/watch`,
                null,
                { params: { newSeasonWatchState: next } }
            );
            if (res.status === 200)
                setAlert({ type: "success", message: `Updated watch status of ${season.name}` });
        } catch {
            // Revert on failure
            setWatched(prev);
            setEpWatched(season.episodesWatched);
            setWatchRuntime(season.totalWatchedRuntime);
            onWatchChange({
                seasonNo: season.seasonNo,
                newWatched: prev,
                newEpCount: season.episodesWatched,
                newRuntime: season.totalWatchedRuntime,
            });
            setAlert({ type: "danger", message: "Failed to update watch status." });
        }
    };

    // ── Toggle like ───────────────────────────────────────────────────────────

    const handleLikeClick = async () => {
        const prev = liked;
        const next = !prev;
        setLiked(next);

        try {
            const res = await axiosInstance.put(
                `servies/${tmdbId}/Season/${season.seasonNo}`,
                null,
                { params: { like: next } }
            );
            if (res.status === 200)
                setAlert({ type: "success", message: `Updated like status of ${season.name}` });
        } catch {
            setLiked(prev);
            setAlert({ type: "danger", message: "Failed to update like status." });
        }
    };

    return (
        <>
            <PosterCard
                tmdbId={Number(tmdbId)}
                childtype="tv"
                title={season.name}
                seasonNo={season.seasonNo}
                posterPath={season.posterPath}
                watched={watched}
                liked={liked}
                episodesWatched={epWatched}
                totalEpisodes={season.episodeCount}
                totalWatchedRuntime={watchRuntime}
                totalRuntime={season.totalRuntime}
                popularity={season.popularity}
                blurCompleted={blurCompleted}
                onWatchClick={handleWatchClick}
                onLikeClick={handleLikeClick}
                onOptionsClick={() => setShowOptions(true)}
            />

            {showOptions && (
                <ServieOptionsModal
                    isOpen={showOptions}
                    onClose={() => setShowOptions(false)}
                    servie={{
                        tmdbId: Number(tmdbId),
                        childtype: "tv",
                        title: season.name,
                        posterPath: season.posterPath,
                        completed: watched,
                        liked: liked
                    }}
                    onSuccess={(msg) => setAlert({ type: "success", message: msg })}
                    onError={(msg) => setAlert({ type: "danger", message: msg })}
                    showWatchlist={false}
                    showLists={false}
                />
            )}
        </>
    );
};

export default SeasonCard;