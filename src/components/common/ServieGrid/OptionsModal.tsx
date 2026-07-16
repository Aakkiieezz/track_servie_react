import React, { useState, useEffect } from 'react';
import axiosInstance from '@/utils/axiosInstance';
import { useNavigate } from "react-router-dom";
import { useAlert } from "@/contexts/AlertContext";
import { useListPageContext } from '@/contexts/ListPageContext';
import { useWatchlistTabContext } from '@/contexts/WatchlistTabContext';
import ReviewModal from '@/components/common/ReviewModal/ReviewModal';
import HalfStarRating from '@/components/common/HalfStarRating';
import type { ReviewData, Servie } from "@/types/servie";
import { useServieListStore } from '@/store/useServieListStore';
import styles from './OptionsModal.module.css';

interface ServieOptionsModalProps {
    isOpen: boolean;
    onClose: () => void;
    servie: Servie;
    showWatchlist?: boolean;
    showLists?: boolean;
    onSuccess: (message: string) => void;
    onError: (message: string) => void;
    initialRating: number | null;
    onRatingChange: (rating: number | null) => Promise<void>;
    onSaveReview: (reviewData: ReviewData) => Promise<void>;
}

const ServieOptionsModal: React.FC<ServieOptionsModalProps> = ({
    isOpen,
    onClose,
    servie,
    showWatchlist = true,
    showLists = true,
    onSuccess,
    onError,
    initialRating,
    onRatingChange,
    onSaveReview,
}) => {
    const navigate = useNavigate();
    const { setAlert } = useAlert();

    const listPageContext = useListPageContext();
    const watchlistPageContext = useWatchlistTabContext();

    const [showListModal, setShowListModal] = useState(false);
    const [loadingLists, setLoadingLists] = useState(false);
    const [isReviewModalOpen, setIsReviewModalOpen] = useState<boolean>(false);

    const {
        fetchAllServieLists,
        servieListMap,
        listDetails,
        addListId,
        removeListId,
        fetchListDetails,
        fetchWatchlistKeys,
        isOnWatchlist,
        addToWatchlist,
        removeFromWatchlist,
    } = useServieListStore();

    useEffect(() => {
        if (isOpen && showLists)
            fetchListDetails();
        if (isOpen && showWatchlist)
            fetchWatchlistKeys();
    }, [isOpen, showLists, showWatchlist, fetchListDetails, fetchWatchlistKeys]);

    const safeListDetails = listDetails ?? [];

    const servieKey = `${servie.childtype}-${servie.tmdbId}`;
    const onWatchlist = isOnWatchlist(servieKey);

    const [rating, setRating] = useState<number | null>(initialRating);

    useEffect(() => {
        if (isOpen)
            setRating(initialRating);
    }, [isOpen, initialRating]);

    useEffect(() => {
        if (!isOpen) setShowListModal(false);
    }, [isOpen]);

    useEffect(() => {
        if (isOpen) {
            fetchAllServieLists();
            fetchListDetails();
            fetchWatchlistKeys();
        }
    }, [isOpen, fetchAllServieLists, fetchListDetails, fetchWatchlistKeys]);

    if (!isOpen || !servie) return null;

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
            const response = await axiosInstance.post(`list/${listId}/add-servie/${servie.childtype}/${servie.tmdbId}`);
            if (response.status === 200) {
                addListId(servieKey, listId);
                onSuccess('Added to list successfully !!');
            }
        } catch (error) {
            onError('Failed to add to list !!');
        }
    };

    const handleRemoveFromList = async (listId: number) => {
        const isCurrentList = listPageContext?.listId === listId;

        if (isCurrentList)
            listPageContext.onServieRemoved(servie);

        try {
            const response = await axiosInstance.delete(`list/${listId}/remove-servie/${servie.childtype}/${servie.tmdbId}`);
            if (response.status === 200) {
                removeListId(servieKey, listId);
                onSuccess('Removed from list successfully !!');
            }
        } catch (error) {
            if (isCurrentList)
                listPageContext!.onServieRollback(servie);
            onError('Failed to remove from list, changes reverted');
        }
    };

    const toggleWatchList = async (tmdbId: number, childType: "movie" | "tv") => {
        const wasOnWatchlist = onWatchlist;

        // Optimistic update
        if (wasOnWatchlist) {
            removeFromWatchlist(servieKey);
            watchlistPageContext?.onServieRemoved(servie);
        } else
            addToWatchlist(servieKey);

        try {
            const response = await axiosInstance.put(`list/watchlist/${tmdbId}`,
                null,
                { params: { childtype: childType } }
            );
            if (response.status === 200)
                onSuccess(wasOnWatchlist
                    ? 'Removed from watchlist'
                    : 'Added to watchlist'
                );
        } catch (error) {
            // Rollback store
            if (wasOnWatchlist) {
                addToWatchlist(servieKey);
                watchlistPageContext?.onServieRollback(servie);
            } else
                removeFromWatchlist(servieKey);
            console.error('Failed to update watchlist', error);
            setAlert({ type: "danger", message: "Failed to update watchlist, changes reverted" });
        }
    };

    const handleRatingChange = async (newRating: number | null) => {
        const prev = rating;
        setRating(newRating);
        try {
            await onRatingChange(newRating);
        } catch {
            setRating(prev);
        }
    };

    return (
        <>
            {/* Main Options Modal */}
            {!showListModal && (
                <div className={styles.backdrop} onClick={onClose}>
                    <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.header}>
                            <div className={styles.ratingSection}>
                                <HalfStarRating maxStars={5} initialRating={rating} onRatingChange={handleRatingChange} />
                            </div>
                            <button className={styles.closeBtn} onClick={onClose}>×</button>
                        </div>

                        <div className={styles.body}>
                            <button className={styles.listItem} onClick={() => setIsReviewModalOpen(true)}>
                                <i className="bi bi-pencil-square"></i> Add Review
                            </button>

                            {showWatchlist && (
                                <button className={styles.listItem} onClick={() => toggleWatchList(servie.tmdbId, servie.childtype)}>
                                    <i className={`bi bi-clock${onWatchlist ? '-fill' : ''} ${styles.icon}`}></i>
                                    {onWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist'}
                                </button>
                            )}

                            {showLists && (
                                <button className={styles.listItem} onClick={openListModal} disabled={loadingLists}>
                                    <i className="bi bi-list-ul"></i>
                                    {loadingLists ? "Loading..." : "Add / Remove from List"}
                                </button>
                            )}

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
                            {safeListDetails.length === 0 ? (
                                <p style={{ textAlign: "center", opacity: 0.7 }}>No lists available</p>
                            ) : (
                                safeListDetails.map((list) => {
                                    const isAlreadyAdded = listIds.includes(list.id);
                                    return (
                                        <button
                                            key={list.id}
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
            <ReviewModal
                isOpen={isReviewModalOpen}
                onClose={() => setIsReviewModalOpen(false)}
                title={servie.title}
                year={servie.childtype === 'movie'
                    ? (servie.releaseDate ? new Date(servie.releaseDate).getFullYear().toString() : '')
                    : (servie.firstAirDate ? new Date(servie.firstAirDate).getFullYear().toString() : '')
                }
                posterPath={`https://image.tmdb.org/t/p/w500${servie.posterPath || ''}`}
                onSave={onSaveReview}
            />
        </>
    );
};

export default ServieOptionsModal;