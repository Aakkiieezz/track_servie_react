import React, { useEffect, useMemo, useRef, useState } from "react";
import styles from "./LanguageMultiselect.module.css";
import stylesAppHeader from "./Filter.module.css";

interface KeyValuePair {
    id: string;
    label: string;
}

interface LanguageMultiselectProps {
    label: string;
    options: KeyValuePair[];
    selected: string[];
    setSelected: React.Dispatch<React.SetStateAction<string[]>>;
}

const LanguageMultiselect: React.FC<LanguageMultiselectProps> = ({
    label,
    options,
    selected,
    setSelected,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    const containerRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node))
                setIsOpen(false);
        };

        document.addEventListener("mousedown", handleClickOutside);

        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        if (isOpen)
            searchInputRef.current?.focus();
        else
            setSearchQuery("");
    }, [isOpen]);

    const filteredOptions = useMemo(() => {
        const query = searchQuery.trim().toLowerCase();

        if (!query)
            return options;

        return options.filter((option) => option.label.toLowerCase().includes(query));
    }, [options, searchQuery]);

    const toggleLanguage = (id: string) => {
        setSelected((prevSelected) =>
            prevSelected.includes(id)
                ? prevSelected.filter((item) => item !== id)
                : [...prevSelected, id]
        );
    };

    const removeLanguage = (language: string) => {
        setSelected((prevSelected) => prevSelected.filter((item) => item !== language));
    };

    return (
        <div className={styles.container} ref={containerRef}>
            <button
                className={`${stylesAppHeader.customBtn} ${selected.length > 0 ? stylesAppHeader.activeFilter : ""}`}
                type="button"
                onClick={() => setIsOpen((prev) => !prev)}
                aria-expanded={isOpen}
            >
                <span>{label}</span>

                {selected.length > 0 && (
                    <span className={styles.count}>
                        {selected.length}
                    </span>
                )}

                <i className={`bi bi-chevron-down ${isOpen ? styles.rotated : ""}`} />
            </button>

            {isOpen && (
                <div className={styles.dropdownMenu}>
                    <div className={styles.searchContainer}>
                        <i className="bi bi-search" />

                        <input
                            ref={searchInputRef}
                            type="text"
                            value={searchQuery}
                            onChange={(event) => setSearchQuery(event.target.value)}
                            placeholder="Search languages..."
                        />

                        {searchQuery && (
                            <button
                                type="button"
                                className={styles.clearSearch}
                                onClick={() => setSearchQuery("")}
                                aria-label="Clear search"
                            >
                                <i className="bi bi-x" />
                            </button>
                        )}
                    </div>

                    {selected.length > 0 && (
                        <div className={styles.selectedLanguages}>
                            {selected.map((id) => {
                                const option = options.find((item) => item.id === id);

                                if (!option)
                                    return null;

                                return (
                                    <span
                                        key={id}
                                        className={styles.languagePill}
                                    >
                                        <span>{option.label}</span>

                                        <button
                                            type="button"
                                            onClick={() => removeLanguage(id)}
                                            aria-label={`Remove ${option.label}`}
                                        >
                                            <i className="bi bi-x" />
                                        </button>
                                    </span>
                                );
                            })}
                        </div>
                    )}

                    <div className={styles.languageList}>
                        {filteredOptions.length > 0 ? (
                            filteredOptions.map((option) => {
                                const isSelected = selected.includes(option.id);

                                return (
                                    <button
                                        key={option.id}
                                        type="button"
                                        className={`${styles.languageOption} ${isSelected ? styles.selected : ""}`}
                                        onClick={() => toggleLanguage(option.id)}
                                    >
                                        <span className={styles.checkbox}>
                                            {isSelected && (<i className="bi bi-check" />)}
                                        </span>
                                        <span>{option.label}</span>
                                    </button>
                                );
                            })
                        ) : (
                            <div className={styles.noResults}>
                                No languages found
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default LanguageMultiselect;