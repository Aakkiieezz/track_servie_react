import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import styles from './SeasonNavBar.module.css';

interface SeasonProps {
  tmdbId: string;
  currentSeasonNo: number;
  totalSeasons: number;
  hasSpecials: boolean;
}

const SeasonsNavBar: React.FC<SeasonProps> = ({ tmdbId, currentSeasonNo, totalSeasons, hasSpecials }) => {
  const navigate = useNavigate();
  useParams<{ seasonNo: string; }>();

  const navigateToSeason = (tmdbId: string, seasonNumber: number) => {
    navigate(`/servies/${tmdbId}/Season/${seasonNumber}`);
  };

  return (
    <nav className={styles.nav}>
      <span className={styles.label}>SEASON</span>
      {hasSpecials && (
        <span
          role="button"
          tabIndex={0}
          className={ currentSeasonNo === 0 ? styles.active : styles.inactive }
          onClick={() => navigateToSeason(tmdbId, 0)}
          onKeyDown={(e) => e.key === 'Enter' && navigateToSeason(tmdbId, 0)}
        >
          Specials
        </span>
      )}

      {Array.from({ length: totalSeasons }, (_, index) => index + 1).map(
        (seasonNo) => (
          <span
            key={seasonNo}
            role="button"
            tabIndex={0}
            className={ seasonNo === currentSeasonNo ? styles.active : styles.inactive }
            onClick={() => navigateToSeason(tmdbId, seasonNo)}
            onKeyDown={(e) =>
              e.key === 'Enter' && navigateToSeason(tmdbId, seasonNo)
            }
          >
            {seasonNo}
          </span>
        )
      )}
    </nav>
  );
};

export default SeasonsNavBar;