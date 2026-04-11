import React, { useState } from "react";
import SeasonCard, { Season } from "@/components/common/PosterCard/SeasonCard";
import seasonStyles from "./SeasonsList.module.css";

interface SeasonsListProps {
	seasons?: Season[];
	tmdbId: string;
	onEpWatchCountChange: (data: {
		totalWatchedEp: number;
		totalWatchedRuntime: number;
	}) => void;
}

const SeasonsList: React.FC<SeasonsListProps> = ({
	seasons = [],
	tmdbId,
	onEpWatchCountChange,
}) => {
	// SeasonsList owns the aggregated per-season counts so it can
	// compute totals and push them up to the series page.
	const [epCounts, setEpCounts] = useState<Record<number, number>>(
		seasons.reduce((acc, s) => { acc[s.seasonNo] = s.episodesWatched; return acc; }, {} as Record<number, number>)
	);

	const [runtimes, setRuntimes] = useState<Record<number, number>>(
		seasons.reduce((acc, s) => { acc[s.seasonNo] = s.totalWatchedRuntime; return acc; }, {} as Record<number, number>)
	);

	const handleWatchChange = ({
		seasonNo,
		newEpCount,
		newRuntime,
	}: {
		seasonNo: number;
		newWatched: boolean;
		newEpCount: number;
		newRuntime: number;
	}) => {
		const updatedEp = { ...epCounts, [seasonNo]: newEpCount };
		const updatedRuntime = { ...runtimes, [seasonNo]: newRuntime };

		setEpCounts(updatedEp);
		setRuntimes(updatedRuntime);

		// Exclude season 0 (specials) from totals — matches original behaviour
		const totalWatchedEp = Object.entries(updatedEp)
			.filter(([k]) => Number(k) !== 0)
			.reduce((sum, [, v]) => sum + v, 0);

		const totalWatchedRuntime = Object.entries(updatedRuntime)
			.filter(([k]) => Number(k) !== 0)
			.reduce((sum, [, v]) => sum + v, 0);

		onEpWatchCountChange({ totalWatchedEp, totalWatchedRuntime });
	};

	return (
		<div className="row left">
			{seasons.map((season) => (
				<div
					key={season.seasonNo}
					className="col-xxl-2 col-sm-3 col-4"
					style={{ padding: "0.2%" }}
				>
					<SeasonCard
						season={{
							...season,
							// Pass live counts from SeasonsList state so reverting
							// on API failure propagates correctly back into the card
							episodesWatched: epCounts[season.seasonNo],
							totalWatchedRuntime: runtimes[season.seasonNo],
						}}
						tmdbId={tmdbId}
						onWatchChange={handleWatchChange}
					/>

					{/* Static label — SeasonsList owns this, intentionally outside PosterCard */}
					<div className={seasonStyles.seasonLabel}>
						<strong>{season.name}</strong>
					</div>
				</div>
			))}
		</div>
	);
};

export default SeasonsList;