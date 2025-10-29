import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';
import 'bootstrap-icons/font/bootstrap-icons.css';

type SearchType = 'movie' | 'tv' | 'servie' | 'person' | 'collection';

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

const SearchPageFilter: React.FC<SearchPageFilterProps> = ({
  handleFilterChange,
  expanded,
  onExpand,
  onCollapse,
}) => {
  const [query, setQuery] = useState('');
  const [type, setType] = useState<SearchType>('movie');
  const [searchResults, setSearchResults] = useState<ServieDto3[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const lastApiCallTime = useRef<number>(0);
  const cooldownPeriod = 3000; // 3 seconds cooldown

  // Refs for outside click detection
  const containerRef = useRef<HTMLDivElement>(null);

  // 🕒 Debounced search effect
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      const now = Date.now();
      const timeSinceLastCall = now - lastApiCallTime.current;

      if (query.trim().length >= 3 && timeSinceLastCall >= cooldownPeriod) {
        setIsLoading(true);
        lastApiCallTime.current = now;

        axiosInstance
          .get(
            `servies/search-debound?type=${encodeURIComponent(
              type
            )}&partialSearchQuery=${encodeURIComponent(query)}`
          )
          .then((res) => {
            setSearchResults(res.data);
            setShowDropdown(true);
          })
          .catch((err) => console.error('Error searching servies:', err))
          .finally(() => setIsLoading(false));
      } else if (query.trim().length < 3) {
        setSearchResults([]);
        setShowDropdown(false);
      }
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [query, type]);

  // 🚀 ESC key and outside click handling
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowDropdown(false);
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setShowDropdown(false);
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("SearchPageFilter -> handleFilterChange() triggered");
    handleFilterChange({ query, type });
    setShowDropdown(false); // hide when submitted
  };

  return (
    <div
      ref={containerRef} // 👈 attach ref for outside click detection
      style={{
        ...styles.searchContainer,
        width: expanded ? '300px' : '40px',
      }}
    >
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
            style={{ fontSize: '1.2rem' }}
          >
            <i className="bi bi-search"></i>
          </button>

          <form
            onSubmit={handleSearchSubmit}
            style={{
              ...styles.form,
              opacity: expanded ? 1 : 0,
              pointerEvents: expanded ? 'auto' : 'none',
            }}
          >
            {/* Search Input */}
            <input
              type="text"
              id="query"
              name="query"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => {
                // 👇 show dropdown again when input focused and we have results
                if (searchResults.length > 0) setShowDropdown(true);
              }}
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
              <option value="tv">Series</option>
              <option value="servie">Servie</option>
              <option value="person">Person</option>
              <option value="collection">Collection</option>
            </select>
          </form>

          {/* 🔽 Animated dropdown */}
          <div
            style={{
              ...styles.dropdownContainer,
              opacity: showDropdown && searchResults.length > 0 ? 1 : 0,
              transform: showDropdown ? 'translateY(0)' : 'translateY(-5px)',
              pointerEvents:
                showDropdown && searchResults.length > 0 ? 'auto' : 'none',
            }}
          >
            {isLoading && (
              <div className="text-center p-2 text-secondary small">
                Searching...
              </div>
            )}

            {!isLoading &&
              showDropdown &&
              query.trim().length >= 1 &&
              searchResults.map((result) => (
                <Link
                  to="/servie"
                  state={{
                    childType: result.childtype,
                    tmdbId: result.tmdbId,
                  }}
                  style={{ textDecoration: 'none', color: 'inherit' }}
                  key={result.tmdbId}
                  onClick={() => setShowDropdown(false)} // 👈 hide on select
                >
                  <div
                    className="d-flex align-items-center p-2 border-bottom hover-bg-light"
                    style={{ cursor: 'pointer' }}
                  >
                    {result.posterPath ? (
                      <img
                        className="rounded image-border"
                        src={`http://localhost:8080/track-servie/posterImgs_resize220x330_q0.85${result.posterPath.replace(
                          '.jpg',
                          '.webp'
                        )}`}
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = `https://www.themoviedb.org/t/p/original${result.posterPath}`;
                        }}
                        alt={result.title}
                        style={{
                          width: 70,
                          height: 105,
                          objectFit: 'cover',
                          marginRight: 8,
                        }}
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
                      <div className="text-muted small">
                        {result.childtype}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
          </div>
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
  dropdownContainer: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    zIndex: 10,
    maxHeight: 300,
    overflowY: 'auto',
    background: 'white',
    borderRadius: 8,
    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
    marginTop: 4,
    transition: 'opacity 0.25s ease, transform 0.25s ease',
  },
};

export default SearchPageFilter;