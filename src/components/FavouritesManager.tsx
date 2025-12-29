import React, { useEffect, useState } from 'react';
import { Plus, X } from 'lucide-react';
import axiosInstance from '../utils/axiosInstance';
import styles from './FavouritesManager.module.css';

interface Servie {
  tmdbId: number;
  childtype: "movie" | "tv";
  title: string;
  posterPath: string;
  releaseDate?: string;
  totalEpisodes: number | null;
  firstAirDate?: string;
  lastAirDate?: string;
  episodesWatched: number;
  completed: boolean;
  liked: boolean;
}

interface FavoritesManagerProps {
  userId: number;
  onAdd?: (index: number) => void;
  onRemove?: (tmdbId: number) => void;
  isEditable?: boolean;
  onFetchError?: (error: string) => void;
}

const FavoritesManager: React.FC<FavoritesManagerProps> = ({ 
  userId,
  onAdd, 
  onRemove,
  isEditable = false,
  onFetchError
}) => {
  const [favorites, setFavorites] = useState<Servie[]>([]);
  const [loading, setLoading] = useState(false);
  const maxFavorites = 5;

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get<Servie[]>(`list/favourites`);
      if (res.status === 200) {
        setFavorites(res.data);
      }
      console.log('these are the fav', favorites);
    } catch (err) {
      console.error('Failed to fetch favorites:', err);
      if (onFetchError) {
        onFetchError('Failed to load favorite servies');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, [userId]);

  const handleRemove = async (tmdbId: number) => {
    if (onRemove) {
      await onRemove(tmdbId);
      // Refresh the list after removal
      fetchFavorites();
    }
  };

  if (loading) {
    return <div className={styles.loadingContainer}>Loading favorites...</div>;
  }

  const emptySlots = Math.max(0, maxFavorites - favorites.length);

  return (
    <div className={styles.favoritesContainer}>
      {favorites.map((movie) => (
        <div key={movie.tmdbId} className={styles.favoriteCard}>
          <img
            src={`https://image.tmdb.org/t/p/w500${movie.posterPath}`}
            alt={movie.title}
            className={styles.posterImage}
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://via.placeholder.com/160x240?text=No+Image';
            }}
          />
          
          {isEditable && onRemove && (
            <button
              onClick={() => handleRemove(movie.tmdbId)}
              className={styles.removeButton}
            >
              <X size={18} />
            </button>
          )}

          <div className={styles.movieTitle}>
            {movie.title}
          </div>
        </div>
      ))}

      {isEditable && onAdd && Array.from({ length: emptySlots }).map((_, index) => (
        <button
          key={`empty-${index}`}
          onClick={() => onAdd(favorites.length + index)}
          className={styles.addButton}
        >
          <Plus size={32} strokeWidth={2} />
          <span className={styles.addButtonText}>Add Favorite</span>
        </button>
      ))}
    </div>
  );
};

export default FavoritesManager;