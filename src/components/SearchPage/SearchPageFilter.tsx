import React, { useState } from 'react';
import 'bootstrap-icons/font/bootstrap-icons.css';

type SearchType = 'movie' | 'tv' | 'multi' | 'person' | 'collection';

interface SearchFilters {
    query: string;
    type: SearchType;
}

interface SearchPageFilterProps {
    handleFilterChange: (filters: SearchFilters) => void;
    expanded: boolean;
    onExpand: () => void;
    onCollapse: () => void;
}

const SearchPageFilter: React.FC<SearchPageFilterProps> = ({ handleFilterChange, expanded, onExpand, onCollapse }) => {
    // const [isExpanded, setIsExpanded] = useState(false);
    const [query, setQuery] = useState('');
    const [type, setType] = useState<SearchType>('movie');

    const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        console.log("SearchPageFilter -> handleFilterChange() triggered")
        handleFilterChange({ query, type })
    };

    return (
        <div style={
            {
                ...styles.searchContainer,
                width: expanded ? '300px' : '40px', // Adjust width dynamically
            }
        }>

            {/* Search Icon Button to expand */}
            {!expanded && (
                <button
                    type="button"
                    className="btn btn-outline-primary me-2"
                    onClick={onExpand}
                    style={{ minWidth: 120 }}
                    title="Expand search"
                >
                    <i className="bi bi-search"></i> Search
                </button>
            )}

            {/* Search Form */}
            {expanded && (
                <>
                    <button
                        type="button"
                        className="btn btn-link p-0 me-2"
                        onClick={onCollapse}
                        title="Collapse search"
                        style={{ fontSize: "1.2rem" }}
                    >
                        <i className="bi bi-search"></i>
                    </button>

                    <form onSubmit={handleSearchSubmit} style={
                        {
                            ...styles.form,
                            opacity: expanded ? 1 : 0, // Hide when collapsed
                            pointerEvents: expanded ? 'auto' : 'none', // Prevent interaction when collapsed
                        }
                    }>
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
                </>
            )}
        </div>
    );
};

const styles: { [key: string]: React.CSSProperties } = {
    searchContainer: {
        display: 'flex',
        alignItems: 'center',
        position: 'relative',
        transition: 'width 0.3s ease-in-out', // Smooth transition
    },
    searchIcon: {
        cursor: 'pointer',
        fontSize: '1.5rem',
        color: '#666',
        transition: 'margin-right 0.3s ease-in-out', // Smooth transition

    },
    form: {
        display: 'flex',
        alignItems: 'center',
        flexGrow: 1,
        transition: 'opacity 0.3s ease-in-out', // Smooth fade-in effect
    },
    input: {
        flexGrow: 1,
        border: '1px solid #ddd',
        borderRadius: '4px',
        outline: 'none',
        padding: '0.5rem',
        fontSize: '1rem',
    },
    select: {
        border: 'none',
        borderRadius: '4px',
        padding: '0.5rem',
        fontSize: '1rem',
    },
};

export default SearchPageFilter;
