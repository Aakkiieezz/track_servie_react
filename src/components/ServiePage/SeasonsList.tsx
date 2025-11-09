import React, { useState } from 'react';
import { Link } from "react-router-dom";
import ProgressBar from '../ProgressBar';
import axiosInstance from '../../utils/axiosInstance';
import Alert from '../Alert';
import styles from "../ImageModules/Image.module.css";
import seasonStyles from "./SeasonsList.module.css";

interface Season {
  id: string;
  name: string;
  seasonNo: number;
  posterPath: string | null;
  episodeCount: number;
  episodesWatched: number;
  watched: boolean;

  totalRuntime: number;
  totalWatchedRuntime: number;
}

interface SeasonsListProps {
  seasons?: Season[];
  tmdbId: string;
  onEpWatchCountChange: (data: { totalWatchedEp: number; totalWatchedRuntime: number }) => void;
}

const SeasonsList: React.FC<SeasonsListProps> = ({ seasons = [], tmdbId, onEpWatchCountChange: onEpWatchCountChange }) => {

  const [alert, setAlert] = useState<{ type: string; message: string } | null>(null);

  const [seasonWatchRuntime, setSeasonWatchRuntime] = useState<{ [key: number]: number }>(
    seasons.reduce((acc, season) => {
      acc[season.seasonNo] = season.totalWatchedRuntime;
      return acc;
    }, {} as { [key: number]: number })
  );

  const seasonRuntime = seasons.reduce((acc: { [key: number]: number }, season) => {
    acc[season.seasonNo] = season.totalRuntime;
    return acc;
  }, {} as { [key: number]: number });

  console.log(`SeasonsList -> seasons: ${seasons}, tmdbId: ${tmdbId}`);

  const [seasonWatchState, setSeasonWatchState] = useState<{ [key: number]: boolean }>(
    seasons.reduce((acc, season) => {
      acc[season.seasonNo] = season.watched;
      return acc;
    }, {} as { [key: number]: boolean })
  );

  const [epWatchCount, setEpWatchCount] = useState<{ [key: number]: number }>(
    seasons.reduce((acc, season) => {
      acc[season.seasonNo] = season.episodesWatched;
      return acc;
    }, {} as { [key: number]: number })
  );

  console.log(epWatchCount);

  const epCount = seasons.reduce((acc: { [key: number]: number }, season) => {
    acc[season.seasonNo] = season.episodeCount;
    return acc;
  }, {} as { [key: number]: number });

  const toggleWatch = async (tmdbId: string, seasonNo: number) => {

    const key = seasonNo;

    const currentWatchState = seasonWatchState[key];
    const newWatchState = !currentWatchState;

    const currentEpWatchCount = epWatchCount[key];
    const newEpWatchCount = newWatchState ? epCount[key] : 0;

    const currentSeasonWatchRuntime = seasonWatchRuntime[key];
    const newSeasonWatchRuntime = newWatchState ? seasonRuntime[key] : 0;

    setSeasonWatchRuntime({
      ...seasonWatchRuntime,
      [key]: newSeasonWatchRuntime,
    });

    setSeasonWatchState({
      ...seasonWatchState,
      [key]: newWatchState,
    });

    setEpWatchCount({
      ...epWatchCount,
      [key]: newEpWatchCount,
    });

    // Calculate new totals based on updated values, excluding key = 0
    const totalWatchedEp = Object.entries({
      ...epWatchCount,
      [key]: newEpWatchCount,
    })
      .filter(([k]) => Number(k) !== 0)
      .reduce((sum, [, count]) => sum + count, 0);

    const totalWatchedRuntime = Object.entries({
      ...seasonWatchRuntime,
      [key]: newSeasonWatchRuntime,
    })
      .filter(([k]) => Number(k) !== 0)
      .reduce((sum, [, runtime]) => sum + runtime, 0);

    // Send the derived values to the parent component
    if (seasonNo !== 0)
      onEpWatchCountChange({
        totalWatchedEp,
        totalWatchedRuntime,
      });

    try {
      const response = await axiosInstance.put(`servies/${tmdbId}/Season/${seasonNo}/toggle`);

      if (response.status === 200)
        setAlert({ type: "success", message: `Updated watch status of S${seasonNo} successfully !!` });

    } catch (error) {

      // Not tested - Revert state in case of an API failure
      setSeasonWatchState({
        ...seasonWatchState,
        [key]: currentWatchState,
      });

      setSeasonWatchRuntime({
        ...seasonWatchRuntime,
        [key]: currentSeasonWatchRuntime,
      });

      // Not tested - Revert state in case of an API failure
      setEpWatchCount({
        ...epWatchCount,
        [key]: currentEpWatchCount,
      });

      // Not tested - Revert parents count of ep watched
      const revertedTotalWatchedEp = Object.values({
        ...epWatchCount,
        [key]: currentEpWatchCount,
      }).reduce((sum, count) => sum + count, 0);

      const revertedTotalWatchedRuntime = Object.values({
        ...seasonWatchRuntime,
        [key]: currentSeasonWatchRuntime,
      }).reduce((sum, runtime) => sum + runtime, 0);

      onEpWatchCountChange({
        totalWatchedEp: revertedTotalWatchedEp,
        totalWatchedRuntime: revertedTotalWatchedRuntime,
      });

      console.error('Failed to update watch status', error);

      setAlert({ type: "danger", message: "Failed to update watch status !!" });
    }
  };

  function formatRuntime(totalMinutes: number): string {
    const days = Math.floor(totalMinutes / 1440);
    const hours = Math.floor((totalMinutes % 1440) / 60);
    const minutes = totalMinutes % 60;

    const parts: string[] = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    return parts.length > 0 ? parts.join(" ") : "0m";
  }

  return (
    <>
      <div className="row left">
        {seasons.map((season) => {
          const key = season.seasonNo;
          const watchStateRender = seasonWatchState[key];
          const epWatchCountRender = epWatchCount[key];
          const seasonWatchRuntimeRender = seasonWatchRuntime[key];

          return (
            <div
              key={key}
              className={`col-xxl-2 col-sm-3 col-4 ${styles.imageContainer} ${styles.poster}`}
            >
              <div className={styles.posterWrapper}>

                {/* ===== TOP TITLE OVERLAY ===== */}
                <div className={styles.titleOverlay}>
                  <Link
                    to={`/servies/${tmdbId}/Season/${season.seasonNo}`}
                    state={{ season }}
                    className={styles.titleLink}
                  >
                    <span className={styles.titleText}>{season.name}</span>
                  </Link>
                </div>

                {/* POSTER IMAGE */}
                <Link
                  to={`/servies/${tmdbId}/Season/${season.seasonNo}`}
                  state={{ season }}
                >
                  <img
                    className={`rounded ${styles.imageBorder}`}
                    src={
                      season.posterPath
                        ? `https://www.themoviedb.org/t/p/w300${season.posterPath}`
                        : `https://placehold.co/400x600?text=S${season.seasonNo}`
                    }
                    alt={season.name}
                  />
                </Link>

                {/* ===== PROGRESS SECTION ===== */}
                {season.episodeCount > 0 && (
                  <div className={styles.progressBarWrapper}>
                    <div className={styles.episodeCount}>
                      <p>
                        {epWatchCountRender}/{season.episodeCount}
                      </p>
                      {season.totalRuntime > 0 && (
                        <span style={{ marginLeft: "6px" }}>
                          ({formatRuntime(seasonWatchRuntimeRender)} / {formatRuntime(season.totalRuntime)})
                        </span>
                      )}
                    </div>

                    <ProgressBar
                      episodesWatched={epWatchCountRender}
                      totalEpisodes={season.episodeCount}
                    />
                  </div>
                )}

                {/* ===== BOTTOM BUTTONS ===== */}
                <div
                  className={styles.buttonsContainer}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className={styles.iconGrid}>
                    {/* Toggle Watched */}
                    <a
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        toggleWatch(tmdbId, season.seasonNo);
                      }}
                      title={watchStateRender ? "Mark as Unwatched" : "Mark as Watched"}
                    >
                      {watchStateRender ? (
                        <i className={`bi bi-eye-fill ${styles.eyeFill}`}></i>
                      ) : (
                        <i className={`bi bi-eye-slash-fill ${styles.eyeSlashFill}`}></i>
                      )}
                    </a>

                    {/* Open Poster Gallery */}
                    {season.posterPath && (
                      <Link
                        to={`/servies/${tmdbId}/Season/${season.seasonNo}/posters`}
                        title="Season Posters"
                      >
                        <i className={`bi bi-file-image ${styles.icon}`}></i>
                      </Link>
                    )}
                  </div>
                </div>
              </div>

              {/* Static label under poster */}
              <div className={seasonStyles.seasonLabel}>
                <strong>{season.name}</strong>
              </div>
            </div>
          );
        })}
      </div>

      {/* Alert */}
      {alert && (
        <Alert
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert(null)}
        />
      )}
    </>
  );
};

export default SeasonsList;