import React, { useEffect, useState } from "react";
import axiosInstance from "@/utils/axiosInstance";
import ServieGrid from "@/components/common/ServieGrid/ServieGrid";
import PaginationBar from "@/components/common/PaginationBar/PaginationBar";
import Filter from "@/components/ProfilePage/TabFilter/Filter";
import { useFilterStore } from "@/store/useFilterStore";
import type { Servie } from "@/types/servie";
import styles from "./Filters.module.css";
import ServieGridSkeleton from "../common/ServieGrid/ServieGridSkeleton";

interface Filters {
	type: string;
	sortBy: string;
	sortDir: "asc" | "desc";
	tickedGenres: string[];
	crossedGenres: string[];
	languages: string[];
	statuses: string[];
	compareMode: "NONE" | "ONLY_MINE" | "ONLY_THEIRS" | "COMMON";
}

interface Pagination {
	pageNumber: number;
	totalPages: number;
}

interface Props {
	userId: number;
	watchedCounts: { movie: number; tv: number };
	isOwnProfile: boolean;
}

const ServiesTab: React.FC<Props> = ({ userId, watchedCounts, isOwnProfile }) => {
	const filters = useFilterStore();
	const [servies, setServies] = useState<Servie[]>([]);
	const [loading, setLoading] = useState(false);
	const [pagination, setPagination] = useState<Pagination>({
		pageNumber: 0,
		totalPages: 0
	});

	const fetchServies = async (currentFilters: Filters, pageNo: number) => {
		try {
			setLoading(true);
			const response = await axiosInstance.post(
				`servies/user/${userId}`,
				{
					type: currentFilters.type,
					languages: currentFilters.languages,
					statuses: currentFilters.statuses,
					selectedGenres: currentFilters.tickedGenres,
					rejectedGenres: currentFilters.crossedGenres,
					sortBy: currentFilters.sortBy,
					sortDir: currentFilters.sortDir,
					compareMode: currentFilters.compareMode,
				},
				{
					params: { pageNo }
				}
			);
			setServies(response.data.servies);
			setPagination({
				pageNumber: response.data.pageNumber,
				totalPages: response.data.totalPages
			});
		} catch (error) {
			console.error("Failed to fetch servies", error);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		const currentFilters = {
			type: filters.type,
			sortBy: filters.sortBy,
			sortDir: filters.sortDir as "asc" | "desc",
			tickedGenres: filters.tickedGenres,
			crossedGenres: filters.crossedGenres,
			languages: filters.languages,
			statuses: filters.statuses,
			compareMode: filters.compareMode,
		};
		fetchServies(currentFilters, 0);
	}, []);

	const handleFilterChange = (newFilters: Filters) => {
		filters.setFilters(newFilters);
		fetchServies(newFilters, 0);
	};

	const handlePageChange = (newPage: number) => {
		const currentFilters = {
			type: filters.type,
			sortBy: filters.sortBy,
			sortDir: filters.sortDir as "asc" | "desc",
			tickedGenres: filters.tickedGenres,
			crossedGenres: filters.crossedGenres,
			languages: filters.languages,
			statuses: filters.statuses,
			compareMode: filters.compareMode,
		};
		fetchServies(currentFilters, newPage);
	};

	return (
		<div>
			<div className={styles.filterBar}>
    
				{/* LEFT */}
				<div className={styles.leftSection}>
					<i className="bi bi-film"></i> {watchedCounts.movie} movies
					<span className={styles.separator}>·</span>
					<i className="bi bi-tv"></i> {watchedCounts.tv} series
				</div>

				{/* CENTER */}
				<div className={styles.centerSection}>
					<Filter 
					handleFilterChange={handleFilterChange}
					showCompareFilter={!isOwnProfile}
					/>
				</div>
			</div>

			{loading ? (
				<ServieGridSkeleton columnsPerRow={12} />
			) : (
				<ServieGrid servies={servies} columnsPerRow={12} />
			)}

			<PaginationBar
				pageNumber={pagination.pageNumber}
				totalPages={pagination.totalPages}
				onPageChange={handlePageChange}
			/>

		</div>
	);
};

export default ServiesTab;