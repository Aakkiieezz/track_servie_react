import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/axiosInstance';
import ProgressBar from '../components/ProgressBar';
import CastListSlider from '../components/CastListSlider';
import SeasonsList from '../components/ServiePage/SeasonsList';
import { format } from 'date-fns';
import Alert from '../components/Alert';
// import styles from "../components/ImageModules/Image.module.css";
import HalfStarRating from '@/components/HalfStarRating';
import VideoPopup from './VideoPopup';
import MovieReviewModal from '@/components/MovieReviewModal';
import AppHeader from '@/components/AppHeader';
import styles from './ServiePage.module.css';

interface ReviewData {
    tmdbId: number;
    childType: string;
    watchedOn: string;
    watchedBefore: boolean;
    review: string;
    tags: string[];
    rating: number;
    liked: boolean;
}

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

interface Cast {
    personId: number;
    name: string;
    character: string;
    profilePath: string;
    gender: number;
    totalEpisodes: number;
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
    firstAirDate?: string;
    lastAirDate?: string;
    episodesWatched: number;
    completed: boolean;
    rated: number;
    cast: Cast[];
    seriesCastRegulars: Cast[];
    seriesCastGuests: Cast[];
    voteAverage: number;
    voteCount: number;
    keywords: { id: number; name: string }[];
    trailerSite: string | null;
    trailerKey: string;
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

    const [isReviewModalOpen, setIsReviewModalOpen] = useState<boolean>(false);

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

    const [seriesCastActiveTab, setSeriesCastActiveTab] = useState<"regulars" | "guests">("regulars");

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

    const handleSaveReview = async (reviewData: ReviewData) => {
        try {
            const response = await axiosInstance.post(
                `/servies/review/${tmdbId}`,
                { review: reviewData.review },
                {
                    params: {
                        type: reviewData.childType,
                        rating: reviewData.rating,
                    },
                }
            );

            if (response.status === 200 || response.status === 201) {
                setAlert({
                    type: "success",
                    message: "Review saved successfully!"
                });
            }
        } catch (error) {
            console.error('Failed to save review', error);
            setAlert({
                type: "danger",
                message: "Failed to save review!"
            });
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

            <div className={styles.serviePageWrapper}>
                {/* Full-page background */}
                <div className={styles.fullPageBackdrop}>
                    <img
                        className={styles.backgroundImage}
                        src={`https://www.themoviedb.org/t/p/original${data?.backdropPath}`}
                        alt={"Backdrop Unavailable"}
                        onError={(e) => {
                            e.currentTarget.src = 'src/assets/defaultBackground.png';
                        }}
                    />
                    <div className={styles.backdropOverlay}></div>
                </div>

                {/* Content on top of background */}
                <div className={styles.pageContent}>
                    <AppHeader />

                    <div className="container">
                        <div className={styles.contentGrid}>
                            {/* Left Column - Main Content */}
                            <div className={styles.mainContent}>
                                {/* Title/Logo Section */}
                                <div className={styles.titleLogo}>
                                    {!isImageError && data?.logoPath ? (
                                        <img
                                            src={`https://www.themoviedb.org/t/p/original${data.logoPath}`}
                                            alt={data?.title || "logo"}
                                            onError={() => setIsImageError(true)}
                                        />
                                    ) : (
                                        <h1 className={styles.title} title={data?.title}>
                                            {data?.title}
                                        </h1>
                                    )}
                                </div>

                                {/* Release Year Section */}
                                {childType === 'movie' && data?.releaseDate && (
                                    <div className={styles.yearInfo}>
                                        <span className={styles.yearText}>
                                            {new Date(data.releaseDate).getFullYear()}
                                        </span>
                                    </div>
                                )}

                                {childType === 'tv' && data?.firstAirDate && (
                                    <div className={styles.yearInfo}>
                                        <span className={styles.yearText}>
                                            {new Date(data?.firstAirDate).getFullYear()} -{" "}
                                            {new Date(data?.lastAirDate!).getFullYear() === new Date().getFullYear()
                                                ? "present"
                                                : new Date(data?.lastAirDate!).getFullYear()}
                                        </span>
                                    </div>
                                )}

                                {/* Trailer Section */}
                                <div className={styles.trailerSection}>
                                    {(data?.trailerSite === "YouTube" || data?.trailerSite === "Vimeo") && (
                                        <VideoPopup videoSite={data.trailerSite} videoKey={data.trailerKey} />
                                    )}
                                </div>

                                {/* Action Buttons */}
                                <div className={styles.actionButtons}>
                                    <button
                                        className={styles.btnTranslucent}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            toggleWatch(childType);
                                        }}
                                    >
                                        {servieWatchState ? (
                                            <>
                                                <i className="bi bi-eye-fill"></i> Watched
                                            </>
                                        ) : (
                                            <>
                                                <i className="bi bi-eye-slash-fill"></i> Mark as Watched
                                            </>
                                        )}
                                    </button>

