import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
import styles from "./CastListSlider.module.css"

type Cast = {
    personId: number;
    name: string;
    character: string;
    profilePath: string;
    gender: number;
    totalEpisodes: number;
};

type CastListSliderProps = {
    profiles?: Cast[];
    childType: "movie" | "tv";
};

const CastListSlider: React.FC<CastListSliderProps> = ({ profiles = [], childType }) => {
    const navigate = useNavigate();

    const [hoveredProfileId, setHoveredProfileId] = useState<number | null>(null);

    const getProfileImage = (profile: Cast) => {
        if (profile.profilePath)
            return `https://www.themoviedb.org/t/p/original${profile.profilePath}`;
        else {
            return profile.gender === 1
                ? '/src/assets/profile_icon_female.png'
                : '/src/assets/profile_icon_male.png';
        }
    };

    function navigateToPersonPage(personId: number): void {
        navigate(`/person/${personId}`);
    }

    return (
        <div className={styles.scrollContainer}>
            {profiles.map(profile => (
                <div key={profile.personId}
                    className={hoveredProfileId && hoveredProfileId !== profile.personId ? styles.blur : ''}
                    onMouseEnter={() => setHoveredProfileId(profile.personId)}
                    onMouseLeave={() => setHoveredProfileId(null)}
                >
                    <div className={styles.profileItem}>
                        <img className="rounded"
                            src={getProfileImage(profile)}
                            alt={profile.name}
                            onError={(e) => {
                                e.currentTarget.src = profile.gender === 1
                                    ? '/src/assets/profile_icon_female.png'
                                    : '/src/assets/profile_icon_male.png';
                            }}
                            onClick={() => navigateToPersonPage(profile.personId)}
                            style={{ cursor: 'pointer' }}
                        />

                        {/* Profile Name */}
                        <p title={profile.name} className={hoveredProfileId === profile.personId ? styles.expanded : ''}>
                            {hoveredProfileId === profile.personId ? profile.name : profile.name.slice(0, 10) + '...'}
                        </p>
                        {/* Character Name */}
                        <p title={profile.character} className={hoveredProfileId === profile.personId ? styles.expanded : ''}>
                            {hoveredProfileId === profile.personId ? `as ${profile.character}` : profile.character.slice(0, 10) + '...'}
                        </p>

                        {/* Episodes */}
                        {childType === "tv" && (
                        <p 
                            title={`${profile.totalEpisodes} eps`} 
                            className={hoveredProfileId === profile.personId ? styles.expanded : ''}
                        >
                            {hoveredProfileId === profile.personId 
                            ? `${profile.totalEpisodes} episodes` 
                            : `${profile.totalEpisodes} eps`}
                        </p>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default CastListSlider;