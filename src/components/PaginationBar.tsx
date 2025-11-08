import React from 'react';
import styles from "./PaginationBar.module.css";

interface PaginationProps {
    pageNumber: number;
    totalPages: number;
    onPageChange: (pageNumber: number) => void;
}

const PaginationBar: React.FC<PaginationProps> = ({ pageNumber: pgNo, totalPages, onPageChange }) => {

    console.log("PaginationBar -> pgNumber : ", pgNo);

    const hasPrevious = pgNo > 0;
    const hasNext = pgNo < totalPages - 1;

    const handlePageChange = (newPgNo: number, event?: React.MouseEvent<HTMLButtonElement>) => {
        console.log("PaginationBar -> handlePageChange -> pgNumber : ", newPgNo);

        if (newPgNo >= 0 && newPgNo < totalPages)
            onPageChange(newPgNo);

        // Remove focus from the clicked button
        if (event)
            event.currentTarget.blur();
    };

    return (
        <nav className={styles.paginationNav}>
            {totalPages > 1 && (
                <ul className={`pagination ${styles.pagination} justify-content-center`}>

                {/* Previous */}
                <li className={`page-item ${!hasPrevious ? 'disabled' : ''}`}>
                    <button
                        className={`${styles.pageLink} ${styles.prevNext}`}
                        onClick={(event) => handlePageChange(pgNo - 1, event)}
                        disabled={!hasPrevious}
                    >
                        Previous
                    </button>
                </li>

                {pgNo !== 0 && (
                    <li className="page-item">
                    <button className={styles.pageLink} onClick={(event) => handlePageChange(0, event)}>1</button>
                    </li>
                )}

                {pgNo > 3 && (
                    <li className="page-item">
                    <span className={`${styles.pageLink} ${styles.ellipsis}`}>...</span>
                    </li>
                )}

                {pgNo > 2 && (
                    <li className="page-item">
                    <button className={styles.pageLink} onClick={(event) => handlePageChange(pgNo - 2, event)}>
                        {pgNo - 1}
                    </button>
                    </li>
                )}

                {pgNo > 1 && (
                    <li className="page-item">
                    <button className={styles.pageLink} onClick={(event) => handlePageChange(pgNo - 1, event)}>
                        {pgNo}
                    </button>
                    </li>
                )}

                <li className={`page-item ${styles.active}`}>
                    <button className={styles.pageLink}>{pgNo + 1}</button>
                </li>

                {pgNo < totalPages - 2 && (
                    <li className="page-item">
                    <button className={styles.pageLink} onClick={(event) => handlePageChange(pgNo + 1, event)}>
                        {pgNo + 2}
                    </button>
                    </li>
                )}

                {pgNo < totalPages - 3 && (
                    <li className="page-item">
                    <button className={styles.pageLink} onClick={(event) => handlePageChange(pgNo + 2, event)}>
                        {pgNo + 3}
                    </button>
                    </li>
                )}

                {pgNo < totalPages - 4 && (
                    <li className="page-item">
                    <span className={`${styles.pageLink} ${styles.ellipsis}`}>...</span>
                    </li>
                )}

                {pgNo !== totalPages - 1 && (
                    <li className="page-item">
                    <button className={styles.pageLink} onClick={(event) => handlePageChange(totalPages - 1, event)}>
                        {totalPages}
                    </button>
                    </li>
                )}

                <li className={`page-item ${!hasNext ? 'disabled' : ''}`}>
                    <button
                        className={`${styles.pageLink} ${styles.prevNext}`}
                        onClick={(event) => handlePageChange(pgNo + 1, event)}
                        disabled={!hasNext}
                    >
                        Next
                    </button>
                </li>

                </ul>
            )}
        </nav>
    );
};

export default PaginationBar;
