import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

import BackdropCard from "@/components/common/BackdropCard/BackdropCard";

import {
  type NormalizedMedia,
  type MediaCardData,
  type GenreMap,
  mergeMediaWithUserState,
} from "@/types/tmdb.types";
import { userInteractionStore } from "@/store/UserInteractionStore";

import {
  fetchTrendingMovies,
  fetchTrendingTv,
  fetchTrendingAll,

  fetchPopularMovies,
  fetchPopularTv,
  fetchPopularAll,

  fetchTopRatedMovies,
  fetchTopRatedTv,

  fetchUpcomingMovies,
  fetchGenreMap,
} from "@/lib/api";

import styles from "./DiscoveryPage.module.css";
import AppHeader from "@/components/common/AppHeader/AppHeader";

// ─────────────────────────────────────────────
// Route config — maps pathname → title + fetcher
// Adding a new list type = one new entry here
// ─────────────────────────────────────────────

interface RouteConfig {
  title: string;
  fetcher: () => Promise<NormalizedMedia[]>;
}

const ROUTE_CONFIG: Record<string, RouteConfig> = {
  "/trending/movies": { title: "Trending movies", fetcher: fetchTrendingMovies },
  "/trending/tv": { title: "Trending shows", fetcher: fetchTrendingTv },
  "/trending/all": { title: "Trending", fetcher: fetchTrendingAll },

  "/popular/movies": { title: "Popular movies", fetcher: fetchPopularMovies },
  "/popular/tv": { title: "Popular shows", fetcher: fetchPopularTv },
  "/popular/all": { title: "Popular", fetcher: fetchPopularAll },

  "/top-rated/movies": { title: "Top rated movies", fetcher: fetchTopRatedMovies },
  "/top-rated/tv": { title: "Top rated shows", fetcher: fetchTopRatedTv },
  
  "/upcoming/movies": { title: "Upcoming movies", fetcher: fetchUpcomingMovies },
};

// ─────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────

export default function DiscoverPage() {
  const { pathname } = useLocation();
  const config = ROUTE_CONFIG[pathname];

  const { get: getInteraction, load: loadInteractions, loaded: interactionsLoaded } = userInteractionStore();

  const [items, setItems] = useState<NormalizedMedia[]>([]);
  const [genreMap, setGenreMap] = useState<GenreMap>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => { loadInteractions(); }, [loadInteractions]);

  useEffect(() => {
    fetchGenreMap().then(setGenreMap).catch(() => { });
  }, []);

  useEffect(() => {
    if (!config || Object.keys(genreMap).length === 0 || !interactionsLoaded) return;

    setLoading(true);
    setError(false);
    config.fetcher()
      .then((data) => { setItems(data); setLoading(false); })
      .catch(() => { setError(true); setLoading(false); });
  }, [config, genreMap, interactionsLoaded]);

  // ── Merge TMDB items with user state ──
  const mergedItems: MediaCardData[] = mergeMediaWithUserState(
    items, getInteraction, genreMap
  );

  // ── Unknown route ──
  if (!config)
    return <p className={styles.error}>Unknown list.</p>;

  const pageTitle = (
    <h1 className={styles.title}>
      {config.title}
      {!loading && (
        <span className={styles.count}>{mergedItems.length} titles</span>
      )}
    </h1>
  );

  // ── Loading ──
  if (loading)
    return (
      <main className={styles.page}>
        {pageTitle}
        <div className={styles.grid}>
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className={styles.skeleton} />
          ))}
        </div>
      </main>
    );

  // ── Error ──
  if (error)
    return (
      <main className={styles.page}>
        {pageTitle}
        <p className={styles.error}>Failed to load. Please try again.</p>
      </main>
    );

  // ── Full list — backdrop cards ──
  return (
    <>
      <AppHeader />
      <main className={styles.page}>
        {pageTitle}
        <div className={styles.grid}>
          {mergedItems.map((item, i) => (
            <BackdropCard
              key={`${item.childtype}-${item.tmdbId}`}
              {...item}
              rank={i + 1}
            />
          ))}
        </div>
      </main>
    </>
  );
}