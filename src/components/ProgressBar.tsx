import React from 'react';
import styles from './ProgressBar.module.css'

interface ProgressBarProps {
    episodesWatched: number;
    totalEpisodes: number | null;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ episodesWatched, totalEpisodes }) => {
    const progress = totalEpisodes && totalEpisodes > 0
        ? Math.min((episodesWatched / totalEpisodes) * 100, 100)
        : 0;
    const roundedProgress = Math.round(progress);

    return (
        <div
            className={styles.progressBar}
            role="progressbar"
            aria-valuenow={roundedProgress}
            aria-valuemin={0}
            aria-valuemax={100}
        >
            <div
                className={styles.progress}
                style={{ width: `${progress}%` }}
            >
                <span className={styles.progressText}>
                    {roundedProgress}%
                </span>
            </div>
        </div>
    );
};

export default ProgressBar;