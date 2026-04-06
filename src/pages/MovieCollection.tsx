import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axiosInstance from '../utils/axiosInstance';
import AppHeader from '@/components/common/AppHeader/AppHeader';
import styles from "./MovieCollection.module.css";
import ServieCard from "@/components/common/PosterCard/ServieCard";

interface Movie {
    tmdbId: number;
    title: string;
    posterPath: string;
    releaseDate: string;
    liked: boolean;
    watched: boolean;
    rated: number | null;
}

interface MovieCollectionProps {
    id: number;
    name: string;
    overview: string;
    backdropPath: string;
    movies: Movie[];
}

const MovieCollection = () => {
    const { collectionId } = useParams<{ collectionId: string }>(); // Extract ID from the URL
    const [data, setData] = useState<MovieCollectionProps | null>(null); // Proper typing
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null); // Proper typing for error

    useEffect(() => {

        const fetchData = async () => {
            try {
                setLoading(true);
                const response = await axiosInstance.get<MovieCollectionProps>(`/servies/movie-collection/${collectionId}`);
                setData(response.data);
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

    return (
        <>
            <AppHeader />

            <div className="container-fluid backdrop">
                <img
                    className={styles.backgroundImage}
                    src={`https://image.tmdb.org/t/p/original${data?.backdropPath}`}
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
                            {data?.movies.map((movie) => (
                                <div key={movie.tmdbId} className="col-lg-2 col-md-3 col-sm-4 col-6" style={{ padding: "0.2%" }}>
                                <ServieCard
                                    servie={{
                                        ...movie,
                                        childtype: "movie",
                                        completed: movie.watched,
                                    }}
                                />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default MovieCollection;

