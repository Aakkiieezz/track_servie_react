import React from "react";
import "./DropdownMultiselect3StateCss.css"; // Ensure this contains the styles for blank, tick, and cross states

interface DropdownMultiselect3StateProps {
   label: string;
   options: string[];
   selected: Record<string, "blank" | "tick" | "cross">;
   setSelected: React.Dispatch<
      React.SetStateAction<Record<string, "blank" | "tick" | "cross">>
   >;
   disabledOptions?: string[];
}

const DropdownMultiselect3State: React.FC<DropdownMultiselect3StateProps> = ({
   label,
   options,
   selected,
   setSelected,
   disabledOptions = [],
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
            id="dropdownMultiselect3StateButton"
            data-bs-toggle="dropdown"
            aria-expanded="false"
         >
            {label}
         </button>

         {/* Dropdown menu with grid layout */}
         <div className="dropdown-menu dropdown-menu-light p-3" aria-labelledby="dropdownMultiselect3StateButton" style={{ minWidth: "400px" }}>
            <div className="dropdown-grid">
               {options.map((option) => {
                  const isDisabled = disabledOptions.includes(option);
                  return (
                     <div 
                        key={option} 
                        className={`dropdown-grid-item ${isDisabled ? "disabled" : ""}`}
                     >
                        <div className="form-check">
                           <input
                              className="form-check-input"
                              type="checkbox"
                              id={`checkbox-${option}`}
                              checked={selected[option] === "tick"}
                              onChange={() => !isDisabled && handleCheckboxChange(option)}
                              disabled={isDisabled}
                           />
                           <label
                              className={`form-check-label ${selected[option]} ${isDisabled ? "text-muted" : ""}`}
                              htmlFor={`checkbox-${option}`}
                           >
                              {option}
                           </label>
                        </div>
                     </div>
                  );
               })}
            </div>
         </div>

      </div>
   );
};

export default DropdownMultiselect3State;
