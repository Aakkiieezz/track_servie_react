import React, { useState, useEffect } from "react";
import "./thymeleafCss.css";
import axios from "axios";

// Define the type for a movie or TV show
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

interface Filters {
 type: string; // String for type (can be empty)
 sortBy: string; // Sorting criteria (e.g., "title")
 sortDir: "asc" | "desc"; // Sorting direction (can only be "asc" or "desc")
 tickedGenres: string[]; // Array of ticked genres
 crossedGenres: string[]; // Array of crossed genres
 tickedGenres2: string[]; // Array of ticked genres (alternative or additional)
 crossedGenres2: string[]; // Array of crossed genres (alternative or additional)
 languages: string[]; // Array of languages
 statuses: string[]; // Array of statuses
 startYear: string; // Start year as a string
 endYear: string; // End year as a string
 watched: string; // Watched status as a string
}

// Define the props interface
interface ServieGridProps {
 data: Filters;
}

// Component for rendering MovieGrid
const ServieGrid: React.FC<ServieGridProps> = ({ data }) => {
 console.log("ServieGrid data updated:", data);
 const [servies, setServies] = useState<Servie[]>([]);

 // Fetch the servies data from the API
 useEffect(() => {
  console.log("ServieGrid useEffect triggered:", data);

  const fetchServies = async () => {
   try {
    console.log("Data sent to api :", data);
    const response = await axios.post(
     "http://localhost:8080/track-servie/servie/react",
     {
      // Request body
      selectedGenres: data.tickedGenres2,
      rejectedGenres: data.crossedGenres2,
     },
     {
      // Query parameters
      params: {
       sortDir: data.sortDir, // Example query parameter
       pageNumber: 3,
      },
     }
    ); // Modify the API URL accordingly
    console.log("Data received as response :", response);
    setServies(response.data.servies);
   } catch (error) {
    console.error("Error fetching servies", error);
   }
  };

  fetchServies();
 }, [data]);

 const toggleWatch = (
  tmdbId: number,
  childtype: "movie" | "tv",
  completed: boolean
 ) => {
  // Handle the logic for toggling the watch status (e.g., API call)
  console.log(
   `Toggling watch status for ${tmdbId}, childtype: ${childtype}, completed: ${completed}`
  );
 };

 const removeServie = (tmdbId: number, childtype: "movie" | "tv") => {
  // Handle the logic for removing a servie (e.g., API call)
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
         <a href={`/track-servie/servies/${servie.tmdbId}?type=movie`}>
          <strong>{servie.title}</strong>
         </a>
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
         <a href={`/track-servie/servies/${servie.tmdbId}?type=tv`}>
          <strong>{servie.title}</strong>
         </a>
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
         {servie.episodesWatched && servie.totalEpisodes && (
          <div className="progress-bar">
           <div
            className="progress"
            style={{
             width: `${(servie.episodesWatched / servie.totalEpisodes) * 100}%`,
            }}
           >
            {((servie.episodesWatched / servie.totalEpisodes) * 100).toFixed(1)}
            %
           </div>
          </div>
         )}
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
