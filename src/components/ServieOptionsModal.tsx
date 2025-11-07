import React, { useState, useEffect } from 'react';
import axiosInstance from '../utils/axiosInstance';
import { useServieListStore } from '../store/useServieListStore';
import styles from './ServieOptionsModal.module.css';

interface ServieOptionsModalProps {
    isOpen: boolean;
    onClose: () => void;
    servie: {
        tmdbId: number;
        childtype: string;
    } | null;
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

    const [showListModal, setShowListModal] = useState(false);
    const [loadingLists, setLoadingLists] = useState(false);

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

    const handleGiveRating = () => {
        onClose();
    };

    return (
        <>
            {/* Main Options Modal */}
            {!showListModal && (
                <div className={styles.backdrop} onClick={onClose}>
                    <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.header}>
                            <h5 className={styles.title}>Options</h5>
                            <button className={styles.closeBtn} onClick={onClose}>×</button>
                        </div>

                        <div className={styles.body}>
                            <button className={styles.listItem} onClick={openListModal} disabled={loadingLists}>
                                <i className="bi bi-list-ul"></i>
                                {loadingLists ? "Loading..." : "Add / Remove from List"}
                            </button>

                            <button className={styles.listItem} onClick={handleGiveRating}>
                                <i className="bi bi-star"></i>
                                Give Rating
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
        </>
    );
};

export default ServieOptionsModal;
