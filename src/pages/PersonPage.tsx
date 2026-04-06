import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axiosInstance from '../utils/axiosInstance';
import AppHeader from '@/components/common/AppHeader/AppHeader';
import styles from "./PersonPage.module.css";
import { useLocation } from 'react-router-dom';
import { useAlert } from "../contexts/AlertContext";
import ServieCard from "@/components/common/PosterCard/ServieCard";
import type { PersonResponse } from "@/types/PersonResponse";

interface LocationState {
    personData?: PersonResponse;
}

const PersonPage: React.FC = () => {
    const { setAlert } = useAlert();

    const location = useLocation() as { state: LocationState };
    const [personData, setPersonData] = useState<PersonResponse | null>(location.state?.personData || null);

    const [filterType, setFilterType] = useState<string>("Servie");

    const { personId } = useParams<{ personId: string }>();

    const [loading, setLoading] = useState<boolean>(true);
    const [blurCompleted, setBlurCompleted] = useState<boolean>(false);
    const [sortOrder, setSortOrder] = useState<string>('title');

    useEffect(() => {
        if (personData)
            setLoading(false);
    }, [personData]);

    useEffect(() => {
        if (!personData && personId) {
            axiosInstance.get(`person/${personId}`)
                .then((response) => {
                    setPersonData(response.data);
                    setLoading(false);
                })
                .catch((error) => {
                    const message = error?.response?.data?.message || 'Error fetching person data. Please try again later.';
                    setLoading(false);
                    setAlert({ type: "danger", message });
                });
        }
    }, [personId]);

    useEffect(() => {
        if (personData?.servies) {
            setWatchedCount(personData.servies.filter(s => s.completed).length);
        }
    }, [personData]);

    const [watchedCount, setWatchedCount] = useState(
        personData?.servies?.filter(s => s.completed).length ?? 0
    );

    const handleWatchChange = (tmdbId: number, childtype: string, newWatched: boolean) => {
        setWatchedCount(prev => newWatched ? prev + 1 : prev - 1);
    };

    if (loading) return <div className={styles.loadingContainer}>Loading...</div>;
    if (!personData) return <div className={styles.loadingContainer}>Person data not found</div>;

    const sortedServies = [...(personData.servies ?? [])].sort((a, b) => {
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

    const age = calculateAge(personData.birthday);

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
                                <img
                                    src={`https://image.tmdb.org/t/p/original/${personData.profilePath}`}
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
                                return (
                                    <ServieCard
                                        key={key}
                                        servie={servie}
                                        blurCompleted={blurCompleted}
                                        onWatchChange={handleWatchChange}
                                    />
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