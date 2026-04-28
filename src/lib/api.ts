import axiosInstance from "@/utils/axiosInstance";
import type { NormalizedMedia, GenreMap } from "@/types/tmdb.types";
import type { UserInteractionDto } from "@/types/UserInteractionDto";

// ─────────────────────────────────────────────
// Trending
// ─────────────────────────────────────────────

export async function fetchTrendingAll(): Promise<NormalizedMedia[]> {
    const res = await axiosInstance.get("/trending", { params: { type: "all" } });
    return res.data;
}

export async function fetchTrendingMovies(): Promise<NormalizedMedia[]> {
    const res = await axiosInstance.get("/trending", { params: { type: "movies" } });
    return res.data;
}

export async function fetchTrendingTv(): Promise<NormalizedMedia[]> {
    const res = await axiosInstance.get("/trending", { params: { type: "tv" } });
    return res.data;
}

// ─────────────────────────────────────────────
// Popular
// ─────────────────────────────────────────────

export async function fetchPopularAll(): Promise<NormalizedMedia[]> {
    const res = await axiosInstance.get("/popular", { params: { type: "all" } });
    return res.data;
}

export async function fetchPopularMovies(): Promise<NormalizedMedia[]> {
    const res = await axiosInstance.get("/popular", { params: { type: "movies" } });
    return res.data;
}

export async function fetchPopularTv(): Promise<NormalizedMedia[]> {
    const res = await axiosInstance.get("/popular", { params: { type: "tv" } });
    return res.data;
}

// ─────────────────────────────────────────────
// Top Rated
// ─────────────────────────────────────────────

export async function fetchTopRatedMovies(): Promise<NormalizedMedia[]> {
    const res = await axiosInstance.get("/top-rated", { params: { type: "movies" } });
    return res.data;
}

export async function fetchTopRatedTv(): Promise<NormalizedMedia[]> {
    const res = await axiosInstance.get("/top-rated", { params: { type: "tv" } });
    return res.data;
}

// ─────────────────────────────────────────────
// Upcoming
// ─────────────────────────────────────────────

export async function fetchUpcomingMovies(): Promise<NormalizedMedia[]> {
    const res = await axiosInstance.get("/upcoming", { params: { type: "movies" } });
    return res.data;
}

// ─────────────────────────────────────────────
// Genre map
// TMDB genre ids are stable — cache aggressively
// ─────────────────────────────────────────────

let genreMapCache: GenreMap | null = null;

export async function fetchGenreMap(): Promise<GenreMap> {
    if (genreMapCache) return genreMapCache;
    const res = await axiosInstance.get("/genres");
    genreMapCache = res.data as GenreMap;
    return genreMapCache;
}

// ─────────────────────────────────────────────
// User interactions store
// Replaces the old fetchUserStates() mock.
// Called once on app init — see useInteractionsStore.
// ─────────────────────────────────────────────

export async function fetchUserInteractions(): Promise<UserInteractionDto[]> {
    const res = await axiosInstance.get("/user/servie-mappings");
    return res.data;
}