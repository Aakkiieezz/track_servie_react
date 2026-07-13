import styles from "@/pages/ServiePage.module.css";
import "@/styles/skeleton.css";

interface CastSectionSkeletonProps {
    childType?: string;
}

const CastSectionSkeleton: React.FC<CastSectionSkeletonProps> = ({ childType }) => (
    <div className={styles.castSection}>

        <div className={styles.section}>
            <h4>Cast</h4>

            {childType === "tv" && (
                <div className={styles.castTabs}>
                    <button
                        className={`${styles.btnTranslucent} ${styles.tabBtn} ${styles.active}`}
                        disabled
                    >
                        Series Regulars
                    </button>

                    <button
                        className={`${styles.btnTranslucent} ${styles.tabBtn}`}
                        disabled
                    >
                        Guest Stars
                    </button>
                </div>
            )}

            <div className={styles.castRow}>
                {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className={styles.castCard}>
                        <div className={`skeletonShimmer ${styles.castImage}`} />
                        <div className={`skeletonBlock ${styles.castName}`} />
                        <div className={`skeletonBlock ${styles.castRole}`} />
                    </div>
                ))}
            </div>
        </div>

        <div
            style={{
                display: "flex",
                gap: 16,
                overflow: "hidden"
            }}
        >
            {Array.from({ length: 8 }).map((_, i) => (
                <div key={i}>

                    <div
                        className="skeletonShimmer"
                        style={{
                            width: 110,
                            height: 165,
                            borderRadius: 12
                        }}
                    />

                    <div
                        className="skeletonBlock"
                        style={{
                            width: 90,
                            height: 14,
                            marginTop: 8
                        }}
                    />

                </div>
            ))}
        </div>
    </div>
);

export default CastSectionSkeleton;