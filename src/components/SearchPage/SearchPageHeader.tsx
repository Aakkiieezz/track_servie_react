import React from 'react';
import SearchPageFilter from './SearchPageFilter';
import ProfilePic from "../ProfilePage/ProfilePic";
import { Link } from 'react-router-dom';

type SearchType = 'movie' | 'tv' | 'multi' | 'person' | 'collection';

interface SearchFilters {
    query: string;
    type: SearchType;
}

interface SearchPageHeaderProps {
    handleSearchFilterChange: (filters: SearchFilters) => void;
}

const SearchPageHeader: React.FC<SearchPageHeaderProps> = ({ handleSearchFilterChange: handleFilterChange }) => {

    // Learning Purpose
    const onFilterChange = (filters: SearchFilters) => {
        console.log("SearchPageHeader -> onFilterChange -> filters : ", filters);
        handleFilterChange(filters);
    };

    return (
        <header className="d-flex justify-content-between align-items-center p-3">

            {/* Logo */}
            <div className="logo">
                <Link to="/">
                    <img src="/src/assets/logo.png" alt="Logo" style={{ width: "200px" }} />
                </Link>
            </div>

            {/* Search Form */}
            <SearchPageFilter handleFilterChange={onFilterChange} />

            {/* Profile Picture */}
            <ProfilePic />
        </header>
    );
};

export default SearchPageHeader;
