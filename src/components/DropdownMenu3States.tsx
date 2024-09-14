import React from "react";
import ThreeStateCheckbox from "./ThreeStateCheckbox";

interface DropdownMenu3StatesProps {
 label: string;
 options: string[];
 tickedItems: string[];
 crossedItems: string[];
 setTickedItems: React.Dispatch<React.SetStateAction<string[]>>;
 setCrossedItems: React.Dispatch<React.SetStateAction<string[]>>;
}

const DropdownMenu3States: React.FC<DropdownMenu3StatesProps> = ({
 label,
 options,
 tickedItems,
 crossedItems,
 setTickedItems,
 setCrossedItems,
}) => {
 const handleStateChange = (option: string, state: string) => {
  if (state === "tick") {
   setTickedItems((prev) => [...prev, option]);
   setCrossedItems((prev) => prev.filter((item) => item !== option));
  } else if (state === "cross") {
   setCrossedItems((prev) => [...prev, option]);
   setTickedItems((prev) => prev.filter((item) => item !== option));
  } else {
   setTickedItems((prev) => prev.filter((item) => item !== option));
   setCrossedItems((prev) => prev.filter((item) => item !== option));
  }
 };

 return (
  <div className="dropdown">
   <button
    className="btn btn-secondary dropdown-toggle"
    type="button"
    data-bs-toggle="dropdown"
   >
    {label}
   </button>
   <ul className="dropdown-menu">
    {options.map((option) => (
     <li key={option} className="dropdown-item">
      <ThreeStateCheckbox option={option} onStateChange={handleStateChange} />
     </li>
    ))}
   </ul>
  </div>
 );
};

export default DropdownMenu3States;
