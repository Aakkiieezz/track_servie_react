export interface UserInteractionDto {
    tmdbId: number;
    childtype: "movie" | "tv";
    completed: boolean;          // false for unwatched movies; for TV derived from episode progress
    liked: boolean;
    rated: number | null;
    review: string | null;
    episodesWatched: number | null; // null for movies
}