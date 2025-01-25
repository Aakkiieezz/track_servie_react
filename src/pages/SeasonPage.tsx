import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axiosInstance from '../utils/axiosInstance';
import "../components/thymeleafCss.css";
import Alert from "../components/Alert";
import MovieCastList from "@/components/MovieCastList";
import NavigationBar from "@/components/SeasonPage/NavigationBar";

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
    seasonCast: MovieCast[];
    episodes: Episode[];
    totalSeasons: number;
    hasSpecials: boolean;
}

interface MovieCast {
    personId: number;
    name: string;
    character: string;
    profilePath: string;
    gender: number;
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
        <div className="container">
            {/* Render the NavigationBar and pass props */}
            <NavigationBar
                tmdbId={tmdbId!}
                currentSeasonNo={currentSeasonNo}
                totalSeasons={totalSeasons}
                hasSpecials={hasSpecials}
            />

            <div className="row">
                <div className="col-4 image-container still">
                    <img
                        src={`https://www.themoviedb.org/t/p/original${season.posterPath}`}
                        alt={season.name}
                    />
                </div>
                <div className="col-8">
                    <h1>{season.name}</h1>
                    {season.overview && (
                        <div>
                            <h3>Overview :</h3>
                            <p>{season.overview}</p>
                        </div>
                    )}

                    {/* {toggle season completed} */}
                    <a href="#" onClick={() => toggleSeasonWatch()}>
                        {seasonWatchState ? (<i className="bi bi-eye-fill"></i>) : (<i className="bi bi-eye-slash-fill"></i>)}
                    </a>

                    {season.episodeCount !== 0 && (
                        <>
                            <p>
                                Total Episodes Watched : {epWatchCount} / {season.episodeCount}
                            </p>

                            {season.lastModified && (
                                <p>
                                    Last Modified :{" "}
                                    {new Date(season.lastModified).toLocaleString("en-US", {
                                        month: "long",
                                        day: "numeric",
                                        year: "numeric",
                                        hour: "numeric",
                                        minute: "numeric",
                                    })}
                                </p>
                            )}

                            <p>
                                Total Watched Runtime : {formatRuntime(seasonWatchRuntime)} /{" "}
                                {formatRuntime(season.totalRuntime)}{" "}
                            </p>
                        </>
                    )}
                </div>
            </div>

            <br />

            <h3>Actors - Season Regulars</h3>
            <div className="cast-slider-container">
                <MovieCastList profiles={season?.seasonCast} />
            </div>

            <br />

            <h3>{season.episodeCount} Episodes</h3>
            {/* <EpisodesList
                episodes={season.episodes}
            /> */}

            <div className="row">
                {season.episodes.map((episode) => {
                    const key = `${episode.episodeNo}`;
                    const watchStateRender = epWatchState ? epWatchState[key] : false;

                    return (
                        <>
                            <div key={key} className="col-4 image-container still">
                                {/* Alert Component */}
                                {alert && (
                                    <Alert
                                        type={alert.type}
                                        message={alert.message}
                                        onClose={() => setAlert(null)}
                                    />
                                )}
                                <a
                                    href={`servies/${tmdbId}/Season/${season.seasonNo}/Episode/${episode.episodeNo}`}
                                >
                                    <img
                                        src={
                                            episode.stillPath
                                                ? `https://www.themoviedb.org/t/p/original${episode.stillPath}`
                                                : `https://placehold.co/428x240?text=Ep. ${episode.episodeNo}`
                                        }
                                        alt={`Episode ${episode.episodeNo}`}
                                    />
                                </a>
                            </div>
                            <div className="col-8">
                                <a
                                    href={`/track-service/services/${tmdbId}/Season/${seasonNo}/Episode/${episode.episodeNo}`}
                                    style={{ textDecoration: "none", color: "inherit" }}
                                >
                                    <span style={{ fontWeight: "bold", fontSize: "20px" }}>
                                        <span style={{ color: "red" }}>Episode {episode.episodeNo}</span>{" "}
                                        {episode.name}
                                    </span>
                                </a>
                                <br />
                                {episode.airDate && (
                                    <span>
                                        Aired Date :{" "}
                                        {new Date(episode.airDate).toLocaleDateString("en-US", {
                                            month: "long",
                                            day: "numeric",
                                            year: "numeric",
                                        })}
                                    </span>
                                )}
                                <br />

                                {episode.overview && <p>{episode.overview}</p>}

                                <p>Runtime : {formatRuntime(episode.runtime)}</p>

                                {episode.lastModified && (
                                    <p>
                                        Last Modified :{" "}
                                        {new Date(episode.lastModified).toLocaleString("en-US", {
                                            month: "long",
                                            day: "numeric",
                                            year: "numeric",
                                            hour: "numeric",
                                            minute: "numeric",
                                        })}
                                    </p>
                                )}

                                {/* {toggle completed} */}
                                <a
                                    href="#"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        toggleEpisodeWatch(episode.episodeNo);
                                    }}
                                >
                                    {watchStateRender ? (<i className="bi bi-eye-fill"></i>) : (<i className="bi bi-eye-slash-fill"></i>)}
                                </a>
                            </div>
                        </>
                    );
                })}
            </div>
        </div>
    );
};

export default SeasonPage;
