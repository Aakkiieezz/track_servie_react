import React from 'react';
import styles from './ProgressBar.module.css'

interface ProgressBarProps {
    episodesWatched: number;
    totalEpisodes: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ episodesWatched, totalEpisodes }) => {
    const progress = (episodesWatched / totalEpisodes) * 100;

    return (
        <div className={styles.progressBar}>
            <div
                className={styles.progress}
                style={{ width: `${progress}%` }}
            >
                {progress > 5 && 
                    <span className={styles.progressText}>
                        {Math.round((episodesWatched / totalEpisodes) * 100)}%
                    </span>
                }
            </div>
        </div>
    );
};

export default ProgressBar;