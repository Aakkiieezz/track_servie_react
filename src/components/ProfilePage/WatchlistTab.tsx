import React, { useCallback, useEffect, useState } from "react";
import axiosInstance from "@/utils/axiosInstance";
import ServieGrid from "@/components/common/ServieGrid/ServieGrid";
import PaginationBar from "@/components/common/PaginationBar/PaginationBar";
import Filter from "@/components/ProfilePage/TabFilter/Filter";
import { useWatchlistFilterStore } from "@/store/useWatchlistFilterStore";
import type { Servie } from "@/types/servie";
import { WatchlistTabContext } from "@/contexts/WatchlistTabContext";
import styles from "./Filters.module.css";

interface Filters {
	type: string;
	sortBy: string;
	sortDir: "asc" | "desc";
	tickedGenres: string[];
	crossedGenres: string[];
	languages: string[];
	statuses: string[];
}

interface Pagination {
	pageNumber: number;
	totalPages: number;
}

interface Props {
	userId: number;
}

const ProfileWatchlistTab: React.FC<Props> = ({ userId }) => {
	const watchlistFilters = useWatchlistFilterStore();
	const [servies, setServies] = useState<Servie[]>([]);
	const [loading, setLoading] = useState<boolean>(false);
	const [fadedKeys, setFadedKeys] = useState<Set<string>>(new Set());

	const [pagination, setPagination] = useState<Pagination>({
		pageNumber: 0,
		totalPages: 0,
	});

	const fetchServies = async (currentFilters: Filters, pageNumber: number = 0) => {
		try {
			setLoading(true);
			const response = await axiosInstance.post(
				`list/${userId}/watchlist`,
				{
					type: currentFilters.type,
					languages: currentFilters.languages,
					statuses: currentFilters.statuses,
					selectedGenres: currentFilters.tickedGenres,
					rejectedGenres: currentFilters.crossedGenres,
					sortBy: currentFilters.sortBy,
					sortDir: currentFilters.sortDir,
				},
				{
					params: { pageNumber }
				}
			);
			setServies(response.data.servies);
			setPagination({
				pageNumber: response.data.pageNumber,
				totalPages: response.data.totalPages,
			});
		} catch (error) {
			console.error("Error fetching watchlist", error);
		} finally {
			setLoading(false);
		}
	};

	// Initialize with persisted filters on mount
	useEffect(() => {
		const currentFilters = {
			type: watchlistFilters.type,
			sortBy: watchlistFilters.sortBy,
			sortDir: watchlistFilters.sortDir as "asc" | "desc",
			tickedGenres: watchlistFilters.tickedGenres,
			crossedGenres: watchlistFilters.crossedGenres,
			languages: watchlistFilters.languages,
			statuses: watchlistFilters.statuses,
		};
		fetchServies(currentFilters, 0);
	}, []);

	const handleFilterChange = (newFilters: Filters) => {
		watchlistFilters.setFilters(newFilters);
		fetchServies(newFilters, 0);
	};

	const handlePageChange = (newPgNumber: number) => {
		// Clear faded keys on page change — fresh page, fresh state
		setFadedKeys(new Set());

		const currentFilters = {
			type: watchlistFilters.type,
			sortBy: watchlistFilters.sortBy,
			sortDir: watchlistFilters.sortDir as "asc" | "desc",
			tickedGenres: watchlistFilters.tickedGenres,
			crossedGenres: watchlistFilters.crossedGenres,
			languages: watchlistFilters.languages,
			statuses: watchlistFilters.statuses,
		};
		fetchServies(currentFilters, newPgNumber);
	};

	const handleServieRemoved = useCallback((servie: Servie) => {
		const key = `${servie.childtype}-${servie.tmdbId}`;
		setFadedKeys((prev) => new Set(prev).add(key));
	}, []);

	const handleServieRollback = useCallback((servie: Servie) => {
		const key = `${servie.childtype}-${servie.tmdbId}`;
		setFadedKeys((prev) => {
			const next = new Set(prev);
			next.delete(key);
			return next;
		});
	}, []);

	return (
		<WatchlistTabContext.Provider value={{
			onServieRemoved: handleServieRemoved,
			onServieRollback: handleServieRollback,
		}}>
			<div>
				{/* Filter Bar - Same styling as ServiesTab */}
				<div className={styles.filterBar}>
    
					{/* LEFT */}
					<div className={styles.leftSection}>
						<i className="bi bi-film"></i> 0 movies
						<span className={styles.separator}>·</span>
						<i className="bi bi-tv"></i> 0 series
					</div>

					{/* CENTER */}
					<div className={styles.centerSection}>
						<Filter handleFilterChange={handleFilterChange} />
					</div>
				</div>

				{loading ? (
					<p>Loading...</p>
				) : (
					<ServieGrid servies={servies} columnsPerRow={12} fadedKeys={fadedKeys} />
				)}

				<PaginationBar
					pageNumber={pagination.pageNumber}
					totalPages={pagination.totalPages}
					onPageChange={handlePageChange}
				/>
			</div>
		</WatchlistTabContext.Provider>
	);
};

export default ProfileWatchlistTab;