import React, { useState } from "react";
import DropdownMenu from "../DropdownMenu";
import DropdownMenu3States2 from "../DropdownMenu3States2";
import YearRangePicker from "../YearRangePickerProps";

interface HomePageFilterProps {
    handleFilterChange: (filters: any) => void;
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
    { id: "cn", label: "Chinese(Cantonese)" },
    { id: "zh", label: "Chinese(Mandarin)" },
    { id: "da", label: "Danish" },
    { id: "en", label: "English" },
    { id: "fr", label: "French" },
    { id: "de", label: "German" },
    { id: "hi", label: "Hindi" },
    { id: "it", label: "Italian" },
    { id: "ja", label: "Japanese" },
    { id: "kn", label: "Kannada" },
    { id: "ko", label: "Korean" },
    { id: "mr", label: "Marathi" },
    { id: "ru", label: "Russian" },
    { id: "es", label: "Spanish" },
    { id: "ta", label: "Tamil" },
    { id: "te", label: "Telugu" },
    { id: "th", label: "Thai" }
];

const statusOptions = [
    "Rumored",
    "Planned",
    "Pilot",
    "In Production",
    "Post Production",
    "Canceled",
    "Airing",
    "Released",
    "Ended",
];

const HomePageFilter: React.FC<HomePageFilterProps> = ({ handleFilterChange }) => {
    const [type, setType] = useState("");
    const [sortBy, setSortBy] = useState("title");
    const [sortDir, setSortDir] = useState("asc");

    // 2 states
    //  const [genres, setGenres] = useState<string[]>([]);

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

        console.log("HomePageFilter -> handleFilterChange() triggered")

        handleFilterChange({
            type,
            sortBy,
            sortDir,

            // 2 states
            // genres,

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

            {/* Sorting Direction */}
            <select value={sortDir} onChange={(e) => setSortDir(e.target.value)}>
                <option value="asc">Ascending</option>
                <option value="desc">Descending</option>
            </select>

            {/* 3 states */}
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
            /> */}
            {/* <input
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

export default HomePageFilter;
