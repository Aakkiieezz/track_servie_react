export interface Servie {
  // Servie fields
  tmdbId: number;
  childtype: "movie" | "tv";
  title: string;
  posterPath?: string | null;
  popularity?: number | null;

  // Movie fields
  releaseDate?: string | null;

  // Series fields
  totalEpisodes?: number | null;
  firstAirDate?: string | null;
  lastAirDate?: string | null;

  // UserServieData fields
  episodesWatched?: number;
  completed: boolean;
  liked: boolean;
  rated?: number | null;
}

export interface ReviewData {
    tmdbId: number;
    childType: string;
    watchedOn: string;
    watchedBefore: boolean;
    review: string;
    tags: string[];
    rating: number;
    liked: boolean;
}