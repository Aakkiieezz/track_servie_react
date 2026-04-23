import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import SearchFilter from "./SearchFilter";
import ProfilePic from "./ProfilePic/ProfilePic";
import styles from "./AppHeader.module.css";

type SearchType = "movie" | "tv" | "servie" | "person" | "collection";

const AppHeader: React.FC = () => {
  const navigate = useNavigate();
  const [isSearchFilterExpanded, setSearchFilterExpanded] = useState(false);

  const handleExpandSearchFilter = () => {
    setSearchFilterExpanded(true);
  };

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
        <div className={styles.headerSearch}>
          <SearchFilter
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
