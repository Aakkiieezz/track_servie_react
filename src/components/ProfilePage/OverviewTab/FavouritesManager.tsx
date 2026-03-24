import React, { useEffect, useState } from 'react';
import { Plus, X } from 'lucide-react';
import axiosInstance from '../../../utils/axiosInstance';
import styles from './FavouritesManager.module.css';
import type { Servie } from "@/types/servie";
import ServieCard from "@/components/common/PosterCard/ServieCard";

interface FavouritesResponse {
  movies: Servie[];
  series: Servie[];
}

interface FavoritesManagerProps {
  userId: number;
  isEditable?: boolean;
  onAdd?: (index: number, type: "movie" | "series") => void;
  onRemove?: (tmdbId: number, type: "movie" | "series") => void;
  onFetchError?: (error: string) => void;
}

const MAX_FAVOURITES = 5;

const FavoritesManager: React.FC<FavoritesManagerProps> = ({
  userId,
  isEditable = false,
  onAdd,
  onRemove,
  onFetchError
}) => {
  const [movies, setMovies] = useState<Servie[]>([]);
  const [series, setSeries] = useState<Servie[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get<FavouritesResponse>(`list/${userId}/favourites`);
      setMovies(res.data.movies);
      setSeries(res.data.series);
    } catch (err) {
      console.error('Failed to fetch favorites:', err);
      onFetchError?.('Failed to load favorite servies');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, [userId]);

  const handleRemove = async (tmdbId: number, type: "movie" | "series") => {
    if (onRemove) {
      await onRemove(tmdbId, type);
      fetchFavorites();
    }
  };

  if (loading) return <div className={styles.loadingContainer}>Loading favorites...</div>;

  const renderColumn = (title: string, items: Servie[], type: "movie" | "series") => {
    const emptySlots = Math.max(0, MAX_FAVOURITES - items.length);

    return (
      <div className={styles.column}>
        <h3 className={styles.columnTitle}>
          <i className={`bi ${type === "movie" ? "bi-film" : "bi-tv"}`}></i>
          {title}
        </h3>

        <div className={styles.posterRow}>
          {items.map((item) => (
            <div key={item.tmdbId} className={styles.favoriteCard}>
              <ServieCard servie={item} />
              {isEditable && (
                <button
                  onClick={() => handleRemove(item.tmdbId, type)}
                  className={styles.removeButton}
                >
                  <X size={16} />
                </button>
              )}
            </div>
          ))}

          {Array.from({ length: emptySlots }).map((_, index) => (
            isEditable ? (
              <button
                key={`empty-${index}`}
                onClick={() => onAdd?.(items.length + index, type)}
                className={styles.addButton}
              >
                <Plus size={28} strokeWidth={1.5} />
                <span className={styles.addButtonText}>Add</span>
              </button>
            ) : (
              <div key={`empty-${index}`} className={styles.emptySlot} />
            )
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className={styles.favoritesContainer}>
      {renderColumn("Favourite Movies", movies, "movie")}
      {renderColumn("Favourite Series", series, "series")}
    </div>
  );
};

export default FavoritesManager;