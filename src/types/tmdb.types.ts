import type { UserInteraction } from "@/store/UserInteractionStore";

// ─────────────────────────────────────────────
// Raw shapes from TMDB API (only fields we use)
// ─────────────────────────────────────────────

export interface TmdbRawMovie {
  id: number;
  media_type: "movie";
  title: string;
  poster_path: string | null;
  backdrop_path: string | null;
  genre_ids: number[];
  release_date: string | null;       // "YYYY-MM-DD"
  vote_average: number;
  adult: boolean;
}

export interface TmdbRawTv {
  id: number;
  media_type: "tv";
  name: string;
  poster_path: string | null;
  backdrop_path: string | null;
  genre_ids: number[];
  first_air_date: string | null;     // "YYYY-MM-DD"
  vote_average: number;
  adult: boolean;
}

// Multi endpoint returns either shape — media_type discriminates
export type TmdbRawMulti = TmdbRawMovie | TmdbRawTv;

// ─────────────────────────────────────────────
// Normalized shape used across the whole app
// Both BackdropCard and PosterCard consume this
// ─────────────────────────────────────────────

export interface NormalizedMedia {
  tmdbId: number;
  childtype: "movie" | "tv";
  title: string;
  posterPath: string | null;
  backdropPath: string | null;
  genreIds: number[];
  releaseDate: string | null;      // unified — maps from release_date or first_air_date
  voteAverage: number;
}

// ─────────────────────────────────────────────
// Genre id → name map (TMDB genre list)
// Fetch once from /genre/movie/list and /genre/tv/list, merge, cache
// ─────────────────────────────────────────────

export type GenreMap = Record<number, string>;

// ─────────────────────────────────────────────
// Normalizer
// ─────────────────────────────────────────────

export function normalizeMedia(raw: TmdbRawMulti): NormalizedMedia {
  if (raw.media_type === "movie") {
    return {
      tmdbId: raw.id,
      childtype: "movie",
      title: raw.title,
      posterPath: raw.poster_path,
      backdropPath: raw.backdrop_path,
      genreIds: raw.genre_ids,
      releaseDate: raw.release_date,
      voteAverage: raw.vote_average,
    };
  }

  return {
    tmdbId: raw.id,
    childtype: "tv",
    title: raw.name,
    posterPath: raw.poster_path,
    backdropPath: raw.backdrop_path,
    genreIds: raw.genre_ids,
    releaseDate: raw.first_air_date,
    voteAverage: raw.vote_average,
  };
}

// ─────────────────────────────────────────────
// User state that gets merged on top of NormalizedMedia at render time
// Comes from your own backend, keyed by tmdbId
// ─────────────────────────────────────────────

export interface UserMediaState {
  tmdbId: number;
  childtype: "movie" | "tv";
  watched: boolean;
  liked: boolean;
  episodesWatched?: number | null;
  totalEpisodes?: number | null;
}

// ─────────────────────────────────────────────
// Final merged shape passed into cards
// ─────────────────────────────────────────────

export interface MediaCardData extends NormalizedMedia {
  genres: string[];
  watched: boolean; // user state — defaults to false/null if user not logged in or no data
  liked: boolean;
  episodesWatched?: number | null;
  totalEpisodes?: number | null;
}

// ─────────────────────────────────────────────
// Merge helper — call this before rendering card lists
// ─────────────────────────────────────────────

export function mergeMediaWithUserState(
  items:      NormalizedMedia[],
  getState:   (mediaType: string, tmdbId: number) => UserInteraction | null,
  genreMap:   GenreMap
): MediaCardData[] {
  return items.map((item) => {
    const state = getState(item.childtype, item.tmdbId);
 
    return {
      ...item,
      genres: item.genreIds
        .map((id) => genreMap[id])
        .filter(Boolean),
      watched:         state?.completed       ?? false,
      liked:           state?.liked           ?? false,
      episodesWatched: state?.episodesWatched ?? null,
      totalEpisodes:   null,  // not available on TMDB list endpoints
    };
  });
}