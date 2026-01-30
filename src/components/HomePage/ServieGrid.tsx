import React, { useState } from "react";
import { Link } from 'react-router-dom';
import ProgressBar from "../ProgressBar";
import axiosInstance from '../../utils/axiosInstance';
import { useAlert } from "../../contexts/AlertContext";
import type { Servie } from "@/types/servie";
import ServieOptionsModal from "../ServieOptionsModal";
import styles from "../ImageModules/Image.module.css";

interface ServieGridProps {
  servies: Servie[];
}

const ServieGrid: React.FC<ServieGridProps> = ({ servies = [] }) => {
  const { setAlert } = useAlert();

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
      const response = await axiosInstance.put(`servies/${childtype}/${tmdbId}/watch`,
                null,
                {
                    params: {
                        newServieWatchState: newWatchState,
                    },
                }
            );

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

  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const [selectedServie, setSelectedServie] = useState<Servie | null>(null);

  const openOptionsMenu = (servie: Servie) => {
    setSelectedServie(servie);
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
                        ? (() => {
                          const firstYear = servie.firstAirDate ? new Date(servie.firstAirDate).getFullYear() : null;
                          const lastYear = servie.lastAirDate ? new Date(servie.lastAirDate).getFullYear() : null;
                          const currentYear = new Date().getFullYear();

                          if (!firstYear) return null;

                          if (lastYear) {
                            const endYear = lastYear === currentYear ? "present" : lastYear;
                            return `(${firstYear} - ${endYear})`;
                          }

                          return `(${firstYear})`;
                        })()
                        : servie.releaseDate && `(${new Date(servie.releaseDate).getFullYear()})`}
                    </span>
                  </Link>
                </div>

                <img
                  className={`rounded ${styles.imageBorder}`}
                  src={
                    //   `http://localhost:8080/track-servie/posterImgs_resize220x330_q0.85${servie.posterPath.replace(
                    //   ".jpg",
                    //   ".webp"
                    // )}`
                    servie.posterPath ?
                      `http://localhost:8080/track-servie/posterImgs_resize220x330_q0.85${servie.posterPath.replace(".jpg", ".webp")}`
                      : `https://www.themoviedb.org/t/p/original${servie.posterPath || ''}`
                  }
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = `https://www.themoviedb.org/t/p/original${servie.posterPath}`;
                  }}
                  alt={servie.title}
                />

                {/* Progress Bar */}
                {servie.childtype === "tv" &&
                  // servie.totalEpisodes != null &&
                  servie.episodesWatched != null && (
                    <div className={styles.progressBarWrapper}>
                      {servie.totalEpisodes && (
                        <div className={styles.episodeCount}>
                          {servie.episodesWatched}/{servie.totalEpisodes}
                        </div>
                      )}
                      <ProgressBar
                        episodesWatched={servie.episodesWatched}
                        totalEpisodes={servie.totalEpisodes}
                      />
                    </div>
                  )
                }

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

                    <a
                      href="#"
                      onClick={() => toggleLike(servie.childtype, servie.tmdbId)}
                      title={likeStateRender ? "Unlike" : "Like"}
                    >
                      <i
                        className={`bi bi-suit-heart-fill ${styles.icon} ${styles.heart} ${likeStateRender ? styles.liked : styles.notLiked
                          }`}
                      ></i>
                    </a>

                    <a
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        openOptionsMenu(servie);
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

      {showOptionsModal && selectedServie && (
        <ServieOptionsModal
          isOpen={showOptionsModal}
          onClose={closeOptionsMenu}
          servie={selectedServie}
          onSuccess={handleModalSuccess}
          onError={handleModalError}
        />
      )}
    </>
  );
};

export default ServieGrid;
