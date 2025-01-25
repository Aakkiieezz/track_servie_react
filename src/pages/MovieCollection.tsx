import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import axiosInstance from '../utils/axiosInstance';
import Alert from '../components/Alert';
import "../components/thymeleafCss.css";

interface MovieDtoMovieCollectionPageDto {
    tmdbId: number;
    title: string;
    posterPath: string;
    releaseDate: string;
    liked: boolean;
    watched: boolean;
}

interface MovieCollectionPageDto {
    id: number;
    name: string;
    overview: string;
    backdropPath: string;
    movies: MovieDtoMovieCollectionPageDto[];
}

const MovieCollection = () => {
    console.log("Movie-Collection Page");

    const [alert, setAlert] = useState<{ type: string; message: string } | null>(null);

    const { collectionId } = useParams<{ collectionId: string }>(); // Extract ID from the URL

    const [data, setData] = useState<MovieCollectionPageDto | null>(null); // Proper typing
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null); // Proper typing for error

    // State for like and watch
    const [servieLikedState, setServieLikedState] = useState<{ [key: number]: boolean }>({});
    const [servieWatchState, setServieWatchState] = useState<{ [key: number]: boolean }>({});

    useEffect(() => {

        const fetchData = async () => {
            console.log("MovieCollectionPage -> useEffect() -> ApiCall -> request : ", collectionId);
            try {
                setLoading(true);
                const response = await axiosInstance.get<MovieCollectionPageDto>(`/servies/movie-collection/${collectionId}`);
                console.log("MovieCollectionPage -> useEffect() -> ApiCall -> response :", response);
                setData(response.data);

                const likedState = response.data.movies.reduce((acc, movie) => {
                    acc[movie.tmdbId] = movie.liked;
                    return acc;
                }, {} as { [key: number]: boolean });
                setServieLikedState(likedState);

                const watchState = response.data.movies.reduce((acc, movie) => {
                    acc[movie.tmdbId] = movie.watched;
                    return acc;
                }, {} as { [key: number]: boolean });
                console.log("hey akash");
                console.log(watchState);
                setServieWatchState(watchState);

            } catch (err) {
                if (err instanceof Error)
                    setError(err.message);
                else
                    setError('An unknown error occurred');

            } finally {
                setLoading(false);
            }
        };

        if (collectionId)
            fetchData();
        else
            setError('Invalid or missing ID');

    }, [collectionId]);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>{error}</div>;

    const toggleLike = async (childtype: string, tmdbId: number) => {

        const key = tmdbId;

        const currentLikedState = servieLikedState[key];
        const newLikedState = !currentLikedState;
        console.log(
            `Marked like status for movie ${tmdbId}, liked: ${newLikedState}`
        );

        setServieLikedState({
            ...servieLikedState,
            [key]: newLikedState,
        });

        try {
            const response = await axiosInstance.put(
                `servies/${tmdbId}`,
                null,
                {
                    params: {
                        type: childtype,
                        like: newLikedState,
                    }
                },
            );

            if (response.status === 200)
                setAlert({ type: "success", message: `Updated like status of Movie ${tmdbId} successfully !!` });

        } catch (error) {

            // Not tested - Revert state in case of an API failure
            setServieLikedState({
                ...servieLikedState,
                [key]: currentLikedState,
            });

            console.error('Failed to update like status', error);

            setAlert({ type: "danger", message: "Failed to update like status !!" });
        }
    };

    const toggleWatch = async (childtype: string, tmdbId: number) => {
        const key = tmdbId;
        const currentWatchState = servieWatchState[key];
        const newWatchState = !currentWatchState;
        console.log(
            `Marked watch status for ${tmdbId}, childtype: ${childtype}, liked: ${newWatchState}`
        );
        setServieWatchState({
            ...servieWatchState,
            [key]: newWatchState,
        });

        try {
            const response = await axiosInstance.put(`servies/${childtype}/${tmdbId}/toggle`);

            if (response.status === 200)
                setAlert({ type: "success", message: `Updated watch status of ${childtype} ${tmdbId} successfully !!` });

        } catch (error) {

            // Not tested - Revert state in case of an API failure
            setServieWatchState({
                ...servieWatchState,
                [key]: currentWatchState,
            });

            console.error('Failed to update watch status', error);

            setAlert({ type: "danger", message: "Failed to update watch status !!" });
        }
    }

    const removeServie = (tmdbId: number, childtype: "movie" | "tv") => {
        console.log(`Removing servie with ID ${tmdbId} of type ${childtype}`);
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
                        <h1>{data?.name}</h1>
                        <br />
                        {/* Overview Section */}
                        {data?.overview && (
                            <>
                                <h4>Overview</h4>
                                <p>{data.overview}</p>
                            </>
                        )}

                        <br />
                        {/* Movies Grid Section */}
                        <h4>Movies</h4>
                        <div className="row center">
                            {data?.movies.map((movie) => {
                                const key = movie.tmdbId;
                                const watchStateRender = servieWatchState[key];
                                const likeStateRender = servieLikedState[key];

                                return (
                                    <div
                                        key={movie.tmdbId}
                                        className="col-lg-2 col-md-3 col-sm-4 col-6 image-container poster"
                                    >
                                        {/* Movie Card */}
                                        <div>
                                            <img
                                                className="rounded image-border"
                                                src={`https://www.themoviedb.org/t/p/original${movie.posterPath}`}
                                                // src={`http://localhost:8080/track-servie/posterImgs${servie.posterPath}`}
                                                // src={`http://localhost:8080/track-servie/staticPosterImgs${servie.posterPath}`}
                                                alt={movie.title}
                                            />
                                            <div className="buttons-container rounded">
                                                <Link to='/servie' state={{ childType: "movie", tmdbId: movie.tmdbId }}>
                                                    <strong>{movie.title}</strong>
                                                </Link>
                                                <br />
                                                {movie.releaseDate && (
                                                    <span>{new Date(movie.releaseDate).getFullYear()}</span>
                                                )}
                                                <br />

                                                <a
                                                    href="#"
                                                    onClick={() =>
                                                        toggleWatch("movie", movie.tmdbId)
                                                    }
                                                >
                                                    {watchStateRender ? (<i className="bi bi-eye-fill"></i>) : (<i className="bi bi-eye-slash-fill"></i>)}
                                                </a>
                                                <a href="#" onClick={() => toggleLike("movie", movie.tmdbId)}>
                                                    <i className={`bi bi-suit-heart-fill ${likeStateRender ? 'liked' : 'not-liked'}`}></i>
                                                </a>
                                                <a
                                                    href={`servies/${movie.tmdbId}/posters?type="movie"`}
                                                >
                                                    <i className="bi bi-file-image"></i>
                                                </a>
                                                <a
                                                    href={`list/${movie.tmdbId}?childtype="movie"`}
                                                >
                                                    <i className="bi bi-clock-fill"></i>
                                                </a>
                                                <a
                                                    href="#"
                                                    onClick={() => removeServie(movie.tmdbId, "movie")}
                                                >
                                                    <i className="bi bi-x-circle-fill"></i>
                                                </a>
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

export default MovieCollection;

