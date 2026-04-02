export interface UserInteractionDto {
    tmdbId: number;
    childtype: "movie" | "tv";
    completed: boolean | null;  // null for tv — use episodesWatched instead
    liked: boolean | null;
    rated: number | null;
    episodesWatched: number | null;  // null for movies
}