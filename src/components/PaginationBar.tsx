import React from 'react';

interface PaginationProps {
    pageNumber: number;
    totalPages: number;
    onPageChange: (pageNumber: number) => void;
}

const PaginationBar: React.FC<PaginationProps> = ({ pageNumber: pgNo, totalPages, onPageChange }) => {

    console.log("PaginationBar -> pgNumber : ", pgNo);

    const hasPrevious = pgNo > 0;
    const hasNext = pgNo < totalPages - 1;

    const handlePageChange = (newPgNo: number) => {
        console.log("PaginationBar -> handlePageChange -> pgNumber : ", newPgNo);

        if (newPgNo >= 0 && newPgNo < totalPages)
            onPageChange(newPgNo);
    };

    return (
        <nav id="paginationNav">
            {totalPages > 1 && (
                <ul className="pagination justify-content-center">

                    {/* Previous button */}
                    <li className={`page-item ${!hasPrevious ? 'disabled' : ''}`}>
                        <button
                            className="page-link"
                            onClick={() => handlePageChange(pgNo - 1)}
                            disabled={!hasPrevious}>
                            Previous
                        </button>
                    </li>

                    {/* First Page */}
                    {pgNo !== 0 && (
                        <li className="page-item">
                            <button className="page-link" onClick={() => handlePageChange(0)}>1</button>
                        </li>
                    )}

                    {/* Gap if current page is greater than 3 */}
                    {pgNo > 3 && (
                        <li className="page-item">
                            <span className="page-link disabled">...</span>
                        </li>
                    )}

                    {/* Previous Pages (current - 2) */}
                    {pgNo > 2 && (
                        <li className="page-item">
                            <button className="page-link" onClick={() => handlePageChange(pgNo - 2)}>
                                {pgNo - 1}
                            </button>
                        </li>
                    )}

                    {/* Previous Page (current - 1) */}
                    {pgNo > 1 && (
                        <li className="page-item">
                            <button className="page-link" onClick={() => handlePageChange(pgNo - 1)}>
                                {pgNo}
                            </button>
                        </li>
                    )}

                    {/* Current Page */}
                    <li className="page-item active">
                        <button className="page-link">{pgNo + 1}</button>
                    </li>

                    {/* Next Page (current + 1) */}
                    {pgNo < totalPages - 2 && (
                        <li className="page-item">
                            <button className="page-link" onClick={() => handlePageChange(pgNo + 1)}>
                                {pgNo + 2}
                            </button>
                        </li>
                    )}

                    {/* Next Next Page (current + 2) */}
                    {pgNo < totalPages - 3 && (
                        <li className="page-item">
                            <button className="page-link" onClick={() => handlePageChange(pgNo + 2)}>
                                {pgNo + 3}
                            </button>
                        </li>
                    )}

                    {/* Gap if current page is less than totalPages - 4 */}
                    {pgNo < totalPages - 4 && (
                        <li className="page-item">
                            <span className="page-link disabled">...</span>
                        </li>
                    )}

                    {/* Last Page */}
                    {pgNo !== totalPages - 1 && (
                        <li className="page-item">
                            <button className="page-link" onClick={() => handlePageChange(totalPages - 1)}>
                                {totalPages}
                            </button>
                        </li>
                    )}

                    {/* Next button */}
                    <li className={`page-item ${!hasNext ? 'disabled' : ''}`}>
                        <button
                            className="page-link"
                            onClick={() => handlePageChange(pgNo + 1)}
                            disabled={!hasNext}>
                            Next
                        </button>
                    </li>
                </ul>
            )}
        </nav>
    );
};

export default PaginationBar;
