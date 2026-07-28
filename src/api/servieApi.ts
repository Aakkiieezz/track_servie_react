import axiosInstance from "@/utils/axiosInstance";
import { ReviewData } from "@/types/servie";

export const saveServieReview = async (
    childType: string,
    tmdbId: number,
    reviewData: ReviewData
) => {
    return axiosInstance.patch(`/servies/${childType}/${tmdbId}/review`,
        reviewData
    );
};