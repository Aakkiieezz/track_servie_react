import styles from "./ServieGridSkeleton.module.css";

interface Props {
    columnsPerRow?: number;
    count?: number;
}

const ServieGridSkeleton = ({
    columnsPerRow = 6,
    count = columnsPerRow * 3,
}: Props) => {
    const itemWidth = `${100 / columnsPerRow}%`;

    return (
        <div className="row center">
            {Array.from({ length: count }).map((_, index) => (
                <div
                    key={index}
                    style={{
                        flex: `0 0 ${itemWidth}`,
                        maxWidth: itemWidth,
                        padding: "0.2%",
                    }}
                >
                    <div className={styles.card}>
                        <div className={styles.posterWrapper}>
                            <div
                                className={`${styles.poster} skeletonShimmer`}
                            />

                            <div className={styles.topLeftInfo}>
                                <div
                                    className="skeletonBlock"
                                    style={{ width: "70%", height: 14 }}
                                />
                                <div
                                    className="skeletonBlock"
                                    style={{ width: "35%", height: 12, marginTop: 6 }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default ServieGridSkeleton;