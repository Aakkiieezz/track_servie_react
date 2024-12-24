import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
import "./MovieCastList.css";

type MovieCast = {
    personId: number;
    name: string;
    character: string;
    profilePath: string;
    gender: number;
};

type MovieCastListProps = {
    profiles?: MovieCast[];
};

const MovieCastList: React.FC<MovieCastListProps> = ({ profiles = [] }) => {
    const navigate = useNavigate();

    const [hoveredProfileId, setHoveredProfileId] = useState<number | null>(null);

    const getProfileImage = (profile: MovieCast) => {
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
        <div className="scroll-container">
            {profiles.map(profile => (
                <div key={profile.personId}
                    className={hoveredProfileId && hoveredProfileId !== profile.personId ? 'blur' : ''}
                    onMouseEnter={() => setHoveredProfileId(profile.personId)}
                    onMouseLeave={() => setHoveredProfileId(null)}
                >
                    <div className="profile-item">
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
                        <p title={profile.name} className={hoveredProfileId === profile.personId ? 'expanded' : ''}>
                            {hoveredProfileId === profile.personId ? profile.name : profile.name.slice(0, 10) + '...'}
                        </p>
                        {/* Character Name */}
                        <p title={profile.character} className={hoveredProfileId === profile.personId ? 'expanded' : ''}>
                            {hoveredProfileId === profile.personId ? profile.character : profile.character.slice(0, 10) + '...'}
                        </p>
                    </div>
                </div>
            ))}
        </div>
    );
};


export default MovieCastList;