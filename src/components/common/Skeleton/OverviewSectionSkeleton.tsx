import styles from "@/pages/ServiePage.module.css";
import "@/styles/skeleton.css";

const OverviewSectionSkeleton = () => (
    <div className={`glass-panel ${styles.overviewSection}`}>

        <h4>Overview</h4>

        <div
            className="skeletonBlock"
            style={{ width: 180, height: 18, marginBottom: 20 }}
        />

        {[100, 100, 98, 92, 80].map((w, i) => (
            <div
                key={i}
                className="skeletonBlock"
                style={{
                    width: `${w}%`,
                    height: 14,
                    marginBottom: 10
                }}
            />
        ))}
    </div>
);

export default OverviewSectionSkeleton;