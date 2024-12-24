import React from "react";
import { Link } from 'react-router-dom';
import "../thymeleafCss.css";
import ProgressBar from "../ProgressBar";

interface Servie {
  tmdbId: number;
  childtype: "movie" | "tv";
  posterPath: string;
  title: string;
  releaseDate?: string;
  firstAirDate?: string;
  lastAirDate?: string;
  completed: boolean;
  episodesWatched?: number;
  totalEpisodes?: number;
}

interface ServieGridProps {
  servies: Servie[];
}

const ServieGrid: React.FC<ServieGridProps> = ({ servies }) => {

  const toggleWatch = (
    tmdbId: number,
    childtype: "movie" | "tv",
    completed: boolean
  ) => {
    console.log(
      `Toggling watch status for ${tmdbId}, childtype: ${childtype}, completed: ${completed}`
    );
  };

  const removeServie = (tmdbId: number, childtype: "movie" | "tv") => {
    console.log(`Removing servie with ID ${tmdbId} of type ${childtype}`);
  };

  return (
    <div className="row center">
      {servies.map((servie) => (
        <div
          className="col-xxl-1 col-sm-2 col-3 image-container poster"
          key={`${servie.childtype}-${servie.tmdbId}`}
        >
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
                  <Link to='/servie'
                    state={{ childType: "movie", tmdbId: servie.tmdbId }}
                  >
                    <strong>{servie.title}</strong>
                  </Link>
                  <br />
                  {servie.releaseDate && (
                    <span>{new Date(servie.releaseDate).getFullYear()}</span>
                  )}
                  <br />
                  <a
                    href="#"
                    onClick={() =>
                      toggleWatch(servie.tmdbId, servie.childtype, servie.completed)
                    }
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
                  <a
                    href="#"
                    onClick={() => removeServie(servie.tmdbId, servie.childtype)}
                  >
                    <i className="bi bi-x-circle-fill"></i>
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
                  <Link to='/servie'
                    state={{ childType: "tv", tmdbId: servie.tmdbId }}
                  >
                    <strong>{servie.title}</strong>
                  </Link>
                  <br />
                  {servie.firstAirDate && (
                    <span>
                      {new Date(servie.firstAirDate).getFullYear()} -{" "}
                      {new Date(servie.lastAirDate!).getFullYear() ===
                        new Date().getFullYear()
                        ? "present"
                        : new Date(servie.lastAirDate!).getFullYear()}
                    </span>
                  )}
                  <br />
                  {servie.episodesWatched && servie.totalEpisodes && (
                    <span>
                      {servie.episodesWatched}/{servie.totalEpisodes}
                    </span>
                  )}
                  <a
                    href="#"
                    onClick={() =>
                      toggleWatch(servie.tmdbId, servie.childtype, servie.completed)
                    }
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
                  <a
                    href="#"
                    onClick={() => removeServie(servie.tmdbId, servie.childtype)}
                  >
                    <i className="bi bi-x-circle-fill"></i>
                  </a>

                  {/* Progress bar */}
                  {servie.episodesWatched && servie.totalEpisodes &&
                    (<ProgressBar episodesWatched={servie.episodesWatched} totalEpisodes={servie.totalEpisodes} />)
                  }
                </div>
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ServieGrid;
