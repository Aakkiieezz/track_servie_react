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
      {/* Dropdown toggle button */}
      <button
        className="btn btn-secondary dropdown-toggle"
        type="button"
        id="dropdownMenuButton"
        data-bs-toggle="dropdown"
        aria-expanded="false"
      >
        {label}
      </button>

      {/* Dropdown menu */}
      <ul className="dropdown-menu" aria-labelledby="dropdownMenuButton">

        {options.map((option) => {
          const id = isOptionObject(option) ? option.id : option; // Use id if it's an object, otherwise the string itself
          const displayLabel = isOptionObject(option) ? option.label : option; // Use label if it's an object, otherwise the string itself

          return (
            <li key={id} className="dropdown-item">
              <div className="form-check">
                <input
                  className="form-check-input"
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
