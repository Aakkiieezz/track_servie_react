import React from "react";
import styles from "./StatsTab.module.css";
import GenreBarCharts from "./GenreBarCharts";
import TopCrewChart from "./TopCrewChart";
import LangBarCharts from "./LangBarCharts";

interface Props {
	userId: number;
	onFetchError: (error: string) => void;
}

const ProfileStatsTab: React.FC<Props> = ({ userId, onFetchError }) => {
	return (
		<div className={styles.statsTab}>
			<div className={styles.row}>
				<GenreBarCharts userId={userId} onFetchError={onFetchError} />
			</div>
			<div className={styles.row}>
				<LangBarCharts userId={userId} onFetchError={onFetchError} />
			</div>
			<div className={styles.row}>
				<TopCrewChart
					userId={userId}
					crewType="cast"
					title="Most Watched Cast"
					onFetchError={onFetchError}
				/>
				<TopCrewChart
					userId={userId}
					crewType="director"
					title="Most Watched Directors"
					onFetchError={onFetchError}
				/>
			</div>
		</div>
	);
};

export default ProfileStatsTab;