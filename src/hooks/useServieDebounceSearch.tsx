import { useEffect, useRef, useState } from "react";
import axiosInstance from "@/utils/axiosInstance";

export interface ServieSearchResult {
    childtype: string;
    tmdbId: number;
    title: string;
    posterPath: string | null;
}

const MIN_QUERY_LENGTH = 3;

export function useServieDebounceSearch(
    type: string,
    query: string,
    debounceMs = 500,
    cooldownMs = 3000
) {
    const [results, setResults] = useState<ServieSearchResult[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const lastApiCallTime = useRef<number>(0);

    useEffect(() => {
        const delay = setTimeout(() => {
            const now = Date.now();
            const timeSinceLastCall = now - lastApiCallTime.current;

            if (query.trim().length >= MIN_QUERY_LENGTH && timeSinceLastCall >= cooldownMs) {
                setIsLoading(true);
                lastApiCallTime.current = now;

                axiosInstance
                    .get(`search/servie-debound?type=${encodeURIComponent(type)}&partialSearchQuery=${encodeURIComponent(query)}`)
                    .then((res) => setResults(res.data))
                    .catch((err) => console.error("Error searching:", err))
                    .finally(() => setIsLoading(false));
            } else if (query.trim().length < MIN_QUERY_LENGTH) {
                setResults([]);
            }
        }, debounceMs);

        return () => clearTimeout(delay);
    }, [type, query, debounceMs, cooldownMs]);

    return { results, isLoading };
}