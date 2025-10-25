import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

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
    <div 
      className="modal-overlay"
      onClick={handleOverlayClick}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1050,
        padding: '20px'
      }}
    >
      <div 
        className="modal-content"
        style={{
          backgroundColor: '#556b7d',
          borderRadius: '12px',
          maxWidth: '800px',
          width: '100%',
          maxHeight: '90vh',
          overflow: 'auto',
          position: 'relative',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)'
        }}
      >
        {/* Header */}
        <div style={{
          padding: '24px 32px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h2 style={{ 
            margin: 0, 
            color: '#fff',
            fontSize: '24px',
            fontWeight: 600
          }}>
            I watched...
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#fff',
              cursor: 'pointer',
              padding: '4px',
              display: 'flex',
              alignItems: 'center',
              opacity: 0.8,
              transition: 'opacity 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
            onMouseLeave={(e) => e.currentTarget.style.opacity = '0.8'}
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '32px', display: 'flex', gap: '32px' }}>
          {/* Poster */}
          <div style={{ flexShrink: 0 }}>
            <img
              src={posterPath}
              alt={title}
              style={{
                width: '150px',
                height: '225px',
                borderRadius: '8px',
                objectFit: 'cover'
              }}
              onError={(e) => {
                e.currentTarget.src = '/src/assets/defaultPoster.png';
              }}
            />
          </div>

          {/* Form */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Title and Year */}
            <div>
              <h3 style={{ 
                margin: '0 0 4px 0', 
                color: '#fff',
                fontSize: '28px',
                fontWeight: 700
              }}>
                {title}
              </h3>
              <p style={{ 
                margin: 0, 
                color: 'rgba(255, 255, 255, 0.6)',
                fontSize: '18px'
              }}>
                {year}
              </p>
            </div>

            {/* Watched On Checkboxes */}
            <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
              <label style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px',
                color: '#fff',
                cursor: 'pointer',
                fontSize: '14px'
              }}>
                <input
                  type="checkbox"
                  checked={!watchedBefore}
                  onChange={(e) => {
                    if (e.target.checked) setWatchedBefore(false);
                  }}
                  style={{
                    width: '18px',
                    height: '18px',
                    cursor: 'pointer',
                    accentColor: '#4a90e2'
                  }}
                />
                Watched on{' '}
                <input
                  type="date"
                  value={watchedOn}
                  onChange={(e) => setWatchedOn(e.target.value)}
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '4px',
                    padding: '4px 8px',
                    color: '#fff',
                    fontSize: '14px'
                  }}
                />
              </label>

              <label style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px',
                color: '#fff',
                cursor: 'pointer',
                fontSize: '14px'
              }}>
                <input
                  type="checkbox"
                  checked={watchedBefore}
                  onChange={(e) => setWatchedBefore(e.target.checked)}
                  style={{
                    width: '18px',
                    height: '18px',
                    cursor: 'pointer',
                    accentColor: '#4a90e2'
                  }}
                />
                I've watched this before
              </label>
            </div>

            {/* Review Textarea */}
            <textarea
              placeholder="Add a review..."
              value={review}
              onChange={(e) => setReview(e.target.value)}
              style={{
                backgroundColor: 'rgba(189, 211, 227, 0.8)',
                border: 'none',
                borderRadius: '8px',
                padding: '16px',
                color: '#2c3e50',
                fontSize: '14px',
                minHeight: '120px',
                resize: 'vertical',
                fontFamily: 'inherit'
              }}
            />

            {/* Bottom Section */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: '1fr auto auto',
              gap: '16px',
              alignItems: 'start'
            }}>
              {/* Tags */}
              <div>
                <label style={{ 
                  display: 'block', 
                  color: '#fff', 
                  marginBottom: '8px',
                  fontSize: '14px',
                  fontWeight: 500
                }}>
                  Tags
                </label>
                <div style={{
                  backgroundColor: 'rgba(189, 211, 227, 0.8)',
                  borderRadius: '8px',
                  padding: '8px',
                  minHeight: '42px',
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '6px'
                }}>
                  {tags.map((tag, index) => (
                    <span
                      key={index}
                      style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        color: '#2c3e50',
                        padding: '4px 10px',
                        borderRadius: '16px',
                        fontSize: '13px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      {tag}
                      <button
                        onClick={() => removeTag(tag)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#666',
                          cursor: 'pointer',
                          padding: 0,
                          fontSize: '16px',
                          lineHeight: 1
                        }}
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
                    style={{
                      background: 'none',
                      border: 'none',
                      outline: 'none',
                      color: '#2c3e50',
                      fontSize: '13px',
                      flex: 1,
                      minWidth: '100px',
                      padding: '4px'
                    }}
                  />
                </div>
                <p style={{ 
                  margin: '4px 0 0 0', 
                  color: 'rgba(255, 255, 255, 0.5)',
                  fontSize: '12px'
                }}>
                  Press Tab to complete. Enter to create
                </p>
              </div>

              {/* Rating */}
              <div>
                <label style={{ 
                  display: 'block', 
                  color: '#fff', 
                  marginBottom: '8px',
                  fontSize: '14px',
                  fontWeight: 500
                }}>
                  Rating
                </label>
                <div style={{ display: 'flex', gap: '4px' }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoveredRating(star)}
                      onMouseLeave={() => setHoveredRating(0)}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '32px',
                        padding: 0,
                        color: (hoveredRating || rating) >= star ? '#fbbf24' : 'rgba(255, 255, 255, 0.3)',
                        transition: 'color 0.1s'
                      }}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>

              {/* Like */}
              <div>
                <label style={{ 
                  display: 'block', 
                  color: '#fff', 
                  marginBottom: '8px',
                  fontSize: '14px',
                  fontWeight: 500
                }}>
                  Like
                </label>
                <button
                  onClick={() => setLiked(!liked)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '32px',
                    padding: 0,
                    color: liked ? '#ef4444' : 'rgba(255, 255, 255, 0.3)',
                    transition: 'color 0.2s'
                  }}
                >
                  {liked ? '❤' : '🤍'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: '20px 32px',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          justifyContent: 'flex-end'
        }}>
          <button
            onClick={handleSave}
            style={{
              backgroundColor: '#00c853',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              padding: '10px 32px',
              fontSize: '16px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'background-color 0.2s',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#00e676'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#00c853'}
          >
            SAVE
          </button>
        </div>
      </div>
    </div>
  );
};

export default MovieReviewModal;