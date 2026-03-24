import React, { useEffect, useState } from "react";
import axiosInstance from "@/utils/axiosInstance";
import ServieGrid from "@/components/common/ServieGrid/ServieGrid";
import PaginationBar from "@/components/common/PaginationBar/PaginationBar";
import HomePageFilter from "@/components/ProfilePage/TabFilter/Filter";
import { useFilterStore } from "@/store/useFilterStore";
import type { Servie } from "@/types/servie";
import filterStyles from "./Filters.module.css";

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
  watchedCounts: { movie: number; tv: number };
}

const ServiesTab: React.FC<Props> = ({ userId, watchedCounts }) => {

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
      statuses: filters.statuses
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
      statuses: filters.statuses
    };

    fetchServies(currentFilters, newPage);
  };

  return (

    <div>

      <div className={filterStyles.filterBar}>
        <span className={filterStyles.countText}>
          <i className="bi bi-film"></i> {watchedCounts.movie} movies
          <span className={filterStyles.separator}>·</span>
          <i className="bi bi-tv"></i> {watchedCounts.tv} series
        </span>

        <div className={filterStyles.filtersWrapper}>
          <HomePageFilter
            handleFilterChange={handleFilterChange}
          />
        </div>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <ServieGrid servies={servies} />
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