import React from "react";
import styles from "../../AppHeader.module.css";

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
  const handleCheckboxChange = (id: string) => {
    setSelected((prevSelected) =>
      prevSelected.includes(id)
        ? prevSelected.filter((item) => item !== id)
        : [...prevSelected, id]
    );
  };

  const isOptionObject = (option: KeyValuePair | string): option is KeyValuePair => {
    return typeof option !== "string";
  };

  return (
    <div className="dropdown">
      <button
        className={`btn ${styles.btnOutlinePrimary} dropdown-toggle`}
        type="button"
        id="dropdownMultiselectButton"
        data-bs-toggle="dropdown"
        aria-expanded="false"
      >
        {label}
      </button>
      <ul className={`dropdown-menu ${styles.dropdownMenu}`} aria-labelledby="dropdownMultiselectButton">
        {options.map((option) => {
          const id = isOptionObject(option) ? option.id : option;
          const displayLabel = isOptionObject(option) ? option.label : option;

          return (
            <li key={id} className={styles.dropdownItem}>
              <div className="form-check d-flex align-items-center">
                <input
                  className="form-check-input me-2"
                  type="checkbox"
                  id={`checkbox-${id}`}
                  checked={selected.includes(id)}
                  onChange={() => handleCheckboxChange(id)}
                />
                <label className="form-check-label" htmlFor={`checkbox-${id}`}>
                  {displayLabel}
                </label>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default DropdownMultiselect;
