import React, { useState } from "react";

interface ThreeStateCheckboxProps {
 option: string;
 onStateChange: (option: string, state: string) => void;
}

const ThreeStateCheckbox: React.FC<ThreeStateCheckboxProps> = ({
 option,
 onStateChange,
}) => {
 const [state, setState] = useState<string>("");

 const handleClick = () => {
  const newState = state === "" ? "tick" : state === "tick" ? "cross" : "";
  setState(newState);
  onStateChange(option, newState);
 };

 return (
  <div className="three-state-checkbox" onClick={handleClick}>
   <span>{state === "tick" ? "✔️" : state === "cross" ? "❌" : "⬜"}</span>
   <label>{option}</label>
  </div>
 );
};

export default ThreeStateCheckbox;
