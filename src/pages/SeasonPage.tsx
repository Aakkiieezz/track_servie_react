import { useEffect, useState, useRef, useCallback } from "react";
import { useParams } from "react-router-dom";
import axiosInstance from '../utils/axiosInstance';

import { useAlert } from "../contexts/AlertContext";
import CastListSlider from "@/components/common/CastListSlider/CastListSlider";
import SeasonsNavBar from "@/components/SeasonPage/SeasonsNavBar";
import ProgressBar from '../components/common/ProgressBar/ProgressBar';
import AppHeader from "@/components/common/AppHeader/AppHeader";

import styles from './SeasonPage.module.css';

interface Season {
    id: number;
    name: string;
    tmdbId: number;
    episodeCount: number;
    episodesWatched: number;
    watched: boolean;
    overview: string;
    posterPath: string;
    seasonNo: number;
    totalRuntime: number;
    watchedRuntime: number;
    lastModified: string;
    seasonCast: Cast[];
    seasonCastGuests: Cast[];
    episodes: Episode[];
    totalSeasons: number;
    hasSpecials: boolean;
}

interface Cast {
    personId: number;
    name: string;
    character: string;
    profilePath: string;
    gender: number;
    totalEpisodes: number;
}

interface Episode {
    name: string;
    episodeNo: number;
    stillPath: string | null;
    overview: string;
    runtime: number;
    lastModified: string;
    airDate: string;
    watched: boolean;
}

