import React, { useState, useEffect } from 'react';
import type { ReviewData } from "@/types/servie";
import HalfStarRating from '@/components/common/HalfStarRating';
import FormattingTextarea from '@/components/common/ReviewModal/FormattingTextarea';
import styles from './ReviewModal.module.css';

interface ReviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: ReviewData) => void | Promise<void>;
    title: string;
    year?: string;
    posterPath: string;
    initialData?: Partial<ReviewData>;
}

const ReviewModal: React.FC<ReviewModalProps> = ({
    isOpen,
    onClose,
    onSave,
    title,
    year,
    posterPath,
    initialData
}) => {
    const [watchedDate, setWatchedDate] = useState<string>(initialData?.watchedDate ?? new Date().toISOString().split('T')[0]);
    const [watchedBefore, setWatchedBefore] = useState<boolean>(initialData?.watchedBefore ?? false);
    const [liked, setLiked] = useState<boolean>(initialData?.liked ?? false);
    const [review, setReview] = useState<string | null>(initialData?.review ?? null);
    const [tags, setTags] = useState<string[]>(initialData?.tags || []);
    const [tagInput, setTagInput] = useState<string>('');
    const [rating, setRating] = useState<number | null>(initialData?.rating ?? null);
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);

    const resetForm = (data?: Partial<ReviewData>) => {
        setWatchedDate(data?.watchedDate ?? new Date().toISOString().split('T')[0]);
        setWatchedBefore(data?.watchedBefore ?? false);
        setLiked(data?.liked ?? false);
        setReview(data?.review ?? null);
        setRating(data?.rating ?? null);
        setTags(data?.tags ?? []);
        setTagInput('');
        setSaveError(null);
    };

    useEffect(() => {
        if (isOpen)
            resetForm(initialData);
    }, [isOpen, initialData]);

    if (!isOpen) return null;

    const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && tagInput.trim()) {
            e.preventDefault();
            if (!tags.includes(tagInput.trim()))
                setTags([...tags, tagInput.trim()]);
            setTagInput('');
        } else if (e.key === 'Tab' && tagInput.trim()) {
            e.preventDefault();
            if (!tags.includes(tagInput.trim()))
                setTags([...tags, tagInput.trim()]);
            setTagInput('');
        }
    };

    const removeTag = (tagToRemove: string) => {
        setTags(tags.filter(tag => tag !== tagToRemove));
    };

    const handleSave = async () => {
        if (saving) return;

        // A cleared (or whitespace-only) review is "no review": save null, not an empty string
        const cleanReview = review?.trim() ? review.trim() : null;

        const reviewData: ReviewData = {
            watchedDate,
            watchedBefore,
            review: cleanReview,
            tags,
            rating,
            liked
        };

        setSaving(true);
        setSaveError(null);
        try {
            // onSave may be async: the modal stays open until the save has succeeded
            await onSave(reviewData);
            onClose();
        } catch {
            // The handler has already reported the details. Stay open so nothing typed is lost;
            // pressing Save again retries.
            setSaveError("Couldn't save your changes. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    // Don't allow closing mid-save, or a failure would go unseen
    const requestClose = () => {
        if (!saving) onClose();
    };

    const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget)
            requestClose();
    };

    return (
        <div className={styles.backdrop} onClick={handleOverlayClick}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className={styles.header}>
                    <h5 className={styles.title}>I watched...</h5>
                    <button className={styles.closeBtn} onClick={requestClose}>×</button>
                </div>

                {/* Content */}
                <div className={styles.body}>
                    <div className={styles.content}>
                        {/* Poster */}
                        <div className={styles.posterContainer}>
                            <img
                                src={posterPath}
                                alt={title}
                                className={styles.poster}
                                onError={(e) => {
                                    e.currentTarget.src = '/defaultPoster.png';
                                }}
                            />
                        </div>

                        {/* Form */}
                        <div className={styles.formSection}>
                            {/* Title and Year */}
                            <div>
                                <h3 className={styles.movieTitle}>{title}</h3>
                                <p className={styles.movieYear}>{year}</p>
                            </div>

                            {/* Watched On Checkboxes */}
                            <div className={styles.checkboxGroup}>
                                <label className={styles.checkboxLabel}>
                                    <input
                                        type="checkbox"
                                        checked={!watchedBefore}
                                        onChange={(e) => {
                                            if (e.target.checked) setWatchedBefore(false);
                                        }}
                                        className={styles.checkbox}
                                    />
                                    Watched on{' '}
                                    <input
                                        type="date"
                                        value={watchedDate}
                                        onChange={(e) => setWatchedDate(e.target.value)}
                                        className={styles.dateInput}
                                    />
                                </label>

                                <label className={styles.checkboxLabel}>
                                    <input
                                        type="checkbox"
                                        checked={watchedBefore}
                                        onChange={(e) => setWatchedBefore(e.target.checked)}
                                        className={styles.checkbox}
                                    />
                                    I've watched this before
                                </label>
                            </div>

                            {/* Review Textarea */}
                            <FormattingTextarea
                                value={review ?? ''}
                                onChange={setReview}
                                placeholder="Add a review..."
                            />

                            {/* Bottom Section */}
                            <div className={styles.bottomGrid}>
                                {/* Tags */}
                                <div>
                                    <label className={styles.fieldLabel}>Tags</label>
                                    <div className={styles.tagsContainer}>
                                        {tags.map((tag, index) => (
                                            <span key={index} className={styles.tag}>
                                                {tag}
                                                <button
                                                    onClick={() => removeTag(tag)}
                                                    className={styles.tagRemoveBtn}
                                                >
                                                    ×
                                                </button>
                                            </span>
                                        ))}
                                        <input
                                            type="text"
                                            placeholder={tags.length === 0 ? "eg. netflix" : ""}
                                            value={tagInput}
                                            onChange={(e) => setTagInput(e.target.value)}
                                            onKeyDown={handleTagKeyDown}
                                            className={styles.tagInput}
                                        />
                                    </div>
                                    <p className={styles.tagHint}>
                                        Press Tab to complete. Enter to create
                                    </p>
                                </div>

                                {/* Rating */}
                                <div>
                                    <label className={styles.fieldLabel}>Rating</label>
                                    <div className={styles.ratingStars}>
                                        <HalfStarRating
                                            maxStars={5}
                                            initialRating={rating}
                                            onRatingChange={(value: number | null) => setRating(value)}
                                        />
                                    </div>
                                </div>

                                {/* Like */}
                                <div>
                                    <label className={styles.fieldLabel}>Like</label>
                                    <button
                                        onClick={() => setLiked(prev => !prev)}
                                        className={`${styles.likeBtn} ${liked ? styles.liked : styles.notLiked}`}
                                    >
                                        {liked ? '❤' : '🤍'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className={styles.footer}>
                    {saveError && (
                        <span className={styles.saveError} role="alert">
                            {saveError}
                        </span>
                    )}
                    <button onClick={handleSave} disabled={saving} className={styles.saveBtn}>
                        {saving ? 'SAVING…' : 'SAVE'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ReviewModal;