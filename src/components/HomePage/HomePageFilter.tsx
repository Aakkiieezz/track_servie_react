import React, { useState } from "react";
import DropdownMenu from "./HomePageFilter/DropdownMenu";
import DropdownMenu3States2 from "./HomePageFilter/DropdownMenu3States2";
import YearRangePicker from "../YearRangePickerProps";

interface HomePageFilterProps {
    handleFilterChange: (filters: any) => void;
    expanded: boolean;
    onExpand: () => void;
    onCollapse: () => void;
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

// Genres to disable for each type
const disabledGenresForMovie = ["Kids", "News", "Politics", "Reality", "Soap", "Talk"];
const disabledGenresForSeries = ["History", "Horror", "Music", "Romance", "TV Movie", "Thriller"];

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

const HomePageFilter: React.FC<HomePageFilterProps> = ({ handleFilterChange, expanded, onExpand, onCollapse }) => {
    
    if (!expanded) {
        return (
            <button
                className="btn btn-outline-primary me-2"
                onClick={onExpand}
                style={{ minWidth: 120 }}
                title="Expand filters"
            >
                <i className="bi bi-funnel"></i> Filters
            </button>
        );
    }
    
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

    // Compute disabled genres based on selected type
    const getDisabledGenres = () => {
        if (type === "movie") return disabledGenresForMovie;
        if (type === "tv") return disabledGenresForSeries;
        return [];
    };

    return (
        <form onSubmit={handleSubmit} className="d-flex flex-row align-items-center">

            {/* Search Icon Button to collapse */}
            <button
                type="button"
                className="btn btn-link p-0 me-2"
                onClick={onCollapse}
                title="Collapse filters"
                style={{ fontSize: "1.2rem" }}
            >
                <i className="bi bi-funnel"></i>
            </button>

            {/* Type Dropdown */}
            <div className="dropdown position-relative">
                {/* Label */}
                <span
                    className="position-absolute bg-white px-1 text-secondary"
                    style={{
                        top: "-10px",
                        left: "5px",
                        fontSize: "0.8rem",
                    }}
                >Type
                </span>
                <button
                    className="btn btn-outline-primary dropdown-toggle w-100"
                    type="button"
                    id="typeDropdown"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                    style={{ paddingTop: "0.5rem" }} // Adjust padding for extra space below label
                >
                    {type === "" ? "Servies" : type === "movie" ? "Movies" : "Series"}
                </button>
                <ul className="dropdown-menu dropdown-menu-light" aria-labelledby="typeDropdown">
                    <li>
                        <button className="dropdown-item" onClick={() => setType("")}>
                            Servies
                        </button>
                    </li>
                    <li>
                        <button className="dropdown-item" onClick={() => setType("movie")}>
                            Movies
                        </button>
                    </li>
                    <li>
                        <button className="dropdown-item" onClick={() => setType("tv")}>
                            Series
                        </button>
                    </li>
                </ul>
            </div>

            {/* Sorting Options */}
            <div className="dropdown">
                <button
                    className="btn btn-outline-primary dropdown-toggle"
                    type="button"
                    id="sortByDropdown"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                >
                    {sortBy === "title" ? "Title" : "Release Date"}
                </button>
                <ul className="dropdown-menu dropdown-menu-light" aria-labelledby="sortByDropdown">
                    <li>
                        <button className="dropdown-item" onClick={() => setSortBy("title")}>
                            Title
                        </button>
                    </li>
                    <li>
                        <button className="dropdown-item" onClick={() => setSortBy("date")}>
                            Release Date
                        </button>
                    </li>
                </ul>
            </div>

            {/* Sorting Direction */}
            <div className="dropdown">
                <button
                    className="btn btn-outline-primary dropdown-toggle"
                    type="button"
                    id="sortDirDropdown"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                >
                    {sortDir === "asc" ? "Ascending" : "Descending"}
                </button>
                <ul className="dropdown-menu dropdown-menu-light" aria-labelledby="sortDirDropdown">
                    <li>
                        <button className="dropdown-item" onClick={() => setSortDir("asc")}>
                            Ascending
                        </button>
                    </li>
                    <li>
                        <button className="dropdown-item" onClick={() => setSortDir("desc")}>
                            Descending
                        </button>
                    </li>
                </ul>
            </div>

            {/* 3 states */}
            <DropdownMenu3States2
                label="Genres"
                options={genreOptions}
                selected={selected}
                setSelected={setSelected}
                disabledOptions={getDisabledGenres()}
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
