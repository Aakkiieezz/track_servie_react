// ServieOptionsModal.tsx
import React, { useState } from 'react';
import axiosInstance from '../utils/axiosInstance';

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

interface ListDto2 {
    id: number;
    name: string;
    description: string;
    totalServiesCount: number;
}

interface ListDtoDetails {
    lists: ListDto2[];
}

const ServieOptionsModal: React.FC<ServieOptionsModalProps> = ({
    isOpen,
    onClose,
    servie,
    onSuccess,
    onError,
}) => {
    const [showListModal, setShowListModal] = useState(false);
    const [userLists, setUserLists] = useState<ListDto2[]>([]);
    const [loadingLists, setLoadingLists] = useState(false);

    if (!isOpen || !servie) return null;

    const openListModal = async () => {
        console.log("here");
        setLoadingLists(true);
        try {
            const response = await axiosInstance.get<ListDtoDetails>('list/get-all');
            setUserLists(response.data.lists);
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
        setUserLists([]);
    };

    const addToList = async (listId: number) => {
        try {

            const response = await axiosInstance.post(`list/${listId}/add-servie/${servie.childtype}/${servie.tmdbId}`);

            if (response.status === 200) {
                onSuccess('Added to list successfully !!');
                closeListModal();
                onClose();
            }
        } catch (error) {
            console.error('Failed to add to list', error);
            onError('Failed to add to list !!');
        }
    };

    const handleGiveRating = () => {
        console.log('Give rating for:', servie);
        onClose();
        // Implement rating functionality here
    };

    return (
        <>
            {/* Options Modal */}
            {!showListModal && (
                <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
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
                                        {loadingLists ? 'Loading...' : 'Add to List'}
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

            {/* List Selection Modal */}
            {showListModal && (
                <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Select a List</h5>
                                <button type="button" className="btn-close" onClick={closeListModal}></button>
                            </div>
                            <div className="modal-body">
                                {userLists.length === 0 ? (
                                    <p className="text-muted text-center">No lists available</p>
                                ) : (
                                    <div className="list-group">
                                        {userLists.map((list) => (
                                            <button
                                                key={list.id}
                                                className="list-group-item list-group-item-action"
                                                onClick={() => addToList(list.id)}
                                            >
                                                <div className="d-flex w-100 justify-content-between">
                                                    <h6 className="mb-1">{list.name}</h6>
                                                    <small>{list.totalServiesCount} items</small>
                                                </div>
                                                {list.description && (
                                                    <small className="text-muted">{list.description}</small>
                                                )}
                                            </button>
                                        ))}
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