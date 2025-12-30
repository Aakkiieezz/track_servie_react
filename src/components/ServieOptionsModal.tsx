import React, { useState, useEffect } from 'react';
import axiosInstance from '../utils/axiosInstance';
import { useServieListStore } from '../store/useServieListStore';
import styles from './ServieOptionsModal.module.css';
import HalfStarRating from './HalfStarRating';
import Alert from './Alert';
import { useNavigate } from "react-router-dom";
import type { Servie } from "@/types/servie";
import MovieReviewModal from '@/components/MovieReviewModal';
import type { ReviewData } from "@/types/servie";

interface ServieOptionsModalProps {
    isOpen: boolean;
    onClose: () => void;
    servie: Servie;
    onSuccess: (message: string) => void;
    onError: (message: string) => void;
}

const ServieOptionsModal: React.FC<ServieOptionsModalProps> = ({
    isOpen,
    onClose,
    servie,
    onSuccess,
    onError,
}) => {

    const navigate = useNavigate();

    const [alert, setAlert] = useState<{ type: string; message: string } | null>(null);

    const [showListModal, setShowListModal] = useState(false);
    const [loadingLists, setLoadingLists] = useState(false);

    const [isReviewModalOpen, setIsReviewModalOpen] = useState<boolean>(false);

    const [rating, setRating] = useState<number>(0);

    const {
        fetchAllServieLists,
        servieListMap,
        listDetails,
        addListId,
        removeListId,
        fetchListDetails,
    } = useServieListStore();

    useEffect(() => {
        if (!isOpen) setShowListModal(false);
    }, [isOpen]);

    useEffect(() => {
        if (isOpen) {
            fetchAllServieLists();
            fetchListDetails();
        }
    }, [isOpen, fetchAllServieLists, fetchListDetails]);

    if (!isOpen || !servie) return null;

    const servieKey = `${servie.childtype}-${servie.tmdbId}`;
    const listIds = servieListMap[servieKey] || [];

    const openListModal = async () => {
        setLoadingLists(true);
        try {
            await fetchListDetails();
            setShowListModal(true);
        } catch (error) {
            onError('Failed to load lists !!');
        } finally {
            setLoadingLists(false);
        }
    };

    const closeListModal = () => {
        setShowListModal(false);
        onClose();
    };

    const handleAddToList = async (listId: number) => {
        try {
            const response = await axiosInstance.post(
                `list/${listId}/add-servie/${servie.childtype}/${servie.tmdbId}`
            );
            if (response.status === 200) {
                addListId(servieKey, listId);
                onSuccess('Added to list successfully !!');
            }
        } catch (error) {
            onError('Failed to add to list !!');
        }
    };

    const handleRemoveFromList = async (listId: number) => {
        try {
            const response = await axiosInstance.delete(
                `list/${listId}/remove-servie/${servie.childtype}/${servie.tmdbId}`
            );
            if (response.status === 200) {
                removeListId(servieKey, listId);
                onSuccess('Removed from list successfully !!');
            }
        } catch (error) {
            onError('Failed to remove from list !!');
        }
    };

    const handleRatingChange = async (newRating: number) => {
        const ratingCurrent = rating;
        setRating(newRating);
        try {
            await axiosInstance.put(
                `servies/${servie.tmdbId}`,
                null,
                {
                    params: {
                        type: servie.childtype,
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

    const toggleWatchList = async (tmdbId: number, childType: "movie" | "tv") => {
        console.log("watchlist toggle");
        try {
            const response = await axiosInstance.put(
                `list/watchlist/${tmdbId}`,
                null,
                {
                    params: {
                        childtype: childType,
                    }
                },
            );
            if (response.status === 200)
                setAlert({ type: "success", message: `Successfully added/removed from watchlist !!` });

        } catch (error) {
            console.error('Failed to add/remove from watchlist', error);

            setAlert({ type: "danger", message: "Failed to add/remove from watchlist !!" });
        }
    }

    const handleSaveReview = async (reviewData: ReviewData) => {
        try {
            const response = await axiosInstance.post(
                `/servies/review/${servie.tmdbId}`,
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

            {/* Main Options Modal */}
            {!showListModal && (
                <div className={styles.backdrop} onClick={onClose}>
                    <div className={styles.modal} onClick={(e) => e.stopPropagation()}>

                        {/* Rating */}
                        <div className={styles.header}>
                            <div className={styles.ratingSection}>
                                <HalfStarRating maxStars={5} initialRating={servie.rated} onRatingChange={handleRatingChange} />
                            </div>
                            <button className={styles.closeBtn} onClick={onClose}>×</button>
                        </div>

                        <div className={styles.body}>

                            <button className={styles.listItem} 
                                        onClick={() => setIsReviewModalOpen(true)}
                                    >
                                        <i className="bi bi-pencil-square"></i> Add Review
                                    </button>

                            <button className={styles.listItem} onClick={() => toggleWatchList(servie.tmdbId, servie.childtype)}>
                                <i className={`bi bi-clock-fill ${styles.icon}`}></i>
                                Add / Remove from Watchlist
                            </button>

                            <button className={styles.listItem} onClick={openListModal} disabled={loadingLists}>
                                <i className="bi bi-list-ul"></i>
                                {loadingLists ? "Loading..." : "Add / Remove from List"}
                            </button>

                            <button
                                className={styles.listItem}
                                onClick={() =>
                                    navigate("/images", {
                                        state: {
                                            childType: servie.childtype,
                                            tmdbId: servie.tmdbId,
                                            title: servie.title,
                                            releaseDate: servie.releaseDate,
                                            firstAirDate: servie.firstAirDate,
                                            lastAirDate: servie.lastAirDate,
                                        },
                                    })
                                }
                            >
                                <i className={`bi bi-file-image ${styles.icon}`}></i>
                                Change Poster Image
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* List Selection Modal */}
            {showListModal && (
                <div className={styles.backdrop} onClick={closeListModal}>
                    <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.header}>
                            <h5 className={styles.title}>Add to List</h5>
                            <button className={styles.closeBtn} onClick={closeListModal}>×</button>
                        </div>

                        <div className={styles.body}>
                            {listDetails.length === 0 ? (
                                <p style={{ textAlign: "center", opacity: 0.7 }}>No lists available</p>
                            ) : (
                                listDetails.map((list) => {
                                    const isAlreadyAdded = listIds.includes(list.id);
                                    return (
                                        <button
                                            key={list.id}
                                            // className={styles.listItem}
                                            className={`${styles.listItem} ${isAlreadyAdded ? styles.activeItem : ''}`}
                                            onClick={() =>
                                                isAlreadyAdded
                                                    ? handleRemoveFromList(list.id)
                                                    : handleAddToList(list.id)
                                            }
                                        >
                                            <div>
                                                <strong>{list.name}</strong>
                                                {list.description && (
                                                    <div style={{ fontSize: "0.8rem", opacity: 0.6 }}>
                                                        {list.description}
                                                    </div>
                                                )}
                                            </div>

                                            <div style={{ marginLeft: "auto", display: "flex", alignItems: "center" }}>
                                                <small style={{ opacity: 0.6, marginRight: "8px" }}>
                                                    {list.totalServiesCount} items
                                                </small>

                                                {isAlreadyAdded ? (
                                                    <i className="bi bi-check2-circle" />
                                                ) : (
                                                    <i className="bi bi-plus-circle" />
                                                )}
                                            </div>
                                        </button>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Review Modal */}
            <MovieReviewModal
                isOpen={isReviewModalOpen}
                onClose={() => setIsReviewModalOpen(false)}
                onSave={handleSaveReview}
                tmdbId={servie.tmdbId}
                childType={servie.childtype}
                title={servie.title}
                year={servie.childtype === 'movie'
                    ? (servie.releaseDate ? new Date(servie.releaseDate).getFullYear().toString() : '')
                    : (servie.firstAirDate ? new Date(servie.firstAirDate).getFullYear().toString() : '')
                }
                posterPath={`https://www.themoviedb.org/t/p/w500${servie.posterPath || ''}`}
            />
        </>
    );
};

export default ServieOptionsModal;
