import React, { useState, useEffect } from "react";
import ServieGrid from "../components/HomePage/ServieGrid";
import PaginationBar from "../components/PaginationBar";
import "bootstrap-icons/font/bootstrap-icons.css";
import axiosInstance from "../utils/axiosInstance";

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

interface Pagination {
    pageNumber: number;
    totalPages: number;
}

const HomePage: React.FC = () => {
    const [servies, setServies] = useState<Servie[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [, setPageNumber] = useState<number | null>(null);
    const [pagination, setPagination] = useState<Pagination>({
        pageNumber: 0,
        totalPages: 0,
    });

    const fetchServies = async (pageNumber: number | null = null) => {
        try {
            setLoading(true);

            console.log("HomePage -> API Call -> request:", pageNumber);

            const response = await axiosInstance.get("list", {
                params: {
                    pageNumber: pageNumber !== null ? pageNumber : 0, // Default to 0 if not provided
                    sortBy: "title", // Default to "title" if not provided
                    sortDir: "asc", // Default to "asc" if not provided
                },
            });

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

    const handlePageChange = (newPgNumber: number) => {
        console.log("HomePage -> handlePageChange -> pgNumber:", newPgNumber);
        setPageNumber(newPgNumber);
        fetchServies(newPgNumber);
    };

    // Fetch servies when the component mounts
    useEffect(() => {
        fetchServies();
    }, []); // Empty dependency array ensures it runs only once

    return (
        <div>
            {/* <HomePageHeader handleFilterChange={handleFilterChange} /> */}

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
