import React from 'react';
import styles from './ProgressBar.module.css'

interface ProgressBarProps {
    episodesWatched: number;
    totalEpisodes: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ episodesWatched, totalEpisodes }) => {
    const progress = (episodesWatched / totalEpisodes) * 100;
    const formattedProgress = progress.toFixed(1);

    return (
        <div className={styles.progressBar}>
            <div
                className={styles.progress}
                style={{ width: `${progress}%` }}
            >
                {progress > 10 && <span className={styles.progressText}>{formattedProgress}%</span>}
            </div>
        </div>
    );
};

export default ProgressBar;
