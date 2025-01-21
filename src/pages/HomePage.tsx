import React, { useState, useEffect } from "react";
import HomePageHeader from "../components/HomePage/HomePageHeader";
import ServieGrid from "../components/HomePage/ServieGrid";
import PaginationBar from "../components/PaginationBar";
import 'bootstrap-icons/font/bootstrap-icons.css';
import axios from "axios";

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
    tickedGenres2: string[];
    crossedGenres2: string[];
    languages: string[];
    statuses: string[];
    startYear: string;
    endYear: string;
    watched: string;
}

interface Pagination {
    pageNumber: number;
    totalPages: number;
}

const HomePage: React.FC = () => {

    const [servies, setServies] = useState<Servie[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    const defaultFilters = {
        type: "",
        sortBy: "title",
        sortDir: "asc",
        tickedGenres2: [],
        crossedGenres2: [],
        languages: [],
        statuses: [],
        startYear: "",
        endYear: "",
        watched: "",
    };

    const savedFilters = JSON.parse(localStorage.getItem('filters') || JSON.stringify(defaultFilters));

    const [filters, setFilters] = useState<Filters>(savedFilters);

    const [, setPageNumber] = useState<number | null>(null);

    const [pagination, setPagination] = useState<Pagination>({
        pageNumber: 0,
        totalPages: 0,
    });

    const fetchServies = async (filters: Filters, pageNumber: number | null = null) => {
        try {
            setLoading(true);

            console.log("HomePage -> API Call -> request:", filters, pageNumber);

            const response = await axios.post(
                "http://localhost:8080/track-servie/react/servies",
                {
                    type: filters.type,
                    languages: filters.languages,
                    statuses: filters.statuses,
                    selectedGenres: filters.tickedGenres2,
                    rejectedGenres: filters.crossedGenres2,
                    sortBy: filters.sortBy,
                    sortDir: filters.sortDir,
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
            setLoading(false); // End loading state
        }
    };

    useEffect(() => {
        console.log("HomePage -> useEffect -> default filters :", filters);
        fetchServies(filters, null);
    }, []);

    const handleFilterChange = (newFilters: Filters) => {
        console.log("HomePage -> handleFilterChange -> filter :", newFilters);
        setFilters(newFilters);
        fetchServies(newFilters, null);
    };

    const handlePageChange = (newPgNumber: number) => {
        console.log("HomePage -> handlePageChange -> pgNumber : ", newPgNumber);
        setPageNumber(newPgNumber);
        fetchServies(filters, newPgNumber);
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
