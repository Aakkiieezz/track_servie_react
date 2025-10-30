import React, { useState, useEffect } from "react";
import { useFilterStore } from "../../store/useFilterStore";
import DropdownMultiselect from "./HomePageFilter/DropdownMultiselect";
import DropdownMenu3States from "./HomePageFilter/DropdownMultiselect3State";

interface HomePageFilterProps {
    handleFilterChange: (filters: any) => void;
    expanded: boolean;
    onExpand: () => void;
    onCollapse: () => void;
}

const genreOptions = [
    "Action", "Adventure", "Animation", "Comedy", "Crime", "Documentary",
    "Drama", "Family", "Fantasy", "History", "Horror", "Kids", "Music",
    "Mystery", "News", "Politics", "Reality", "Romance", "Science Fiction",
    "Soap", "Talk", "TV Movie", "Thriller", "War", "Western",
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
    "Rumored", "Planned", "Pilot", "In Production", "Post Production",
    "Canceled", "Airing", "Released", "Ended",
];

const sortOptions = [
    { key: "title", label: "Title" },
    { key: "recent", label: "Recently Added" },
    { key: "date", label: "Release Date" },
    { key: "popularity", label: "Popularity" },
    { key: "voteAverage", label: "Vote Average" },
];

const HomePageFilter: React.FC<HomePageFilterProps> = ({ 
    handleFilterChange, 
    expanded, 
    onExpand, 
    onCollapse 
}) => {
    // Get persisted filters from Zustand
    const persistedFilters = useFilterStore();
    
    // Initialize local state from Zustand store
    const [type, setType] = useState(persistedFilters.type);
    const [sortBy, setSortBy] = useState(persistedFilters.sortBy);
    const [sortDir, setSortDir] = useState(persistedFilters.sortDir);
    const [languages, setLanguages] = useState<string[]>(persistedFilters.languages);
    const [statuses, setStatuses] = useState<string[]>(persistedFilters.statuses);
    
    // Initialize selected genres from persisted state
    const [selected, setSelected] = useState<Record<string, "blank" | "tick" | "cross">>(() => {
        const initial: Record<string, "blank" | "tick" | "cross"> = genreOptions.reduce(
            (acc, option) => ({ ...acc, [option]: "blank" as const }), 
            {} as Record<string, "blank" | "tick" | "cross">
        );
        
        persistedFilters.tickedGenres.forEach(genre => {
            if (initial[genre] !== undefined) initial[genre] = "tick";
        });
        
        persistedFilters.crossedGenres.forEach(genre => {
            if (initial[genre] !== undefined) initial[genre] = "cross";
        });
        
        return initial;
    });

    // Sync local state when component mounts or Zustand state changes
    useEffect(() => {
        console.log("HomePageFilter -> Syncing with persisted filters:", persistedFilters);
        
        setType(persistedFilters.type);
        setSortBy(persistedFilters.sortBy);
        setSortDir(persistedFilters.sortDir);
        setLanguages(persistedFilters.languages);
        setStatuses(persistedFilters.statuses);
        
        // Sync selected genres
        const newSelected: Record<string, "blank" | "tick" | "cross"> = genreOptions.reduce(
            (acc, option) => ({ ...acc, [option]: "blank" as const }), 
            {} as Record<string, "blank" | "tick" | "cross">
        );
        
        persistedFilters.tickedGenres.forEach(genre => {
            if (newSelected[genre] !== undefined) newSelected[genre] = "tick";
        });
        
        persistedFilters.crossedGenres.forEach(genre => {
            if (newSelected[genre] !== undefined) newSelected[genre] = "cross";
        });
        
        setSelected(newSelected);
    }, [persistedFilters.type, persistedFilters.sortBy, persistedFilters.sortDir,
        persistedFilters.tickedGenres, persistedFilters.crossedGenres,
        persistedFilters.languages, persistedFilters.statuses]);

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

    const getSelectedLists = () => {
        const ticked: string[] = [];
        const crossed: string[] = [];
        Object.keys(selected).forEach((key) => {
            if (selected[key] === "tick") ticked.push(key);
            else if (selected[key] === "cross") crossed.push(key);
        });
        return { ticked, crossed };
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const { ticked, crossed } = getSelectedLists();

        const newFilters = {
            type,
            sortBy,
            sortDir,
            tickedGenres: ticked,
            crossedGenres: crossed,
            languages,
            statuses,
        };

        console.log("HomePageFilter -> handleSubmit -> new filters:", newFilters);

        // Save to Zustand (which also saves to localStorage via persist middleware)
        persistedFilters.setFilters(newFilters);

        // Notify parent
        handleFilterChange(newFilters);
    };

    const handleReset = () => {
        // Reset Zustand store
        persistedFilters.resetFilters();
        
        // Reset local state to defaults
        setType("");
        setSortBy("title");
        setSortDir("asc");
        setLanguages([]);
        setStatuses([]);
        
        // Reset selected genres
        const resetSelected: Record<string, "blank" | "tick" | "cross"> = genreOptions.reduce(
            (acc, option) => ({ ...acc, [option]: "blank" as const }), 
            {} as Record<string, "blank" | "tick" | "cross">
        );
        setSelected(resetSelected);
        
        // Notify parent with default filters
        handleFilterChange({
            type: "",
            sortBy: "title",
            sortDir: "asc",
            tickedGenres: [],
            crossedGenres: [],
            languages: [],
            statuses: []
        });
    };

    const getDisabledGenres = () => {
        if (type === "movie") return disabledGenresForMovie;
        if (type === "tv") return disabledGenresForSeries;
        return [];
    };

    return (
        <form onSubmit={handleSubmit} className="d-flex flex-row align-items-center">
            <button
                type="button"
                className="btn btn-link p-0 me-2"
                onClick={onCollapse}
                title="Collapse filters"
                style={{ fontSize: "1.2rem" }}
            >
                <i className="bi bi-funnel"></i>
            </button>

            <button 
                type="button" 
                className="btn btn-outline-secondary ms-2"
                onClick={handleReset}
                title="Clear all filters"
            >
                <i className="bi bi-x-circle"></i>
            </button>

            {/* Type Dropdown */}
            <div className="dropdown position-relative">
                <span
                    className="position-absolute bg-white px-1 text-secondary"
                    style={{ top: "-10px", left: "5px", fontSize: "0.8rem" }}
                >Type</span>
                <button
                    className="btn btn-outline-primary dropdown-toggle w-100"
                    type="button"
                    id="typeDropdown"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                    style={{ paddingTop: "0.5rem" }}
                >
                    {type === "" ? "Servies" : type === "movie" ? "Movies" : "Series"}
                </button>
                <ul className="dropdown-menu dropdown-menu-light" aria-labelledby="typeDropdown">
                    <li><button className="dropdown-item" type="button" onClick={() => setType("")}>Servies</button></li>
                    <li><button className="dropdown-item" type="button" onClick={() => setType("movie")}>Movies</button></li>
                    <li><button className="dropdown-item" type="button" onClick={() => setType("tv")}>Series</button></li>
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
                    {{
                        title: "Title",
                        date: "Release Date",
                        popularity: "Popularity",
                        voteAverage: "Avg Vote",
                        recent: "Recently Added",
                    }[sortBy] || "Sort By"}
                </button>
                <ul className="dropdown-menu dropdown-menu-light" aria-labelledby="sortByDropdown">
                    {sortOptions.map(({ key, label }) => (
                        <li key={key}>
                            <button className="dropdown-item" type="button" onClick={() => setSortBy(key)}>
                                {label}
                            </button>
                        </li>
                    ))}
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
                    <li><button className="dropdown-item" type="button" onClick={() => setSortDir("asc")}>Ascending</button></li>
                    <li><button className="dropdown-item" type="button" onClick={() => setSortDir("desc")}>Descending</button></li>
                </ul>
            </div>

            <DropdownMenu3States
                label="Genres"
                options={genreOptions}
                selected={selected}
                setSelected={setSelected}
                disabledOptions={getDisabledGenres()}
            />

            <DropdownMultiselect
                label="Languages"
                options={langOptions}
                selected={languages}
                setSelected={setLanguages}
            />

            <DropdownMultiselect
                label="Statuses"
                options={statusOptions}
                selected={statuses}
                setSelected={setStatuses}
            />

            <button type="submit">Search</button>
        </form>
    );
};

export default HomePageFilter;