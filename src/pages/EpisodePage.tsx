import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import axiosInstance from '../utils/axiosInstance';
import { useAlert } from '../contexts/AlertContext';
import CastListSlider from '@/components/common/CastListSlider/CastListSlider';
import HalfStarRating from '@/components/common/HalfStarRating';
import MovieReviewModal from '@/components/common/MovieReviewModal/Modal';
import AppHeader from '@/components/common/AppHeader/AppHeader';
import EpisodeNavBar from '@/components/EpisodePage/EpisodeNavBar';
import styles from './EpisodePage.module.css';
import type { ReviewData } from '@/types/servie';

interface CastDto {
	personId: number;
	name: string;
	character: string;
	profilePath: string;
	gender: number;
	totalEpisodes: number;
}

interface EpisodeDto {
	// Episode data
	id: string;
	name: string;
	runtime: number;
	overview: string;
	stillPath: string | null;
	airDate: string;
	type: string;
	voteAverage: number;
	cast: CastDto[];
	guests: CastDto[];
	lastModified: string;
	totalEpisodes: number;

	// User data
	watched: boolean;
	liked: boolean;
	rated: number | null;
	notes: string | null;
}

const EpisodePage = () => {
	const { setAlert } = useAlert();
	const { tmdbId, seasonNo, episodeNo } = useParams<{
		tmdbId: string;
		seasonNo: string;
		episodeNo: string;
	}>();

	// ✅ ALL useState
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);
	const [episode, setEpisode] = useState<EpisodeDto | null>(null);
	const [episodeWatchState, setEpisodeWatchState] = useState(false);
	const [episodeRating, setEpisodeRating] = useState<number | null>(null);
	const [episodeLiked, setEpisodeLiked] = useState(false);
	const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

	// ✅ ALL useRef hooks
	const pendingWatchRef = useRef<boolean | null>(null);
	const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const DEBOUNCE_DELAY = 3000; // 3 seconds

	const rollbackRef = useRef<{
		episodeWatchState: boolean;
	} | null>(null);

	const currentSeasonNo = parseInt(seasonNo || '1', 10);
	const currentEpisodeNo = parseInt(episodeNo || '1', 10);

	// ✅ Define fetchEpisodeData BEFORE useEffect uses it
	const fetchEpisodeData = useCallback(
		async (tmdbId: string, seasonNo: string, episodeNo: string) => {
			try {
				setLoading(true);
				setError(null);
				const response = await axiosInstance.get<EpisodeDto>(
					`servies/${tmdbId}/Season/${seasonNo}/Episode/${episodeNo}`
				);

				setEpisode(response.data);
				setEpisodeWatchState(response.data.watched);
				setEpisodeRating(response.data.rated);
				setEpisodeLiked(response.data.liked);
			} catch (err) {
				console.error('Error fetching episode data', err);
				setError('Failed to load episode. Please try again.');
			} finally {
				setLoading(false);
			}
		},
		[currentEpisodeNo]
	);

	// ✅ useEffect to fetch data
	useEffect(() => {
		if (tmdbId && seasonNo && episodeNo)
			fetchEpisodeData(tmdbId, seasonNo, episodeNo);
	}, [tmdbId, seasonNo, episodeNo, fetchEpisodeData]);

	// ✅ useCallback hooks
	const flushPendingWatch = useCallback(async () => {
		if (pendingWatchRef.current === null) {
			console.log('No pending watch changes');
			rollbackRef.current = null;
			return;
		}

		const newWatchState = pendingWatchRef.current;
		console.log('Flushing watch status:', newWatchState);

		try {
			const response = await axiosInstance.post(
				`servies/${tmdbId}/Season/${seasonNo}/Episode/${episodeNo}/toggle-watch`,
				{ watched: newWatchState }
			);

			if (response.status === 200) {
				setAlert({
					type: 'success',
					message: newWatchState
						? 'Episode marked as watched!'
						: 'Episode marked as unwatched!',
				});
				rollbackRef.current = null;
			}

			pendingWatchRef.current = null;
		} catch (error) {
			console.error('Failed to update watch status', error);

			// Rollback to previous state
			if (rollbackRef.current) {
				console.log('Rolling back watch state');
				setEpisodeWatchState(rollbackRef.current.episodeWatchState);
				rollbackRef.current = null;
			}
			setAlert({ type: 'danger', message: 'Failed to update watch status!' });
			pendingWatchRef.current = null;
		}
	}, [tmdbId, seasonNo, episodeNo, setAlert]);

	const toggleEpisodeWatch = useCallback(() => {
		// Capture rollback state before making changes
		if (rollbackRef.current === null)
			rollbackRef.current = { episodeWatchState };

		const newState = !episodeWatchState;
		setEpisodeWatchState(newState);
		pendingWatchRef.current = newState;

		// Clear existing timer
		if (debounceTimerRef.current)
			clearTimeout(debounceTimerRef.current);

		// Set new timer
		debounceTimerRef.current = setTimeout(() => {
			flushPendingWatch();
		}, DEBOUNCE_DELAY);
	}, [episodeWatchState, flushPendingWatch]);

	const toggleEpisodeLike = useCallback(async () => {
		try {
			const newLikeState = !episodeLiked;
			setEpisodeLiked(newLikeState);

			const response = await axiosInstance.post(
				`servies/${tmdbId}/Season/${seasonNo}/Episode/${episodeNo}/like`,
				{ liked: newLikeState }
			);

			if (response.status === 200)
				setAlert({
					type: 'success',
					message: newLikeState
						? 'Episode added to favorites!'
						: 'Removed from favorites!'
				});
				
		} catch (error) {
			console.error('Failed to toggle like', error);
			setEpisodeLiked(!episodeLiked); // Rollback
			setAlert({ type: 'danger', message: 'Failed to update favorite status!' });
		}
	}, [episodeLiked, tmdbId, seasonNo, episodeNo, setAlert]);

	const saveRating = useCallback(
		async (rating: number) => {
			try {
				setEpisodeRating(rating);

				const response = await axiosInstance.post(
					`servies/${tmdbId}/Season/${seasonNo}/Episode/${episodeNo}/rate`,
					{ rated: rating }
				);

				if (response.status === 200)
					setAlert({ type: 'success', message: 'Rating saved!' });
			} catch (error) {
				console.error('Failed to save rating', error);
				setAlert({ type: 'danger', message: 'Failed to save rating!' });
			}
		},
		[tmdbId, seasonNo, episodeNo, setAlert]
	);

	const handleSaveReview = useCallback(
		async (reviewData: ReviewData) => {
			try {
				const response = await axiosInstance.post(
					`servies/${tmdbId}/Season/${seasonNo}/Episode/${episodeNo}/notes`,
					{ notes: reviewData.review }
				);

				if (response.status === 200) {
					setAlert({ type: 'success', message: 'Review saved successfully!' });
					setIsReviewModalOpen(false);
				}
			} catch (error) {
				console.error('Failed to save review', error);
				setAlert({ type: 'danger', message: 'Failed to save review!' });
			}
		},
		[tmdbId, seasonNo, episodeNo, setAlert]
	);

	const formatRuntime = (minutes: number): string => {
		if (minutes < 60) return `${minutes}m`;
		const hours = Math.floor(minutes / 60);
		const mins = minutes % 60;
		return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
	};

	const formatDate = (dateString: string): string => {
		try {
			return new Date(dateString).toLocaleDateString('en-US', {
				month: 'short',
				day: 'numeric',
				year: 'numeric',
			});
		} catch {
			return dateString;
		}
	};

	// Cleanup on unmount
	useEffect(() => {
		return () => {
			if (debounceTimerRef.current)
				clearTimeout(debounceTimerRef.current);
		};
	}, []);

	if (loading)
		return (
			<>
				<AppHeader />
				<div className={styles.pageContainer}>
					<div className={styles.container}>
						<div className={styles.loadingState}>Loading episode details...</div>
					</div>
				</div>
			</>
		);

	if (error || !episode)
		return (
			<>
				<AppHeader />
				<div className={styles.pageContainer}>
					<div className={styles.container}>
						<div className={styles.errorState}>
							{error || 'Episode not found'}
							<button
								onClick={() => fetchEpisodeData(tmdbId!, seasonNo!, episodeNo!)}
								className={styles.retryButton}
							>
								Try Again
							</button>
						</div>
					</div>
				</div>
			</>
		);

	return (
		<>
			<AppHeader />
			<EpisodeNavBar
				tmdbId={tmdbId!}
				seasonNo={currentSeasonNo}
				episodeNo={currentEpisodeNo}
				totalEpisodes={episode.totalEpisodes}
				episodeName={episode.name}
			/>

			<div className={styles.pageContainer}>
				<div className={styles.container}>
					{/* Hero Section */}
					<div className={styles.heroSection}>
						{/* Still Image */}
						<div className={styles.stillContainer}>
							<div className={styles.stillImageWrapper}>
								<img
									src={
										episode.stillPath
											? `https://image.tmdb.org/t/p/original${episode.stillPath}`
											: `https://placehold.co/356x200?text=Ep.+${currentEpisodeNo}`
									}
									alt={`Episode ${currentEpisodeNo}`}
									className={styles.stillImage}
								/>
								{episodeWatchState && (
									<div className={styles.watchedBadge}>
										<i className="bi bi-check-lg"></i>
									</div>
								)}
							</div>
						</div>

						{/* Episode Info */}
						<div className={styles.infoSection}>
							<div className={styles.episodeLabel}>
								Episode {currentEpisodeNo}
							</div>
							<h1 className={styles.episodeTitle}>{episode.name}</h1>

							<div className={styles.metaInfo}>
								{episode.airDate && (
									<span className={styles.metaItem}>
										{formatDate(episode.airDate)}
									</span>
								)}
								{episode.runtime && (
									<>
										<span className={styles.metaSeparator}>•</span>
										<span className={styles.metaItem}>
											{formatRuntime(episode.runtime)}
										</span>
									</>
								)}
								{episode.type && (
									<>
										<span className={styles.metaSeparator}>•</span>
										<span className={styles.metaItem}>{episode.type}</span>
									</>
								)}
							</div>

							{episode.voteAverage > 0 && (
								<div className={styles.ratingDisplay}>
									<span className={styles.ratingLabel}>TMDB Rating:</span>
									<span className={styles.ratingValue}>
										{episode.voteAverage.toFixed(1)}/10
									</span>
								</div>
							)}
						</div>
					</div>

					{/* Stats & Actions Bar */}
					<div className={styles.statsBar}>
						<button
							onClick={toggleEpisodeWatch}
							className={`${styles.actionButton} ${episodeWatchState ? styles.watched : styles.unwatched
								}`}
							title={episodeWatchState ? 'Mark as unwatched' : 'Mark as watched'}
						>
							<i
								className={`bi ${episodeWatchState ? 'bi-eye-fill' : 'bi-eye-slash-fill'
									}`}
							></i>
							{episodeWatchState ? 'Watched' : 'Mark Watched'}
						</button>

						<button
							onClick={toggleEpisodeLike}
							className={`${styles.actionButton} ${episodeLiked ? styles.liked : ''
								}`}
							title={episodeLiked ? 'Remove from favorites' : 'Add to favorites'}
						>
							<i
								className={`bi ${episodeLiked ? 'bi-heart-fill' : 'bi-heart'
									}`}
							></i>
							{episodeLiked ? 'Favorited' : 'Favorite'}
						</button>

						<div className={styles.ratingSection}>
							<span className={styles.ratingLabel}>Your Rating:</span>
							<HalfStarRating
								initialRating={episodeRating || 0}
								onRatingChange={saveRating}
							/>
						</div>

						<button
							onClick={() => setIsReviewModalOpen(true)}
							className={styles.actionButton}
							title="Write or edit your review"
						>
							<i className="bi bi-pencil-square"></i>
							Review
						</button>
					</div>

					{/* Overview Section */}
					{episode.overview && (
						<div className={styles.overviewSection}>
							<h3 className={styles.sectionTitle}>Overview</h3>
							<p className={styles.overviewText}>{episode.overview}</p>
							{episode.lastModified && (
								<p className={styles.lastModified}>
									Last updated: {formatDate(episode.lastModified)}
								</p>
							)}
						</div>
					)}

					{/* Cast Section - Guest Stars Only */}
					{episode.guests && episode.guests.length > 0 && (
						<div className={styles.castSection}>
							<h2 className={styles.sectionTitle}>Guest Stars</h2>
							<CastListSlider profiles={episode.guests} childType="tv" />
						</div>
					)}
				</div>
			</div>

			{/* Review Modal */}
			<MovieReviewModal
				isOpen={isReviewModalOpen}
				onClose={() => setIsReviewModalOpen(false)}
				onSave={handleSaveReview}
				tmdbId={parseInt(tmdbId!)}
				childType="tv"
				title={episode.name}
				year={new Date(episode.airDate).getFullYear().toString()}
				posterPath={
					episode.stillPath
						? `https://image.tmdb.org/t/p/w500${episode.stillPath}`
						: ''
				}
			/>
		</>
	);
};

export default EpisodePage;