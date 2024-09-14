import React from "react";

interface DropdownMenuProps {
 label: string;
 options: string[];
 selected: string[];
 setSelected: React.Dispatch<React.SetStateAction<string[]>>;
}

const DropdownMenu: React.FC<DropdownMenuProps> = ({
 label,
 options,
 selected,
 setSelected,
}) => {
 const handleCheckboxChange = (option: string) => {
  setSelected((prevSelected) =>
   prevSelected.includes(option)
    ? prevSelected.filter((item) => item !== option)
    : [...prevSelected, option]
  );
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
    {options.map((option) => (
     <li key={option} className="dropdown-item">
      <div className="form-check">
       <input
        className="form-check-input"
        type="checkbox"
        id={`checkbox-${option}`}
        checked={selected.includes(option)}
        onChange={() => handleCheckboxChange(option)}
       />
       <label className="form-check-label" htmlFor={`checkbox-${option}`}>
        {option}
       </label>
      </div>
     </li>
    ))}
   </ul>
  </div>
 );
};

export default DropdownMenu;
