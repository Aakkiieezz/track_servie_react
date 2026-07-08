import React, { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import axiosInstance from '../utils/axiosInstance';
import AppHeader from '@/components/common/AppHeader/AppHeader';
import styles from "./PersonPage.module.css";
import ServieCard from "@/components/common/PosterCard/ServieCard";
import type { PersonResponse } from "@/types/PersonResponse";

export interface PartialPersonData {
    id: number;
    name: string;
    profilePath?: string | null;
}

interface LocationState {
    personData?: PartialPersonData;
}

const PersonPage: React.FC = () => {
    const location = useLocation() as { state: LocationState };
    const { personId } = useParams<{ personId: string }>();

    // Derived fresh each render — no need to sync into state.
    const partialData = location.state?.personData ?? null;

    const [personData, setPersonData] = useState<PersonResponse | null>(null);
    const [loadingDetails, setLoadingDetails] = useState<boolean>(true);
    const [detailsError, setDetailsError] = useState<string | null>(null);
    const [filterType, setFilterType] = useState<string>("Servie");
    const [blurCompleted, setBlurCompleted] = useState<boolean>(false);
    const [sortOrder, setSortOrder] = useState<string>('title');
    const [watchedCount, setWatchedCount] = useState(0);

    useEffect(() => {
        setLoadingDetails(true);
        setDetailsError(null);
        setPersonData(null);

        if (!personId) return;

        axiosInstance.get(`person/${personId}`)
            .then((response) => {
                setPersonData(response.data);
                setLoadingDetails(false);
            })
            .catch((error) => {
                const message = error?.response?.data?.message || 'Error fetching person data. Please try again later.';
                setLoadingDetails(false);
                setDetailsError(message);
            });
    }, [personId]);

    useEffect(() => {
        if (personData?.servies) {
            setWatchedCount(personData.servies.filter(s => s.completed).length);
        }
    }, [personData]);

    const handleWatchChange = (tmdbId: number, childtype: string, newWatched: boolean) => {
        setWatchedCount(prev => newWatched ? prev + 1 : prev - 1);
    };

    // Nothing to show at all yet (direct URL visit, first paint)
    if (loadingDetails && !partialData && !personData) {
        return (
            <>
                <AppHeader />
                <div className={styles.loadingContainer}>Loading...</div>
            </>
        );
    }

    // Fetch failed AND we never had partial data to fall back on
    if (detailsError && !partialData && !personData) {
        return (
            <>
                <AppHeader />
                <div className={styles.loadingContainer}>
                    <p>{detailsError}</p>
                    <button onClick={() => window.location.reload()}>Retry</button>
                </div>
            </>
        );
    }

    const displayName = personData?.name ?? partialData?.name ?? '';
    const displayProfilePath = personData?.profilePath ?? partialData?.profilePath;

    const sortedServies = [...(personData?.servies ?? [])].sort((a, b) => {
        if (sortOrder === 'popularity') return (b.popularity ?? 0) - (a.popularity ?? 0);
        return a.title.localeCompare(b.title);
    });

    const filteredServies = sortedServies.filter(servie => {
        if (filterType === "Servie") return true;
        if (filterType === "Movie") return servie.childtype === "movie";
        if (filterType === "TV") return servie.childtype === "tv";
        return true;
    });

    const calculateAge = (birthday: string) => {
        if (!birthday) return null;
        const birthDate = new Date(birthday);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) age--;
        return age;
    };

    const age = personData?.birthday ? calculateAge(personData.birthday) : null;

    return (
        <>
            <AppHeader />
            <div className={styles.pageContainer}>
                {/* Hero Section */}
                <div className={styles.heroSection}>
                    <div className={styles.container}>
                        <div className={styles.heroContent}>
                            {/* Profile Image */}
                            <div className={styles.profileContainer}>
                                {displayProfilePath ? (
                                    <img
                                        src={`https://image.tmdb.org/t/p/original/${displayProfilePath}`}
                                        alt={displayName}
                                        className={styles.profileImage}
                                    />
                                ) : (
                                    <div className={`${styles.profileImage} ${styles.profileImageSkeleton}`} />
                                )}
                            </div>

                            {/* Person Info */}
                            <div className={styles.infoSection}>
                                <h1 className={styles.personName}>{displayName}</h1>

                                {!personData && !detailsError && (
                                    <div className={styles.detailsSkeleton}>
                                        <div className={styles.skeletonLine} />
                                        <div className={styles.skeletonLine} />
                                        <div className={styles.skeletonLine} />
                                    </div>
                                )}

                                {detailsError && (
                                    <div className={styles.inlineError}>
                                        <p>{detailsError}</p>
                                        <button onClick={() => window.location.reload()}>Retry</button>
                                    </div>
                                )}

                                {personData && (
                                    <>
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
                                                            month: 'long', day: 'numeric', year: 'numeric'
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
                                                    month: 'long', day: 'numeric', year: 'numeric'
                                                })}
                                            </p>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Works Section - Works needs full data — only render once loaded */}
                {personData && (
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
                                    <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} className={styles.select}>
                                        <option value="title">Title (A-Z)</option>
                                        <option value="popularity">Popularity (High to Low)</option>
                                    </select>
                                </div>
                                <div className={styles.controlGroup}>
                                    <label className={styles.controlLabel}>Filter:</label>
                                    <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className={styles.select}>
                                        <option value="Servie">All</option>
                                        <option value="Movie">Movies</option>
                                        <option value="TV">TV Shows</option>
                                    </select>
                                </div>
                            </div>

                            {/* Works Grid */}
                            <div className={styles.worksGrid}>
                                {filteredServies.map(servie => (
                                    <ServieCard
                                        key={`${servie.childtype}-${servie.tmdbId}`}
                                        servie={servie}
                                        blurCompleted={blurCompleted}
                                        onWatchChange={handleWatchChange}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default PersonPage;