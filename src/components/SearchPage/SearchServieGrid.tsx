import React, { useState } from "react";
import { Link } from 'react-router-dom';
import "../thymeleafCss.css";
import axios from "axios";
import ProgressBar from "../ProgressBar";
import Alert from "../Alert";

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

  const toggleWatch = async (tmdbId: number, childtype: string) => {

    const key = `${childtype}-${tmdbId}`;
    const currentCompletedState = servieWatchState[key];
    const newCompletedState = !currentCompletedState;

    setServieWatchState({
      ...servieWatchState,
      [key]: newCompletedState,
    });

    try {
      const response = await axios.put(`http://localhost:8080/track-servie/react/servies/${childtype}/${tmdbId}/toggle`);

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

  return (
    <div className="row">
      {servies.map((servie) => {
        const key = `${servie.childtype}-${servie.tmdbId}`;
        const isCompleted = servieWatchState[key];

        return (
          <div
            key={key}
            className="col-xxl-1 custom-col-10 col-sm-2 col-3 image-container poster"
          >

            {/* Alert Component */}
            {alert && (
              <Alert
                type={alert.type}
                message={alert.message}
                onClose={() => setAlert(null)}
              />
            )}

            <div>

              {/* Movie Card */}
              {servie.childtype === "movie" && (
                <>
                  <img
                    className="rounded image-border"
                    src={`https://www.themoviedb.org/t/p/original${servie.posterPath}`}
                    alt={servie.title}
                  />
                  <div className="buttons-container rounded">
                    <Link to="/servie" state={{ childType: "movie", tmdbId: servie.tmdbId }}>
                      <strong>{servie.title}</strong>
                    </Link>
                    <br />

                    {servie.releaseDate && (
                      <span>{new Date(servie.releaseDate).getFullYear()}</span>
                    )}
                    <br />

                    {/* {toggle completed} */}
                    <a
                      href="#"
                      onClick={() => toggleWatch(servie.tmdbId, servie.childtype)}
                    >
                      {isCompleted ? (
                        <i className="bi bi-eye-slash-fill"></i>
                      ) : (
                        <i className="bi bi-eye-fill"></i>
                      )}
                    </a>

                    <a
                      href={`/track-servie/servies/${servie.tmdbId}/posters?type=${servie.childtype}`}
                    >
                      <i className="bi bi-file-image"></i>
                    </a>
                    <a
                      href={`/track-servie/list/${servie.tmdbId}?childtype=${servie.childtype}`}
                    >
                      <i className="bi bi-clock-fill"></i>
                    </a>
                  </div>
                </>
              )}

              {/* TV Show Card */}
              {servie.childtype === "tv" && (
                <>
                  <img
                    className="rounded image-border"
                    src={`https://www.themoviedb.org/t/p/original${servie.posterPath}`}
                    alt={servie.title}
                  />
                  <div className="buttons-container rounded">
                    <Link to="/servie" state={{ childType: "tv", tmdbId: servie.tmdbId }}>
                      <strong>{servie.title}</strong>
                    </Link>
                    <br />
                    {servie.releaseDate && (
                      <span>{new Date(servie.releaseDate).getFullYear()}</span>
                    )}
                    <br />
                    {servie.found && servie.episodesWatched && servie.totalEpisodes && (
                      <span>
                        {servie.episodesWatched}/{servie.totalEpisodes}
                      </span>
                    )}
                    <a
                      href="#"
                      onClick={() => toggleWatch(servie.tmdbId, servie.childtype)}
                    >
                      {servie.completed ? (
                        <i className="bi bi-eye-slash-fill"></i>
                      ) : (
                        <i className="bi bi-eye-fill"></i>
                      )}
                    </a>
                    <a
                      href={`/track-servie/servies/${servie.tmdbId}/posters?type=${servie.childtype}`}
                    >
                      <i className="bi bi-file-image"></i>
                    </a>
                    <a
                      href={`/track-servie/list/${servie.tmdbId}?childtype=${servie.childtype}`}
                    >
                      <i className="bi bi-clock-fill"></i>
                    </a>

                    {/* Progress bar */}
                    {servie.found && servie.episodesWatched && servie.totalEpisodes &&
                      (<ProgressBar episodesWatched={servie.episodesWatched} totalEpisodes={servie.totalEpisodes} />)
                    }
                  </div>
                </>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default SearchServieGrid;
