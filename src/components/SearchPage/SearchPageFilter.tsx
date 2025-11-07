import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';
import 'bootstrap-icons/font/bootstrap-icons.css';
import styles from "./SearchPageFilter.module.css";
import stylesAppHeader from "../AppHeader.module.css";

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
      className={styles.searchContainer}
      style={{
        width: expanded ? '300px' : '40px',
      }}
    >
      {/* Search Icon Button to expand */}
      {!expanded && (
        <button
          type="button"
          className={`btn ${stylesAppHeader.btnOutlinePrimary} me-2`}
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
          <form onSubmit={handleSearchSubmit} className={` ${styles.form} d-flex flex-row align-items-center gap-1 `}>

            <button
            type="button"
            className={`btn ${stylesAppHeader.btnOutlinePrimary} d-flex align-items-center`}
            onClick={onCollapse}
            title="Collapse search"
          >
            <i className="bi bi-search"></i>
          </button>

            {/* 🔍 Search Input */}
            <div className="input-group flex-grow-1">
              <input
                className={`${styles.formControl} form-control border-start-0`}
                style={{ boxShadow: 'none' }}
                type="text"
                id="query"
                name="query"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => {
                  if (searchResults.length > 0) setShowDropdown(true);
                }}
                placeholder="Search..."
              />
            </div>

            {/* 🔽 Type Dropdown */}
            <div className="dropdown">
              <button
                className={`btn ${stylesAppHeader.btnOutlinePrimary} dropdown-toggle`}
                type="button"
                id="typeDropdown"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                {{
                  movie: 'Movies',
                  tv: 'Series',
                  servie: 'Servies',
                  person: 'Persons',
                  collection: 'Collections',
                }[type] || 'Select Type'}
              </button>
              <ul className={`dropdown-menu ${stylesAppHeader.dropdownMenu}`} aria-labelledby="typeDropdown">
                <li><button className={stylesAppHeader.dropdownItem} type="button" onClick={() => setType('movie')}>Movies</button></li>
                <li><button className={stylesAppHeader.dropdownItem} type="button" onClick={() => setType('tv')}>Series</button></li>
                <li><button className={stylesAppHeader.dropdownItem} type="button" onClick={() => setType('servie')}>Servies</button></li>
                <li><button className={stylesAppHeader.dropdownItem} type="button" onClick={() => setType('person')}>Persons</button></li>
                <li><button className={stylesAppHeader.dropdownItem} type="button" onClick={() => setType('collection')}>Collections</button></li>
              </ul>
            </div>
          </form>

          {/* 🔽 Animated dropdown */}
          <div
            className={styles.dropdownContainer}
            style={{
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
                    className={`d-flex align-items-center p-2 border-bottom ${styles.hoverBgLight}`}
                    style={{ cursor: 'pointer' }}
                  >
                    {result.posterPath ? (
                      <img
                        className={`rounded ${styles.imageBorder}`}
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

export default SearchPageFilter;