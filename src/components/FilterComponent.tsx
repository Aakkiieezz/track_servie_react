import React, { useState } from "react";
import DropdownMenu from "./DropdownMenu";
import DropdownMenu3States from "./DropdownMenu3States";
import DropdownMenu3States2 from "./DropdownMenu3States2";
import YearRangePicker from "./YearRangePickerProps";

interface FilterComponentProps {
 handleFilterChange: (filters: any) => void; // Define the prop type
}

const genreOptions = [
 "Action",
 "Adventure",
 "Animation",
 "Comedy",
 "Crime",
 "Documentary",
 "Drama",
 "Family",
 "Fantasy",
 "History",
 "Horror",
 "Kids",
 "Music",
 "Mystery",
 "News",
 "Politics",
 "Reality",
 "Romance",
 "Science Fiction",
 "Soap",
 "Talk",
 "TV Movie",
 "Thriller",
 "War",
 "Western",
];

const langOptions = [
 "Chinese(Cantonese)",
 "Chinese(Mandarin)",
 "Danish",
 "English",
 "French",
 "German",
 "Hindi",
 "Italian",
 "Japanese",
 "Kannada",
 "Korean",
 "Marathi",
 "Russian",
 "Spanish",
 "Tamil",
 "Telugu",
 "Thai",
];

const statusOptions = [
 "Rumored",
 "Planned",
 "Pilot",
 "In Production",
 "Post Production",
 "Cancelled",
 "Airing",
 "Released",
 "Ended",
];

const FilterComponent: React.FC<FilterComponentProps> = ({
 handleFilterChange,
}) => {
 const [type, setType] = useState("");
 const [sortBy, setSortBy] = useState("title");
 const [sortDir, setSortDir] = useState("asc");

 // 2 states
 //  const [genres, setGenres] = useState<string[]>([]);

 // 3 states
 const [tickedGenres, setTickedGenres] = useState<string[]>([]);
 const [crossedGenres, setCrossedGenres] = useState<string[]>([]);

 // 3 states (2)
 const [tickedGenres2, setTickedGenres2] = useState<string[]>([]);
 const [crossedGenres2, setCrossedGenres2] = useState<string[]>([]);

 const getSelectedLists = () => {
  const ticked: string[] = [];
  const crossed: string[] = [];
  Object.keys(selected).forEach((key) => {
   if (selected[key] === "tick") {
    ticked.push(key);
   } else if (selected[key] === "cross") {
    crossed.push(key);
   }
  });
  return { ticked, crossed };
 };

 const [selected, setSelected] = useState<
  Record<string, "blank" | "tick" | "cross">
 >(genreOptions.reduce((acc, option) => ({ ...acc, [option]: "blank" }), {}));

 const [languages, setLanguages] = useState<string[]>([]);
 const [statuses, setStatuses] = useState<string[]>([]);

 const [startYear, setStartYear] = useState("");
 const [endYear, setEndYear] = useState("");

 const [startYear2, setStartYear2] = useState<Date | undefined>(undefined);
 const [endYear2, setEndYear2] = useState<Date | undefined>(undefined);

 const [watched, setWatched] = useState("");

 const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault();

  // 3 states (2)
  const { ticked, crossed } = getSelectedLists();

  handleFilterChange({
   type,
   sortBy,
   sortDir,

   // 2 states
   // genres,

   // 3 states
   tickedGenres,
   crossedGenres,

   // 3 states (2)
   tickedGenres2: ticked,
   crossedGenres2: crossed,

   languages,
   statuses,

   startYear,
   endYear,

   startYear2,
   endYear2,

   watched,
  });
 };

 return (
  <form onSubmit={handleSubmit} className="d-flex flex-row align-items-center">
   {/* Type Dropdown */}
   <select value={type} onChange={(e) => setType(e.target.value)}>
    <option value="">Servies</option>
    <option value="movie">Movies</option>
    <option value="tv">Series</option>
   </select>
   {/* Sorting Options */}
   <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
    <option value="title">Title</option>
    <option value="date">Release Date</option>
   </select>
   <select value={sortDir} onChange={(e) => setSortDir(e.target.value)}>
    <option value="asc">Ascending</option>
    <option value="desc">Descending</option>
   </select>

   {/* 3 states */}
   <DropdownMenu3States
    label="Genres"
    options={genreOptions}
    tickedItems={tickedGenres}
    crossedItems={crossedGenres}
    setTickedItems={setTickedGenres}
    setCrossedItems={setCrossedGenres}
   />

   {/* 3 states (2) */}
   <DropdownMenu3States2
    label="Genres"
    options={genreOptions}
    selected={selected}
    setSelected={setSelected}
   />

   <DropdownMenu
    label="Languages"
    options={langOptions}
    selected={languages}
    setSelected={setLanguages}
   />
   <DropdownMenu
    label="Statuses"
    options={statusOptions}
    selected={statuses}
    setSelected={setStatuses}
   />
   {/* Year Range */}
   {/* <input
    type="number"
    value={startYear}
    onChange={(e) => setStartYear(e.target.value)}
    placeholder="Start Year"
   />
   <input
    type="number"
    value={endYear}
    onChange={(e) => setEndYear(e.target.value)}
    placeholder="End Year"
   /> */}

   <YearRangePicker
    startYear2={startYear2}
    endYear2={endYear2}
    setStartYear2={setStartYear2}
    setEndYear2={setEndYear2}
   />

   {/* Watched */}
   <select value={watched} onChange={(e) => setWatched(e.target.value)}>
    <option value="">All</option>
    <option value="true">Watched</option>
    <option value="false">Unwatched</option>
   </select>
   <button type="submit">Search</button>
  </form>
 );
};

export default FilterComponent;
