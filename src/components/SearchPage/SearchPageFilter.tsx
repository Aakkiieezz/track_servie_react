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
        <div style={
            {
                ...styles.searchContainer,
                width: isExpanded ? '300px' : '40px', // Adjust width dynamically
            }
        }>

            {/* Search Icon */}
            <i
                className="bi bi-search"
                style={{
                    ...styles.searchIcon,
                    marginRight: isExpanded ? '10px' : '0', // Adjust spacing dynamically
                }}
                onClick={toggleSearchForm}
            ></i>

            {/* Search Form */}
            {isExpanded && (
                <form onSubmit={handleSearchSubmit} style={
                    {
                        ...styles.form,
                        opacity: isExpanded ? 1 : 0, // Hide when collapsed
                        pointerEvents: isExpanded ? 'auto' : 'none', // Prevent interaction when collapsed
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
