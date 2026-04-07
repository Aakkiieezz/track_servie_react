import React, { useMemo, useState } from "react";
import styles from "./PosterFanStack.module.css";

interface PosterFanStackProps {
    posters: (string | null | undefined)[]; // poster paths (relative or absolute). up to 5
    height?: number;                        // pixel height for the stack (optional)
    onClick?: (index: number) => void;      // clicked poster index
    className?: string;
}

const PosterFanStack: React.FC<PosterFanStackProps> = ({ posters = [], height = 200, onClick, className }) => {

    const MAX = 5;

    const finalPosters = useMemo(() => {
        const allPosters = posters ?? [];

        const validPosters = allPosters.filter((p): p is string => !!p);
        const nullPosters = allPosters.filter((p) => !p);

        // Non-null posters take priority; pad with nulls only if under MAX
        return [...validPosters.slice(0, MAX), ...nullPosters].slice(0, MAX);
    }, [posters]);

    const [hoverIndex, setHoverIndex] = useState<number | null>(null);

    // Calculate poster dimensions (2:3 aspect ratio)
    const posterWidth = Math.round((height * 2) / 3);

    // Offset for each poster to show 50% of next poster
    const posterOffset = Math.round(posterWidth * 0.5);

    if (finalPosters.length === 0) {
        const skeletonCount = 5;

        return (
            <div
                className={`${styles.wrapper} ${styles.emptyWrapper} ${className || ""}`}
                style={{
                    height: `${height}px`,
                    width: `${posterWidth + (skeletonCount - 1) * posterOffset}px`
                }}
            >
                {Array.from({ length: skeletonCount }).map((_, idx) => {
                    const left = idx * posterOffset;

                    return (
                        <div
                            key={idx}
                            className={styles.skeletonPoster}
                            style={{
                                left: `${left}px`,
                                width: `${posterWidth}px`,
                                height: `${height}px`,
                                zIndex: 1
                            }}
                        />
                    );
                })}
            </div>
        );
    }

    return (
        <div
            className={`${styles.wrapper} ${className || ""}`}
            style={{
                height: `${height}px`,
                width: "100%"
            }}
            onMouseLeave={() => setHoverIndex(null)}
            role="presentation"
        >
            {finalPosters.map((p, idx) => {
                // Default position: each poster offset by 50% of its width
                let left = idx * posterOffset;

                // Hover behavior: all left posters slide 50% to the left
                if (hoverIndex !== null && idx < hoverIndex) {
                    // All left posters shift 50% (one posterOffset) to the left
                    left = idx * posterOffset - posterOffset;
                }

                // Z-index: lower index (left) should be on top, so right ones are covered
                const zIndex = 100 + (finalPosters.length - idx);

                const src =
                    !p
                        ? "https://placehold.co/220x330?text=No+Image"
                        : p.startsWith("http://") || p.startsWith("https://")
                            ? p
                            : `http://localhost:8080/track-servie/posterImgs_resize220x330_q0.85${p.replace(".jpg", ".webp")}`;

                return (
                    <div
                        key={idx}
                        className={styles.posterWrap}
                        style={{
                            left: `${left}px`,
                            width: `${posterWidth}px`,
                            height: `${height}px`,
                            zIndex,
                            transition: `left 0.3s cubic-bezier(0.4, 0, 0.2, 1)`,
                            transitionDelay: `${idx * 20}ms`
                        }}
                        onMouseEnter={() => setHoverIndex(idx)}
                        onClick={(e) => {
                            e.stopPropagation();
                            if (onClick) onClick(idx);
                        }}
                        data-index={idx}
                        role="button"
                        aria-label={`poster-${idx}`}
                    >
                        <img
                            src={src}
                            alt={`poster-${idx}`}
                            className={`${styles.posterImg} ${idx === (hoverIndex ?? 0) ? styles.posterActive : ""}`}
                            onError={(ev) => {
                                (ev.currentTarget as HTMLImageElement).onerror = null;
                                (ev.currentTarget as HTMLImageElement).src = `https://image.tmdb.org/t/p/original${p || ""}`;
                            }}
                        />
                    </div>
                );
            })}
        </div>
    );
};

export default PosterFanStack;