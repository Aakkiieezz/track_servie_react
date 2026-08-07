import React, { useEffect, useState } from "react";
import { useFilterStore, type Keyword } from "@/store/useFilterStore";
import DropdownMultiselect from "./DropdownMultiselect";
import GenreMultiselect from "./GenreMultiselect";
import KeywordMultiselect from "./KeywordMultiselect";
import styles from "./Filter.module.css";
import LanguageMultiselect from "./LanguageMultiselect";

interface FilterProps {
    handleFilterChange: (filters: any) => void;
    showCompareFilter?: boolean;
}

const genreOptions = [
    "Action", "Adventure", "Animation", "Comedy", "Crime", "Documentary",
    "Drama", "Family", "Fantasy", "History", "Horror", "Kids", "Music",
    "Mystery", "News", "Politics", "Reality", "Romance", "Science Fiction",
    "Soap", "Talk", "TV Movie", "Thriller", "War", "Western",
];

const disabledGenresForMovie = ["Kids", "News", "Politics", "Reality", "Soap", "Talk"];
const disabledGenresForSeries = ["History", "Horror", "Music", "Romance", "TV Movie", "Thriller"];

const langOptions = [
    { id: "ar", label: "Arabic" },
    { id: "bn", label: "Bengali" },
    { id: "zh", label: "Chinese (Mandarin)" },
    { id: "cn", label: "Chinese (Cantonese)" },
    { id: "cs", label: "Czech" },
    { id: "da", label: "Danish" },
    { id: "nl", label: "Dutch" },
    { id: "en", label: "English" },
    { id: "fi", label: "Finnish" },
    { id: "fr", label: "French" },
    { id: "de", label: "German" },
    { id: "el", label: "Greek" },
    { id: "he", label: "Hebrew" },
    { id: "hi", label: "Hindi" },
    { id: "hu", label: "Hungarian" },
    { id: "id", label: "Indonesian" },
    { id: "it", label: "Italian" },
    { id: "ja", label: "Japanese" },
    { id: "kn", label: "Kannada" },
    { id: "ko", label: "Korean" },
    { id: "ml", label: "Malayalam" },
    { id: "mr", label: "Marathi" },
    { id: "no", label: "Norwegian" },
    { id: "pl", label: "Polish" },
    { id: "pt", label: "Portuguese" },
    { id: "ro", label: "Romanian" },
    { id: "ru", label: "Russian" },
    { id: "es", label: "Spanish" },
    { id: "ta", label: "Tamil" },
    { id: "te", label: "Telugu" },
];

const statusOptions = [
    "Rumored", "Planned", "Pilot", "In Production", "Post Production",
    "Canceled", "Airing", "Released", "Ended",
];

