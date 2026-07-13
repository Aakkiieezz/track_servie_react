import styles from "@/pages/ServiePage.module.css";
import "@/styles/skeleton.css";

const Card = ({ title, rows }: { title: string; rows: number }) => (
    <div className={styles.infoCard}>

        <h4 className={styles.cardTitle}>
            {title}
        </h4>

        {Array.from({ length: rows }).map((_, i) => (
            <div
                key={i}
                className="skeletonBlock"
                style={{
                    width: `${70 + Math.random() * 20}%`,
                    height: 18,
                    marginBottom: 12
                }}
            />
        ))}
    </div>
);

const SidebarSkeleton = () => (
    <div className={styles.sidebar}>
        <Card title="Genres" rows={5} />
        <Card title="Keywords" rows={8} />
        <Card title="Details" rows={6} />
    </div>
);

export default SidebarSkeleton;