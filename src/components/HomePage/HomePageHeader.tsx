import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import HomePageFilter from "./HomePageFilter";
import ProfilePic from "../ProfilePage/ProfilePic";
import SearchPageFilter from '../SearchPage/SearchPageFilter';

type SearchType = 'movie' | 'tv' | 'servie' | 'person' | 'collection';

interface SearchFilters {
    query: string;
    type: SearchType;
}

interface HomePageHeaderProps {
    handleFilterChange: (filters: any) => void;
}

const HomePageHeader: React.FC<HomePageHeaderProps> = ({ handleFilterChange }) => {
    const navigate = useNavigate();

    // Add expand/collapse state
    const [isHomeFilterExpanded, setHomeFilterExpanded] = useState(false);
    const [isSearchFilterExpanded, setSearchFilterExpanded] = useState(false);

    const handleExpandHomeFilter = () => {
        setHomeFilterExpanded(true);
        setSearchFilterExpanded(false);
    };

    const handleExpandSearchFilter = () => {
        setSearchFilterExpanded(true);
        setHomeFilterExpanded(false);
    };

    const handleCollapseHomeFilter = () => setHomeFilterExpanded(false);
    const handleCollapseSearchFilter = () => setSearchFilterExpanded(false);

    const handleSearchFilterChange = (filters: SearchFilters) => {
        navigate(`/search?query=${filters.query}&type=${filters.type}`);
    };

    return (
        <header className="d-flex justify-content-between align-items-center p-3">

            {/* Logo */}
            <div className="logo">
                <img src="/src/assets/logo.png" alt="Logo" style={{ width: "200px" }} />
            </div>

            {/* Filter Component */}
            {/* <HomePageFilter handleFilterChange={onFilterChange} /> */}
            <HomePageFilter
                handleFilterChange={handleFilterChange}
                expanded={isHomeFilterExpanded}
                onExpand={handleExpandHomeFilter}
                onCollapse={handleCollapseHomeFilter}
            />

            {/* Search Form */}
            {/* <SearchPageFilter handleFilterChange={handleSearchFilterChange} /> */}
            <SearchPageFilter
                handleFilterChange={handleSearchFilterChange}
                expanded={isSearchFilterExpanded}
                onExpand={handleExpandSearchFilter}
                onCollapse={handleCollapseSearchFilter}
            />

            {/* Profile Picture */}
            <ProfilePic />
        </header>
    );
};

export default HomePageHeader;
