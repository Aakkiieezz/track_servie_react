import styles from "@/pages/ServiePage.module.css";
import "@/styles/skeleton.css";
import HalfStarRating from "../HalfStarRating";

interface HeroSectionSkeletonProps {
    title?: string;
    posterPath?: string;
}

const HeroSectionSkeleton = ({ title, posterPath }: HeroSectionSkeletonProps) => {
    return (
        <div className={styles.heroSection}>

            {/* Poster */}
            <img
                className={styles.heroPoster}
                src={`https://image.tmdb.org/t/p/w500${posterPath}`}
                alt={title}
                onError={(e) => {
                    e.currentTarget.src = "src/assets/defaultPoster.png";
                }}
            />

            {/* Hero Info */}
            <div className={styles.heroInfo}>

                {/* Title */}
                <h1 className={styles.title}>
                    {title}
                </h1>

                {/* Year */}
                <div className={styles.yearInfo}>
                    <div
                        className="skeletonBlock"
                        style={{
                            width: 90,
                            height: 20
                        }}
                    />
                </div>

                {/* Rating */}
                <div className={styles.heroRating}>
                    <div className={styles.heroRatingLabel}>
                        Rate this
                    </div>

                    <HalfStarRating
                        maxStars={5}
                        initialRating={0}
                        onRatingChange={() => { }}
                    />
                </div>

                {/* Buttons */}
                <div className={styles.actionButtons}>
                    <button
                        className={styles.btnTranslucent}
                        disabled
                    >
                        <i className="bi bi-eye-slash-fill"></i>
                        {" "}Mark as Watched
                    </button>

                    <button
                        className={styles.btnTranslucent}
                        disabled
                    >
                        <i className="bi bi-pencil-square"></i>
                        {" "}Add Review
                    </button>
                </div>
            </div>
        </div>
    );
};

export default HeroSectionSkeleton;