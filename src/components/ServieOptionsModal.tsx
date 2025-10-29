import React, { useState, useEffect } from 'react';
import axiosInstance from '../utils/axiosInstance';
import { useServieListStore } from '../store/useServieListStore';

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

    // ✅ Zustand store
    const {
        fetchAllServieLists,
        servieListMap,
        listDetails,
        addListId,
        removeListId,
        fetchListDetails,
    } = useServieListStore();

    // Reset modal when closed
    useEffect(() => {
        if (!isOpen) setShowListModal(false);
    }, [isOpen]);

    // Fetch data when modal opens
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
            console.error('Failed to fetch lists', error);
            onError('Failed to load lists !!');
        } finally {
            setLoadingLists(false);
        }
    };

    const closeListModal = () => {
        setShowListModal(false);
        onClose(); // Close the entire modal when list modal closes
    };

    // ✅ Add to list (both backend + local)
    const handleAddToList = async (listId: number) => {
        try {
            const response = await axiosInstance.post(
                `list/${listId}/add-servie/${servie.childtype}/${servie.tmdbId}`
            );
            if (response.status === 200) {
                addListId(servieKey, listId); // ✅ Update local state instantly
                onSuccess('Added to list successfully !!');
            }
        } catch (error) {
            console.error('Failed to add to list', error);
            onError('Failed to add to list !!');
        }
    };

    // ✅ Remove from list (both backend + local)
    const handleRemoveFromList = async (listId: number) => {
        try {
            const response = await axiosInstance.delete(
                `list/${listId}/remove-servie/${servie.childtype}/${servie.tmdbId}`
            );
            if (response.status === 200) {
                removeListId(servieKey, listId); // ✅ Update local store
                onSuccess('Removed from list successfully !!');
            }
        } catch (error) {
            console.error('Failed to remove from list', error);
            onError('Failed to remove from list !!');
        }
    };

    const handleGiveRating = () => {
        console.log('Give rating for:', servie);
        onClose();
    };

    return (
        <>
            {/* Main options modal */}
            {!showListModal && (
                <div
                    className="modal show d-block"
                    tabIndex={-1}
                    style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
                >
                    <div className="modal-dialog modal-dialog-centered modal-sm">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Options</h5>
                                <button type="button" className="btn-close" onClick={onClose}></button>
                            </div>
                            <div className="modal-body p-0">
                                <div className="list-group list-group-flush">
                                    <button
                                        className="list-group-item list-group-item-action"
                                        onClick={openListModal}
                                        disabled={loadingLists}
                                    >
                                        <i className="bi bi-list-ul me-2"></i>
                                        {loadingLists ? 'Loading...' : 'Add / Remove from List'}
                                    </button>
                                    <button
                                        className="list-group-item list-group-item-action"
                                        onClick={handleGiveRating}
                                    >
                                        <i className="bi bi-star me-2"></i>
                                        Give Rating
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* List selection modal */}
            {showListModal && (
                <div
                    className="modal show d-block"
                    tabIndex={-1}
                    style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
                >
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Select a List</h5>
                                <button type="button" className="btn-close" onClick={closeListModal}></button>
                            </div>
                            <div className="modal-body">
                                {listDetails.length === 0 ? (
                                    <p className="text-muted text-center">No lists available</p>
                                ) : (
                                    <div className="list-group">
                                        {listDetails.map((list) => {
                                            const isAlreadyAdded = listIds.includes(list.id);
                                            return (
                                                <button
                                                    key={list.id}
                                                    className={`list-group-item list-group-item-action d-flex justify-content-between align-items-center ${isAlreadyAdded ? 'list-group-item-success' : ''
                                                        }`}
                                                    onClick={() =>
                                                        isAlreadyAdded
                                                            ? handleRemoveFromList(list.id)
                                                            : handleAddToList(list.id)
                                                    }
                                                >
                                                    <div>
                                                        <h6 className="mb-1">{list.name}</h6>
                                                        {list.description && (
                                                            <small className="text-muted">{list.description}</small>
                                                        )}
                                                    </div>

                                                    <div className="text-end">
                                                        <small className="me-2 text-muted">
                                                            {list.totalServiesCount} items
                                                        </small>
                                                        {isAlreadyAdded ? (
                                                            <i className="bi bi-check2-circle text-success fs-5"></i>
                                                        ) : (
                                                            <i className="bi bi-plus-circle text-primary fs-5"></i>
                                                        )}
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default ServieOptionsModal;