const SeasonPage = () => {
    // ✅ ALL useState
    const { setAlert } = useAlert();
    const [loading, setLoading] = useState<boolean>(true);
    const [, setError] = useState<string | null>(null);
    const [season, setSeason] = useState<Season | null>(null);
    const [seasonWatchState, setSeasonWatchState] = useState(false);
    const [epWatchState, setEpWatchState] = useState<{ [key: string]: boolean }>({});
    const [epWatchCount, setEpWatchedCount] = useState<number>(0);
    const [epRuntime, setEpRuntime] = useState<{ [key: string]: number }>({});
    const [seasonWatchRuntime, setSeasonWatchRuntime] = useState<number>(0);
    const [seasonRuntime, setSeasonRuntime] = useState<number>(0);
    const [totalSeasons, setTotalSeasons] = useState(0);
    const [hasSpecials, setHasSpecials] = useState(false);
    const [seasonCastActiveTab, setSeasonCastActiveTab] = useState<"regulars" | "guests">("regulars");

    // ✅ ALL useRef hooks
    const pendingTogglesRef = useRef<Map<number, boolean>>(new Map());
    const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
    const DEBOUNCE_DELAY = 3000; // 3 seconds

    // 🔑 KEY FIX: Capture snapshot BEFORE first toggle in a batch
    const rollbackRef = useRef<{
        epWatchState: { [key: string]: boolean };
        epWatchCount: number;
        seasonWatchRuntime: number;
        seasonWatchState: boolean;
    } | null>(null);

    // ✅ NOW extract params and derived values (after all hooks)
    const { tmdbId, seasonNo = "1" } = useParams<{ tmdbId: string, seasonNo?: string }>();
    const currentSeasonNo = parseInt(seasonNo, 10);
    const totalEpisodes = season?.episodeCount || 1;

    // ✅ Define fetchSeasonData BEFORE useEffect uses it
    const fetchSeasonData = async (tmdbId: string, seasonNo: string) => {
        try {
            setLoading(true);
            const response = await axiosInstance.get(`servies/${tmdbId}/Season/${seasonNo}`);
            setSeason(response.data);
            setTotalSeasons(response.data.totalSeasons);
            setHasSpecials(response.data.hasSpecials);
        } catch (error) {
            console.error("Error fetching servies", error);
        } finally {
            setLoading(false);
        }
    };

    // ✅ useCallback hooks
    // Flush pending toggles to backend
    const flushPendingToggles = useCallback(async () => {
        if (pendingTogglesRef.current.size === 0) {
            console.log("No pending toggles to flush");
            rollbackRef.current = null; // cleanup safety
            return;
        }

        // 🔍 Build diff-only payload
        const episodes = Array.from(pendingTogglesRef.current.entries())
            .filter(([episodeNo, watched]) => {
                const originalState = rollbackRef.current?.epWatchState[String(episodeNo)] ?? false;
                return originalState !== watched;
            })
            .map(([episodeNo, watched]) => ({
                episodeNo,
                watched,
            }));

        if (episodes.length === 0) {
            console.log("No effective changes to flush");
            pendingTogglesRef.current.clear();
            rollbackRef.current = null;
            return;
        }

        console.log("Flushing episodes:", episodes);

        try {
            const response = await axiosInstance.post(
                `servies/${tmdbId}/Season/${seasonNo}/Episodes/batch-toggle`,
                { episodes }
            );

            if (response.status === 200) {
                setAlert({
                    type: "success",
                    message: `Updated watch status of ${episodes.length} episode(s) successfully!`,
                });

                // ✅ Clear rollback since API succeeded
                rollbackRef.current = null;
            }

            pendingTogglesRef.current.clear();
        } catch (error) {
            console.error("Failed to update watch status", error);

            // 🔄 ROLLBACK TO CAPTURED STATE
            if (rollbackRef.current) {
                console.log("Rolling back to:", rollbackRef.current);
                setEpWatchState(rollbackRef.current.epWatchState);
                setEpWatchedCount(rollbackRef.current.epWatchCount);
                setSeasonWatchRuntime(rollbackRef.current.seasonWatchRuntime);
                setSeasonWatchState(rollbackRef.current.seasonWatchState);
                rollbackRef.current = null; // Clear after rollback
            }

            setAlert({
                type: "danger",
                message: "Failed to update watch status!!",
            });

            pendingTogglesRef.current.clear();
        }
    }, [tmdbId, seasonNo]);

    // ✅ ALL useEffect hooks
    useEffect(() => {
        if (tmdbId) {
            fetchSeasonData(tmdbId, seasonNo);
        }
    }, [tmdbId, seasonNo]);

    useEffect(() => {
        try {
            setLoading(true);
            if (!season)
                return;
            setSeasonWatchState(season.watched);

            const epWatchStates = season.episodes.reduce((acc, episode) => {
                acc[`${episode.episodeNo}`] = episode.watched;
                return acc;
            }, {} as { [key: string]: boolean });
            setEpWatchState(epWatchStates);

            setEpWatchedCount(season.episodesWatched);

            const epRuntimes = season.episodes.reduce((acc, episode) => {
                acc[`${episode.episodeNo}`] = episode.runtime;
                return acc;
            }, {} as { [key: string]: number });
            setEpRuntime(epRuntimes);

            const totalRuntime = Object.values(epRuntimes).reduce((sum, runtime) => {
                return sum + (runtime || 0);
            }, 0);
            setSeasonRuntime(totalRuntime);

            const totalWatchRuntime = Object.entries(epWatchStates).reduce(
                (sum, [episodeNo, watched]) => {
                    if (watched)
                        return sum + epRuntimes[episodeNo];
                    return sum;
                },
                0
            );
            setSeasonWatchRuntime(totalWatchRuntime);
        } catch (err) {
            if (err instanceof Error)
                setError(err.message);
            else
                setError("An unknown error occurred");
        } finally {
            setLoading(false);
        }
    }, [season]);

    // Force flush on component unmount or navigation
    useEffect(() => {
        return () => {
            if (pendingTogglesRef.current.size > 0) {
                if (debounceTimerRef.current)
                    clearTimeout(debounceTimerRef.current);
                flushPendingToggles();
            }
        };
    }, [flushPendingToggles]);

    // ✅ NOW you can have conditional returns AFTER all hooks
    if (isNaN(currentSeasonNo)) {
        console.error("Invalid season number, defaulting to 1");
        return <div>Invalid season number</div>;
    }

    if (tmdbId === undefined)
        console.warn("SeasonPage -> WARN -> tmdbId is undefined. Please check your route parameters.");

    if (!season) return <div>Loading...</div>;
    if (loading) return <div>Loading...</div>;

    // ✅ Regular functions
    const toggleSeasonWatch = async () => {
        const currentSeasonWatchState = seasonWatchState;
        const newSeasonWatchState = !currentSeasonWatchState;

        setSeasonWatchState(newSeasonWatchState);

        const currentEpWatchCount = epWatchCount;
        setEpWatchedCount(newSeasonWatchState ? totalEpisodes : 0);

        const currentSeasonWatchRuntime = seasonWatchRuntime;
        setSeasonWatchRuntime(newSeasonWatchState ? seasonRuntime : 0);

        const currentEpWatchCountState = epWatchState;
        setEpWatchState(
            Object.fromEntries(
                Object.keys(epWatchState).map((key) => [key, newSeasonWatchState])
            )
        );

        try {
            const response = await axiosInstance.put(
                `servies/${tmdbId}/Season/${seasonNo}/watch`,
                null,
                {
                    params: {
                        newSeasonWatchState: newSeasonWatchState,
                    },
                }
            );
            if (response.status === 200)
                setAlert({
                    type: "success",
                    message: `Updated watch status of S${seasonNo} successfully !!`,
                });
        } catch (error) {
            setSeasonWatchState(currentSeasonWatchState);
            setEpWatchedCount(currentEpWatchCount);
            setSeasonWatchRuntime(currentSeasonWatchRuntime);
            setEpWatchState(currentEpWatchCountState);

            console.error("Failed to update watch status", error);
            setAlert({ type: "danger", message: "Failed to update watch status !!" });
        }
    };

    const toggleEpisodeWatch = (episodeNo: number) => {
        const key = `${episodeNo}`;

        // 🔑 KEY FIX: Capture snapshot BEFORE first toggle
        if (pendingTogglesRef.current.size === 0 && !rollbackRef.current) {
            console.log("📸 Capturing rollback snapshot");
            rollbackRef.current = {
                epWatchState: { ...epWatchState },
                epWatchCount,
                seasonWatchRuntime,
                seasonWatchState,
            };
        }

        const currentWatchState = epWatchState[key];
        const newWatchState = !currentWatchState;

        setEpWatchState(prev => ({
            ...prev,
            [key]: newWatchState,
        }));

        setEpWatchedCount(prev => {
            const nextCount = newWatchState
                ? prev + 1
                : Math.max(prev - 1, 0);

            setSeasonWatchState(nextCount === season.episodeCount);

            return nextCount;
        });

        setSeasonWatchRuntime(prev =>
            newWatchState
                ? prev + epRuntime[key]
                : prev - epRuntime[key]
        );

        // Track this toggle
        const originalState = rollbackRef.current?.epWatchState[String(episodeNo)] ?? false;
        if (originalState === newWatchState)
            pendingTogglesRef.current.delete(episodeNo);
        else
            pendingTogglesRef.current.set(episodeNo, newWatchState);

        // Reset debounce timer
        if (debounceTimerRef.current)
            clearTimeout(debounceTimerRef.current);

        debounceTimerRef.current = setTimeout(() => {
            console.log('⏰ Timer fired! Calling flushPendingToggles');
            flushPendingToggles();
        }, DEBOUNCE_DELAY);
    };

    function formatRuntime(totalMinutes: number): string {
        const days = Math.floor(totalMinutes / 1440);
        const hours = Math.floor((totalMinutes % 1440) / 60);
        const minutes = totalMinutes % 60;

        const parts: string[] = [];

        if (days > 0) parts.push(`${days}d`);
        if (hours > 0) parts.push(`${hours}hr`);
        if (minutes > 0) parts.push(`${minutes}min`);

        return parts.length > 0 ? parts.join(" ") : "0min";
    }

    return (
        <>
            <AppHeader />
            <div className={styles.pageContainer}>

                {/* Hero Section */}
                <div className={styles.heroSection}>

                    <div className={styles.container}>
                        <SeasonsNavBar
                            tmdbId={tmdbId!}
                            currentSeasonNo={currentSeasonNo}
                            totalSeasons={totalSeasons}
                            hasSpecials={hasSpecials}
                        />
                        <br />
                        <div className={styles.heroContent}>
                            {/* Poster */}
                            <div className={styles.posterContainer}>
                                <img
                                    src={`https://image.tmdb.org/t/p/original${season.posterPath}`}
                                    alt={season.name}
                                    className={styles.posterImage}
                                />
                            </div>

                            {/* Info */}
                            <div className={styles.infoSection}>
                                <h1 className={styles.seasonTitle}>{season.name}</h1>

                                {/* Stats Bar */}
                                <div className={styles.statsBar}>
                                    <button
                                        onClick={toggleSeasonWatch}
                                        className={`${styles.watchButton} ${seasonWatchState ? styles.watched : styles.unwatched}`}
                                    >
                                        <i className={`bi ${seasonWatchState ? 'bi-eye-fill' : 'bi-eye-slash-fill'}`}></i>
                                        {seasonWatchState ? 'Watched' : 'Mark as Watched'}
                                    </button>

                                    <div className={styles.statsInfo}>
                                        <span className={styles.statsBadge}>
                                            {epWatchCount}/{season.episodeCount} Episodes
                                        </span>
                                        <span className={styles.statsSeparator}>•</span>
                                        <span className={styles.statsText}>
                                            {formatRuntime(seasonWatchRuntime)} / {formatRuntime(season.totalRuntime)}
                                        </span>
                                    </div>
                                </div>

                                {/* Progress Bar */}
                                <div className={styles.progressContainer}>
                                    <ProgressBar episodesWatched={epWatchCount} totalEpisodes={season.episodeCount} />
                                    <div className={styles.progressText}>
                                        {Math.round((epWatchCount / season.episodeCount) * 100)}% Complete
                                    </div>
                                </div>

                                {/* Overview */}
                                {season.overview && (
                                    <div className={styles.overviewSection}>
                                        <h3 className={styles.overviewTitle}>Overview</h3>
                                        <p className={styles.overviewText}>{season.overview}</p>
                                    </div>
                                )}

                                {season.lastModified && (
                                    <p className={styles.lastModified}>
                                        Last updated: {new Date(season.lastModified).toLocaleDateString('en-US', {
                                            month: 'long',
                                            day: 'numeric',
                                            year: 'numeric'
                                        })}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>


                {/* Cast Section */}
                <div className={styles.container}>
                    <div className={styles.castSection}>
                        <h2 className={styles.sectionTitle}>Cast</h2>

                        {/* Tabs */}
                        <div className={styles.tabsContainer}>
                            <button
                                onClick={() => setSeasonCastActiveTab('regulars')}
                                className={`${styles.tabButton} ${seasonCastActiveTab === 'regulars' ? styles.tabActive : ''}`}
                            >
                                Season Regulars ({season?.seasonCast?.length ?? 0})
                            </button>
                            <button
                                onClick={() => setSeasonCastActiveTab('guests')}
                                className={`${styles.tabButton} ${seasonCastActiveTab === 'guests' ? styles.tabActive : ''}`}
                            >
                                Guest Stars ({season?.seasonCastGuests?.length ?? 0})
                            </button>
                        </div>

                        {/* Tab content */}
                        {seasonCastActiveTab === 'regulars' ? (
                            <CastListSlider profiles={season?.seasonCast} childType='movie' />
                        ) : (
                            <CastListSlider profiles={season?.seasonCastGuests} childType='tv' />
                        )}
                    </div>
                </div>

                {/* Episodes Section */}
                <div className={styles.container}>
                    <div className={styles.episodesSection}>
                        <h2 className={styles.sectionTitle}>Episodes</h2>

                        <div className={styles.episodesList}>
                            {season.episodes.map((episode) => {
                                const isWatched = epWatchState[episode.episodeNo];

                                return (
                                    <div key={episode.episodeNo} className={styles.episodeCard}>
                                        <div className={styles.episodeContent}>
                                            {/* Episode Thumbnail */}
                                            <div className={styles.episodeThumbnail}>
                                                <img
                                                    src={episode.stillPath
                                                        ? `https://image.tmdb.org/t/p/original${episode.stillPath}`
                                                        : `https://placehold.co/428x240?text=Ep. ${episode.episodeNo}`
                                                    }
                                                    alt={`Episode ${episode.episodeNo}`}
                                                    className={styles.thumbnailImage}
                                                />

                                                {isWatched && (
                                                    <div className={styles.watchedBadge}>
                                                        <i className="bi bi-check-lg"></i>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Episode Info */}
                                            <div className={styles.episodeInfo}>
                                                <div className={styles.episodeHeader}>
                                                    <div>
                                                        <div className={styles.episodeNumber}>Episode {episode.episodeNo}</div>
                                                        <h3 className={styles.episodeTitle}>{episode.name}</h3>
                                                    </div>

                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            toggleEpisodeWatch(episode.episodeNo);
                                                        }}
                                                        className={`${styles.episodeWatchButton} ${isWatched ? styles.episodeWatched : ''}`}
                                                    >
                                                        <i className={`bi ${isWatched ? 'bi-eye-fill' : 'bi-eye-slash-fill'}`}></i>
                                                        {isWatched ? 'Watched' : 'Mark Watched'}
                                                    </button>
                                                </div>

                                                <div className={styles.episodeMeta}>
                                                    {episode.airDate && (
                                                        <span className={styles.metaText}>
                                                            {new Date(episode.airDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                        </span>
                                                    )}
                                                    <span className={styles.metaSeparator}>•</span>
                                                    <span className={styles.metaText}>{formatRuntime(episode.runtime)}</span>
                                                </div>

                                                {episode.overview && (
                                                    <p className={styles.episodeOverview}>{episode.overview}</p>
                                                )}

                                                {episode.lastModified && (
                                                    <p className={styles.episodeLastModified}>
                                                        Updated: {new Date(episode.lastModified).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default SeasonPage;
