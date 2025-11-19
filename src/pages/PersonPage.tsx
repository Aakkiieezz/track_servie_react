import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import axiosInstance from '../utils/axiosInstance';
import Alert from '../components/Alert';
import AppHeader from '@/components/AppHeader';
import styles from "./PersonPage.module.css";

interface PersonResponse {
    name: string;
    knownForDepartment: string;
    gender: number;
    adult: boolean;
    popularity: number;
    birthday: string;
    biography: string;
    birthPlace: string;
    homepage: string;
    lastModified: string;
    profilePath: string;
    servies: Servie[];
}

interface Servie {
    childtype: string;
    tmdbId: number;
    posterPath: string;
    title: string;
    releaseDate: string;
    firstAirDate: string;
    lastAirDate: string;
    episodesWatched: number;
    totalEpisodes: number;
    completed: boolean;
    popularity: number;
}

const PersonPage: React.FC = () => {
    const [filterType, setFilterType] = useState<string>("Servie");
    const [alert, setAlert] = useState<{ type: string; message: string } | null>(null);
    const { personId } = useParams<{ personId: string }>();
    const [personData, setPersonData] = useState<PersonResponse | null>(null);
    const [servieWatchState, setServieWatchState] = useState<{ [key: string]: boolean }>({});
    const [loading, setLoading] = useState<boolean>(true);
    const [blurCompleted, setBlurCompleted] = useState<boolean>(false);
    const [sortOrder, setSortOrder] = useState<string>('title');

    useEffect(() => {
        if (personId) {
            axiosInstance.get(`person/${personId}`)
                .then((response) => {
                    setPersonData(response.data);
                    setLoading(false);
                })
                .catch((error) => {
                    console.error('Error fetching person data:', error);
                    setLoading(false);
                });
        }
    }, [personId]);

    useEffect(() => {
        if (personData && personData.servies) {
            const watchState = personData.servies.reduce((acc, servie) => {
                acc[`${servie.childtype}-${servie.tmdbId}`] = servie.completed;
                return acc;
            }, {} as { [key: string]: boolean });
            setServieWatchState(watchState);
        }
    }, [personData]);

    const toggleWatch = async (tmdbId: number, childtype: string) => {
        const key = `${childtype}-${tmdbId}`;
        const currentCompletedState = servieWatchState[key];
        const newCompletedState = !currentCompletedState;

        setServieWatchState({
            ...servieWatchState,
            [key]: newCompletedState,
        });

        try {
            const response = await axiosInstance.put(`servies/${childtype}/${tmdbId}/toggle`);
            const message = newCompletedState ?
                `Marked ${childtype} as watched successfully !!` :
                `Marked ${childtype} as un-watched successfully !!`
            if (response.status === 200)
                setAlert({ type: "success", message: message });
        } catch (error) {
            setServieWatchState({
                ...servieWatchState,
                [key]: currentCompletedState,
            });
            console.error("PersonPage -> toggleWatch -> Failed to update watch status", error);
            setAlert({ type: "danger", message: "Failed to update watch status !!" });
        }
    };

    if (loading) return <div className={styles.loadingContainer}>Loading...</div>;
    if (!personData) return <div className={styles.loadingContainer}>Person data not found</div>;

    const sortedServies = [...personData.servies].sort((a, b) => {
        if (sortOrder === 'popularity')
            return b.popularity - a.popularity;
        return a.title.localeCompare(b.title);
    });

    const filteredServies = sortedServies.filter(servie =>
        filterType === "Servie" || servie.childtype === filterType.toLowerCase()
    );

    const calculateAge = (birthday: string) => {
        if (!birthday) return null;
        const birthDate = new Date(birthday);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    };

    const age = calculateAge(personData.birthday);

    return (
        <>
            <AppHeader />

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
                        <div className={styles.heroContent}>
                            {/* Profile Image */}
                            <div className={styles.profileContainer}>
                                <img
                                    src={`https://www.themoviedb.org/t/p/original/${personData.profilePath}`}
                                    alt={personData.name}
                                    className={styles.profileImage}
                                />
                            </div>

                            {/* Person Info */}
                            <div className={styles.infoSection}>
                                <h1 className={styles.personName}>{personData.name}</h1>

                                {/* Quick Stats */}
                                <div className={styles.statsBar}>
                                    <div className={styles.statItem}>
                                        <span className={styles.statLabel}>Known For</span>
                                        <span className={styles.statValue}>{personData.knownForDepartment}</span>
                                    </div>
                                    <span className={styles.statsSeparator}>•</span>
                                    <div className={styles.statItem}>
                                        <span className={styles.statLabel}>Gender</span>
                                        <span className={styles.statValue}>{personData.gender === 1 ? 'Female' : 'Male'}</span>
                                    </div>
                                    <span className={styles.statsSeparator}>•</span>
                                    <div className={styles.statItem}>
                                        <span className={styles.statLabel}>Popularity</span>
                                        <span className={styles.statValue}>{personData.popularity.toFixed(1)}</span>
                                    </div>
                                </div>

                                {/* Personal Details */}
                                <div className={styles.detailsGrid}>
                                    {personData.birthday && (
                                        <div className={styles.detailItem}>
                                            <i className="bi bi-cake2"></i>
                                            <span>
                                                {new Date(personData.birthday).toLocaleDateString('en-US', {
                                                    month: 'long',
                                                    day: 'numeric',
                                                    year: 'numeric'
                                                })}
                                                {age && ` (${age} years old)`}
                                            </span>
                                        </div>
                                    )}
                                    {personData.birthPlace && (
                                        <div className={styles.detailItem}>
                                            <i className="bi bi-geo-alt"></i>
                                            <span>{personData.birthPlace}</span>
                                        </div>
                                    )}
                                    {personData.homepage && (
                                        <div className={styles.detailItem}>
                                            <i className="bi bi-globe"></i>
                                            <a href={personData.homepage} target="_blank" rel="noopener noreferrer">
                                                Visit Homepage
                                            </a>
                                        </div>
                                    )}
                                </div>

                                {/* Biography */}
                                {personData.biography && (
                                    <div className={styles.biographySection}>
                                        <h3 className={styles.sectionSubtitle}>Biography</h3>
                                        <p className={styles.biographyText}>{personData.biography}</p>
                                    </div>
                                )}

                                {personData.lastModified && (
                                    <p className={styles.lastModified}>
                                        Last updated: {new Date(personData.lastModified).toLocaleDateString('en-US', {
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

                {/* Works Section */}
                <div className={styles.container}>
                    <div className={styles.worksSection}>
                        <h2 className={styles.sectionTitle}>Works ({filteredServies.length})</h2>

                        {/* Controls Bar */}
                        <div className={styles.controlsBar}>
                            <div className={styles.controlGroup}>
                                <label className={styles.controlLabel}>
                                    <input
                                        type="checkbox"
                                        checked={blurCompleted}
                                        onChange={() => setBlurCompleted(!blurCompleted)}
                                        className={styles.checkbox}
                                    />
                                    Blur watched items
                                </label>
                            </div>

                            <div className={styles.controlGroup}>
                                <label className={styles.controlLabel}>Sort by:</label>
                                <select
                                    value={sortOrder}
                                    onChange={(e) => setSortOrder(e.target.value)}
                                    className={styles.select}
                                >
                                    <option value="title">Title (A-Z)</option>
                                    <option value="popularity">Popularity (High to Low)</option>
                                </select>
                            </div>

                            <div className={styles.controlGroup}>
                                <label className={styles.controlLabel}>Filter:</label>
                                <select
                                    value={filterType}
                                    onChange={(e) => setFilterType(e.target.value)}
                                    className={styles.select}
                                >
                                    <option value="Servie">All</option>
                                    <option value="Movie">Movies</option>
                                    <option value="TV">TV Shows</option>
                                </select>
                            </div>
                        </div>

                        {/* Works Grid */}
                        <div className={styles.worksGrid}>
                            {filteredServies.map(servie => {
                                const key = `${servie.childtype}-${servie.tmdbId}`;
                                const isCompleted = servieWatchState[key];

                                return (
                                    <div key={key} className={styles.workCard}>
                                        <div className={styles.posterWrapper}>
                                            <img
                                                className={`${styles.posterImage} ${blurCompleted && isCompleted ? styles.blurred : ''}`}
                                                src={`https://www.themoviedb.org/t/p/original${servie.posterPath}`}
                                                alt={servie.title}
                                                onError={(e) => {
                                                    e.currentTarget.src = '/src/assets/defaultPoster.png';
                                                }}
                                            />

                                            {/* Title Overlay */}
                                            <div className={styles.titleOverlay}>
                                                <Link
                                                    to='/servie'
                                                    state={{ childType: servie.childtype, tmdbId: servie.tmdbId }}
                                                    className={styles.titleLink}
                                                >
                                                    <div className={styles.titleText}>{servie.title}</div>
                                                    <div className={styles.yearText}>
                                                        {servie.childtype === 'movie'
                                                            ? new Date(servie.releaseDate).getFullYear()
                                                            : `${new Date(servie.firstAirDate).getFullYear()} - ${servie.lastAirDate ? new Date(servie.lastAirDate).getFullYear() : 'Present'}`
                                                        }
                                                    </div>
                                                </Link>
                                            </div>

                                            {/* Action Buttons */}
                                            <div className={styles.actionsOverlay}>
                                                <div className={styles.actionIcons}>
                                                    <button
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            toggleWatch(servie.tmdbId, servie.childtype);
                                                        }}
                                                        className={styles.iconButton}
                                                        title={isCompleted ? 'Mark as unwatched' : 'Mark as watched'}
                                                    >
                                                        {isCompleted ? (
                                                            <i className={`bi bi-eye-fill ${styles.icon} ${styles.eyeFill}`}></i>
                                                        ) : (
                                                            <i className={`bi bi-eye-slash-fill ${styles.icon} ${styles.eyeSlashFill}`}></i>
                                                        )}
                                                    </button>

                                                    {servie.childtype === 'tv' && (
                                                        <span className={styles.episodeCount}>
                                                            {servie.episodesWatched}/{servie.totalEpisodes}
                                                        </span>
                                                    )}

                                                    <span className={styles.popularityBadge}>
                                                        ★ {servie.popularity.toFixed(1)}
                                                    </span>
                                                </div>
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

export default PersonPage;