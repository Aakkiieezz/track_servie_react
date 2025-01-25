import React, { useState, useEffect } from "react";
import { useLocation, useSearchParams } from 'react-router-dom';
import SearchPageHeader from "../components/SearchPage/SearchPageHeader";
import PaginationBar from "../components/PaginationBar";
import axiosInstance from '../utils/axiosInstance';
import SearchServieGrid from "../components/SearchPage/SearchServieGrid";

interface Servie {
    tmdbId: number;
    childtype: "movie" | "tv";
    title: string;
    posterPath: string;
    found: boolean; // check where used
    totalEpisodes?: number;
    episodesWatched?: number;
    completed: boolean;
    releaseDate?: string;
    language: string; // check where used
    // firstAirDate?: string;
    // lastAirDate?: string;
}

type SearchType = 'movie' | 'tv' | 'multi' | 'person' | 'collection';

interface SearchFilters {
    query: string;
    type: SearchType;
}

interface Pagination {
    pageNumber: number;
    totalPages: number;
}

const SearchPage: React.FC = () => {

    const location = useLocation();

    const queryParams = new URLSearchParams(location.search);
    const initialQuery = queryParams.get('query') || "";
    const initialType = (queryParams.get('type') as SearchFilters['type']) || "movie";

    const [servies, setServies] = useState<Servie[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [pagination, setPagination] = useState<Pagination>({ pageNumber: 0, totalPages: 0 });
    const [searchFilters, setSearchFilters] = useState<SearchFilters>({ query: initialQuery, type: initialType });

    const [searchParams, setSearchParams] = useSearchParams();

    useEffect(() => {
        const queryFromUrl = searchParams.get('query') || '';
        const typeFromUrl = (searchParams.get('type') as SearchType) || 'movie';

        setSearchFilters({
            query: queryFromUrl,
            type: typeFromUrl,
        });
    }, [searchParams]);

    const fetchServies = async (filters: SearchFilters, pageNumber: number | null = null) => {
        try {
            setLoading(true);

            console.log("SearchPage -> API Call -> request:", filters, pageNumber);

            const response = await axiosInstance.get(
                "servies/search",
                {
                    params: {
                        type: filters.type,
                        query: filters.query,
                        ...(pageNumber !== null && { pageNumber }),
                    },
                }
            );

            console.log("SearchPage -> API Call -> response:", response.data);

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

    useEffect(() => {
        fetchServies(searchFilters, pagination.pageNumber);
    }, [searchFilters, pagination.pageNumber]);

    const handleSearch = (newFilters: SearchFilters) => {
        setSearchFilters(newFilters);

        setSearchParams({
            query: newFilters.query,
            type: newFilters.type,
        });

        setPagination((prev) => ({
            ...prev,
            pageNumber: 0,
        }));
    };

    return (
        <div>
            <SearchPageHeader handleSearchFilterChange={handleSearch} />

            <h1>Search Results</h1>

            {loading ?
                (<p>Loading...</p>) :
                (servies.length > 0 ?
                    (<SearchServieGrid servies={servies} />) :
                    (<p>No results found.</p>)
                )
            }

            <PaginationBar
                pageNumber={pagination.pageNumber}
                totalPages={pagination.totalPages}
                onPageChange={(newPgNumber) => setPagination((prev) => ({ ...prev, pageNumber: newPgNumber }))}
            />
        </div>
    );
};

export default SearchPage;
