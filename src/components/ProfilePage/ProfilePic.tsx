import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./ProfilePic.module.css";
import AppHeaderStyles from "../AppHeader.module.css";
import { handleLogout } from "../../utils/auth";


const ProfilePic: React.FC = () => {
    const navigate = useNavigate();
    const [profilePicUrl] = useState<string | null>(localStorage.getItem("profileImgUrl"));
    const username = localStorage.getItem("username");

    const [darkMode, setDarkMode] = useState(() => localStorage.getItem("theme") === "dark");

    useEffect(() => {
        if (darkMode) {
            document.body.classList.add("dark");
            document.body.classList.remove("light");
        } else {
            document.body.classList.remove("dark");
            document.body.classList.add("light");
        }
        localStorage.setItem("theme", darkMode ? "dark" : "light");
    }, [darkMode]);

    const toggleTheme = () => {
        setDarkMode(prev => !prev);
    };

    return (
        <div className={styles.profilePicContainer}>
            <span className={styles.username}>{username}</span>

            <div className="dropdown">
                <img
                    src={profilePicUrl || "src/assets/defaultProfileImg.jpg"}
                    alt="Profile"
                    data-bs-toggle="dropdown"
                    data-bs-display="static"
                    data-bs-auto-close="true"
                    aria-expanded="false"
                    onError={(e) => {
                        (e.target as HTMLImageElement).src = "src/assets/defaultProfileImg.jpg";
                    }}
                />

                <ul className={`dropdown-menu ${AppHeaderStyles.dropdownMenu} ${styles.dropdownMenu}`}>
                    <li>
                        <button className={AppHeaderStyles.dropdownItem} type="button" onClick={() => { navigate("/profile") }}>
                            <i className="bi bi-person-circle"></i> Profile
                        </button>
                    </li>
                    <li>
                        <button className={AppHeaderStyles.dropdownItem} type="button" onClick={() => { navigate("/settings") }}>
                            <i className="bi bi-sliders"></i> Settings
                        </button>
                    </li>
                    <li>
                        <button className={AppHeaderStyles.dropdownItem} type="button" onClick={() => { navigate("/watchlist") }}>
                            <i className="bi bi-clock-fill"></i> Watchlist
                        </button>
                    </li>
                    <li>
                        <button className={AppHeaderStyles.dropdownItem} type="button" onClick={() => { navigate("/list") }}>
                            <i className="bi bi-list"></i> Lists
                        </button>
                    </li>

                    <li>
                        <button className={AppHeaderStyles.dropdownItem} type="button" onClick={toggleTheme}>
                            <i className={`bi ${darkMode ? "bi-lightbulb-fill" : "bi-lightbulb-off-fill"}`}></i> {darkMode ? " Light Mode" : " Dark Mode"}
                        </button>
                    </li>

                    <li>
                        <button className={AppHeaderStyles.dropdownItem} type="button" onClick={() => handleLogout(navigate)} style={{ color: "rgb(255,100,100)" }}>
                            <i className="bi bi-box-arrow-left"></i> Logout
                        </button>
                    </li>
                </ul>
            </div>

        </div>
    );
};

export default ProfilePic;
