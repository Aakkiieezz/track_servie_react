import React, { useEffect, useRef, useState } from "react";
import styles from "./DropdownMultiselect.module.css";
import filterStyles from "./Filter.module.css";

interface KeyValuePair {
	id: string;
	label: string;
}

interface DropdownMultiselectProps {
	label: string;
	options: KeyValuePair[] | string[];
	selected: string[];
	setSelected: React.Dispatch<React.SetStateAction<string[]>>;
}

const DropdownMultiselect: React.FC<DropdownMultiselectProps> = ({
	label,
	options,
	selected,
	setSelected,
}) => {
	const [isOpen, setIsOpen] = useState(false);
	const containerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (containerRef.current && !containerRef.current.contains(event.target as Node))
				setIsOpen(false);
		};

		document.addEventListener("mousedown", handleClickOutside);

		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, []);

	const isOptionObject = (
		option: KeyValuePair | string
	): option is KeyValuePair => {
		return typeof option !== "string";
	};

	const toggleOption = (id: string) => {
		setSelected((prevSelected) =>
			prevSelected.includes(id)
				? prevSelected.filter((item) => item !== id)
				: [...prevSelected, id]
		);
	};

	return (
		<div className={styles.container} ref={containerRef}>
			<button
				className={`${filterStyles.customBtn} ${selected.length > 0 ? filterStyles.activeFilter : ""}`}
				type="button"
				onClick={() => setIsOpen((prev) => !prev)}
				aria-expanded={isOpen}
			>
				<span>{label}</span>

				{selected.length > 0 && (
					<span className={styles.count}>
						{selected.length}
					</span>
				)}

				<i className={`bi bi-chevron-down ${isOpen ? styles.rotated : ""}`} />
			</button>

			{isOpen && (
				<div className={styles.dropdownMenu}>
					<div className={styles.optionList}>
						{options.map((option) => {
							const id = isOptionObject(option)
								? option.id
								: option;

							const displayLabel = isOptionObject(option)
								? option.label
								: option;

							const isSelected = selected.includes(id);

							return (
								<button
									key={id}
									type="button"
									className={`${styles.option} ${isSelected ? styles.selected : ""}`}
									onClick={() => toggleOption(id)}
								>
									<span className={styles.checkbox}>
										{isSelected && (
											<i className="bi bi-check" />
										)}
									</span>

									<span className={styles.optionLabel}>
										{displayLabel}
									</span>
								</button>
							);
						})}
					</div>
				</div>
			)}
		</div>
	);
};

export default DropdownMultiselect;