import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../../../utils/axiosInstance';
import 'bootstrap-icons/font/bootstrap-icons.css';

import styles from "./SearchFilter.module.css";
import stylesAppHeader from "./AppHeader.module.css";
import PortalDropdown from "./PortalDropdown";

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

interface SearchFilterProps {
	handleFilterChange: (filters: SearchFilters) => void;
	expanded: boolean;
	onExpand: () => void;
	onCollapse: () => void;
}

const SearchFilter: React.FC<SearchFilterProps> = ({
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
	const [showTypeDropdown, setShowTypeDropdown] = useState(false);

	const [dropdownPosition, setDropdownPosition] = useState({
		top: 0,
		left: 0,
		width: 0
	});

	const [typeDropdownPosition, setTypeDropdownPosition] = useState({
		top: 0,
		left: 0,
		width: 0
	});

	const lastApiCallTime = useRef<number>(0);
	const cooldownPeriod = 3000;

	const containerRef = useRef<HTMLDivElement>(null);
	const dropdownRef = useRef<HTMLDivElement>(null);
	const typeButtonRef = useRef<HTMLButtonElement>(null);
	const typeDropdownRef = useRef<HTMLDivElement>(null);

	// ✅ FIXED: uses `position: fixed`
	const updateDropdownPosition = () => {
		if (containerRef.current) {
			const rect = containerRef.current.getBoundingClientRect();
			setDropdownPosition({
				top: rect.bottom + 6,
				left: rect.left,
				width: rect.width,
			});
		}
	};

	// ✅ NEW: Type dropdown position updater
	const updateTypeDropdownPosition = () => {
		if (typeButtonRef.current) {
			const rect = typeButtonRef.current.getBoundingClientRect();
			setTypeDropdownPosition({
				top: rect.bottom + 4,
				left: rect.left,
				width: DROPDOWN_WIDTH,
			});
		}
	};

	// 🔍 Debounced search
	useEffect(() => {
		const delay = setTimeout(() => {
			const now = Date.now();
			const timeSinceLastCall = now - lastApiCallTime.current;

			if (query.trim().length >= 3 && timeSinceLastCall >= cooldownPeriod) {
				setIsLoading(true);
				lastApiCallTime.current = now;

				axiosInstance
					.get(`search/servie-debound?type=${encodeURIComponent(type)}&partialSearchQuery=${encodeURIComponent(query)}`)
					.then((res) => {
						setSearchResults(res.data);
						setShowDropdown(true);
						updateDropdownPosition();
					})
					.catch((err) => console.error('Error searching:', err))
					.finally(() => setIsLoading(false));
			} else if (query.trim().length < 3) {
				setSearchResults([]);
				setShowDropdown(false);
			}
		}, 500);

		return () => clearTimeout(delay);
	}, [query, type]);

	// ✅ Event listeners for both dropdowns
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === 'Escape') {
				setShowDropdown(false);
				setShowTypeDropdown(false);
			}
		};

		const handleClickOutside = (e: MouseEvent) => {
			const target = e.target as Node;

			// Check search results dropdown
			if (
				containerRef.current &&
				!containerRef.current.contains(target) &&
				dropdownRef.current &&
				!dropdownRef.current.contains(target)
			) {
				setShowDropdown(false);
			}

			// Check type dropdown
			if (
				typeButtonRef.current &&
				!typeButtonRef.current.contains(target) &&
				typeDropdownRef.current &&
				!typeDropdownRef.current.contains(target)
			) {
				setShowTypeDropdown(false);
			}
		};

		const handleResize = () => {
			if (showDropdown) updateDropdownPosition();
			if (showTypeDropdown) updateTypeDropdownPosition();
		};

		document.addEventListener('keydown', handleKeyDown);
		document.addEventListener('mousedown', handleClickOutside);
		window.addEventListener('resize', handleResize);

		return () => {
			document.removeEventListener('keydown', handleKeyDown);
			document.removeEventListener('mousedown', handleClickOutside);
			window.removeEventListener('resize', handleResize);
		};
	}, [showDropdown, showTypeDropdown]);

	const handleSearchSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		handleFilterChange({ query, type });
		setShowDropdown(false);
	};

	const handleTypeSelect = (selectedType: SearchType) => {
		setType(selectedType);
		setShowTypeDropdown(false);
	};

	const viewportHeight = window.innerHeight;
	const spaceBelow = viewportHeight - dropdownPosition.top;
	const maxHeight = Math.min(400, spaceBelow - 20);

	// Type dropdown max height
	const typeSpaceBelow = viewportHeight - typeDropdownPosition.top;
	const typeMaxHeight = Math.min(200, typeSpaceBelow - 20);

	const SEARCH_TYPES: SearchType[] = ['movie', 'tv', 'servie', 'person', 'collection'];

	// ✅ Fixed width for button and dropdown
	// Button is 196px with box-sizing: border-box (border included)
	// Dropdown needs to be 194px so border adds 2px = 196px total
	const DROPDOWN_WIDTH = 120;

	return (
		<div
			ref={containerRef}
			className={styles.searchContainer}
			style={{ width: expanded ? '300px' : '40px' }}
		>

			{/* Expand Button */}
			{!expanded && (
				<button
					type="button"
					className={`btn ${stylesAppHeader.btnOutlinePrimary} me-2`}
					onClick={onExpand}
				>
					<i className="bi bi-search"></i> Search
				</button>
			)}

			{/* Expanded UI */}
			{expanded && (
				<>
					<form onSubmit={handleSearchSubmit} className={`${styles.form} d-flex align-items-center gap-1`}>

						<button
							type="button"
							className={`btn ${stylesAppHeader.btnOutlinePrimary}`}
							onClick={onCollapse}
						>
							<i className="bi bi-search"></i>
						</button>

						{/* Input */}
						<div className="input-group flex-grow-1">
							<input
								className={`${styles.formControl} form-control`}
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

						{/* ✅ Type Dropdown Button (Portal) */}
						<button
							ref={typeButtonRef}
							type="button"
							className={`btn ${stylesAppHeader.btnOutlinePrimary} ${styles.typeButton} ${showTypeDropdown ? styles.typeButtonOpen : ''}`}
							onClick={() => {
								setShowTypeDropdown(!showTypeDropdown);
								if (!showTypeDropdown) {
									setTimeout(() => updateTypeDropdownPosition(), 0);
								}
							}}
						>
							<span>{type}</span>
							<i className={`bi bi-caret-down-fill ${styles.caretIcon}`}></i>
						</button>
					</form>

					{/* ✅ Type Portal Dropdown */}
					<PortalDropdown
						show={showTypeDropdown}
						position={typeDropdownPosition}
						maxHeight={typeMaxHeight}
						dropdownRef={typeDropdownRef}
					>
						{SEARCH_TYPES.map((searchType) => (
							<button
								key={searchType}
								className={`${styles.typeDropdownItem} ${type === searchType ? styles.typeDropdownItemActive : ''}`}
								onClick={() => handleTypeSelect(searchType)}
							>
								{searchType}
								{type === searchType && <i className="bi bi-check-lg" style={{ marginLeft: '0.5rem' }}></i>}
							</button>
						))}
					</PortalDropdown>

					{/* ✅ Search Results Portal Dropdown */}
					<PortalDropdown
						show={showDropdown && searchResults.length > 0}
						position={dropdownPosition}
						maxHeight={maxHeight}
						dropdownRef={dropdownRef}
					>
						{isLoading && (
							<div className="text-center p-2 small">Searching...</div>
						)}

						{!isLoading &&
							searchResults.map((result) => (
								<Link
									to="/servie"
									state={{ childType: result.childtype, tmdbId: result.tmdbId, }}
									key={result.tmdbId}
									onClick={() => setShowDropdown(false)}
									style={{ textDecoration: "none", color: "inherit" }}
								>
									<div
										className={`d-flex align-items-center ${styles.dropdownRow}`}
										style={{ cursor: "pointer", gap: "10px" }}
									>
										{/* 🎬 Poster */}
										{result.posterPath ? (
											<img
												className={styles.imageBorder}
												src={`http://localhost:8080/track-servie/posterImgs_resize220x330_q0.85${result.posterPath.replace('.jpg', '.webp')}`}
												alt={result.title}
												onError={(e) => {
													e.currentTarget.onerror = null;
													e.currentTarget.src = `https://image.tmdb.org/t/p/original${result.posterPath}`;
												}}
											/>
										) : (
											<div className={styles.posterFallback} />
										)}

										{/* 📝 Text */}
										<div className={styles.textContainer}>
											<div className={styles.title}>{result.title}</div>
											<div className={styles.childType}>{result.childtype}</div>
										</div>
									</div>
								</Link>
							))}
					</PortalDropdown>
				</>
			)}
		</div>
	);
};

export default SearchFilter;