import React from "react";
import "./DropdownMenu3States2Css.css"; // Ensure this contains the styles for blank, tick, and cross states

interface DropdownMenu3States2Props {
   label: string;
   options: string[];
   selected: Record<string, "blank" | "tick" | "cross">;
   setSelected: React.Dispatch<
      React.SetStateAction<Record<string, "blank" | "tick" | "cross">>
   >;
}

const DropdownMenu3States2: React.FC<DropdownMenu3States2Props> = ({
   label,
   options,
   selected,
   setSelected,
}) => {
   const handleCheckboxChange = (option: string) => {
      setSelected((prevSelected) => {
         const newState: Record<string, "blank" | "tick" | "cross"> = {
            ...prevSelected,
            [option]:
               prevSelected[option] === "tick"
                  ? "cross"
                  : prevSelected[option] === "cross"
                     ? "blank"
                     : "tick",
         };
         return newState;
      });
   };

   return (
      <div className="dropdown">
         {/* Dropdown toggle button */}
         <button
            className="btn btn-outline-primary dropdown-toggle"
            type="button"
            id="dropdownMenuButton"
            data-bs-toggle="dropdown"
            aria-expanded="false"
         >
            {label}
         </button>

         {/* Dropdown menu */}
         <ul className="dropdown-menu dropdown-menu-light" aria-labelledby="dropdownMenuButton">
            {options.map((option) => (
               <li key={option} className="dropdown-item">
                  <div className="form-check d-flex align-items-center">
                     <input
                        className="form-check-input me-2"
                        type="checkbox"
                        id={`checkbox-${option}`}
                        checked={selected[option] === "tick"}
                        onChange={() => handleCheckboxChange(option)}
                     />
                     <label
                        className={`form-check-label ${selected[option]}`}
                        htmlFor={`checkbox-${option}`}
                     >
                        {option}
                     </label>
                  </div>
               </li>
            ))}
         </ul>
      </div>
   );
};

export default DropdownMenu3States2;
