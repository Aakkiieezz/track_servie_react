import type { ReviewData } from "@/types/servie";
// Adjust these three import paths to wherever your API files live.
import { saveServieReview } from "@/api/servieApi";
import { saveSeasonReview } from "@/api/seasonApi";
import { saveEpisodeReview } from "@/api/episodeApi";

/** What identifies the thing a review belongs to. A row from the reviews list already has all of it. */
export interface ReviewTarget {
    entityType: string;
    childtype: string;
    tmdbId: number;
    seasonNo: number | null;
    episodeNo: number | null;
}

/**
 * One entry point for "save a review for whatever this is", for places that show mixed entity
 * types (the reviews tab today, maybe a feed / diary later). It only picks the right existing
 * API function; the entity API files stay where they are.
 *
 * Rejects on failure, so callers can keep their UI open and show an error.
 */
export async function saveReview(target: ReviewTarget, data: ReviewData): Promise<void> {
    switch (target.entityType) {
        case "MOVIE":
        
        case "SERIES":
            await saveServieReview(target.childtype, target.tmdbId, data);
            return;

        case "SEASON":
            if (target.seasonNo == null)
                throw new Error("Missing season number");
            
            await saveSeasonReview(target.tmdbId, target.seasonNo, data);
            return;

        case "EPISODE":
            if (target.seasonNo == null || target.episodeNo == null)
                throw new Error("Missing season or episode number");

            await saveEpisodeReview(target.tmdbId, target.seasonNo, target.episodeNo, data);
            return;

        default:
            throw new Error(`Unsupported entity type: ${target.entityType}`);
    }
}