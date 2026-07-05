import React from "react";
import styles from "./CollectionRow.module.css";

export type CollectionRowData = {
    id: number;
    name: string;
    overview: string | null;
    posterPath: string | null;
    backdropPath: string | null;
};

type CollectionRowProps = CollectionRowData & {
    onClick: (id: number) => void;
};

const CollectionRow: React.FC<CollectionRowProps> = ({
    id,
    name,
    overview,
    posterPath,
    backdropPath,
    onClick,
}) => {
    const backdropSrc = backdropPath
        ? `https://image.tmdb.org/t/p/w780${backdropPath}`
        : null;
    const posterSrc = posterPath
        ? `https://image.tmdb.org/t/p/w185${posterPath}`
        : null;

    return (
        <div
            className={styles.row}
            onClick={() => onClick(id)}
            role="button"
            tabIndex={0}
        >
            {backdropSrc ? (
                <img className={styles.backdrop} src={backdropSrc} alt="" aria-hidden="true" />
            ) : (
                <div className={styles.backdropFallback} aria-hidden="true" />
            )}

            <div className={styles.overlay} />

            <div className={styles.content}>
                <div className={styles.poster}>
                    {posterSrc ? (
                        <img src={posterSrc} alt={name} className={styles.posterImg} />
                    ) : (
                        <div className={styles.posterFallback}>
                            <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.5">
                                <rect x="3" y="3" width="18" height="18" rx="2" />
                                <circle cx="8.5" cy="9.5" r="1.5" />
                                <path d="M21 15l-5-5-9 9" />
                            </svg>
                        </div>
                    )}
                </div>

                <div className={styles.text}>
                    <p className={styles.name} title={name}>
                        {name}
                    </p>
                    {overview && (
                        <p className={styles.overview} title={overview}>
                            {overview}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CollectionRow;