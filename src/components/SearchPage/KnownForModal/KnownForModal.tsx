import React from "react";
import { Link } from "react-router-dom";
import styles from "./KnownForModal.module.css";

export type KnownForItem = {
    tmdbId: number;
    childtype: string;
    title: string | null;
    posterPath: string | null;
};

export type KnownForModalPerson = {
    id: number;
    name: string;
    profilePath: string | null;
    knownFor: KnownForItem[];
};

type KnownForModalProps = {
    person: KnownForModalPerson;
    onClose: () => void;
    onNavigateToPerson: (personId: number) => void;
};

const KnownForModal: React.FC<KnownForModalProps> = ({
    person,
    onClose,
    onNavigateToPerson,
}) => {
    return (
        <div className={styles.backdrop} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <button className={styles.closeButton} onClick={onClose} aria-label="Close">
                    ×
                </button>

                <p
                    className={styles.personName}
                    onClick={() => onNavigateToPerson(person.id)}
                    title={`View ${person.name}'s profile`}
                >
                    {person.name}
                </p>

                {person.knownFor.length > 0 ? (
                    <div className={styles.tiles}>
                        {person.knownFor.map((item) => (
                            <Link
                                key={`${item.childtype}-${item.tmdbId}`}
                                to="/servie"
                                state={{ childType: item.childtype, tmdbId: item.tmdbId, title: item.title, posterPath: item.posterPath }}
                                className={styles.tile}
                                onClick={onClose}
                            >
                                {item.posterPath ? (
                                    <img
                                        className={styles.poster}
                                        src={`https://image.tmdb.org/t/p/w300${item.posterPath}`}
                                        alt={item.title ?? ""}
                                    />
                                ) : (
                                    <div className={styles.posterFallback} />
                                )}
                                {item.title && (
                                    <p className={styles.tileTitle} title={item.title}>
                                        {item.title}
                                    </p>
                                )}
                            </Link>
                        ))}
                    </div>
                ) : (
                    <p className={styles.empty}>No known titles available.</p>
                )}
            </div>
        </div>
    );
};

export default KnownForModal;