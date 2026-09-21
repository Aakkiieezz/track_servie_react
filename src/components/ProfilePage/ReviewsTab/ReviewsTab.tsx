import React, { useCallback, useEffect, useLayoutEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { createPortal } from "react-dom";
import axiosInstance from "@/utils/axiosInstance";
import PaginationBar from "@/components/common/PaginationBar/PaginationBar";
import styles from "./ReviewsTab.module.css";
import filterStyles from "@/components/ProfilePage/TabFilter/Filter.module.css";
import ReviewText from "@/components/common/ReviewModal/ReviewText";
import ReviewModal from "@/components/common/ReviewModal/ReviewModal";
import type { ReviewData } from "@/types/servie";
import { userInteractionStore } from "@/store/UserInteractionStore";
import { saveReview } from "./SaveReview";

interface Review {
    childtype: string;
    entityType: string;
    episodeNo: number | null;
    liked: boolean;
    posterPath: string | null;
    rated: number | null;
    review: string;
    reviewUpdatedAt: string;
    seasonNo: number | null;
    title: string;
    tmdbId: number;
}

interface ReviewsResponse {
    content: Review[];
    totalPages: number;
    totalElements: number;
    number: number;
    size: number;
    first: boolean;
    last: boolean;
}

// One piece of the "Series · Season 2 · Episode 5" line; `to` makes it a link.
interface EntityPart {
    label: string;
    to?: string;
}

interface ReviewsTabProps {
    userId: number;
    isOwnProfile: boolean;
}

const PAGE_SIZE = 20;

const ReviewsTab = ({ userId, isOwnProfile }: ReviewsTabProps) => {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [pageNo, setPageNo] = useState(0);

    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [tempSortBy, setTempSortBy] = useState<string>("recent");
    const [tempSortDir, setTempSortDir] = useState<string>("desc");

    const [openDropdown, setOpenDropdown] = useState<string | null>(null);

    const [expandedReviewId, setExpandedReviewId] = useState<string | null>(null);

    const reviewTextRefs = useRef<Record<string, HTMLDivElement | null>>({});
    const [expandableReviews, setExpandableReviews] = useState<Set<string>>(new Set());
    // Full (natural) height of each review's text, measured right before
    // expanding, so the max-height transition animates to an exact value
    // instead of snapping straight to "auto".
    const [expandedHeights, setExpandedHeights] = useState<Record<string, number>>({});

    const getReviewId = (review: Review) => `${review.entityType}-${review.tmdbId}-${review.seasonNo ?? ""}-${review.episodeNo ?? ""}`;

    /* =========================
       Editing (own profile only)
    ========================= */

    const {
        get: getInteraction,
        load: loadInteractions,
        update: updateInteraction,
    } = userInteractionStore();

    // Make sure the interaction store is populated (no-op if it already is)
    useEffect(() => {
        loadInteractions();
    }, [loadInteractions]);

    // The review open in the edit modal. `initialData` is built once, when the modal opens:
    // the modal resets its form whenever that object's identity changes, so it must stay stable.
    const [editing, setEditing] = useState<{
        review: Review;
        initialData: Partial<ReviewData>;
    } | null>(null);

    const totalElementsRef = useRef(0);
    totalElementsRef.current = totalElements;

    // Movies and series only for now: season / episode interactions aren't in the store yet.
    const canEdit = (review: Review) =>
        isOwnProfile &&
        (review.entityType === "MOVIE" || review.entityType === "SERIES");

    const openEditor = (review: Review) => {
        const interaction = getInteraction(review.childtype, review.tmdbId);

        setEditing({
            review,
            initialData: {
                // Store first, falling back to what the list already shows
                review: interaction?.review ?? review.review ?? null,
                rating: interaction?.rated ?? review.rated ?? null,
                liked: interaction?.liked ?? review.liked ?? false,
                // watchedDate / watchedBefore / tags aren't in the store yet, so the modal
                // uses its defaults (today / false / none). Add them here once they are.
            },
        });
    };

    const applySavedReview = (target: Review, data: ReviewData) => {
        updateInteraction(target.childtype, target.tmdbId, {
            review: data.review,
            rated: data.rating,
            liked: data.liked,
        });

        const targetId = getReviewId(target);

        if (!data.review) {
            // Review text cleared: it no longer belongs in this list
            setReviews((prev) => prev.filter((r) => getReviewId(r) !== targetId));

            const nextTotal = Math.max(0, totalElementsRef.current - 1);
            setTotalElements(nextTotal);
            setTotalPages(Math.ceil(nextTotal / PAGE_SIZE));
            setExpandedReviewId((id) => (id === targetId ? null : id));
            return;
        }

        setReviews((prev) =>
            prev.map((r) =>
                getReviewId(r) === targetId
                    ? {
                        ...r,
                        review: data.review ?? "",
                        rated: data.rating,
                        liked: data.liked,
                        reviewUpdatedAt: new Date().toISOString(),
                    }
                    : r
            )
        );
    };

    // Passed to the modal as `onSave`. Async on purpose: the modal stays open until this resolves,
    // and if it throws the modal stays open (with everything typed) and shows an error.
    const handleSaveEdit = async (data: ReviewData) => {
        if (!editing) return;

        try {
            await saveReview(editing.review, data);
        } catch (err) {
            console.error("Failed to save review:", err);
            throw err;
        }

        applySavedReview(editing.review, data);
    };

    const measureExpandableReviews = useCallback(() => {
        const expandable = new Set<string>();

        reviews.forEach((review) => {
            const reviewId = getReviewId(review);
            const element = reviewTextRefs.current[reviewId];

            if (element && element.scrollHeight > element.clientHeight + 1)
                expandable.add(reviewId);
        });

        setExpandableReviews(expandable);
    }, [reviews]);

    useLayoutEffect(() => {
        measureExpandableReviews();
    }, [measureExpandableReviews]);

    // Re-measure once web fonts finish loading — the very first measurement
    // can run against a fallback font, under-counting lines and hiding the
    // "Show more" button for reviews that only overflow once the real
    // font (usually wider) swaps in.
    useEffect(() => {
        if (typeof document === "undefined" || !("fonts" in document))
            return;

        document.fonts.ready.then(() => {
            measureExpandableReviews();
        });
    }, [measureExpandableReviews]);

    // Line count depends on the review column's width, so re-measure
    // whenever the viewport (and therefore that width) changes.
    useEffect(() => {
        const handleResize = () => measureExpandableReviews();

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, [measureExpandableReviews]);

    const sortingOptionsPreviewLabel = () => {
        const map: Record<string, string> = {
            title_asc: "Sort By : Title (A → Z)",
            title_desc: "Sort By : Title (Z → A)",
            popularity_desc: "Sort By : Popularity (High → Low)",
            popularity_asc: "Sort By : Popularity (Low → High)",
            recent_desc: "Sort By : When Reviewed (Newest → Oldest)",
            recent_asc: "Sort By : When Reviewed (Oldest → Newest)",
        };

        return (
            map[`${tempSortBy}_${tempSortDir}`] ||
            "Sort By"
        );
    };

    const fetchReviews = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await axiosInstance.get<ReviewsResponse>("/reviews/all",
                {
                    params: {
                        targetUserId: userId,
                        pageNo,
                        sortBy: tempSortBy.toUpperCase(),
                        sortDir: tempSortDir.toUpperCase(),
                    },
                }
            );

            setReviews(response.data.content ?? []);
            setTotalPages(response.data.totalPages ?? 0);
            setTotalElements(response.data.totalElements ?? 0);
        } catch (err) {
            console.error("Failed to fetch reviews:", err);
            setError("Failed to load reviews.");
            setReviews([]);
        } finally {
            setLoading(false);
        }
    }, [userId, pageNo, tempSortBy, tempSortDir]);

    useEffect(() => {
        fetchReviews();
    }, [fetchReviews]);

    // If removing a review empties a page after the first one, step back a page
    useEffect(() => {
        if (!loading && !error && reviews.length === 0 && pageNo > 0)
            setPageNo((p) => p - 1);
    }, [loading, error, reviews.length, pageNo]);

    const handleSortChange = (
        sortBy: string,
        sortDir: string
    ) => {
        setTempSortBy(sortBy);
        setTempSortDir(sortDir);
        setPageNo(0);
        setOpenDropdown(null);
        setExpandedReviewId(null);
    };

    const formatDate = (dateString: string) => {
        if (!dateString)
            return "";

        const date = new Date(dateString);

        if (Number.isNaN(date.getTime()))
            return dateString;

        return date.toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
        });
    };

    // Movie / series page. It reads these from router state so its skeleton can render immediately.
    const getSeriesLink = (review: Review) => ({
        to: "/servie",
        state: {
            childType: review.childtype,
            tmdbId: review.tmdbId,
            title: review.title,
            posterPath: review.posterPath,
        },
    });

    const getEntityParts = (review: Review): EntityPart[] => {
        const seasonPath = review.seasonNo != null
            ? `/servies/${review.tmdbId}/Season/${review.seasonNo}`
            : undefined;

        const episodePath = seasonPath && review.episodeNo != null
            ? `${seasonPath}/Episode/${review.episodeNo}`
            : undefined;

        const seasonLabel = review.seasonNo != null
            ? `Season ${review.seasonNo}`
            : "Season";

        const episodeLabel = review.episodeNo != null
            ? `Episode ${review.episodeNo}`
            : "Episode";

        switch (review.entityType) {
            case "MOVIE":
                return [{ label: "Movie" }];

            case "SERIES":
                return [{ label: "Series" }];

            case "SEASON":
                return [
                    { label: "Series" },
                    { label: seasonLabel, to: seasonPath },
                ];

            case "EPISODE":
                return [
                    { label: "Series" },
                    { label: seasonLabel, to: seasonPath },
                    { label: episodeLabel, to: episodePath },
                ];

            default:
                return [{ label: review.entityType }];
        }
    };

    const getPosterUrl = (posterPath: string | null) => {
        if (!posterPath)
            return null;

        if (posterPath.startsWith("http://") || posterPath.startsWith("https://"))
            return posterPath;

        return `https://image.tmdb.org/t/p/w342${posterPath}`;
    };

    const renderRating = (rating: number | null) => {
        if (rating == null)
            return null;

        return (
            <div className={styles.rating}>
                <i className="bi bi-star-fill" />
                <span>{rating.toFixed(1)}</span>
            </div>
        );
    };

    const renderSkeletons = () => {
        return (
            <div className={styles.reviewList}>
                {Array.from({ length: 5 }).map((_, index) => (
                    <div className={styles.reviewSkeleton} key={index}>
                        <div className={styles.skeletonPoster} />

                        <div className={styles.skeletonContent}>
                            <div className={styles.skeletonTitle} />
                            <div className={styles.skeletonMeta} />

                            <div className={styles.skeletonLine} />
                            <div className={`${styles.skeletonLine} ${styles.shortLine}`} />
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className={styles.reviewsTab}>
            {/* =========================
                Header
            ========================= */}

            <div className={styles.reviewsHeader}>
                <div>
                    <h2>Reviews</h2>

                    {!loading && totalElements > 0 && (
                        <p>
                            {totalElements}{" "}
                            {totalElements === 1 ? "review" : "reviews"}
                        </p>
                    )}
                </div>

                {/* Combined Sort Dropdown */}
                <div className={filterStyles.simpleDropdown}>
                    <button
                        className={filterStyles.customBtn}
                        type="button"
                        onClick={() => setOpenDropdown(openDropdown === "sort" ? null : "sort")}
                        aria-expanded={openDropdown === "sort"}
                    >
                        <span>
                            {sortingOptionsPreviewLabel()}
                        </span>

                        <i className={`bi bi-chevron-down ${openDropdown === "sort" ? filterStyles.rotated : ""}`} />
                    </button>

                    {openDropdown === "sort" && (
                        <div className={`${filterStyles.simpleDropdownMenu} ${filterStyles.sortDropdownMenu}`} >
                            <div className={filterStyles.dropdownHeader}>
                                Title
                            </div>

                            <button
                                type="button"
                                className={filterStyles.simpleDropdownItem}
                                onClick={() => handleSortChange("title", "asc")}
                            >
                                A → Z
                            </button>

                            <button
                                type="button"
                                className={filterStyles.simpleDropdownItem}
                                onClick={() => handleSortChange("title", "desc")}
                            >
                                Z → A
                            </button>

                            <div className={filterStyles.dropdownDivider} />

                            <div className={filterStyles.dropdownHeader}>
                                Popularity
                            </div>

                            <button
                                type="button"
                                className={filterStyles.simpleDropdownItem}
                                onClick={() => handleSortChange("popularity", "desc")}
                            >
                                High → Low
                            </button>

                            <button
                                type="button"
                                className={filterStyles.simpleDropdownItem}
                                onClick={() => handleSortChange("popularity", "asc")}
                            >
                                Low → High
                            </button>

                            <div className={filterStyles.dropdownDivider} />

                            <div className={filterStyles.dropdownHeader}  >
                                When Reviewed
                            </div>

                            <button
                                type="button"
                                className={filterStyles.simpleDropdownItem}
                                onClick={() => handleSortChange("recent", "desc")}
                            >
                                Newest First
                            </button>

                            <button type="button"
                                className={filterStyles.simpleDropdownItem}
                                onClick={() => handleSortChange("recent", "asc")}
                            >
                                Oldest First
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* =========================
                Content
            ========================= */}

            {loading ? (
                renderSkeletons()
            ) : error ? (
                <div className={styles.emptyState}>
                    <div className={styles.emptyIcon}>
                        <i className="bi bi-exclamation-circle" />
                    </div>

                    <h3>Unable to load reviews</h3>
                    <p>{error}</p>
                </div>
            ) : reviews.length === 0 ? (
                <div className={styles.emptyState}>
                    <div className={styles.emptyIcon}>
                        <i className="bi bi-chat-square-text" />
                    </div>

                    <h3>No reviews yet</h3>

                    <p>
                        Reviews written by this user will
                        appear here.
                    </p>
                </div>
            ) : (
                <>
                    <div className={styles.reviewList}>
                        {reviews.map((review) => {
                            const reviewId = getReviewId(review);

                            const posterUrl = getPosterUrl(review.posterPath);
                            const seriesLink = getSeriesLink(review);
                            const isExpanded = expandedReviewId === reviewId;

                            return (
                                <article className={styles.reviewCard} key={reviewId}>
                                    {/* Poster. Decorative link: the title link is the one keyboard and screen-reader users get. */}
                                    <Link
                                        to={seriesLink.to}
                                        state={seriesLink.state}
                                        className={styles.posterWrapper}
                                        aria-hidden="true"
                                        tabIndex={-1}
                                    >
                                        {posterUrl ? (
                                            <img
                                                className={styles.poster}
                                                src={posterUrl}
                                                alt=""
                                                loading="lazy"
                                            />
                                        ) : (
                                            <div className={styles.posterFallback}>
                                                <i className="bi bi-film" />
                                            </div>
                                        )}
                                    </Link>

                                    {/* Content */}
                                    <div className={styles.reviewContent}>
                                        <div className={styles.reviewTop}>
                                            <div className={styles.titleSection}>
                                                <div className={styles.titleLine}>
                                                    <h3 className={styles.title}>
                                                        <Link
                                                            to={seriesLink.to}
                                                            state={seriesLink.state}
                                                            className={styles.titleLink}
                                                        >
                                                            {review.title}
                                                        </Link>
                                                    </h3>

                                                    <span className={styles.metaGroup}>
                                                        {getEntityParts(review).map((part, index) => (
                                                            <React.Fragment key={index}>
                                                                <span className={styles.dot}>·</span>
                                                                {part.to ? (
                                                                    <Link
                                                                        to={part.to}
                                                                        className={`${styles.metadata} ${styles.metadataLink}`}
                                                                    >
                                                                        {part.label}
                                                                    </Link>
                                                                ) : (
                                                                    <span className={styles.metadata}>
                                                                        {part.label}
                                                                    </span>
                                                                )}
                                                            </React.Fragment>
                                                        ))}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className={styles.reviewActions}>
                                                {renderRating(review.rated)}

                                                {review.liked && (
                                                    <i
                                                        className={`bi bi-heart-fill ${styles.liked}`}
                                                        title="Liked"
                                                    />
                                                )}
                                            </div>
                                        </div>

                                        <div className={styles.reviewTextContainer}>
                                            <div
                                                ref={(element) => {
                                                    reviewTextRefs.current[reviewId] = element;
                                                }}
                                                className={`${styles.reviewText} ${isExpanded ? styles.reviewTextExpanded : ""}`}
                                                style={
                                                    isExpanded
                                                        ? { maxHeight: `${expandedHeights[reviewId] ?? 2000}px` }
                                                        : undefined
                                                }
                                            >
                                                <ReviewText text={review.review ?? ""} />
                                            </div>
                                        </div>

                                        {/* Footer: "Show more" on the left, date on the right */}
                                        <div className={styles.reviewFooter}>
                                            {expandableReviews.has(reviewId) && (
                                                <button
                                                    type="button"
                                                    className={styles.expandButton}
                                                    onClick={() => {
                                                        const isExpanding = !isExpanded;

                                                        if (isExpanding) {
                                                            const element = reviewTextRefs.current[reviewId];

                                                            if (element) {
                                                                setExpandedHeights((prev) => ({
                                                                    ...prev,
                                                                    [reviewId]: element.scrollHeight,
                                                                }));
                                                            }
                                                        }

                                                        setExpandedReviewId(isExpanding ? reviewId : null);
                                                    }}
                                                >
                                                    <span>{isExpanded ? "Show less" : "Show more"}</span>

                                                    <i
                                                        className={`bi bi-chevron-down ${styles.expandButtonIcon} ${isExpanded ? styles.rotated : ""}`}
                                                    />
                                                </button>
                                            )}

                                            <div className={styles.footerRight}>
                                                {canEdit(review) && (
                                                    <button
                                                        type="button"
                                                        className={styles.iconButton}
                                                        title="Edit review"
                                                        aria-label={`Edit review of ${review.title}`}
                                                        onClick={() => openEditor(review)}
                                                    >
                                                        <i className="bi bi-pencil" />
                                                    </button>
                                                )}

                                                <span className={styles.updated}>
                                                    Reviewed {formatDate(review.reviewUpdatedAt)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </article>
                            );
                        })}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <PaginationBar
                            pageNumber={pageNo}
                            totalPages={totalPages}
                            onPageChange={setPageNo}
                        />
                    )}
                </>
            )}

            {editing &&
                createPortal(
                    <ReviewModal
                        isOpen
                        onClose={() => setEditing(null)}
                        onSave={handleSaveEdit}
                        title={editing.review.title}
                        posterPath={getPosterUrl(editing.review.posterPath) ?? "/defaultPoster.png"}
                        initialData={editing.initialData}
                    />,
                    document.body
                )}
        </div>
    );
};

export default ReviewsTab;