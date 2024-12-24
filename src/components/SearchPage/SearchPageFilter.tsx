import React, { useState } from 'react';
import 'bootstrap-icons/font/bootstrap-icons.css';

type SearchType = 'movie' | 'tv' | 'multi' | 'person' | 'collection';

interface SearchFilters {
    query: string;
    type: SearchType;
}

interface SearchPageFilterProps {
    handleFilterChange: (filters: SearchFilters) => void;
}

const SearchPageFilter: React.FC<SearchPageFilterProps> = ({ handleFilterChange }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [query, setQuery] = useState('');
    const [type, setType] = useState<SearchType>('movie');

    const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        console.log("SearchPageFilter -> handleFilterChange() triggered")
        handleFilterChange({ query, type })
    };

    const toggleSearchForm = () => {
        setIsExpanded(!isExpanded);
    };

    return (
        <div style={styles.searchContainer}>
            {/* Search Icon */}
            <i
                className="bi bi-search"
                style={styles.searchIcon}
                onClick={toggleSearchForm}
            ></i>

            {/* Search Form */}
            {isExpanded && (
                <form onSubmit={handleSearchSubmit} style={styles.form}>
                    {/* Search Input */}
                    <input
                        type="text"
                        id="query"
                        name="query"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search..."
                        style={styles.input}
                    />

                    {/* Dropdown */}
                    <select
                        id="type"
                        name="type"
                        value={type}
                        onChange={(e) => setType(e.target.value as SearchType)}
                        style={styles.select}
                    >
                        <option value="movie">Movie</option>
                        <option value="tv">TV</option>
                        <option value="multi">TV & Movie</option>
                        <option value="person">Person</option>
                        <option value="collection">Collection</option>
                    </select>
                </form>
            )}
        </div>
    );
};

const styles: { [key: string]: React.CSSProperties } = {
    searchContainer: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
    },
    searchIcon: {
        cursor: 'pointer',
        fontSize: '1.5rem',
        color: '#666',
    },
    form: {
        display: 'flex',
        alignItems: 'center',
        width: '250px',
    },
    input: {
        flexGrow: 1,
        border: 'none',
        outline: 'none',
        padding: '0.5rem',
        fontSize: '1rem',
    },
    select: {
        border: 'none',
        padding: '0.5rem',
        fontSize: '1rem',
    },
};

export default SearchPageFilter;
