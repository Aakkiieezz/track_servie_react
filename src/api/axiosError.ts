import axios from "axios";

export const getAxiosErrorMessage = (error: unknown): string => {
    if (axios.isAxiosError(error) && error.response?.data) {
        return Object.values(
            error.response.data as Record<string, string>
        ).join(", ");
    }

    return "Failed to save!";
};