import styles from "./HomeTabs.module.css";

const TABS = [
    { label: "All", path: "/" },
    { label: "Movies", path: "/?tab=movies" },
    { label: "Shows", path: "/?tab=shows" },
] as const;

export type HomeTab = "all" | "movies" | "shows";

interface HomeTabsProps {
    active: HomeTab;
    onChange: (tab: HomeTab) => void;
}

export default function HomeTabs({ active, onChange }: HomeTabsProps) {
    return (
        <nav className={styles.tabs}>
            {TABS.map(({ label }) => {
                const value = label.toLowerCase() as HomeTab;
                const isActive = active === value;
                return (
                    <button
                        key={value}
                        className={`${styles.tab} ${isActive ? styles.tabActive : ""}`}
                        onClick={() => onChange(value)}
                        aria-current={isActive ? "page" : undefined}
                    >
                        {label}
                    </button>
                );
            })}
        </nav>
    );
}