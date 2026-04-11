import { useNavigate } from 'react-router-dom';
import styles from './EpisodeNavBar.module.css';

interface EpisodeNavBarProps {
	tmdbId: string | number;
	seasonNo: number;
	episodeNo: number;
	totalEpisodes: number;
	episodeName?: string;
}

const EpisodeNavBar = ({
	tmdbId,
	seasonNo,
	episodeNo,
	totalEpisodes,
	episodeName = '',
}: EpisodeNavBarProps) => {
	const navigate = useNavigate();

	const isPrevDisabled = episodeNo <= 1;
	const isNextDisabled = episodeNo >= totalEpisodes;

	const handlePrevClick = () => {
		if (!isPrevDisabled)
			navigate(`/servies/${tmdbId}/season/${seasonNo}/episode/${episodeNo - 1}`);
	};

	const handleNextClick = () => {
		if (!isNextDisabled)
			navigate(`/servies/${tmdbId}/season/${seasonNo}/episode/${episodeNo + 1}`);
	};

	return (
		<div className={styles.navBarContainer}>
			<div className={styles.container}>
				<div className={styles.navContent}>
					{/* Left: Episode Info */}
					<div className={styles.episodeInfo}>
						<span className={styles.episodeLabel}>
							Season {seasonNo}, Episode {episodeNo}
						</span>
						{episodeName && (
							<span className={styles.episodeName}>{episodeName}</span>
						)}
					</div>

					{/* Center: Episode Counter */}
					<div className={styles.episodeCounter}>
						{episodeNo} / {totalEpisodes}
					</div>

					{/* Right: Navigation Buttons */}
					<div className={styles.navButtons}>
						<button
							onClick={handlePrevClick}
							disabled={isPrevDisabled}
							className={`${styles.navButton} ${styles.prevButton}`}
							title="Previous Episode"
							aria-label="Go to previous episode"
						>
							<i className="bi bi-chevron-left"></i>
							<span className={styles.buttonText}>Prev</span>
						</button>

						<button
							onClick={handleNextClick}
							disabled={isNextDisabled}
							className={`${styles.navButton} ${styles.nextButton}`}
							title="Next Episode"
							aria-label="Go to next episode"
						>
							<span className={styles.buttonText}>Next</span>
							<i className="bi bi-chevron-right"></i>
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};

export default EpisodeNavBar;