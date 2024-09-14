import React from "react";
import FilterComponent from "./FilterComponent";
import ProfilePic from "./ProfilePic";

interface HeaderProps {
 handleFilterChange: (filters: any) => void;
}

const Header: React.FC<HeaderProps> = ({ handleFilterChange }) => {
 return (
  <header className="d-flex justify-content-between align-items-center p-3">
   {/* Logo */}
   <div className="logo">
    <img src="/src/assets/logo.png" alt="Logo" style={{ width: "200px" }} />
   </div>

   {/* Filter Component */}
   <FilterComponent handleFilterChange={handleFilterChange} />

   {/* Profile Picture */}
   <ProfilePic />
  </header>
 );
};

export default Header;
