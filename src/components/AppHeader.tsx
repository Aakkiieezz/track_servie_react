import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import HomePageFilter from "./HomePage/HomePageFilter";
import SearchPageFilter from "./SearchPageFilter";
import ProfilePic from "./ProfilePage/ProfilePic";
import styles from "./AppHeader.module.css";

type SearchType = "movie" | "tv" | "servie" | "person" | "collection";

interface AppHeaderProps {
  showHomeFilter?: boolean;
  handleHomeFilterChange?: (filters: any) => void;
}

const AppHeader: React.FC<AppHeaderProps> = ({
  showHomeFilter = false,
  handleHomeFilterChange,
}) => {
  const navigate = useNavigate();

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

  interface SearchFilters {
    query: string;
    type: SearchType;
  }

  const handleSearchFilterChange = (filters: SearchFilters) => {
    navigate(`/search?query=${filters.query}&type=${filters.type}`);
  };

  return (
    <header className={styles.appHeader}>

      {/* Logo */}
      <div className={styles.logo}>
        <Link to="/">
          <img src="/src/assets/logo.png" alt="Logo" style={{ width: "200px", borderRadius: "6px" }} />
        </Link>
      </div>

      {/* CENTER: HomePageFilter (optional) + SearchPageFilter (always) */}
      <div className={styles.headerCenter}>
        {showHomeFilter && handleHomeFilterChange && (
          <div className={styles.homePageFilter}>
            <HomePageFilter
              handleFilterChange={handleHomeFilterChange}
              expanded={isHomeFilterExpanded}
              onExpand={handleExpandHomeFilter}
              onCollapse={handleCollapseHomeFilter}
            />
          </div>
        )}

        <div className={styles.headerSearch}>
          <SearchPageFilter
            handleFilterChange={handleSearchFilterChange}
            expanded={isSearchFilterExpanded}
            onExpand={handleExpandSearchFilter}
            onCollapse={handleCollapseSearchFilter}
          />
        </div>
      </div>

      {/* Profile Picture */}
      <div className={styles.headerProfile}>
        <ProfilePic />
      </div>
    </header>
  );
};

export default AppHeader;
