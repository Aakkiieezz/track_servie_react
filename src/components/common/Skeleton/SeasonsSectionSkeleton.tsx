import styles from "@/pages/ServiePage.module.css";
import "@/styles/skeleton.css";
import ProgressBar from "@/components/common/ProgressBar/ProgressBar";

const SeasonsSectionSkeleton = () => (
    <div className={styles.seasonsSection}>

        <div className={styles.seasonsHeader}>

            <h3>8 Seasons</h3>

            <ProgressBar
                episodesWatched={0}
                totalEpisodes={100}
            />

        </div>

        <div className={styles.episodesInfo}>
            Total Episodes Watched: 0 / 100
        </div>

        {Array.from({ length: 7 }).map((_, i) => (

            <div
                key={i}
                style={{
                    display: "flex",
                    gap: 18,
                    marginBottom: 18,
                    alignItems: "center"
                }}
            >

                <div
                    className="skeletonShimmer"
                    style={{
                        width: 80,
                        aspectRatio: "2/3",
                        borderRadius: 8
                    }}
                />

                <div style={{ flex: 1 }}>

                    <div
                        className="skeletonBlock"
                        style={{
                            width: "35%",
                            height: 18,
                            marginBottom: 12
                        }}
                    />

                    <div
                        className="skeletonBlock"
                        style={{
                            width: "60%",
                            height: 14
                        }}
                    />

                </div>
            </div>
        ))}
    </div>
);

export default SeasonsSectionSkeleton;