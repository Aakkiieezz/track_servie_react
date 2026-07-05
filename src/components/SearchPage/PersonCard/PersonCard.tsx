import React from "react";
import styles from "./PersonCard.module.css";
import type { KnownForItem } from "@/components/SearchPage/KnownForModal/KnownForModal";

export type PersonCardData = {
    id: number;
    name: string;
    originalName: string | null;
    profilePath: string | null;
    knownForDepartment: string | null;
    popularity: number;
    knownFor: KnownForItem[];
};

type PersonCardProps = PersonCardData & {
    onClick: (person: PersonCardData) => void;
};

const DEFAULT_AVATAR = "/src/assets/profile_icon_male.png";

// Matches strings made up of Latin letters, marks, numbers, and common punctuation/spacing.
// Anything containing script outside this range (Devanagari, CJK, Cyrillic, Arabic, etc.)
// is treated as non-Latin and won't be shown alongside the primary name.
const LATIN_ONLY = /^[\p{Script=Latin}\p{N}\p{P}\p{Zs}]*$/u;

function isDisplayableOriginalName(name: string, originalName: string | null): boolean {
    if (!originalName) return false;
    if (originalName.trim() === name.trim()) return false;
    return LATIN_ONLY.test(originalName);
}

const PersonCard: React.FC<PersonCardProps> = (props) => {
    const { name, originalName, profilePath, knownForDepartment, onClick } = props;

    const imageSrc = profilePath
        ? `https://image.tmdb.org/t/p/w300${profilePath}`
        : DEFAULT_AVATAR;

    const showOriginalName = isDisplayableOriginalName(name, originalName);

    return (
        <div
            className={styles.card}
            onClick={() => onClick(props)}
            role="button"
            tabIndex={0}
        >
            <img
                className={styles.photo}
                src={imageSrc}
                alt={name}
                onError={(e) => {
                    e.currentTarget.src = DEFAULT_AVATAR;
                }}
            />
            <p className={styles.name} title={name}>
                {name}
            </p>
            {showOriginalName && (
                <p className={styles.originalName} title={originalName!}>
                    {originalName}
                </p>
            )}
            {knownForDepartment && (
                <p className={styles.department} title={knownForDepartment}>
                    {knownForDepartment}
                </p>
            )}
        </div>
    );
};

export default PersonCard;