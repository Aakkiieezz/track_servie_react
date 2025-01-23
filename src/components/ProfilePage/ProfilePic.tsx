import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./ProfilePic.module.css";
import { handleLogout } from "../../utils/auth";

const ProfilePic: React.FC = () => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const navigate = useNavigate(); // For routing


    const [profilePicUrl, setProfilePicUrl] = useState<string | null>(localStorage.getItem("profileImgUrl"));

    // const [profilePicUrl, setProfilePicUrl] = useState<string>(() => {
    //     const storedImageUrl = localStorage.getItem("profileImgUrl");
    //     return storedImageUrl ? storedImageUrl : "src/assets/defaultProfileImg.jpg";
    // });

    const username = localStorage.getItem("username");

    const toggleDropdown = () => {
        setIsDropdownOpen(!isDropdownOpen);
        console.log("dropdownToggle = ", isDropdownOpen);
    };

    const handleSettings = () => {
        console.log("Settings Page");
    };

    return (
        <div className={styles.profilePicContainer}>
            <span className="username">{username}</span>
            <img
                src={profilePicUrl || "src/assets/defaultProfileImg.jpg"}
                alt="Profile"
                className={styles.profilePic}
                onClick={() => navigate("/profile")}
                onError={(e) => {
                    (e.target as HTMLImageElement).src = "src/assets/defaultProfileImg.jpg";
                }}
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