                                    <button
                                        onClick={() => setIsReviewModalOpen(true)}
                                        className={styles.btnTranslucent}
                                    >
                                        <i className="bi bi-pencil-square"></i> Add Review
                                    </button>
                                </div>

                                {/* Rating */}
                                <div className={styles.ratingSection}>
                                    <HalfStarRating maxStars={5} initialRating={rating} onRatingChange={handleRatingChange} />
                                </div>

                                {/* Overview Section */}
                                {data?.overview && (
                                    <div className={styles.overviewSection}>
                                        <h4>Overview</h4>
                                        {data.tagline && <h5 className={styles.tagline}>{data.tagline}</h5>}
                                        <p className={styles.overviewText}>{data.overview}</p>
                                    </div>
                                )}

                                {/* Cast Section */}
                                {childType === "movie" && (
                                    <div className={styles.castSection}>
                                        <h4>Cast</h4>
                                        <CastListSlider profiles={data?.cast} childType={childType} />
                                    </div>
                                )}

                                {childType === "tv" && (
                                    <div className={styles.castSection}>
                                        <h4>Cast</h4>
                                        <div className={styles.castTabs}>
                                            <button
                                                className={`${styles.btnTranslucent} ${styles.tabBtn} ${seriesCastActiveTab === "regulars" ? styles.active : ""}`}
                                                onClick={() => setSeriesCastActiveTab("regulars")}
                                            >
                                                Series Regulars ({data?.seriesCastRegulars?.length ?? 0})
                                            </button>
                                            <button
                                                className={`${styles.btnTranslucent} ${styles.tabBtn} ${seriesCastActiveTab === "guests" ? styles.active : ""}`}
                                                onClick={() => setSeriesCastActiveTab("guests")}
                                            >
                                                Guest Stars ({data?.seriesCastGuests?.length ?? 0})
                                            </button>
                                        </div>
                                        {seriesCastActiveTab === "regulars" ? (
                                            <CastListSlider profiles={data?.seriesCastRegulars} childType={childType} />
                                        ) : (
                                            <CastListSlider profiles={data?.seriesCastGuests} childType={childType} />
                                        )}
                                    </div>
                                )}

                                {/* Movie Collection */}
                                {data?.collectionId && (
                                    <div className={styles.overviewSection}>
                                        <h5>{data.collectionName}</h5>
                                        <img
                                            className="rounded"
                                            src={`https://www.themoviedb.org/t/p/original${data.colleactionPosterPath}`}
                                            alt="Poster Unavailable"
                                            style={{ width: "200px", height: "300px", cursor: "pointer" }}
                                            onClick={() => navigate(`/movie-collection/${data.collectionId}`)}
                                        />
                                    </div>
                                )}

