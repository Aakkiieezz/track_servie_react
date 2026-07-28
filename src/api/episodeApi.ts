import axiosInstance from "@/utils/axiosInstance";
import { ReviewData } from "@/types/servie";

export const saveEpisodeReview = async (
    tmdbId: number,
    seasonNo: number,
    episodeNo: number,
    reviewData: ReviewData
) => {
    return axiosInstance.patch(`/servies/${tmdbId}/Season/${seasonNo}/Episode/${episodeNo}/review`,
        reviewData
    );
};