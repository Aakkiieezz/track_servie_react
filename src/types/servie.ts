export interface Servie {
  // Servie fields
  tmdbId: number;
  childtype: "movie" | "tv";
  title: string;
  posterPath: string;

  // Movie fields
  releaseDate?: string;

  // Series fields
  totalEpisodes: number | null;
  firstAirDate?: string;
  lastAirDate?: string;

  // UserServieData fields
  episodesWatched: number;
  completed: boolean;
  liked: boolean;
  rated: number | null;
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