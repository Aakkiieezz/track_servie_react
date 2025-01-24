import React from "react";

interface KeyValuePair {
  id: string;
  label: string;
}

interface DropdownMenuProps {
  label: string;
  options: KeyValuePair[] | string[];
  selected: string[];
  setSelected: React.Dispatch<React.SetStateAction<string[]>>;
}

const DropdownMenu: React.FC<DropdownMenuProps> = ({
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
        className="btn btn-outline-primary dropdown-toggle"
        type="button"
        id="dropdownMenuButton"
        data-bs-toggle="dropdown"
        aria-expanded="false"
      >
        {label}
      </button>
      <ul className="dropdown-menu dropdown-menu-light" aria-labelledby="dropdownMenuButton">
        {options.map((option) => {
          const id = isOptionObject(option) ? option.id : option;
          const displayLabel = isOptionObject(option) ? option.label : option;

          return (
            <li key={id} className="dropdown-item">
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

export default DropdownMenu;
