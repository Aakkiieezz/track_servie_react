import React, { useEffect, useRef, useState } from "react";
import styles from "./GenreMultiselect.module.css";
import stylesAppHeader from "./Filter.module.css";

interface GenreMultiselectProps {
	label: string;
	options: string[];
	selected: Record<string, "blank" | "tick" | "cross">;
	setSelected: React.Dispatch<React.SetStateAction<Record<string, "blank" | "tick" | "cross">>>;
	disabledOptions?: string[];
}

const GenreMultiselect: React.FC<GenreMultiselectProps> = ({
	label,
	options,
	selected,
	setSelected,
	disabledOptions = [],
}) => {
	const [isOpen, setIsOpen] = useState(false);
	const containerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (containerRef.current && !containerRef.current.contains(event.target as Node))
				setIsOpen(false);
		};

		document.addEventListener("mousedown", handleClickOutside);

		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	const handleCheckboxChange = (option: string) => {
		setSelected((prevSelected) => ({
			...prevSelected,
			[option]:
				prevSelected[option] === "tick"
					? "cross"
					: prevSelected[option] === "cross"
						? "blank"
						: "tick",
		}));
	};

	const activeCount = Object.values(selected).filter((value) => value !== "blank").length;

	return (
		<div className={styles.container} ref={containerRef}>
			{/* Compact filter button */}
			<button
				className={`${stylesAppHeader.customBtn} ${activeCount > 0 ? stylesAppHeader.activeFilter : ""}`}
				type="button"
				onClick={() => setIsOpen((prev) => !prev)}
				aria-expanded={isOpen}
			>
				<span>{label}</span>

				{activeCount > 0 && (
					<span className={styles.count}>{activeCount}</span>
				)}

				<i className={`bi bi-chevron-down ${isOpen ? styles.rotated : ""}`} />
			</button>

			{/* Floating dropdown */}
			{isOpen && (
				<div className={styles.dropdownMenu}>
					<div className={styles.dropdownGrid}>
						{options.map((option) => {
							const isDisabled = disabledOptions.includes(option);
							const state = selected[option] ?? "blank";

							return (
								<div
									key={option}
									className={`${styles.dropdownGridItem} ${isDisabled ? styles.disabled : ""}`}
								>
									<button
										type="button"
										className={`${styles.genreOption} ${state === "tick"
											? styles.tick
											: state === "cross"
												? styles.cross
												: ""
											}`}
										disabled={isDisabled}
										onClick={() => handleCheckboxChange(option)}
										title={
											isDisabled
												? "Not available for this content type"
												: state === "blank"
													? "Include genre"
													: state === "tick"
														? "Exclude genre"
														: "Clear genre filter"
										}
									>
										<span className={styles.stateIcon}>
											{state === "tick" && (<i className="bi bi-check" />)}
											{state === "cross" && (<i className="bi bi-x" />)}
										</span>

										<span className={styles.formCheckLabel}>
											{option}
										</span>
									</button>
								</div>
							);
						})}
					</div>
				</div>
			)}
		</div>
	);
};

export default GenreMultiselect;