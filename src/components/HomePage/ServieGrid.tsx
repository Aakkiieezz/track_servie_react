import React, { useState } from "react";
import { Link } from 'react-router-dom';
import ProgressBar from "../ProgressBar";
import axiosInstance from '../../utils/axiosInstance';
import Alert from '../Alert';
import ServieOptionsModal from "../ServieOptionsModal";
import styles from "../ImageModules/Image.module.css";

interface Servie {
  // Servie fields
  tmdbId: number;
  childtype: "movie" | "tv";
  title: string;
  posterPath: string;

  // Movie fields
  releaseDate?: string;

  // Series fields
  totalEpisodes?: number;
  firstAirDate?: string;
  lastAirDate?: string;

  // UserServieData fields
  episodesWatched?: number;
  completed: boolean;
  liked: boolean;
}

interface ServieGridProps {
  servies: Servie[];
}

const ServieGrid: React.FC<ServieGridProps> = ({ servies = [] }) => {
  const [alert, setAlert] = useState<{ type: string; message: string } | null>(null);

  const [servieLikedState, setServieLikedState] = useState<{ [key: string]: boolean }>(
    servies.reduce((acc, servie) => {
      const key = `${servie.childtype}-${servie.tmdbId}`;
      acc[key] = servie.liked;
      return acc;
    }, {} as { [key: string]: boolean })
  );

  const [servieWatchState, setServieWatchState] = useState<{ [key: string]: boolean }>(
    servies.reduce((acc, servie) => {
      const key = `${servie.childtype}-${servie.tmdbId}`;
      acc[key] = servie.completed;
      return acc;
    }, {} as { [key: string]: boolean })
  );

  const toggleLike = async (childtype: string, tmdbId: number) => {

    const key = `${childtype}-${tmdbId}`;

    const currentLikedState = servieLikedState[key];
    const newLikedState = !currentLikedState;
    console.log(
      `Marked like status for ${tmdbId}, childtype: ${childtype}, liked: ${newLikedState}`
    );

    setServieLikedState({
      ...servieLikedState,
      [key]: newLikedState,
    });

    try {
      const response = await axiosInstance.put(
        `servies/${tmdbId}`,
        null,
        {
          params: {
            type: childtype,
            like: newLikedState,
          }
        },
      );

      if (response.status === 200)
        setAlert({ type: "success", message: `Updated like status of S${tmdbId} successfully !!` });

    } catch (error) {

      // Not tested - Revert state in case of an API failure
      setServieLikedState({
        ...servieLikedState,
        [key]: currentLikedState,
      });

      console.error('Failed to update like status', error);

      setAlert({ type: "danger", message: "Failed to update like status !!" });
    }
  };

  const toggleWatch = async (childtype: string, tmdbId: number) => {
    const key = `${childtype}-${tmdbId}`;

    const currentWatchState = servieWatchState[key];
    const newWatchState = !currentWatchState;
    console.log(
      `Marked watch status for ${tmdbId}, childtype: ${childtype}, liked: ${newWatchState}`
    );
    setServieWatchState({
      ...servieWatchState,
      [key]: newWatchState,
    });

    try {
      const response = await axiosInstance.put(`servies/${childtype}/${tmdbId}/toggle`);

      if (response.status === 200)
        setAlert({ type: "success", message: `Updated watch status of ${childtype} ${tmdbId} successfully !!` });

    } catch (error) {

      // Not tested - Revert state in case of an API failure
      setServieWatchState({
        ...servieWatchState,
        [key]: currentWatchState,
      });

      console.error('Failed to update watch status', error);

      setAlert({ type: "danger", message: "Failed to update watch status !!" });
    }
  }
  
  const toggleWatchList = async (tmdbId: number, childType: "movie" | "tv") => {
    console.log("watchlist toggle");
    try {
      const response = await axiosInstance.put(
        `watchlist/${tmdbId}`,
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

  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const [selectedServie, setSelectedServie] = useState<{ tmdbId: number; childtype: string } | null>(null);

  const openOptionsMenu = (tmdbId: number, childtype: string) => {
    setSelectedServie({ tmdbId, childtype });
    setShowOptionsModal(true);
  };

  const closeOptionsMenu = () => {
    setShowOptionsModal(false);
    setSelectedServie(null);
  };

  const handleModalSuccess = (message: string) => {
    setAlert({ type: "success", message });
  };

  const handleModalError = (message: string) => {
    setAlert({ type: "danger", message });
  };

  return (
  <>
    <div className="row center">
      {servies.map((servie) => {
        const key = `${servie.childtype}-${servie.tmdbId}`;
        const watchStateRender = servieWatchState[key];
        const likeStateRender = servieLikedState[key];
        return (
          <div
            className={`col-xxl-1 col-sm-2 col-3 ${styles.imageContainer} ${styles.poster}`}
            key={key}
          >
            <div className={styles.posterWrapper}>

              {/* TITLE OVERLAY INSIDE IMAGE */}
              <div className={styles.titleOverlay}>
                <Link
                  to='/servie'
                  state={{
                    childType: servie.childtype,
                    tmdbId: servie.tmdbId
                  }}
                  className={styles.titleLink}
                >
                  <span className={styles.titleText}>{servie.title}</span>

                  <span className={styles.yearText}>
                    {servie.childtype === "tv"
                      ? `(${new Date(servie.firstAirDate!).getFullYear()} - ${
                          new Date(servie.lastAirDate!).getFullYear() === new Date().getFullYear()
                            ? "present"
                            : new Date(servie.lastAirDate!).getFullYear()
                        })`
                      : servie.releaseDate && `(${new Date(servie.releaseDate).getFullYear()})`}
                  </span>
                </Link>
              </div>

              <img
                className={`rounded ${styles.imageBorder}`}
                src={`http://localhost:8080/track-servie/posterImgs_resize220x330_q0.85${servie.posterPath.replace(
                  ".jpg",
                  ".webp"
                )}`}
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = `https://www.themoviedb.org/t/p/original${servie.posterPath}`;
                }}
                alt={servie.title}
              />

              {/* Progress Bar */}
              {servie.childtype === "tv" &&
                servie.totalEpisodes != null &&
                servie.episodesWatched != null && (
                  <div className={styles.progressBarWrapper}>
                    <div className={styles.episodeCount}>
                      {servie.episodesWatched}/{servie.totalEpisodes}
                    </div>
                    <ProgressBar
                      episodesWatched={servie.episodesWatched}
                      totalEpisodes={servie.totalEpisodes}
                    />
                  </div>
                )}

              {/* Buttons */}
              <div className={styles.buttonsContainer}>
                <div className={styles.iconGrid}>
                  <a
                    href="#"
                    onClick={() => toggleWatch(servie.childtype, servie.tmdbId)}
                    title={
                      watchStateRender ? "Mark as Unwatched" : "Mark as Watched"
                    }
                  >
                    {watchStateRender ? (
                      <i
                        className={`bi bi-eye-fill ${styles.icon} ${styles.eyeFill}`}
                      ></i>
                    ) : (
                      <i
                        className={`bi bi-eye-slash-fill ${styles.icon} ${styles.eyeSlashFill}`}
                      ></i>
                    )}
                  </a>

                  <Link
                    to="/images"
                    state={{
                      childType: servie.childtype,
                      tmdbId: servie.tmdbId,
                      title: servie.title,
                      releaseDate: servie.releaseDate,
                      firstAirDate: servie.firstAirDate,
                      lastAirDate: servie.lastAirDate,
                    }}
                    title="View Images"
                  >
                    <i className={`bi bi-file-image ${styles.icon}`}></i>
                  </Link>

                  <a
                    href="#"
                    onClick={() => toggleLike(servie.childtype, servie.tmdbId)}
                    title={likeStateRender ? "Unlike" : "Like"}
                  >
                    <i
                      className={`bi bi-suit-heart-fill ${styles.icon} ${styles.heart} ${
                        likeStateRender ? styles.liked : styles.notLiked
                      }`}
                    ></i>
                  </a>

                  <a
                    href="#"
                    onClick={() => toggleWatchList(servie.tmdbId, servie.childtype)}
                    title="Add to Watchlist"
                  >
                    <i className={`bi bi-clock-fill ${styles.icon}`}></i>
                  </a>

                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      openOptionsMenu(servie.tmdbId, servie.childtype);
                    }}
                    title="More Options"
                  >
                    <i
                      className={`bi bi-three-dots-vertical ${styles.icon} ${styles.options}`}
                    ></i>
                  </a>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>

    {alert && (
      <Alert
        type={alert.type}
        message={alert.message}
        onClose={() => setAlert(null)}
      />
    )}

    <ServieOptionsModal
      isOpen={showOptionsModal}
      onClose={closeOptionsMenu}
      servie={selectedServie}
      onSuccess={handleModalSuccess}
      onError={handleModalError}
    />
  </>
);
};

export default ServieGrid;
