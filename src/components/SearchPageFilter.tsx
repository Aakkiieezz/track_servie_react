import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import axiosInstance from '../utils/axiosInstance';
import 'bootstrap-icons/font/bootstrap-icons.css';
import styles from "./SearchPageFilter.module.css";
import stylesAppHeader from "./AppHeader.module.css";

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
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });

  const lastApiCallTime = useRef<number>(0);
  const cooldownPeriod = 3000;

  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 🎯 Calculate dropdown position
  const updateDropdownPosition = () => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + window.scrollY + 6,
        left: rect.left + window.scrollX,
        width: rect.width,
      });
    }
  };

  // 🕒 Debounced search effect
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      const now = Date.now();
      const timeSinceLastCall = now - lastApiCallTime.current;

      if (query.trim().length >= 3 && timeSinceLastCall >= cooldownPeriod) {
        setIsLoading(true);
        lastApiCallTime.current = now;

        axiosInstance.get(`servies/search-debound?type=${encodeURIComponent(type)}&partialSearchQuery=${encodeURIComponent(query)}`)
          .then((res) => {
            setSearchResults(res.data);
            setShowDropdown(true);
            updateDropdownPosition();
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

  // Exit menu on ESC keypress & outside click
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowDropdown(false);
    };

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      // Check if click is outside both the container AND the dropdown portal
      if (
        containerRef.current &&
        !containerRef.current.contains(target) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(target)
      ) {
        setShowDropdown(false);
      }
    };

    // Throttled scroll handler to prevent excessive updates
    let scrollTimeout: NodeJS.Timeout;
    const handleScroll = () => {
      if (showDropdown) {
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
          updateDropdownPosition();
        }, 50); // Throttle scroll updates
      }
    };

    const handleResize = () => {
      if (showDropdown) updateDropdownPosition();
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('scroll', handleScroll, { passive: true }); // Use passive for better performance
    window.addEventListener('resize', handleResize);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
      clearTimeout(scrollTimeout);
    };
  }, [showDropdown]);

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("SearchPageFilter -> handleFilterChange() triggered");
    handleFilterChange({ query, type });
    setShowDropdown(false);
  };

  // 🌟 Portal Dropdown Component - for suggestions
  const DropdownPortal = () => {
    if (!showDropdown || searchResults.length === 0) return null;

    // Calculate max height to prevent dropdown from going off-screen
    const viewportHeight = window.innerHeight;
    const spaceBelow = viewportHeight - dropdownPosition.top;
    const maxHeight = Math.min(400, spaceBelow - 20); // 20px padding from bottom

    return createPortal(
      <div
        ref={dropdownRef}
        className={styles.dropdownContainer}
        style={{
          position: 'absolute',
          top: `${dropdownPosition.top}px`,
          left: `${dropdownPosition.left}px`,
          width: `${dropdownPosition.width}px`,
          maxHeight: `${maxHeight}px`,
          opacity: showDropdown ? 1 : 0,
          transform: showDropdown ? 'translateY(0)' : 'translateY(-5px)',
          pointerEvents: showDropdown ? 'auto' : 'none',
        }}
        onMouseDown={(e) => {
          e.stopPropagation();
        }}
        onClick={(e) => {
          e.stopPropagation();
        }}
        // onTouchStart={(e) => {}}
        // onTouchMove={(e) => {}}
      >
        <div
          className={styles.dropdownContent}
          onScroll={(e) => {
            e.stopPropagation();
          }}
        >
          {isLoading && (
            <div className="text-center p-2 text-secondary small">
              Searching...
            </div>
          )}

          {!isLoading &&
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
                onClick={() => setShowDropdown(false)}
              >
                <div
                  className={`d-flex align-items-center p-2 ${styles.border} ${styles.hoverBgLight}`}
                  style={{ cursor: 'pointer' }}
                >
                  {result.posterPath ? (
                    <img
                      className={`rounded ${styles.imageBorder}`}
                      src={`http://localhost:8080/track-servie/posterImgs_resize220x330_q0.85${result.posterPath.replace('.jpg', '.webp')}`}
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
                    <div className={styles.childType}>
                      {result.childtype}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
        </div>
      </div>,
      document.body
    );
  };

  return (
    <div
      ref={containerRef}
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
                ref={inputRef}
                className={`${styles.formControl} form-control border-start-0`}
                style={{ boxShadow: 'none' }}
                type="text"
                id="query"
                name="query"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => {
                  if (searchResults.length > 0) {
                    setShowDropdown(true);
                    updateDropdownPosition();
                  }
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

          {/* 🌟 Portal Dropdown */}
          <DropdownPortal />
        </>
      )}
    </div>
  );
};

export default SearchPageFilter;