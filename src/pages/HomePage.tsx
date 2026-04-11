import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";

import HomeTabs, { type HomeTab } from "@/components/HomePage/HomeTabs";
import SectionRow from "@/components/HomePage/SectionRow";
import ServieCard from "@/components/common/PosterCard/ServieCard";
import type { Servie } from "@/types/servie";
import { userInteractionStore } from "@/store/UserInteractionStore";
import styles from "./HomePage.module.css";

import {
    type NormalizedMedia,
    type MediaCardData,
    type GenreMap,
    mergeMediaWithUserState,
} from "@/types/tmdb.types";


import {
    fetchTrendingAll,
    fetchTrendingMovies,
    fetchTrendingTv,

    fetchPopularAll,
    fetchPopularMovies,
    fetchPopularTv,

    fetchTopRatedMovies,
    fetchTopRatedTv,

    fetchUpcomingMovies,

    fetchGenreMap,
} from "@/lib/api";
import AppHeader from "@/components/common/AppHeader/AppHeader";


// ─────────────────────────────────────────────
// Adapter — MediaCardData → Servie
// ─────────────────────────────────────────────

function toServie(item: MediaCardData): Servie {
    return {
        tmdbId: item.tmdbId,
        childtype: item.childtype,
        title: item.title,
        posterPath: item.posterPath,
        releaseDate: item.childtype === "movie" ? item.releaseDate : null,
        firstAirDate: item.childtype === "tv" ? item.releaseDate : null,
        totalEpisodes: item.totalEpisodes ?? null,
        episodesWatched: item.episodesWatched ?? undefined,
        completed: item.watched,
        liked: item.liked,
        rated: null,
        popularity: null,
        lastAirDate: undefined,
    };
}

// ─────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────

const POSTER_LIMIT = 10;

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

interface SectionData {
    items: NormalizedMedia[];
    loading: boolean;
    error: boolean;
}

function emptySection(): SectionData {
    return { items: [], loading: true, error: false };
}

interface HomeData {
    trendingAll: SectionData;
    trendingMovies: SectionData;
    trendingTv: SectionData;

    popularAll: SectionData;
    popularMovies: SectionData;
    popularTv: SectionData;

    topRatedMovies: SectionData;
    topRatedTv: SectionData;

    upcomingMovies: SectionData;
}

function tabFromParam(param: string | null): HomeTab {
    if (param === "movies" || param === "shows") return param;
    return "all";
}

// ─────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────

export default function HomePage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const activeTab = tabFromParam(searchParams.get("tab"));

    const { get: getInteraction, load: loadInteractions, loaded: interactionsLoaded } = userInteractionStore();

    const [genreMap, setGenreMap] = useState<GenreMap>({});
    const [data, setData] = useState<HomeData>({
        trendingAll: emptySection(),
        trendingMovies: emptySection(),
        trendingTv: emptySection(),

        popularAll: emptySection(),
        popularMovies: emptySection(),
        popularTv: emptySection(),

        topRatedMovies: emptySection(),
        topRatedTv: emptySection(),

        upcomingMovies: emptySection(),
    });

    // ── Load interactions store once on mount ──
    useEffect(() => {
        loadInteractions();
    }, [loadInteractions]);

    // ── Fetch genre map once ──
    useEffect(() => {
        fetchGenreMap().then(setGenreMap).catch(() => { });
    }, []);

    // ── Fetch all sections once genre map + interactions are ready ──
    useEffect(() => {
        if (Object.keys(genreMap).length === 0 || !interactionsLoaded) return;

        async function loadSection(
            key: keyof HomeData,
            fetcher: () => Promise<NormalizedMedia[]>
        ) {
            try {
                const raw = await fetcher();
                setData((prev) => ({
                    ...prev,
                    // [key]: { items: sliced, loading: false, error: false },
                    [key]: { items: raw.slice(0, POSTER_LIMIT), loading: false, error: false },
                }));
            } catch {
                setData((prev) => ({
                    ...prev,
                    [key]: { items: [], loading: false, error: true },
                }));
            }
        }

        loadSection("trendingAll", fetchTrendingAll);
        loadSection("trendingMovies", fetchTrendingMovies);
        loadSection("trendingTv", fetchTrendingTv);

        loadSection("popularAll", fetchPopularAll);
        loadSection("popularMovies", fetchPopularMovies);
        loadSection("popularTv", fetchPopularTv);

        loadSection("topRatedMovies", fetchTopRatedMovies);
        loadSection("topRatedTv", fetchTopRatedTv);

        loadSection("upcomingMovies", fetchUpcomingMovies);
    }, [genreMap, interactionsLoaded]);

    // ── Tab change ──
    function handleTabChange(tab: HomeTab) {
        setSearchParams(tab === "all" ? {} : { tab });
    }

    // ── Merge + render a section ──────────────────────────────────────────

    function renderSection(section: SectionData) {
        if (section.loading)
            return <PosterSkeleton count={POSTER_LIMIT} />;

        if (section.error)
            return <SectionError />;

        return mergeMediaWithUserState(section.items, getInteraction, genreMap)
            .map((item) => (
                <ServieCard
                    key={`${item.childtype}-${item.tmdbId}`}
                    servie={toServie(item)}
                />
            ));
    }

    // ── Layout ────────────────────────────────────────────────────────────

    return (
        <>
            <AppHeader />
            <main className={styles.page}>
                <HomeTabs active={activeTab} onChange={handleTabChange} />

                {activeTab === "all" && (
                    <div className={styles.sections}>
                        <SectionRow title="Trending" meta="Updated daily" seeAllPath="/trending/all">
                            {renderSection(data.trendingAll)}
                        </SectionRow>
                        <SectionRow title="Popular" seeAllPath="/popular/all">
                            {renderSection(data.popularAll)}
                        </SectionRow>
                    </div>
                )}

                {activeTab === "movies" && (
                    <div className={styles.sections}>
                        <SectionRow title="Trending movies" meta="Updated daily" seeAllPath="/trending/movies">
                            {renderSection(data.trendingMovies)}
                        </SectionRow>
                        <SectionRow title="Popular movies" seeAllPath="/popular/movies">
                            {renderSection(data.popularMovies)}
                        </SectionRow>
                        <SectionRow title="Top rated movies" seeAllPath="/top-rated/movies">
                            {renderSection(data.topRatedMovies)}
                        </SectionRow>
                        <SectionRow title="Upcoming movies" seeAllPath="/upcoming/movies">
                            {renderSection(data.upcomingMovies)}
                        </SectionRow>
                    </div>
                )}

                {activeTab === "shows" && (
                    <div className={styles.sections}>
                        <SectionRow title="Trending shows" meta="Updated daily" seeAllPath="/trending/tv">
                            {renderSection(data.trendingTv)}
                        </SectionRow>
                        <SectionRow title="Popular shows" seeAllPath="/popular/tv">
                            {renderSection(data.popularTv)}
                        </SectionRow>
                        <SectionRow title="Top rated shows" seeAllPath="/top-rated/tv">
                            {renderSection(data.topRatedTv)}
                        </SectionRow>
                    </div>
                )}
            </main>
        </>

    );
}

// ─────────────────────────────────────────────
// Skeletons + Error
// ─────────────────────────────────────────────

function PosterSkeleton({ count }: { count: number }) {
    return (
        <>
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className={styles.skeletonPoster} />
            ))}
        </>
    );
}

function SectionError() {
    return <p className={styles.error}>Failed to load. Please try again.</p>;
}