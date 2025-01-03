import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import ProgressBar from '../components/ProgressBar';
import MovieCastList from '../components/MovieCastList';
import SeasonsList from '../components/ServiePage/SeasonsList';
import { format } from 'date-fns';
import "../components/thymeleafCss.css";

interface GenreDtoServiePage {
    id: number;
    name: string;
}

interface SeasonDtoServiePage {
    id: string;
    seasonNo: number;
    name: string;
    posterPath: string;
    episodeCount: number;
    episodesWatched: number;
    watched: boolean;
    totalRuntime: number;
    totalWatchedRuntime: number;
}

interface MovieCast {
    personId: number;
    name: string;
    character: string;
    profilePath: string;
    gender: number;
}

interface ServieDto {
    tmdbId: number;
    childType: string; // not being used
    title: string;
    status: string;
    tagline: string;
    overview: string;
    backdropPath: string;
    logoPath: string;
    lastModified: string;
    genres: GenreDtoServiePage[];
    releaseDate: string;
    runtime: number;
    collectionId: number | null;
    collectionName: string | null;
    colleactionPosterPath: string | null;
    totalSeasons: number | null;
    totalEpisodes: number | null;
    totalRuntime: number;
    totalWatchedRuntime: number;
    seasons: SeasonDtoServiePage[];
    episodesWatched: number;
    completed: boolean;
    cast: MovieCast[];
}

const ServiePage = () => {

    const location = useLocation();
    const { childType, tmdbId } = location.state || {};

    const [isImageError, setIsImageError] = useState(false);

    const [data, setData] = useState<ServieDto | null>(null); // Proper typing

    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null); // Proper typing for error

    const [totalEpWatched, setTotalEpWatched] = useState<number>(0);
    // Initialize the states for season watch runtime and season runtime
    const [seasonWatchRuntime, setSeasonWatchRuntime] = useState<number>(0);
    // const [seasonRuntime, setSeasonRuntime] = useState<{ [key: string]: number }>({});
    const totalEpisodes = data?.totalEpisodes || 1;

    useEffect(() => {
        const fetchData = async () => {

            console.log("ServiePage -> useEffect() -> ApiCall -> request : ", childType, tmdbId);
            try {
                setLoading(true);
                const response = await axios.get<ServieDto>(`http://localhost:8080/track-servie/react/servies/${tmdbId}`,
                    {
                        params: {
                            type: childType,
                        },
                    });

                console.log("ServiePage -> useEffect() -> ApiCall -> response :", response);

                setData(response.data);

                setTotalEpWatched(response.data.episodesWatched);
                setSeasonWatchRuntime(response.data.totalWatchedRuntime);

            } catch (err) {
                if (axios.isAxiosError(err))
                    setError(err.response?.data?.message || 'Something went wrong');
                else if (err instanceof Error)
                    setError(err.message);
                else
                    setError('An unknown error occurred');

            } finally {
                setLoading(false);
            }
        };

        if (tmdbId && childType)
            fetchData();

    }, [tmdbId, childType]);

    const lastModified: string | Date = new Date();

    // const formattedDate = format(new Date(lastModified), 'dd-MM-yyyy HH:mm:ss');

    if (loading) return <div>Loading...</div>;
    if (error) return <div>{error}</div>;

    const handleEpWatchCountChange = (data: { totalWatchedEp: number; totalWatchedRuntime: number }) => {
        setTotalEpWatched(data.totalWatchedEp);
        setSeasonWatchRuntime(data.totalWatchedRuntime);
    };

    function formatRuntime(totalMinutes: number): string {
        const days = Math.floor(totalMinutes / 1440);
        const hours = Math.floor((totalMinutes % 1440) / 60);
        const minutes = totalMinutes % 60;

        const parts: string[] = [];

        if (days > 0)
            parts.push(`${days}d`);
        if (hours > 0)
            parts.push(`${hours}hr`);
        if (minutes > 0)
            parts.push(`${minutes}min`);

        return parts.length > 0 ? parts.join(' ') : '0min';
    }

    return (
        <>
            <div className="container-fluid backdrop">
                <img
                    className="background-image"
                    src={`https://www.themoviedb.org/t/p/original${data?.backdropPath}`}
                    alt={"Backdrop Unavailable"}
                    onError={(e) => {
                        e.currentTarget.src = 'src/assets/defaultBackground.png';
                    }}
                />
                {childType === "tv" && (<ProgressBar episodesWatched={totalEpWatched} totalEpisodes={totalEpisodes} />
                )}
                <div className="content-overlay">
                    {/* Main Content */}
                    <div className="container">

                        {/* <img className="rounded"
                            src={`https://www.themoviedb.org/t/p/original${data?.logoPath}`}
                            alt={data?.title}
                            style={{ maxHeight: '400px', maxWidth: '400px' }}
                        ></img>
                        <h1>{data?.title}</h1> */}

                        {!isImageError && data?.logoPath ? (
                            <img
                                className="rounded"
                                src={`https://www.themoviedb.org/t/p/original${data.logoPath}`}
                                alt={data?.title}
                                style={{ maxHeight: '400px', maxWidth: '400px' }}
                                onError={() => setIsImageError(true)}
                            />
                        ) : (
                            <h1>{data?.title}</h1>
                        )}

                        {/* Genres Section */}
                        <h4>Genres</h4>
                        <div className="row row-cols-auto left">
                            {data?.genres.map((genre) => (
                                <div key={genre.id} className="col">
                                    <a href={`/track-servie/servies?genreIds=${genre.id}`} className="btn btn-secondary btn-sm mx-1">{genre.name}</a>
                                </div>
                            ))}
                        </div>

                        {/* Overview Section */}
                        {data?.overview && (
                            <>
                                <h4>Overview</h4>
                                <h5>{data.tagline}</h5>
                                <p>{data.overview}</p>
                            </>
                        )}

                        {/* Cast Section */}
                        {childType === "movie" && (
                            <>
                                <h4>Cast</h4>
                                <div className="cast-slider-container">
                                    <MovieCastList profiles={data?.cast} />
                                </div>
                            </>
                        )}

                        <br />

                        {/* Movie Collection */}
                        {data?.collectionId && (
                            <>
                                <h5>{data.collectionName}</h5>
                                <a href={`/track-servie/servies/movie-collection/${data.collectionId}`}>
                                    <img
                                        className="rounded"
                                        src={`https://www.themoviedb.org/t/p/original${data.colleactionPosterPath}`}
                                        alt="Poster Unavailable"
                                        style={{ width: "200px", height: "300px" }}
                                    />
                                </a>
                            </>
                        )}

                        {data?.totalRuntime && (
                            <>
                                <span>Total Watched Runtime : {formatRuntime(seasonWatchRuntime)}  / {formatRuntime(data.totalRuntime)}</span>
                                <br />
                            </>
                        )}

                        {(childType === 'tv') && (
                            <>
                                <span>Last Modified : {format(new Date(lastModified), 'dd-MM-yyyy HH:mm:ss')}</span>
                                <br />
                                <span>Total Episodes Watched : {totalEpWatched + '/' + data?.totalEpisodes}</span>

                                <br />
                                <br />

                                <h3>{data?.totalSeasons} Seasons</h3>
                                <SeasonsList
                                    seasons={data?.seasons}
                                    tmdbId={tmdbId}
                                    // totalEpWatched={totalEpWatched}
                                    onEpWatchCountChange={handleEpWatchCountChange} />
                            </>
                        )}
                    </div>
                </div>
            </div>


        </>
    );
};

export default ServiePage;