const Filter: React.FC<FilterProps> = ({ handleFilterChange, showCompareFilter = true }) => {

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
    const [tempSelectedKeywords, setTempSelectedKeywords] = useState<Keyword[]>([]);
    const [tempRejectedKeywords, setTempRejectedKeywords] = useState<Keyword[]>([]);
    const [tempCompareMode, setTempCompareMode] = useState<"NONE" | "ONLY_MINE" | "ONLY_THEIRS" | "COMMON">("NONE");

    // selected genres for 3-state control (temp)
    const [tempGenresSelected, setTempGenresSelected] = useState<Record<string, "blank" | "tick" | "cross">>(() =>
        genreOptions.reduce((acc, g) => ({ ...acc, [g]: "blank" as const }), {} as Record<string, "blank" | "tick" | "cross">)
    );

    const [openDropdown, setOpenDropdown] = useState<"type" | "compare" | "sort" | null>(null);
    const isSortActive = tempSortBy !== "title" || tempSortDir !== "asc";

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
        setTempSelectedKeywords(persistedFilters.selectedKeywords ?? []);
        setTempRejectedKeywords(persistedFilters.rejectedKeywords ?? []);
        setTempCompareMode(persistedFilters.compareMode ?? "NONE");

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
            selectedKeywords: tempSelectedKeywords,
            rejectedKeywords: tempRejectedKeywords,
            compareMode: tempCompareMode,
        };

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
        setTempSelectedKeywords([]);
        setTempRejectedKeywords([]);
        setTempGenresSelected(genreOptions.reduce((acc, g) => ({ ...acc, [g]: "blank" as const }), {} as Record<string, "blank" | "tick" | "cross">));
        setTempCompareMode("NONE");

        // Notify parent with defaults immediately (your existing behavior)
        handleFilterChange({
            type: "",
            sortBy: "title",
            sortDir: "asc",
            tickedGenres: [],
            crossedGenres: [],
            languages: [],
            statuses: [],
            selectedKeywords: [],
            rejectedKeywords: [],
            compareMode: "NONE"
        });
    };

    const getDisabledGenres = () => {
        if (tempType === "movie") return disabledGenresForMovie;
        if (tempType === "tv") return disabledGenresForSeries;
        return [];
    };

    // UI label map for sorting
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

    const DEFAULTS = {
        type: "",
        sortBy: "title",
        sortDir: "asc",
    };

    const isTypeActive = tempType !== DEFAULTS.type;

    return (
        <form onSubmit={handleSubmit} className="d-flex flex-row align-items-center flex-wrap" style={{ gap: "0.5rem" }}>

            {/* Type Dropdown (updates tempType only) */}
            <div className={styles.simpleDropdown}>
                <button
                    className={`${styles.customBtn} ${isTypeActive ? styles.activeFilter : ""}`}
                    type="button"
                    onClick={() => setOpenDropdown(openDropdown === "type" ? null : "type")}
                    aria-expanded={openDropdown === "type"}
                >
                    <span>
                        {tempType === ""
                            ? "Type : Servies"
                            : tempType === "movie"
                                ? "Type : Movies"
                                : "Type : Series"}
                    </span>

                    <i className={`bi bi-chevron-down ${openDropdown === "type" ? styles.rotated : ""}`} />
                </button>

                {openDropdown === "type" && (
                    <div className={styles.simpleDropdownMenu}>
                        <button
                            type="button"
                            className={styles.simpleDropdownItem}
                            onClick={() => {
                                setTempType("");
                                setOpenDropdown(null);
                            }}
                        >
                            Servies
                        </button>

                        <button
                            type="button"
                            className={styles.simpleDropdownItem}
                            onClick={() => {
                                setTempType("movie");
                                setOpenDropdown(null);
                            }}
                        >
                            Movies
                        </button>

                        <button
                            type="button"
                            className={styles.simpleDropdownItem}
                            onClick={() => {
                                setTempType("tv");
                                setOpenDropdown(null);
                            }}
                        >
                            Series
                        </button>
                    </div>
                )}
            </div>

            {/* Compare Dropdown */}
            {showCompareFilter && (
                < div className="dropdown position-relative">
                    <button
                        className={`${styles.customBtn} dropdown-toggle ${tempCompareMode !== "NONE" ? styles.activeFilter : ""}`}
                        type="button"
                        id="compareDropdown"
                        data-bs-toggle="dropdown"
                        aria-expanded="false"
                    >
                        {(() => {
                            switch (tempCompareMode) {
                                case "ONLY_MINE":
                                    return "Compare : They've Missed";
                                case "ONLY_THEIRS":
                                    return "Compare : I've Missed";
                                case "COMMON":
                                    return "Compare : Common";
                                default:
                                    return "Compare : None";
                            }
                        })()}
                    </button>
                    <ul className={`dropdown-menu ${styles.dropdownMenu} ${styles.dropdownMenuMatchButton}`} aria-labelledby="compareDropdown">
                        <li><button className={styles.dropdownItem} type="button" onClick={() => setTempCompareMode("NONE")}>None</button></li>
                        <li><button className={styles.dropdownItem} type="button" onClick={() => setTempCompareMode("ONLY_THEIRS")}>I've Missed</button></li>
                        <li><button className={styles.dropdownItem} type="button" onClick={() => setTempCompareMode("ONLY_MINE")}>They've Missed</button></li>
                        <li><button className={styles.dropdownItem} type="button" onClick={() => setTempCompareMode("COMMON")}> Common</button></li>
                    </ul>
                </div>
            )}

            {/* Combined Sort Dropdown (updates only tempSortBy & tempSortDir) */}
            <div className={styles.simpleDropdown}>
                <button
                    className={`${styles.customBtn} ${isSortActive ? styles.activeFilter : ""}`}
                    type="button"
                    onClick={() => setOpenDropdown(openDropdown === "sort" ? null : "sort")}
                    aria-expanded={openDropdown === "sort"}
                >
                    <span>{sortingOptionsPreviewLabel()}</span>

                    <i className={`bi bi-chevron-down ${openDropdown === "sort" ? styles.rotated : ""}`} />
                </button>

                {openDropdown === "sort" && (
                    <div className={`${styles.simpleDropdownMenu} ${styles.sortDropdownMenu}`}>
                        <div className={styles.dropdownHeader}>Title</div>

                        <button
                            type="button"
                            className={styles.simpleDropdownItem}
                            onClick={() => {
                                setTempSortBy("title");
                                setTempSortDir("asc");
                                setOpenDropdown(null);
                            }}
                        >
                            A → Z
                        </button>

                        <button
                            type="button"
                            className={styles.simpleDropdownItem}
                            onClick={() => {
                                setTempSortBy("title");
                                setTempSortDir("desc");
                                setOpenDropdown(null);
                            }}
                        >
                            Z → A
                        </button>

                        <div className={styles.dropdownDivider} />

                        <div className={styles.dropdownHeader}>Popularity</div>

                        <button
                            type="button"
                            className={styles.simpleDropdownItem}
                            onClick={() => {
                                setTempSortBy("popularity");
                                setTempSortDir("desc");
                                setOpenDropdown(null);
                            }}
                        >
                            High → Low
                        </button>

                        <button
                            type="button"
                            className={styles.simpleDropdownItem}
                            onClick={() => {
                                setTempSortBy("popularity");
                                setTempSortDir("asc");
                                setOpenDropdown(null);
                            }}
                        >
                            Low → High
                        </button>

                        <div className={styles.dropdownDivider} />

                        <div className={styles.dropdownHeader}>Rating</div>

                        <button
                            type="button"
                            className={styles.simpleDropdownItem}
                            onClick={() => {
                                setTempSortBy("voteAverage");
                                setTempSortDir("desc");
                                setOpenDropdown(null);
                            }}
                        >
                            High → Low
                        </button>

                        <button
                            type="button"
                            className={styles.simpleDropdownItem}
                            onClick={() => {
                                setTempSortBy("voteAverage");
                                setTempSortDir("asc");
                                setOpenDropdown(null);
                            }}
                        >
                            Low → High
                        </button>

                        <div className={styles.dropdownDivider} />

                        <div className={styles.dropdownHeader}>When Added</div>

                        <button
                            type="button"
                            className={styles.simpleDropdownItem}
                            onClick={() => {
                                setTempSortBy("recent");
                                setTempSortDir("desc");
                                setOpenDropdown(null);
                            }}
                        >
                            Newest First
                        </button>

                        <button
                            type="button"
                            className={styles.simpleDropdownItem}
                            onClick={() => {
                                setTempSortBy("recent");
                                setTempSortDir("asc");
                                setOpenDropdown(null);
                            }}
                        >
                            Earliest First
                        </button>

                        <div className={styles.dropdownDivider} />

                        <div className={styles.dropdownHeader}>Release Date</div>

                        <button
                            type="button"
                            className={styles.simpleDropdownItem}
                            onClick={() => {
                                setTempSortBy("date");
                                setTempSortDir("desc");
                                setOpenDropdown(null);
                            }}
                        >
                            Newest First
                        </button>

                        <button
                            type="button"
                            className={styles.simpleDropdownItem}
                            onClick={() => {
                                setTempSortBy("date");
                                setTempSortDir("asc");
                                setOpenDropdown(null);
                            }}
                        >
                            Oldest First
                        </button>
                    </div>
                )}
            </div>

            {/* Genres (3-state): pass tempSelected and updater */}
            <GenreMultiselect
                label="Genres"
                options={genreOptions}
                selected={tempGenresSelected}
                setSelected={setTempGenresSelected}
                disabledOptions={getDisabledGenres()}
            />

            {/* Keywords (3-state): update tempKeywords only */}
            <KeywordMultiselect
                selectedKeywords={tempSelectedKeywords}
                rejectedKeywords={tempRejectedKeywords}
                onSelectedKeywordsChange={setTempSelectedKeywords}
                onRejectedKeywordsChange={setTempRejectedKeywords}
            />

            {/* Languages - update tempLanguages only */}
            <LanguageMultiselect
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

            <div className="d-flex align-items-center gap-2 ms-2">
                <button
                    type="button"
                    className={`${styles.btnOutlineDanger}`}
                    onClick={handleReset}
                >
                    <i className="bi bi-arrow-counterclockwise"></i>
                </button>

                <button
                    type="submit"
                    className={`${styles.btnPrimary}`}
                >
                    Apply
                </button>
            </div>
        </form >
    );
};

export default Filter;