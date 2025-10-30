import React, { useEffect, useState } from "react";
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

const HomePageFilter: React.FC<HomePageFilterProps> = ({ handleFilterChange, expanded, onExpand, onCollapse }) => {

    const persistedFilters = useFilterStore();

    // ---------------------
    // TEMPORARY (UI) STATE
    // ---------------------
    // These are the values user interacts with. Nothing external reads these.
    const [tempType, setTempType] = useState<string>("");
    const [tempSortBy, setTempSortBy] = useState<string>("title");
    const [tempSortDir, setTempSortDir] = useState<string>("asc");
    const [tempLanguages, setTempLanguages] = useState<string[]>([]);
    const [tempStatuses, setTempStatuses] = useState<string[]>([]);

    // selected genres for 3-state control (temp)
    const [tempGenresSelected, setTempGenresSelected] = useState<Record<string, "blank" | "tick" | "cross">>(() =>
        genreOptions.reduce((acc, g) => ({ ...acc, [g]: "blank" as const }), {} as Record<string, "blank" | "tick" | "cross">)
    );

    // ---------------------
    // Initialize temp state ONCE from persisted store (on mount)
    // ---------------------
    useEffect(() => {
        // Read persisted store once and populate temp state.
        // IMPORTANT: This effect has an empty deps array intentionally so that
        // we don't re-sync and overwrite user changes while they are editing.
        // If you need to explicitly refresh persisted values, add a manual "Reset to saved" control.
        setTempType(persistedFilters.type ?? "");
        setTempSortBy(persistedFilters.sortBy ?? "title");
        setTempSortDir(persistedFilters.sortDir ?? "asc");
        setTempLanguages(persistedFilters.languages ?? []);
        setTempStatuses(persistedFilters.statuses ?? []);

        const initialGenresSelected: Record<string, "blank" | "tick" | "cross"> =
            genreOptions.reduce((acc, option) => ({ ...acc, [option]: "blank" as const }), {} as Record<string, "blank" | "tick" | "cross">);

        (persistedFilters.tickedGenres ?? []).forEach(g => { if (initialGenresSelected[g] !== undefined) initialGenresSelected[g] = "tick"; });
        (persistedFilters.crossedGenres ?? []).forEach(g => { if (initialGenresSelected[g] !== undefined) initialGenresSelected[g] = "cross"; });

        setTempGenresSelected(initialGenresSelected);

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // run once on mount

    // ---------------------
    // Helpers
    // ---------------------
    const getGenresSelectedFromTemp = () => {
        const ticked: string[] = [];
        const crossed: string[] = [];
        Object.keys(tempGenresSelected).forEach(k => {
            if (tempGenresSelected[k] === "tick") ticked.push(k);
            if (tempGenresSelected[k] === "cross") crossed.push(k);
        });
        return { ticked, crossed };
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Compose new filters from temp values (only now do we persist + notify)
        const { ticked, crossed } = getGenresSelectedFromTemp();
        const newFilters = {
            type: tempType,
            sortBy: tempSortBy,
            sortDir: tempSortDir,
            tickedGenres: ticked,
            crossedGenres: crossed,
            languages: tempLanguages,
            statuses: tempStatuses,
        };

        console.log("HomePageFilter -> APPLY filters:", newFilters);

        // Persist to Zustand once (this is the moment other parts of app should react)
        persistedFilters.setFilters(newFilters);

        // Notify parent — parent should perform the API call here
        handleFilterChange(newFilters);
    };

    const handleReset = () => {
        // Reset persisted store (if you want to clear saved state immediately).
        // If you prefer reset to only happen on Apply, remove this line and just reset temp below.
        persistedFilters.resetFilters();

        // Reset temp UI state to defaults
        setTempType("");
        setTempSortBy("title");
        setTempSortDir("asc");
        setTempLanguages([]);
        setTempStatuses([]);
        setTempGenresSelected(genreOptions.reduce((acc, g) => ({ ...acc, [g]: "blank" as const }), {} as Record<string, "blank" | "tick" | "cross">));

        // Notify parent with defaults immediately (your existing behavior)
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
        if (tempType === "movie") return disabledGenresForMovie;
        if (tempType === "tv") return disabledGenresForSeries;
        return [];
    };

    // UI label map for preview
    const sortingOptionsPreviewLabel = () => {
        const map: Record<string, string> = {
            "title_asc": "Sort By : Title (A → Z)",
            "title_desc": "Sort By : Title (Z → A)",
            "popularity_desc": "Sort By : Popularity (High → Low)",
            "popularity_asc": "Sort By : Popularity (Low → High)",
            "voteAverage_desc": "Sort By : Rating (High → Low)",
            "recent_desc": "Sort By : Recently Added",
            "recent_asc": "Sort By : Earliest Added",
            "date_desc": "Sort By : Release Date (Newest → Oldest)",
            "date_asc": "Sort By : Release Date (Oldest → Newest)",
        };
        return map[`${tempSortBy}_${tempSortDir}`] || "Sort By";
    };

    // When component collapsed, show the collapsed button
    if (!expanded) {
        return (
            <button
                className="btn btn-outline-primary"
                onClick={onExpand}
                style={{ minWidth: 120 }}
                title="Expand filters"
            >
                <i className="bi bi-funnel"></i> Filters
            </button>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="d-flex flex-row align-items-center gap-1 flex-wrap">
            {/* Collapse */}
            <button
                type="button"
                className="btn btn-link p-0 me-2"
                onClick={onCollapse}
                title="Collapse filters"
                style={{ fontSize: "1.2rem" }}
            >
                <i className="bi bi-funnel"></i>
            </button>

            {/* Clear Button */}
            <button
                type="button"
                className="btn btn-outline-danger d-flex align-items-center"
                onClick={handleReset}
                title="Clear all filters"
            >
                <i className="bi bi-arrow-counterclockwise"></i>
            </button>

            {/* Type Dropdown (updates tempType only) */}
            <div className="dropdown position-relative">
                <button
                    className="btn btn-outline-primary dropdown-toggle w-100"
                    type="button"
                    id="typeDropdown"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                    style={{ paddingTop: "0.5rem" }}
                >
                    {tempType === "" ? "Type : Servies" : tempType === "movie" ? "Type : Movies" : "Type : Series"}
                </button>
                <ul className="dropdown-menu dropdown-menu-light" aria-labelledby="typeDropdown">
                    <li><button className="dropdown-item" type="button" onClick={() => setTempType("")}>Servies</button></li>
                    <li><button className="dropdown-item" type="button" onClick={() => setTempType("movie")}>Movies</button></li>
                    <li><button className="dropdown-item" type="button" onClick={() => setTempType("tv")}>Series</button></li>
                </ul>
            </div>

            {/* Combined Sort Dropdown (updates only tempSortBy & tempSortDir) */}
            <div className="dropdown">
                <button
                    className="btn btn-outline-primary dropdown-toggle"
                    type="button"
                    id="sortDropdown"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                >
                    {sortingOptionsPreviewLabel()}
                </button>

                <ul className="dropdown-menu dropdown-menu-light" aria-labelledby="sortDropdown">
                    <li><h6 className="dropdown-header">Title</h6></li>
                    <li><button className="dropdown-item" type="button" onClick={() => { setTempSortBy("title"); setTempSortDir("asc"); }}>A → Z</button></li>
                    <li><button className="dropdown-item" type="button" onClick={() => { setTempSortBy("title"); setTempSortDir("desc"); }}>Z → A</button></li>

                    <li><hr className="dropdown-divider" /></li>
                    <li><h6 className="dropdown-header">Popularity</h6></li>
                    <li><button className="dropdown-item" type="button" onClick={() => { setTempSortBy("popularity"); setTempSortDir("desc"); }}>High → Low</button></li>
                    <li><button className="dropdown-item" type="button" onClick={() => { setTempSortBy("popularity"); setTempSortDir("asc"); }}>Low → High</button></li>

                    <li><hr className="dropdown-divider" /></li>
                    <li><h6 className="dropdown-header">Rating</h6></li>
                    <li><button className="dropdown-item" type="button" onClick={() => { setTempSortBy("voteAverage"); setTempSortDir("desc"); }}>High → Low</button></li>
                    <li><button className="dropdown-item" type="button" onClick={() => { setTempSortBy("voteAverage"); setTempSortDir("asc"); }}>Low → High</button></li>

                    <li><hr className="dropdown-divider" /></li>
                    <li><h6 className="dropdown-header">When Added</h6></li>
                    <li><button className="dropdown-item" type="button" onClick={() => { setTempSortBy("recent"); setTempSortDir("desc"); }}>Newest First</button></li>
                    <li><button className="dropdown-item" type="button" onClick={() => { setTempSortBy("recent"); setTempSortDir("asc"); }}>Earliest First</button></li>

                    <li><hr className="dropdown-divider" /></li>
                    <li><h6 className="dropdown-header">Release Date</h6></li>
                    <li><button className="dropdown-item" type="button" onClick={() => { setTempSortBy("date"); setTempSortDir("desc"); }}>Newest First</button></li>
                    <li><button className="dropdown-item" type="button" onClick={() => { setTempSortBy("date"); setTempSortDir("asc"); }}>Oldest First</button></li>
                </ul>
            </div>

            {/* Genres (3-state): pass tempSelected and updater */}
            <DropdownMenu3States
                label="Genres"
                options={genreOptions}
                selected={tempGenresSelected}
                setSelected={setTempGenresSelected}
                disabledOptions={getDisabledGenres()}
            />

            {/* Languages - update tempLanguages only */}
            <DropdownMultiselect
                label="Languages"
                options={langOptions}
                selected={tempLanguages}
                setSelected={setTempLanguages}
            />

            {/* Statuses - update tempStatuses only */}
            <DropdownMultiselect
                label="Statuses"
                options={statusOptions}
                selected={tempStatuses}
                setSelected={setTempStatuses}
            />

            {/* Form-level Apply: commit temp => persisted + notify parent */}
            <button type="submit" className="btn btn-primary d-flex align-items-center">
                Apply
            </button>
        </form>
    );
};

export default HomePageFilter;