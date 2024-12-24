import React from 'react';

interface ProgressBarProps {
    episodesWatched: number;
    totalEpisodes: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ episodesWatched, totalEpisodes }) => {
    const progress = (episodesWatched / totalEpisodes) * 100;
    const formattedProgress = progress.toFixed(1);

    return (
        <div className="progress-bar">
            <div
                className="progress"
                style={{ width: `${progress}%` }}
            >
                {formattedProgress} %
            </div>
        </div>
    );
};

export default ProgressBar;
