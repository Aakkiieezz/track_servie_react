import React, { useState, useEffect } from 'react';
import styles from './MovieReviewModal.module.css';

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

interface MovieReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: ReviewData) => void;
  tmdbId: number;
  childType: string;
  title: string;
  year: string;
  posterPath: string;
  initialData?: Partial<ReviewData>;
}

const MovieReviewModal: React.FC<MovieReviewModalProps> = ({
  isOpen,
  onClose,
  onSave,
  tmdbId,
  childType,
  title,
  year,
  posterPath,
  initialData
}) => {
  const [watchedOn, setWatchedOn] = useState<string>(
    initialData?.watchedOn || new Date().toISOString().split('T')[0]
  );
  const [watchedBefore, setWatchedBefore] = useState<boolean>(
    initialData?.watchedBefore || false
  );
  const [review, setReview] = useState<string>(initialData?.review || '');
  const [tags, setTags] = useState<string[]>(initialData?.tags || []);
  const [tagInput, setTagInput] = useState<string>('');
  const [rating, setRating] = useState<number>(initialData?.rating || 0);
  const [hoveredRating, setHoveredRating] = useState<number>(0);
  const [liked, setLiked] = useState<boolean>(initialData?.liked || false);

  useEffect(() => {
    if (isOpen && initialData) {
      setWatchedOn(initialData.watchedOn || new Date().toISOString().split('T')[0]);
      setWatchedBefore(initialData.watchedBefore || false);
      setReview(initialData.review || '');
      setTags(initialData.tags || []);
      setRating(initialData.rating || 0);
      setLiked(initialData.liked || false);
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()]);
      }
      setTagInput('');
    } else if (e.key === 'Tab' && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()]);
      }
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSave = () => {
    const reviewData: ReviewData = {
      tmdbId,
      childType,
      watchedOn,
      watchedBefore,
      review,
      tags,
      rating,
      liked
    };
    onSave(reviewData);
    onClose();
  };

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
  <div className={styles.backdrop} onClick={handleOverlayClick}>
    <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
      {/* Header */}
      <div className={styles.header}>
        <h5 className={styles.title}>I watched...</h5>
        <button className={styles.closeBtn} onClick={onClose}>×</button>
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
                e.currentTarget.src = '/src/assets/defaultPoster.png';
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
                  value={watchedOn}
                  onChange={(e) => setWatchedOn(e.target.value)}
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
            <textarea
              placeholder="Add a review..."
              value={review}
              onChange={(e) => setReview(e.target.value)}
              className={styles.reviewTextarea}
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
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoveredRating(star)}
                      onMouseLeave={() => setHoveredRating(0)}
                      className={`${styles.starBtn} ${
                        (hoveredRating || rating) >= star ? styles.filled : styles.empty
                      }`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>

              {/* Like */}
              <div>
                <label className={styles.fieldLabel}>Like</label>
                <button
                  onClick={() => setLiked(!liked)}
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
        <button onClick={handleSave} className={styles.saveBtn}>
          SAVE
        </button>
      </div>
    </div>
  </div>
  );
};

export default MovieReviewModal;