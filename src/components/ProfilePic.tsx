import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./ProfilePic.module.css";
import { handleLogout } from "../utils/auth";

const ProfilePic: React.FC = () => {
 const [isDropdownOpen, setIsDropdownOpen] = useState(false);
 const navigate = useNavigate(); // For routing

 const profilePicUrl = "src/components/pro.jpg"; // User's profile pic
 const username = "JohnDoe"; // Replace with actual user data

 const toggleDropdown = () => {
  setIsDropdownOpen(!isDropdownOpen);
  console.log("dropdownToggle = ", isDropdownOpen);
 };

 //  const handleLogout = () => {
 //   // Implement logout logic
 //   console.log("Logging out...");
 //  };

 const handleSettings = () => {
  //   navigate("/settings");
  console.log("Settings Page");
 };

 return (
  <div className={styles.profilePicContainer}>
   <span className="username">{username}</span>
   <img
    src={profilePicUrl}
    alt="Profile"
    className={styles.profilePic}
    onClick={() => navigate("/profile")}
   />
   <button className={styles.dropdownToggle} onClick={toggleDropdown}>
    ▼
   </button>
   {isDropdownOpen && (
    <ul className={styles.dropdownMenu}>
     <li onClick={handleSettings}>Settings</li>
     <li onClick={() => handleLogout(navigate)}>Logout</li>
    </ul>
   )}
  </div>
 );
};

export default ProfilePic;
