import React, { useState, useEffect } from "react";
import HomePageHeader from "../components/HomePage/HomePageHeader";
import ServieGrid from "../components/HomePage/ServieGrid";
import PaginationBar from "../components/PaginationBar";
import 'bootstrap-icons/font/bootstrap-icons.css';
import axiosInstance from '../utils/axiosInstance';
import { useFilterStore } from '../store/useFilterStore';

interface Servie {
    // Servie fields
    tmdbId: number;
    childtype: "movie" | "tv";
    title: string;
    posterPath: string;

    // Movie fields
    releaseDate?: string;

    // Series fields
    totalEpisodes?: number;
    firstAirDate?: string;
    lastAirDate?: string;

    // UserServieData fields
    episodesWatched?: number;
    completed: boolean;
    liked: boolean;
}

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

const HomePage: React.FC = () => {
    // Get filters from Zustand store
    const filters = useFilterStore();

    const [servies, setServies] = useState<Servie[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [, setPageNumber] = useState<number | null>(null);
    const [pagination, setPagination] = useState<Pagination>({
        pageNumber: 0,
        totalPages: 0,
    });

    const fetchServies = async (currentFilters: Filters, pageNumber: number | null = null) => {
        try {
            setLoading(true);

            console.log("HomePage -> API Call -> request:", currentFilters, pageNumber);

            const response = await axiosInstance.post(
                "servies",
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
                    params: {
                        ...(pageNumber !== null && { pageNumber }),
                    },
                }
            );

            console.log("HomePage -> API Call -> response:", response.data);

            setServies(response.data.servies);
            setPagination({
                pageNumber: response.data.pageNumber,
                totalPages: response.data.totalPages,
            });

        } catch (error) {
            console.error("Error fetching servies", error);
        } finally {
            setLoading(false);
        }
    };

    // Fetch on mount with persisted filters
    useEffect(() => {
        const currentFilters = {
            type: filters.type,
            sortBy: filters.sortBy,
            sortDir: filters.sortDir as "asc" | "desc",
            tickedGenres: filters.tickedGenres,
            crossedGenres: filters.crossedGenres,
            languages: filters.languages,
            statuses: filters.statuses,
        };
        
        console.log("HomePage -> useEffect -> fetching with filters:", currentFilters);
        fetchServies(currentFilters, null);
    }, []); // Only run on mount

    const handleFilterChange = (newFilters: Filters) => {
        console.log("HomePage -> handleFilterChange -> filter:", newFilters);
        
        // Update Zustand store
        filters.setFilters(newFilters);
        
        // Fetch with new filters
        fetchServies(newFilters, null);
    };

    const handlePageChange = (newPgNumber: number) => {
        console.log("HomePage -> handlePageChange -> pgNumber:", newPgNumber);
        setPageNumber(newPgNumber);
        
        const currentFilters = {
            type: filters.type,
            sortBy: filters.sortBy,
            sortDir: filters.sortDir as "asc" | "desc",
            tickedGenres: filters.tickedGenres,
            crossedGenres: filters.crossedGenres,
            languages: filters.languages,
            statuses: filters.statuses,
        };
        
        fetchServies(currentFilters, newPgNumber);
    };

    return (
        <div>
            <HomePageHeader handleFilterChange={handleFilterChange} />

            {loading ? <p>Loading...</p> : <ServieGrid servies={servies} />}

            <PaginationBar
                pageNumber={pagination.pageNumber}
                totalPages={pagination.totalPages}
                onPageChange={handlePageChange}
            />
        </div>
    );
};

export default HomePage;