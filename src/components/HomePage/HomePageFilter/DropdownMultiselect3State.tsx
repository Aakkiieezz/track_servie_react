import React from "react";
import styles from "./DropdownMultiselect3State.module.css";
import stylesAppHeader from "../../AppHeader.module.css";

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
            className={`btn ${stylesAppHeader.btnOutlinePrimary} dropdown-toggle`}
            type="button"
            id="dropdownMultiselect3StateButton"
            data-bs-toggle="dropdown"
            aria-expanded="false"
         >
            {label}
         </button>

         {/* Dropdown menu */}
         <div
            className={`dropdown-menu ${stylesAppHeader.dropdownMenu} p-3 ${styles.dropdownMenu}`}
            aria-labelledby="dropdownMultiselect3StateButton"
            style={{ minWidth: "400px" }}
         >
            <div className={styles.dropdownGrid}>
               {options.map((option) => {
                  const isDisabled = disabledOptions.includes(option);
                  return (
                     <div
                        key={option}
                        className={`${styles.dropdownGridItem} ${isDisabled ? styles.disabled : "" }`}
                     >
                        <div className={styles.formCheck}>
                           <input
                              className={styles.formCheckInput}
                              type="checkbox"
                              id={`checkbox-${option}`}
                              checked={selected[option] === "tick"}
                              onChange={() => !isDisabled && handleCheckboxChange(option)}
                              disabled={isDisabled}
                           />
                           {/* Cross overlay */}
                           {selected[option] === "cross" && (
                              <div className={styles.crossOverlay}>✘</div>
                           )}
                           <label
                              className={`${styles.formCheckLabel} ${ selected[option] === "cross" ? styles.formCheckLabelCross : "" } ${isDisabled ? "text-muted" : ""}`}
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
