import React, { useState } from 'react';
import ProgressBar from '../ProgressBar';
import axiosInstance from '../../utils/axiosInstance';
import Alert from '../Alert';

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

  return (
    <div className="row left">
      {seasons.map((season) => {

        const key = season.seasonNo;
        const watchStateRender = seasonWatchState[key];
        const epWatchCountRender = epWatchCount[key];
        const seasonWatchRuntimeRender = seasonWatchRuntime[key];

        function formatRuntime(totalMinutes: number): string {
          const days = Math.floor(totalMinutes / 1440);
          const hours = Math.floor((totalMinutes % 1440) / 60);
          const minutes = totalMinutes % 60;

          const parts: string[] = [];

          if (days > 0)
            parts.push(`${days}d`);
          if (hours > 0)
            parts.push(`${hours}h`);
          if (minutes > 0)
            parts.push(`${minutes}m`);

          return parts.length > 0 ? parts.join(' ') : '0m';
        }

        return (
          <div key={key} className="col-xxl-2 col-sm-3 col-4 image-container poster">

            {/* Alert Component */}
            {alert && (
              <Alert
                type={alert.type}
                message={alert.message}
                onClose={() => setAlert(null)}
              />
            )}

            <div className="image-season-poster">
              <img
                className="rounded"
                src={season.posterPath
                  ? `https://www.themoviedb.org/t/p/w300${season.posterPath}`
                  : `https://placehold.co/400x600?text=S${season.seasonNo}`}
                alt={season.name || 'No poster available'}
              />
            </div>

            <div className="buttons-container rounded">
              <a href={`servies/${tmdbId}/Season/${season.seasonNo}`}>
                <strong>{season.name}</strong>
              </a>
              <br />

              {/* {toggle completed} */}
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  toggleWatch(tmdbId, season.seasonNo);
                }}
              >
                {watchStateRender ? (<i className="bi bi-eye-fill"></i>) : (<i className="bi bi-eye-slash-fill"></i>)}
              </a>

              {/* Link to poster page if posterPath exists */}
              {season.posterPath && (
                <a href={`servies/${tmdbId}/Season/${season.seasonNo}/posters`}>
                  <i className="bi bi-file-image"></i>
                </a>
              )}

              <br />

              {/* Display episode progress */}
              {season.episodeCount !== 0 && (
                <span>
                  {epWatchCountRender}/{season.episodeCount}
                </span>
              )}

              <br />

              {season.totalRuntime > 0 && (
                <span>{formatRuntime(seasonWatchRuntimeRender)}  / {formatRuntime(season.totalRuntime)}</span>
              )}

              <br />

              {/* Progress bar for episode watching */}
              {season.episodeCount !== 0 && (<ProgressBar episodesWatched={epWatchCountRender} totalEpisodes={season.episodeCount} />
              )}

            </div>

            <div>
              <strong>{season.name}</strong>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default SeasonsList;
