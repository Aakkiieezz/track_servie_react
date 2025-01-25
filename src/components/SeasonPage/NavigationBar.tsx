import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';

interface SeasonProps {
  tmdbId: string;
  currentSeasonNo: number;
  totalSeasons: number;
  hasSpecials: boolean;
}

const NavigationBar: React.FC<SeasonProps> = ({ tmdbId, currentSeasonNo, totalSeasons, hasSpecials }) => {
  const navigate = useNavigate();
  useParams<{ seasonNo: string; }>();

  const navigateToSeason = (tmdbId: string, seasonNumber: number) => {
    navigate(`servies/${tmdbId}/Season/${seasonNumber}`);
  };

  return (
    <nav className="flex flex-row gap-2 text-gray-600">
      SEASON
      {hasSpecials && (
        <button className={(0 === currentSeasonNo) ? 'font-bold text-black' : 'hover:font-bold hover:text-blue-800'} onClick={() => navigateToSeason(tmdbId, 0)}>Specials</button>
      )}
      {Array.from({ length: totalSeasons }, (_, index) => index + 1).map((seasonNo) => (
        <button
          key={seasonNo}
          className={(seasonNo === currentSeasonNo) ? 'font-bold text-black' : 'hover:font-bold hover:text-blue-800'}
          onClick={() => navigateToSeason(tmdbId, seasonNo)}>
          {seasonNo}
        </button>
      ))}
    </nav>
  );
};

export default NavigationBar;
