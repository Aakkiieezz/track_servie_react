import FavoritesManager from "./FavouritesManager";
import styles from "../../../pages/UserProfilePage.module.css";

interface Props {
	userId: number;
	watchedCounts: { movie: number; tv: number };
	onFetchError: (error: string) => void;
}

const ProfileOverviewTab = ({
	userId,
	watchedCounts,
	onFetchError
}: Props) => {

	return (
		<div className={styles.profileTab}>

			{/* Watched Counts */}
			<div className={styles.userStats}>
				<span className={styles.userStat}>
					<i className="bi bi-film"></i> {watchedCounts.movie} movies
				</span>
				<span className={styles.statsSeparator}>•</span>
				<span className={styles.userStat}>
					<i className="bi bi-tv"></i> {watchedCounts.tv} series
				</span>
			</div>

			{/* Favorites */}
			<h2 className={styles.sectionTitle}>Favorite Servies</h2>
			<FavoritesManager
				userId={userId}
				onFetchError={onFetchError}
				isEditable={false}
			/>
		</div>
	);
};

export default ProfileOverviewTab;