import React, { useState, useEffect } from "react";
import HomePageHeader from "../components/HomePage/HomePageHeader";
import ServieGrid from "../components/HomePage/ServieGrid";
import PaginationBar from "../components/PaginationBar";
import 'bootstrap-icons/font/bootstrap-icons.css';
import axiosInstance from '../utils/axiosInstance';
import { useFilterStore } from '../store/useFilterStore';
import { useSearchParams } from 'react-router-dom';

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

    const [searchParams, setSearchParams] = useSearchParams();

    const [servies, setServies] = useState<Servie[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [pagination, setPagination] = useState<Pagination>({
        pageNumber: 0,
        totalPages: 0,
    });

    // Get page from URL (1-based), convert to 0-based for backend
    // Default to page 1 in URL = page 0 in backend
    const urlPage = parseInt(searchParams.get('pageNo') || '1');
    const currentPage = urlPage - 1; // Convert to 0-based

    const fetchServies = async (currentFilters: Filters, pageNo: number) => {
        try {
            setLoading(true);

            console.log("HomePage -> API Call -> request:", currentFilters, pageNo);

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
                    params: { pageNo },
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
        fetchServies(currentFilters, currentPage);
    }, [currentPage]); // Re-fetch when URL page param changes

    const handleFilterChange = (newFilters: Filters) => {
        console.log("HomePage -> handleFilterChange -> filter:", newFilters);
        
        // Update Zustand store
        filters.setFilters(newFilters);

        // Reset to first page (remove page param from URL)
        setSearchParams({});
        
        // Fetch with new filters
        fetchServies(newFilters, 0);
    };

    const handlePageChange = (newPgNumber: number) => {
        console.log("HomePage -> handlePageChange -> pgNumber:", newPgNumber);
        // setPageNumber(newPgNumber);

        // Convert 0-based backend page to 1-based URL page
        const urlPageNumber = newPgNumber + 1;

        // Only add page param if not first page
        if (newPgNumber === 0)
            setSearchParams({});
        else
            setSearchParams({ pageNo: urlPageNumber.toString() });
        
        // fetchServies will be called by useEffect watching currentPage
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