import React, { useEffect, useRef, useState } from "react";
import axiosInstance from "@/utils/axiosInstance";
import type { Keyword } from "@/store/useFilterStore";
import styles from "./KeywordMultiselect.module.css";

interface Props {
	selectedKeywords: Keyword[];
	rejectedKeywords: Keyword[];
	onSelectedKeywordsChange: (keywords: Keyword[]) => void;
	onRejectedKeywordsChange: (keywords: Keyword[]) => void;
}

const MIN_SEARCH_LENGTH = 3;
const DEBOUNCE_DELAY = 300;
const MAX_RESULTS = 20;

const KeywordMultiselect: React.FC<Props> = ({
	selectedKeywords,
	rejectedKeywords,
	onSelectedKeywordsChange,
	onRejectedKeywordsChange,
}) => {
	const [query, setQuery] = useState("");
	const [results, setResults] = useState<Keyword[]>([]);
	const [loading, setLoading] = useState(false);
	const [isOpen, setIsOpen] = useState(false);

	const containerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const trimmedQuery = query.trim();

		if (trimmedQuery.length < MIN_SEARCH_LENGTH) {
			setResults([]);
			setLoading(false);
			return;
		}

		const timeout = setTimeout(async () => {
			try {
				setLoading(true);

				const response = await axiosInstance.get<Keyword[]>(
					"search/keyword-debound",
					{
						params: {
							partialSearchQuery: trimmedQuery,
						},
					}
				);

				setResults(response.data.slice(0, MAX_RESULTS));
			} catch (error) {
				console.error("Failed to search keywords", error);
				setResults([]);
			} finally {
				setLoading(false);
			}
		}, DEBOUNCE_DELAY);

		return () => clearTimeout(timeout);
	}, [query]);

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (containerRef.current && !containerRef.current.contains(event.target as Node))
				setIsOpen(false);
		};

		document.addEventListener("mousedown", handleClickOutside);

		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	const isSelected = (id: number) => selectedKeywords.some(keyword => keyword.id === id);
	const isRejected = (id: number) => rejectedKeywords.some(keyword => keyword.id === id);

	const handleInclude = (keyword: Keyword) => {
		if (isSelected(keyword.id))
			return;

		onRejectedKeywordsChange(rejectedKeywords.filter(item => item.id !== keyword.id));

		onSelectedKeywordsChange([
			...selectedKeywords,
			keyword,
		]);
	};

	const handleExclude = (keyword: Keyword) => {
		if (isRejected(keyword.id))
			return;

		onSelectedKeywordsChange(selectedKeywords.filter(item => item.id !== keyword.id));

		onRejectedKeywordsChange([
			...rejectedKeywords,
			keyword,
		]);
	};

	const removeSelected = (id: number) => {
		onSelectedKeywordsChange(selectedKeywords.filter(keyword => keyword.id !== id));
	};

	const removeRejected = (id: number) => {
		onRejectedKeywordsChange(rejectedKeywords.filter(keyword => keyword.id !== id));
	};

	const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setQuery(event.target.value);
		setIsOpen(true);
	};

	const showResults = isOpen && query.trim().length >= MIN_SEARCH_LENGTH;

	const totalSelected = selectedKeywords.length + rejectedKeywords.length;

	return (
		<div className={styles.container} ref={containerRef}>

			{/* Compact filter control */}
			<button
				type="button"
				className={`${styles.filterButton} ${totalSelected > 0 ? styles.active : ""}`}
				onClick={() => setIsOpen(prev => !prev)}
			>
				<span>Keywords</span>

				{totalSelected > 0 && (
					<span className={styles.count}>
						{totalSelected}
					</span>
				)}

				<i className={`bi bi-chevron-down ${isOpen ? styles.rotated : ""}`}></i>
			</button>

			{/* Floating dropdown */}
			{isOpen && (
				<div className={styles.dropdown}>

					<div className={styles.searchBox}>
						<i className="bi bi-search"></i>

						<input
							type="text"
							value={query}
							onChange={handleInputChange}
							autoFocus
							placeholder="Search keywords..."
						/>

						{loading && (
							<i className={`bi bi-arrow-repeat ${styles.spinner}`}></i>
						)}
					</div>

					{/* Selected keywords */}
					{selectedKeywords.length > 0 && (
						<div className={styles.selectionGroup}>

							<div className={`${styles.selectionLabel} ${styles.includeLabel}`}>
								<i className="bi bi-check-circle"></i>
								Included
							</div>

							<div className={styles.chips}>
								{selectedKeywords.map(keyword => (
									<div
										key={keyword.id}
										className={`${styles.chip} ${styles.selectedChip}`}
									>
										<span>{keyword.name}</span>

										<button
											type="button"
											onClick={() => removeSelected(keyword.id)}
											aria-label={`Remove ${keyword.name}`}
										>
											<i className="bi bi-x"></i>
										</button>
									</div>
								))}
							</div>

						</div>
					)}

					{/* Rejected keywords */}
					{rejectedKeywords.length > 0 && (
						<div className={styles.selectionGroup}>

							<div className={`${styles.selectionLabel} ${styles.excludeLabel}`}>
								<i className="bi bi-x-circle"></i>
								Excluded
							</div>

							<div className={styles.chips}>
								{rejectedKeywords.map(keyword => (
									<div
										key={keyword.id}
										className={`${styles.chip} ${styles.rejectedChip}`}
									>
										<span>{keyword.name}</span>

										<button
											type="button"
											onClick={() => removeRejected(keyword.id)}
											aria-label={`Remove ${keyword.name}`}
										>
											<i className="bi bi-x"></i>
										</button>
									</div>
								))}
							</div>

						</div>
					)}

					{showResults && (
						<div className={styles.results}>

							{loading && results.length === 0 ? (
								<div className={styles.message}>
									Searching...
								</div>
							) : results.length === 0 ? (
								<div className={styles.message}>
									No keywords found
								</div>
							) : (
								results.map(keyword => (
									<div
										key={keyword.id}
										className={styles.resultRow}
									>
										<span className={styles.keywordName}>
											{keyword.name}
										</span>

										<div className={styles.actions}>
											<button
												type="button"
												className={`${styles.actionButton} ${styles.includeButton} ${isSelected(keyword.id) ? styles.activeInclude : ""}`}
												onClick={() => handleInclude(keyword)}
												title="Include keyword"
											>
												<i className="bi bi-check"></i>
											</button>

											<button
												type="button"
												className={`${styles.actionButton} ${styles.excludeButton} ${isRejected(keyword.id) ? styles.activeExclude : "" }`}
												onClick={() => handleExclude(keyword)}
												title="Exclude keyword"
											>
												<i className="bi bi-x"></i>
											</button>
										</div>
									</div>
								))
							)}

						</div>
					)}

					{totalSelected === 0 &&
						query.trim().length < MIN_SEARCH_LENGTH && (
							<div className={styles.hint}>
								Type at least 3 characters to search
							</div>
						)}
				</div>
			)}
		</div>
	);
};

export default KeywordMultiselect;