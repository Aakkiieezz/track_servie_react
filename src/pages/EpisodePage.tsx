import { useEffect, useState, useCallback } from 'react';
import axiosInstance from '../utils/axiosInstance';
import { useAlert } from '../contexts/AlertContext';
import CastListSlider from '@/components/common/CastListSlider/CastListSlider';
import HalfStarRating from '@/components/common/HalfStarRating';
import ReviewModal from '@/components/common/ReviewModal/ReviewModal';
import AppHeader from '@/components/common/AppHeader/AppHeader';
import styles from './EpisodePage.module.css';
import type { ReviewData } from '@/types/servie';
import { useRouteParamNumber } from '@/utils/hooks/useRouteParamNumber';
import NavBar from "@/components/common/NavBar/NavBar";

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
	const tmdbId = useRouteParamNumber('tmdbId');
	const seasonNo = useRouteParamNumber("seasonNo", 1);
	const episodeNo = useRouteParamNumber("episodeNo", 1);

	// ✅ ALL useState
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);
	const [episode, setEpisode] = useState<EpisodeDto | null>(null);
	const [episodeWatchState, setEpisodeWatchState] = useState(false);
	const [rating, setRating] = useState<number | null>(null);
	const [liked, setLiked] = useState(false);
	// const [castActiveTab, setCastActiveTab] = useState<"cast" | "guests">("cast");

	const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

	// ✅ Define fetchEpisodeData BEFORE useEffect uses it
	const fetchEpisodeData = useCallback(
		async (tmdbId: number, seasonNo: number, episodeNo: number) => {
			try {
				setLoading(true);
				setError(null);
				const response = await axiosInstance.get<EpisodeDto>(`servies/${tmdbId}/Season/${seasonNo}/Episode/${episodeNo}`);

				setEpisode(response.data);
				setEpisodeWatchState(response.data.watched);
				setRating(response.data.rated);
				setLiked(response.data.liked);
			} catch (err) {
				console.error('Error fetching episode data', err);
				setError('Failed to load episode. Please try again.');
			} finally {
				setLoading(false);
			}
		},
		[episodeNo]
	);

	// ✅ useEffect to fetch data
	useEffect(() => {
		if (tmdbId && seasonNo && episodeNo)
			fetchEpisodeData(tmdbId, seasonNo, episodeNo);
	}, [tmdbId, seasonNo, episodeNo, fetchEpisodeData]);

	const toggleEpisodeWatch = async () => {
		const previousWatchState = episodeWatchState;
		const newWatchState = !previousWatchState;
		// Optimistic update
		setEpisodeWatchState(newWatchState);
		try {
			await axiosInstance.put(`servies/${tmdbId}/Season/${seasonNo}/Episode/${episodeNo}/toggle`);
			setAlert({ type: "success", message: `Episode marked as ${newWatchState ? "watched" : "unwatched"}!` });
		} catch (error) {
			// Roll back on failure
			setEpisodeWatchState(previousWatchState);
			console.error("Failed to update watch status", error);
			setAlert({ type: "danger", message: "Failed to update watch status!", });
		}
	};

	const handleLikeClick = async () => {
		const prev = liked;
		const next = !prev;
		setLiked(next);
		try {
			const res = await axiosInstance.patch(`/servies/${tmdbId}/Season/${seasonNo}/Episode/${episodeNo}/review`,
				{ liked: next }
			);
			if (res.status === 200)
				setAlert({ type: "success", message: `Updated like status of S${seasonNo} Ep${episodeNo}` });
		} catch {
			setLiked(prev);
			setAlert({ type: "danger", message: "Failed to update like status." });
		}
	};

	const handleRatingChange = async (newRating: number | null) => {
		const previousRating = rating ?? null;

		// Optimistic UI update
		setEpisode(prev =>
			prev
				? {
					...prev,
					rated: newRating,
				}
				: prev
		);
		setRating(newRating);

		try {
			await axiosInstance.patch(`/servies/${tmdbId}/Season/${seasonNo}/Episode/${episodeNo}/review`,
				{ rating: newRating }
			);
		} catch (error) {

			// Roll back
			setEpisode(prev =>
				prev
					? {
						...prev,
						rated: previousRating,
					}
					: prev
			);
			setRating(newRating);
			console.error("Failed to update rating", error);
			setAlert({ type: "danger", message: "Failed to update rating!", });
		}
	};

	const handleSaveReview = useCallback(
		async (reviewData: ReviewData) => {
			try {
				const response = await axiosInstance.post(`servies/${tmdbId}/Season/${seasonNo}/Episode/${episodeNo}/notes`,
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
			<div className={styles.pageWrapper}>
				{/* Fixed blurred backdrop */}
				<div className={styles.fullPageBackdrop}>
					<img
						className={styles.backgroundImage}
						src={`https://image.tmdb.org/t/p/original${episode.stillPath}`}
						alt="Backdrop"
					/>
					<div className={styles.backdropOverlay} />
				</div>

				{/* Fixed application header */}
				<AppHeader />

				{/* Everything below the header */}
				<div className={styles.pageContent}>

					<div className={styles.container}>

						{/* Hero */}
						<div className={styles.heroSection}>

							<NavBar
								label="EPISODE"
								tmdbId={tmdbId!}
								seasonNo={seasonNo}
								current={episodeNo}
								total={episode.totalEpisodes}
							/>

							<br />

							<div className={styles.heroLayout}>

								<div className={styles.posterColumn}>
									<div className={styles.posterContainer}>
										<img
											src={`https://image.tmdb.org/t/p/original${episode.stillPath}`}
											alt={episode?.name}
											className={styles.posterImage}
										/>
									</div>
								</div>

								<div className={styles.contentColumn}>

									<div>
										<div className={styles.episodeLabel}>
											Episode {episodeNo}
										</div>

										<h1 className={styles.episodeTitle}>
											{episode?.name}
										</h1>

										<div className={styles.metaRow}>
											{episode?.airDate && (
												<>
													<span>
														{formatDate(episode.airDate)}
													</span>
													<span className={styles.dot}>•</span>
												</>
											)}

											{episode?.runtime && (
												<>
													<span>{episode.runtime} min</span>
													<span className={styles.dot}>•</span>
												</>
											)}

											{episode?.type && (
												<span>{episode.type}</span>
											)}
										</div>
									</div>

									{/* Rating */}
									<div className="glass-panel rating-block">
										<div className="rating-label">
											{episode?.rated ? "Your Rating" : "Rate this"}
										</div>
										<HalfStarRating
											maxStars={5}
											initialRating={episode?.rated}
											onRatingChange={handleRatingChange}
										/>
									</div>

									<div className={styles.actionRow}>

										<button
											onClick={toggleEpisodeWatch}
											className={`btnTranslucent ${episodeWatchState ? "btnSuccess" : ""}`}
										>
											<i className={`bi ${episodeWatchState ? "bi-eye-fill" : "bi-eye-slash-fill"}`} />
											{episodeWatchState ? "Watched" : "Mark as Watched"}
										</button>

										<button
											className={`btnTranslucent btnLike ${liked ? "btnLikeActive" : ""}`}
											onClick={handleLikeClick}
											aria-label={liked ? "Unlike episode" : "Like episode"}
										>
											<i className={`bi ${liked ? "bi-heart-fill" : "bi-heart"}`}></i>
										</button>

										<button
											onClick={() => setIsReviewModalOpen(true)}
											className="btnTranslucent"
										>
											<i className="bi bi-pencil-square"></i> Add Review
										</button>
									</div>

								</div>

							</div>

							<div className={`glass-panel ${styles.detailsPanel}`}>

								<h4>Details</h4>

								<div className={styles.detailsList}>

									<div className={styles.detailRow}>
										<strong>Runtime</strong>
										<span>{episode?.runtime ?? "-"} min</span>
									</div>

									<div className={styles.detailRow}>
										<strong>Air Date</strong>
										<span>{formatDate(episode?.airDate)}</span>
									</div>

									<div className={styles.detailRow}>
										<strong>Season</strong>
										<span>{seasonNo}</span>
									</div>

									<div className={styles.detailRow}>
										<strong>Episode</strong>
										<span>{episodeNo}</span>
									</div>

									<div className={styles.detailRow}>
										<strong>Type</strong>
										<span>{episode?.type ?? "-"}</span>
									</div>

									<div className={styles.detailRow}>
										<strong>TMDB</strong>
										<span>
											⭐ {episode?.voteAverage?.toFixed(1)}
											{" "}
											{/* ({episode?.voteCount?.toLocaleString()}) */}
										</span>
									</div>

									{/* {episode?.productionCode && (
										<div className={styles.detailRow}>
											<strong>Code</strong>
											<span>{episode.productionCode}</span>
										</div>
									)} */}

								</div>

							</div>
						</div>

						{/* Overview */}
						<div className={`glass-panel ${styles.panel} ${styles.overviewSection}`}>

							<h4 className={styles.sectionTitle}>
								Overview
							</h4>

							<p className={styles.overviewText}>
								{episode?.overview || "No overview available."}
							</p>

						</div>

						{/* Cast */}
						<div className={styles.castSection}>

							<div className={`glass-panel ${styles.panel}`}>

								<h4 className={styles.sectionTitle}>
									Cast
								</h4>

								<CastListSlider profiles={episode?.guests} childType='tv' />

							</div>

						</div>

					</div>
				</div>
			</div>

			{/* Review Modal */}
			<ReviewModal
				isOpen={isReviewModalOpen}
				onClose={() => setIsReviewModalOpen(false)}
				onSave={handleSaveReview}
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