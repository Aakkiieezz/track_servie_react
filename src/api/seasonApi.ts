import axiosInstance from "@/utils/axiosInstance";
import { ReviewData } from "@/types/servie";

export const saveSeasonReview = async (
    tmdbId: number,
    seasonNo: number,
    reviewData: ReviewData
) => {
    const payload: Partial<ReviewData> = {};

    if (reviewData.watchedDate != null)
        payload.watchedDate = reviewData.watchedDate;

    if (reviewData.liked != null)
        payload.liked = reviewData.liked;

    if (reviewData.rating != null)
        payload.rating = reviewData.rating;

    if (reviewData.review != null)
        payload.review = reviewData.review;

    return axiosInstance.patch(`/servies/${tmdbId}/Season/${seasonNo}/review`,
        payload
    );
};