                                {/* Seasons Section */}
                                {childType === 'tv' && (
                                    <div className={styles.seasonsSection}>
                                        <div className={styles.seasonsHeader}>
                                            <h3>{data?.totalSeasons} Seasons</h3>
                                            <ProgressBar episodesWatched={totalEpWatched} totalEpisodes={totalEpisodes} />
                                        </div>
                                        <div className={styles.episodesInfo}>
                                            <span>Total Episodes Watched: {totalEpWatched}/{data?.totalEpisodes}</span>
                                        </div>
                                        <SeasonsList
                                            seasons={data?.seasons}
                                            tmdbId={tmdbId}
                                            onEpWatchCountChange={handleEpWatchCountChange}
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Right Column - Info Cards */}
                            <div className={styles.sidebar}>
                                {/* Genres Card */}
                                <div className={styles.infoCard}>
                                    <h4 className={styles.cardTitle}>Genres</h4>
                                    <div className={styles.genresGrid}>
                                        {data?.genres.map((genre) => (
                                            <a key={genre.id} href={`servies?genreIds=${genre.id}`} className={styles.genreTag}>
                                                {genre.name}
                                            </a>
                                        ))}
                                    </div>
                                </div>

                                {/* Keywords Card */}
                                {data?.keywords && data.keywords.length > 0 && (
                                    <div className={styles.infoCard}>
                                        <h4 className={styles.cardTitle}>Keywords</h4>
                                        <div className={styles.keywordsGrid}>
                                            {data.keywords.map((keyword) => (
                                                <a key={keyword.id} href={`servies?keywordIds=${keyword.id}`} className={styles.keywordTag}>
                                                    {keyword.name}
                                                </a>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Details Card */}
                                <div className={styles.infoCard}>
                                    <h4 className={styles.cardTitle}>Details</h4>
                                    <div className={styles.detailsList}>
                                        {childType === 'tv' && data?.totalRuntime && (
                                            <div className={styles.detailItem}>
                                                <span className={styles.detailLabel}>Total Watched Runtime:</span>
                                                <span className={styles.detailValue}>
                                                    {formatRuntime(servieWatchRuntime)} / {formatRuntime(servieRuntime)}
                                                </span>
                                            </div>
                                        )}
                                        {childType === 'movie' && data?.releaseDate && (
                                            <div className={styles.detailItem}>
                                                <span className={styles.detailLabel}>Release Date:</span>
                                                <span className={styles.detailValue}>
                                                    {format(new Date(data.releaseDate), 'dd MMM yyyy')}
                                                </span>
                                            </div>
                                        )}
                                        {childType === 'movie' && data?.runtime && (
                                            <div className={styles.detailItem}>
                                                <span className={styles.detailLabel}>Runtime:</span>
                                                <span className={styles.detailValue}>
                                                    {formatRuntime(data?.runtime)}
                                                </span>
                                            </div>
                                        )}
                                        <div className={styles.detailItem}>
                                            <span className={styles.detailLabel}>Vote Average:</span>
                                            <span className={styles.detailValue}>
                                                {data && (data.voteAverage > 0 ? `${data.voteAverage} / 10` : 'Not Rated Yet')}
                                            </span>
                                        </div>
                                        <div className={styles.detailItem}>
                                            <span className={styles.detailLabel}>Vote Count:</span>
                                            <span className={styles.detailValue}>
                                                {data && (data.voteCount > 0 ? data.voteCount.toLocaleString() : 'No Votes Yet')}
                                            </span>
                                        </div>
                                        {childType === 'tv' && (
                                            <div className={styles.detailItem}>
                                                <span className={styles.detailLabel}>Last Modified:</span>
                                                <span className={styles.detailValue}>
                                                    {format(new Date(lastModified), 'dd-MM-yyyy HH:mm:ss')}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Review Modal */}
            <MovieReviewModal
                isOpen={isReviewModalOpen}
                onClose={() => setIsReviewModalOpen(false)}
                onSave={handleSaveReview}
                tmdbId={tmdbId}
                childType={childType}
                title={data?.title || ''}
                year={childType === 'movie'
                    ? (data?.releaseDate ? new Date(data.releaseDate).getFullYear().toString() : '')
                    : (data?.firstAirDate ? new Date(data.firstAirDate).getFullYear().toString() : '')
                }
                posterPath={`https://www.themoviedb.org/t/p/w500${data?.backdropPath || ''}`}
            />
        </>
    );
};

export default ServiePage;