import React, { useState, useEffect } from "react";
import styles from "./TopCrewChart.module.css";
import axiosInstance from "@/utils/axiosInstance";

interface CastWatchCountDto {
  personId: number;
  name: string;
  profilePath: string;
  filmsCount: number;
}

interface Props {
  userId: number;
  crewType: "cast" | "director";
  title: string;
  onFetchError: (error: string) => void;
}

const TopCrewChart: React.FC<Props> = ({ 
  userId, 
  crewType, 
  title, 
  onFetchError 
}) => {
  const [crewData, setCrewData] = useState<CastWatchCountDto[] | null>(null);
  const [displayCount, setDisplayCount] = useState(16); // Start with 12 (2 rows of 6)
  const [loading, setLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const endpoint = crewType === "cast" 
          ? `stats/${userId}/cast-freq`
          : `stats/${userId}/director-freq`;

        const response = await axiosInstance.get(endpoint);
        setCrewData(response.data);
      } catch (error) {
        onFetchError(`Failed to fetch ${title}`);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [userId, crewType, title, onFetchError]);

  const handleToggle = () => {
    if (isExpanded) {
      // Collapse back to initial 2 rows
      setDisplayCount(12);
      setIsExpanded(false);
    } else {
      // Expand to show all
      setDisplayCount(crewData?.length || 12);
      setIsExpanded(true);
    }
  };

  if (loading) return <p className={styles.loadingText}>Loading {title.toLowerCase()}...</p>;
  if (!crewData || crewData.length === 0) return null;

  const displayedCrew = crewData.slice(0, displayCount);

  return (
    <div className={styles.castSection}>
      <h2 className={styles.sectionTitle}>{title}</h2>
      
      <div className={styles.castGrid}>
        {displayedCrew.map((member) => (
          <div key={member.personId} className={styles.castCard}>
            {member.profilePath ? (
              <img
                src={`https://image.tmdb.org/t/p/original${member.profilePath}`}
                alt={member.name}
                className={styles.profileImage}
              />
            ) : (
              <div className={styles.noImage}>
                <span>No Image</span>
              </div>
            )}
            <div className={styles.castInfo}>
              <h3 className={styles.memberName}>{member.name}</h3>
              <p className={styles.filmCount}>{member.filmsCount} films</p>
            </div>
          </div>
        ))}
      </div>

      {crewData.length > 12 && (
        <div className={styles.buttonContainer}>
          <button onClick={handleToggle} className={styles.toggleButton}>
            {isExpanded ? "Show Less" : "Show More"}
          </button>
        </div>
      )}
    </div>
  );
};

export default TopCrewChart;