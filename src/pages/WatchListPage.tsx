import React, { useState, useEffect } from "react";
import { useLocation, useSearchParams } from 'react-router-dom';
import ServieGrid from "../components/HomePage/ServieGrid";
import PaginationBar from "../components/PaginationBar";
import "bootstrap-icons/font/bootstrap-icons.css";
import axiosInstance from "../utils/axiosInstance";
import AppHeader from "@/components/AppHeader";
import type { Servie } from "@/types/servie";

type SearchType = 'movie' | 'tv' | 'servie' | 'person' | 'collection';

interface SearchFilters {
    query: string;
    type: SearchType;
}

interface Pagination {
    pageNumber: number;
    totalPages: number;
}

const WatchListPage: React.FC = () => {

    const [servies, setServies] = useState<Servie[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [, setPageNumber] = useState<number | null>(null);
    const [pagination, setPagination] = useState<Pagination>({
        pageNumber: 0,
        totalPages: 0,
    });

    const location = useLocation();

    const queryParams = new URLSearchParams(location.search);
    const initialQuery = queryParams.get('query') || "";
    const initialType = (queryParams.get('type') as SearchFilters['type']) || "movie";

    const [, setSearchFilters] = useState<SearchFilters>({ query: initialQuery, type: initialType });
    const [searchParams] = useSearchParams();

    useEffect(() => {
        const queryFromUrl = searchParams.get('query') || '';
        const typeFromUrl = (searchParams.get('type') as SearchType) || 'movie';

        setSearchFilters({
            query: queryFromUrl,
            type: typeFromUrl,
        });
    }, [searchParams]);

    const fetchServies = async (pageNumber: number | null = null) => {
        try {
            setLoading(true);

            console.log("WatchListPage -> API Call -> request:", pageNumber);

            const response = await axiosInstance.get("list/watchlist", {
                params: {
                    pageNumber: pageNumber !== null ? pageNumber : 0, // Default to 0 if not provided
                    sortBy: "title", // Default to "title" if not provided
                    sortDir: "asc", // Default to "asc" if not provided
                },
            });

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

            <AppHeader />

            <h1 style={{
                fontSize: "48px",
                fontWeight: "700",
                margin: "0 0 12px 0",
                letterSpacing: "-0.5px"
            }}>
                Watchlist
            </h1>

            {loading ? <p>Loading...</p> : <ServieGrid servies={servies} />}

            <PaginationBar
                pageNumber={pagination.pageNumber}
                totalPages={pagination.totalPages}
                onPageChange={handlePageChange}
            />
        </div>
    );
};

export default WatchListPage;