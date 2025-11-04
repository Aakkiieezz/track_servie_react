import React, { useState } from "react";
import { Link } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';
import ProgressBar from "../ProgressBar";
import Alert from "../Alert";
import styles from "../ImageModules/Image.module.css";

interface Servie {
  tmdbId: number;
  childtype: "movie" | "tv";
  title: string;
  posterPath: string;
  found: boolean; // check where used
  totalEpisodes?: number;
  episodesWatched?: number;
  completed: boolean;
  releaseDate?: string;
  language: string; // check where used
  // firstAirDate?: string;
  // lastAirDate?: string;
}

interface ServieGridProps {
  servies: Servie[];
}

const SearchServieGrid: React.FC<ServieGridProps> = ({ servies }) => {

  const [alert, setAlert] = useState<{ type: string; message: string } | null>(null);

  console.log("SearchServieGrid -> servies: ${servies}");

  // State to track the 'completed' status for each servie
  const [servieWatchState, setServieWatchState] = useState<{ [key: string]: boolean }>(
    servies.reduce((acc, servie) => {
      acc[`${servie.childtype}-${servie.tmdbId}`] = servie.completed;
      return acc;
    }, {} as { [key: string]: boolean })
  );

  const toggleWatch = async (childtype: string, tmdbId: number) => {

    const key = `${childtype}-${tmdbId}`;
    const currentCompletedState = servieWatchState[key];
    const newCompletedState = !currentCompletedState;

    setServieWatchState({
      ...servieWatchState,
      [key]: newCompletedState,
    });

    try {
      const response = await axiosInstance.put(`servies/${childtype}/${tmdbId}/toggle`);

      console.log(response);

      const message = newCompletedState ?
        `Marked ${childtype} as watched successfully !!` :
        `Marked ${childtype} as un-watched successfully !!`

      if (response.status === 200) {
        console.log('inside');

        setAlert({ type: "success", message: message });
      }

    } catch (error) {

      // Revert state in case of an API failure
      setServieWatchState({
        ...servieWatchState,
        [key]: currentCompletedState,
      });

      console.error('Failed to update watch status', error);

      setAlert({ type: "danger", message: "Failed to update watch status !!" });
    }
  };

  const toggleWatchList = async (tmdbId: number, childType: "movie" | "tv") => {
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

  return (
    <>

      <div className="row">
        {servies.map((servie) => {
          const key = `${servie.childtype}-${servie.tmdbId}`;
          const watchStateRender = servieWatchState[key];

          return (
            <div className={`col-xxl-1 ${styles.customCol10} col-sm-2 col-3 ${styles.imageContainer} ${styles.poster}`}
              key={key} >

              <div>

                <img
                  className={`rounded ${styles.imageBorder}`}
                  src={`https://www.themoviedb.org/t/p/original${servie.posterPath}`}
                  alt={servie.title}
                  onError={(e) => {
                    e.currentTarget.src = '/src/assets/defaultPoster.png';
                  }}
                />

                <div className={`${styles.buttonsContainer} rounded`}>

                  <Link to='/servie' state={{ childType: servie.childtype, tmdbId: servie.tmdbId }}>
                    <strong>{servie.title}</strong>
                  </Link>

                  <br />

                  {/* only Movie */}
                  {servie.releaseDate && (
                    <span>{new Date(servie.releaseDate).getFullYear()}</span>
                  )}

                  {/* only TV */}
                  {servie.childtype === "tv" && (
                    <>
                      {/* Progress bar */}
                      {servie.found && servie.episodesWatched && servie.totalEpisodes && (
                        <ProgressBar episodesWatched={servie.episodesWatched} totalEpisodes={servie.totalEpisodes} />
                      )}
                    </>
                  )}

                  {servie.found && servie.episodesWatched && servie.totalEpisodes && (
                    <span>
                      {servie.episodesWatched}/{servie.totalEpisodes}
                    </span>
                  )}

                  <a href="#" onClick={() => toggleWatch(servie.childtype, servie.tmdbId)}>
                    {watchStateRender ? (<i className={`bi bi-eye-fill ${styles.icon} ${styles.eyeFill}`}></i>) : (<i className={`bi bi-eye-slash-fill ${styles.eyeSlashFill}`}></i>)}
                  </a>

                  <Link to='/images' state={{ childType: servie.childtype, tmdbId: servie.tmdbId }}>
                    <i className={`bi bi-file-image ${styles.icon}`}></i>
                  </Link>

                  <a href="#" onClick={() => toggleWatchList(servie.tmdbId, servie.childtype)}>
                    <i className={`bi bi-clock-fill ${styles.icon}`}></i>
                  </a>

                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Alert Component */}
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

export default SearchServieGrid;
