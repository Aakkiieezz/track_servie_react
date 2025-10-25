import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';
import 'bootstrap-icons/font/bootstrap-icons.css';

type SearchType = 'movie' | 'tv' | 'multi' | 'person' | 'collection';

interface ServieDto3 {
  childtype: string;
  tmdbId: number;
  title: string;
  posterPath: string | null;
}

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
    const [query, setQuery] = useState('');
    const [type, setType] = useState<SearchType>('movie');
    const [searchResults, setSearchResults] = useState<ServieDto3[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    
    // Refs to track the cooldown state
    const lastApiCallTime = useRef<number>(0);
    const cooldownPeriod = 3000; // 3 seconds cooldown

    // 🕒 Debounced search effect for SUGGESTIONS ONLY with cooldown
    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            const now = Date.now();
            const timeSinceLastCall = now - lastApiCallTime.current;
            
            // Only make API call if:
            // 1. Query has at least 3 characters AND
            // 2. Cooldown period has passed (or it's the first call)
            if (query.trim().length >= 3 && timeSinceLastCall >= cooldownPeriod) {
                setIsLoading(true);
                lastApiCallTime.current = now; // Update the last call time
                
                axiosInstance
                    .get(`servies/search-debound?partialSearchTitle=${encodeURIComponent(query)}`)
                    .then((res) => {
                        setSearchResults(res.data);
                    })
                    .catch((err) => console.error('Error searching servies:', err))
                    .finally(() => setIsLoading(false));
            } else if (query.trim().length < 3) {
                // Clear results if query is too short
                setSearchResults([]);
            }
            // If cooldown hasn't passed, do nothing (maintain previous results)
        }, 500);

        return () => clearTimeout(delayDebounce);
    }, [query, type]);

    const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        console.log("SearchPageFilter -> handleFilterChange() triggered");
        handleFilterChange({ query, type });
    };

    return (
        <div style={
            {
                ...styles.searchContainer,
                width: expanded ? '300px' : '40px',
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
                            opacity: expanded ? 1 : 0,
                            pointerEvents: expanded ? 'auto' : 'none',
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

                    {/* Search Results - SUGGESTIONS ONLY */}
                    {query.trim().length > 1 && searchResults.length > 0 && (
                        <div className="mt-2 border rounded bg-white position-absolute shadow-sm" style={{ top: '100%', left: 0, right: 0, zIndex: 10, maxHeight: 300, overflowY: 'auto' }}>
                        
                        {isLoading && (
                            <div className="text-center p-2 text-secondary small">Searching...</div>
                        )}

                        {!isLoading && searchResults.map((result) => (
                            <Link 
                                to='/servie' 
                                state={{ childType: result.childtype, tmdbId: result.tmdbId }}
                                style={{ textDecoration: 'none', color: 'inherit' }}
                                key={result.tmdbId}
                            >
                            <div
                                className="d-flex align-items-center p-2 border-bottom hover-bg-light"
                                style={{ cursor: 'pointer' }}
                            >
                                {result.posterPath ? (
                                <img
                                    className="rounded image-border"
                                    src={`http://localhost:8080/track-servie/posterImgs_resize220x330_q0.85${result.posterPath.replace('.jpg', '.webp')}`}
                                    onError={(e) => {
                                    e.currentTarget.onerror = null;
                                    e.currentTarget.src = `https://www.themoviedb.org/t/p/original${result.posterPath}`;
                                    }}
                                    alt={result.title}
                                    style={{ width: 70, height: 105, objectFit: 'cover', marginRight: 8 }}
                                />
                                ) : (
                                <div
                                    style={{
                                    width: 40,
                                    height: 60,
                                    background: '#eee',
                                    borderRadius: 4,
                                    marginRight: 8,
                                    }}
                                />
                                )}
                                <div>
                                    <div style={{ fontWeight: 500 }}>{result.title}</div>
                                    <div className="text-muted small">{result.childtype}</div>
                                </div>
                            </div>
                            </Link>
                        ))}
                        </div>
                    )}
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
        transition: 'width 0.3s ease-in-out',
    },
    searchIcon: {
        cursor: 'pointer',
        fontSize: '1.5rem',
        color: '#666',
        transition: 'margin-right 0.3s ease-in-out',
    },
    form: {
        display: 'flex',
        alignItems: 'center',
        flexGrow: 1,
        transition: 'opacity 0.3s ease-in-out',
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
        margin: '0 0.5rem',
    },
};

export default SearchPageFilter;