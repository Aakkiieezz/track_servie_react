import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axiosInstance from '../utils/axiosInstance';

import Alert from "../components/Alert";
import CastListSlider from "@/components/CastListSlider";
import SeasonsNavBar from "@/components/SeasonPage/SeasonsNavBar";
import ProgressBar from '../components/ProgressBar';
import AppHeader from "@/components/AppHeader";

import styles from './SeasonPage.module.css';

interface Season {
    id: string;
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
    console.log(`SeasonsPage`);

    const [alert, setAlert] = useState<{ type: string; message: string } | null>(null);

    const [loading, setLoading] = useState<boolean>(true);
    const [, setError] = useState<string | null>(null); // Proper typing for error

    const { tmdbId, seasonNo = "1" } = useParams<{ tmdbId: string, seasonNo?: string }>();
    const currentSeasonNo = parseInt(seasonNo, 10);

    if (isNaN(currentSeasonNo)) {
        console.error("Invalid season number, defaulting to 1");
        return <div>Invalid season number</div>;
    }

    if (tmdbId === undefined)
        console.warn("SeasonPage -> WARN -> tmdbId is undefined. Please check your route parameters.");

    const [season, setSeason] = useState<Season | null>(null);
    const [seasonWatchState, setSeasonWatchState] = useState(false);
    const [epWatchState, setEpWatchState] = useState<{ [key: string]: boolean }>({});
    const [epWatchCount, setEpWatchedCount] = useState<number>(0);

    const [epRuntime, setEpRuntime] = useState<{ [key: string]: number }>({});
    const [seasonWatchRuntime, setSeasonWatchRuntime] = useState<number>(0);
    const [seasonRuntime, setSeasonRuntime] = useState<number>(0);

    const totalEpisodes = season?.episodeCount || 1;

    const [totalSeasons, setTotalSeasons] = useState(0);
    const [hasSpecials, setHasSpecials] = useState(false);

    const [seasonCastActiveTab, setSeasonCastActiveTab] = useState<"regulars" | "guests">("regulars");

    const fetchSeasonData = async (tmdbId: string, seasonNo: string) => {
        try {
            setLoading(true);
            console.log("SeasonPage -> API Call -> request:", tmdbId, seasonNo);
            const response = await axiosInstance.get(`servies/${tmdbId}/Season/${seasonNo}`);
            console.log("SeasonPage -> API Call -> response:", response.data);
            setSeason(response.data);
            setTotalSeasons(response.data.totalSeasons);
            setHasSpecials(response.data.hasSpecials);
        } catch (error) {
            console.error("Error fetching servies", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (tmdbId) {
            console.log(
                "SeasonPage -> useEffect(tmdbId, seasonNo) -> data :",
                tmdbId,
                seasonNo
            );
            fetchSeasonData(tmdbId, seasonNo);
        }
    }, [tmdbId, seasonNo]);

    useEffect(() => {
        try {
            setLoading(true);
            console.log("SeasonPage -> useEffect(season) -> data :", season);
            if (!season) {
                console.log("SeasonPage -> useEffect(season) -> data -> null/undefined");
                return; // Early return if season is null or undefined
            }
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
                return sum + (runtime || 0); // Add runtime, default to 0 if it's undefined
            }, 0);
            setSeasonRuntime(totalRuntime);

            // Calculate the sum of runtimes where the corresponding watch state is true
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
            // if (axios.isAxiosError(err))
            //     setError(err.response?.data?.message || "Something went wrong");
            // else
            if (err instanceof Error) setError(err.message);
            else setError("An unknown error occurred");
        } finally {
            setLoading(false);
        }
    }, [season]);

    // which is better ?
    if (!season) return <div>Loading...</div>;
    if (loading) return <div>Loading...</div>;

    const toggleSeasonWatch = async () => {
        console.log(`SeasonPage -> toggleSeasonWatch -> tmdbId: ${tmdbId}, seasonNo: ${seasonNo}`);

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
            const response = await axiosInstance.put(`servies/${tmdbId}/Season/${seasonNo}/toggle`);
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

    const toggleEpisodeWatch = async (episodeNo: number) => {
        console.log(`SeasonPage -> toggleEpisodeWatch -> episodeNo: ${episodeNo}`);
        const key = `${episodeNo}`;

        const currentWatchState = epWatchState[key];
        const newWatchState = !currentWatchState;

        setEpWatchState({
            ...epWatchState,
            [key]: newWatchState,
        });

        const currentEpWatchedCount = epWatchCount;
        const newEpWatchedCount = newWatchState ? epWatchCount + 1 : epWatchCount - 1;
        setEpWatchedCount(newEpWatchedCount);

        if (newWatchState && newEpWatchedCount === season.episodeCount) {
            console.log("seems last episode was watched, toggling season watch to true");
            setSeasonWatchState(true);
        }

        if (!newWatchState && seasonWatchState) {
            console.log(
                "seems an episode was un-watched and seasonWatch status was still true, toggling season watch to false"
            );
            setSeasonWatchState(false);
        }

        const currentSeasonWatchRuntime = seasonWatchRuntime;
        const newSeasonWatchRuntime = newWatchState
            ? seasonWatchRuntime + epRuntime[key]
            : seasonWatchRuntime - epRuntime[key];
        setSeasonWatchRuntime(newSeasonWatchRuntime);

        try {
            const response = await axiosInstance.put(`servies/${tmdbId}/Season/${seasonNo}/Episode/${episodeNo}/toggle`
            );
            if (response.status === 200)
                setAlert({
                    type: "success",
                    message: `Updated watch status of Ep${episodeNo} successfully !!`,
                });
        } catch (error) {
            setEpWatchState({
                ...epWatchState,
                [key]: currentWatchState,
            });

            setEpWatchedCount(currentEpWatchedCount);

            setSeasonWatchRuntime(currentSeasonWatchRuntime);

            console.error("Failed to update watch status", error);

            setAlert({ type: "danger", message: "Failed to update watch status !!" });
        }
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

            {/* Alert Component */}
            {alert && (
                <Alert
                    type={alert.type}
                    message={alert.message}
                    onClose={() => setAlert(null)}
                />
            )}

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
                                    src={`https://www.themoviedb.org/t/p/original${season.posterPath}`}
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
                                                        ? `https://www.themoviedb.org/t/p/original${episode.stillPath}`
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
