import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axiosInstance from '../utils/axiosInstance';
import AppHeader from '@/components/common/AppHeader/AppHeader';
import ServieGrid from '@/components/common/ServieGrid/ServieGrid';
import styles from "./MovieCollection.module.css";

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
    posterPath: string;
    movies: Movie[];
}

const MovieCollection = () => {
    const { collectionId } = useParams<{ collectionId: string }>();
    const [data, setData] = useState<MovieCollectionProps | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const response = await axiosInstance.get<MovieCollectionProps>(`/movie-collection/${collectionId}`);
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

        if (collectionId) fetchData();
        else setError('Invalid or missing ID');
    }, [collectionId]);

    if (loading) return (
        <>
            <AppHeader />
            <div className={styles.loadingContainer}>Loading...</div>
        </>
    );

    if (error) return (
        <>
            <AppHeader />
            <div className={styles.errorContainer}>{error}</div>
        </>
    );

    const watchedCount = data?.movies.filter(m => m.watched).length || 0;
    const totalCount = data?.movies.length || 0;

    const servies = data?.movies.map(movie => ({
        ...movie,
        childtype: "movie" as const,
        completed: movie.watched,
    })) || [];

    return (
        <div className={styles.pageContainer}>
            {/* Background */}
            <img
                className={styles.backgroundImage}
                src={`https://image.tmdb.org/t/p/original${data?.backdropPath}`}
                alt="Backdrop"
                onError={(e) => {
                    e.currentTarget.src = 'src/assets/defaultBackground.png';
                }}
            />

            <AppHeader />

            <div className={styles.mainLayout}>

                {/* LEFT - BIG POSTER */}
                <div className={styles.posterColumn}>

                    <div className={styles.posterFrame}>
                        <img
                            className={styles.posterImage}
                            src={`https://image.tmdb.org/t/p/w500${data?.posterPath}`}
                            alt={data?.name}
                            onError={(e) => {
                                e.currentTarget.src = 'src/assets/defaultPoster.png';
                            }}
                        />
                    </div>

                    <div className={styles.posterStats}>
                        <div className={styles.statPill}>
                            {watchedCount} / {totalCount}
                        </div>
                        <span className={styles.statText}>Watched</span>
                    </div>
                </div>

                {/* RIGHT SIDE */}
                <div className={styles.rightColumn}>

                    {/* INFO CARD */}
                    <div className={styles.infoCard}>
                        <h1 className={styles.collectionTitle}>{data?.name}</h1>

                        {data?.overview && (
                            <p className={styles.collectionOverview}>
                                {data.overview}
                            </p>
                        )}
                    </div>

                    {/* MOVIES GRID */}
                    <div className={styles.moviesCard}>
                        <h2 className={styles.moviesHeader}>
                            Movies ({data?.movies.length})
                        </h2>

                        {data && data.movies.length > 0 ? (
                            <div className={styles.moviesGridWrapper}>
                                <ServieGrid servies={servies} columnsPerRow={6} />
                            </div>
                        ) : (
                            <div className={styles.emptyState}>
                                <h3>No movies yet</h3>
                                <p>This collection doesn't have any movies added.</p>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
};

export default MovieCollection;