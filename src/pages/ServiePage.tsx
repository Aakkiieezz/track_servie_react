import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/axiosInstance';
import ProgressBar from '../components/ProgressBar';
import MovieCastList from '../components/MovieCastList';
import SeasonsList from '../components/ServiePage/SeasonsList';
import { format } from 'date-fns';
import Alert from '../components/Alert';
import "../components/thymeleafCss.css";
import HalfStarRating from '@/components/HalfStarRating';

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
    rated: number;
    cast: MovieCast[];
    voteAverage: number;
    voteCount: number;
}

const ServiePage = () => {
    const navigate = useNavigate();
    const [alert, setAlert] = useState<{ type: string; message: string } | null>(null);

    const location = useLocation();
    const { childType, tmdbId } = location.state || {};

    const [isImageError, setIsImageError] = useState(false);

    const [data, setData] = useState<ServieDto | null>(null); // Proper typing

    const [rating, setRating] = useState<number>(0); // State to hold the rating

    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null); // Proper typing for error

    const [servieWatchState, setServieWatchState] = useState<boolean>(false);

    const [totalEpWatched, setTotalEpWatched] = useState<number>(0);
    // Initialize the states for season watch runtime and season runtime
    const [servieWatchRuntime, setServieWatchRuntime] = useState<number>(0);

    const [servieRuntime, setServieRuntime] = useState<number>(0);

    // const [seasonRuntime, setSeasonRuntime] = useState<{ [key: string]: number }>({});
    const totalEpisodes = data?.totalEpisodes || 1;

    useEffect(() => {
        const fetchData = async () => {

            console.log("ServiePage -> useEffect() -> ApiCall -> request : ", childType, tmdbId);
            try {
                setLoading(true);
                const response = await axiosInstance.get<ServieDto>(`servies/${tmdbId}`,
                    {
                        params: {
                            type: childType,
                        },
                    });

                console.log("ServiePage -> useEffect() -> ApiCall -> response :", response);

                setData(response.data);

                if (response.data.childType == 'movie')
                    setServieRuntime(response.data.runtime);
                else
                    setServieRuntime(response.data.totalRuntime);

                setTotalEpWatched(response.data.episodesWatched);
                setServieWatchRuntime(response.data.totalWatchedRuntime);
                setServieWatchState(response.data.completed);
                setRating(response.data.rated);

            } catch (err) {
                // if (axios.isAxiosError(err))
                //     setError(err.response?.data?.message || 'Something went wrong');
                // else
                if (err instanceof Error)
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

    const toggleWatch = async (childtype: string) => {

        const servieWatchStateCurrent = servieWatchState;
        const servieWatchStateNew = !servieWatchStateCurrent;

        setServieWatchState(servieWatchStateNew);

        const servieWatchRuntimeCurrent = servieWatchRuntime;
        setServieWatchRuntime(servieWatchStateNew ? servieRuntime : 0);

        const EpWatchCountCurrent = totalEpWatched;
        setTotalEpWatched(servieWatchStateNew ? totalEpisodes : 0);

        try {
            const response = await axiosInstance.put(`servies/${childtype}/${tmdbId}/toggle`);

            if (response.status === 200)
                setAlert({ type: "success", message: `Updated watch status of ${childtype} ${tmdbId} successfully !!` });

        } catch (error) {

            setServieWatchState(servieWatchStateCurrent);
            setServieWatchRuntime(servieWatchRuntimeCurrent);
            setTotalEpWatched(EpWatchCountCurrent);

            console.error('Failed to update watch status', error);
            setAlert({ type: "danger", message: "Failed to update watch status !!" });
        }
    };


    const handleEpWatchCountChange = (data: { totalWatchedEp: number; totalWatchedRuntime: number }) => {
        setTotalEpWatched(data.totalWatchedEp);
        setServieWatchRuntime(data.totalWatchedRuntime);
        setServieWatchState((data.totalWatchedEp === totalEpisodes) ? true : false);
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

    const handleRatingChange = async (newRating: number) => {
        const ratingCurrent = rating;
        setRating(newRating);
        try {
            await axiosInstance.put(
                `servies/${tmdbId}`,
                null,
                {
                    params: {
                        type: childType,
                        rating: newRating,
                    },
                }
            );
        } catch (error) {
            setRating(ratingCurrent);
            console.error('Failed to update watch status', error);
            setAlert({ type: "danger", message: "Failed to update watch status !!" });
        }
    };

    return (
        <>
            {/* Alert Component */}
            {alert && (
                <Alert
                    type={alert.type}
                    message={alert.message}
                    onClose={() => setAlert(null)}
                />
            )}

            <div className="container-fluid backdrop">
                <img
                    className="background-image"
                    src={`https://www.themoviedb.org/t/p/original${data?.backdropPath}`}
                    alt={"Backdrop Unavailable"}
                    onError={(e) => {
                        e.currentTarget.src = 'src/assets/defaultBackground.png';
                    }}
                />
                <div className="content-overlay">
                    {/* Main Content */}
                    <div className="container">

                        {/* Title/Logo Section */}
                        {!isImageError && data?.logoPath ? (
                            <img
                                className="rounded"
                                src={`https://www.themoviedb.org/t/p/original${data.logoPath}`}
                                alt={data?.title}
                                style={{ maxHeight: '300px', maxWidth: '300px' }}
                                onError={() => setIsImageError(true)}
                            />
                        ) : (<h1>{data?.title}</h1>)}

                        <br />

                        {/* Genres Section */}
                        <h4>Genres</h4>
                        <div className="row row-cols-auto left">
                            {data?.genres.map((genre) => (
                                <div key={genre.id} className="col">
                                    <a href={`servies?genreIds=${genre.id}`} className="btn btn-secondary btn-sm mx-1">{genre.name}</a>
                                </div>
                            ))}
                        </div>

                        {/* {toggle completed} */}
                        <a
                            href="#"
                            onClick={(e) => {
                                e.preventDefault();
                                toggleWatch(childType);
                            }}
                        >
                            {servieWatchState ? (<i className="bi bi-eye-fill"></i>) : (<i className="bi bi-eye-slash-fill"></i>)}
                        </a>

                        {/* Overview Section */}
                        {data?.overview && (
                            <>
                                <h4>Overview</h4>
                                <h5>{data.tagline}</h5>
                                <p>{data.overview}</p>
                            </>
                        )}

                        {/* Rating Section */}
                        <div>
                            <HalfStarRating maxStars={5} initialRating={rating} onRatingChange={handleRatingChange} />
                        </div>

                        {/* Runtime Section */}
                        {(childType === 'movie') && data?.runtime && (
                            <>
                                <span>Runtime : {formatRuntime(data?.runtime)}</span>
                                <br />
                            </>
                        )}
                        {(childType === 'tv') && data?.totalRuntime && (
                            <>
                                <span>Total Watched Runtime : {formatRuntime(servieWatchRuntime)}  / {formatRuntime(servieRuntime)}</span>
                                <br />
                            </>
                        )}

                        {/* Release Date Section */}
                        {(childType === 'movie') && data?.releaseDate && (
                            <>
                                <span>Release Date : {format(new Date(data.releaseDate), 'dd MMM yyyy')}</span>
                                <br />
                            </>
                        )}

                        Vote Average : {data && (data.voteAverage > 0 ? data.voteAverage + ' / 10' : 'Not Rated Yet')}
                        
                        <br />

                        Vote Count : {data && (data.voteCount > 0 ? data.voteCount : 'No Votes Yet')}

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
                                <img
                                    className="rounded"
                                    src={`https://www.themoviedb.org/t/p/original${data.colleactionPosterPath}`}
                                    alt="Poster Unavailable"
                                    style={{ width: "200px", height: "300px" }}
                                    onClick={() => navigate(`/movie-collection/${data.collectionId}`)}
                                />
                                {/* <a href={`servies/movie-collection/${data.collectionId}`}>
                                    <img
                                        className="rounded"
                                        src={`https://www.themoviedb.org/t/p/original${data.colleactionPosterPath}`}
                                        alt="Poster Unavailable"
                                        style={{ width: "200px", height: "300px" }}
                                    />
                                </a> */}
                            </>
                        )}

                        {(childType === 'tv') && (
                            <>
                                <span>Last Modified : {format(new Date(lastModified), 'dd-MM-yyyy HH:mm:ss')}</span>
                                <br />
                                <span>Total Episodes Watched : {totalEpWatched + '/' + data?.totalEpisodes}</span>

                                <br />
                                <br />

                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', width: '100%' }}>
                                    <h3 style={{ margin: 0, whiteSpace: 'nowrap' }}>{data?.totalSeasons} Seasons</h3>
                                    <ProgressBar episodesWatched={totalEpWatched} totalEpisodes={totalEpisodes} />
                                </div>
                                <SeasonsList
                                    seasons={data?.seasons}
                                    tmdbId={tmdbId}
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