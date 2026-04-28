import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./ProfilePic.module.css";
import PortalDropdown from "../PortalDropdown";
import { handleLogout } from "../../../../utils/auth";

const DROPDOWN_WIDTH = 180;

const ProfilePic: React.FC = () => {
    const navigate = useNavigate();

    const [profilePicUrl] = useState<string | null>(localStorage.getItem("profileImgUrl"));
    const username = localStorage.getItem("username");

    const [darkMode, setDarkMode] = useState(() => localStorage.getItem("theme") === "dark");

    const [showDropdown, setShowDropdown] = useState(false);
    const [position, setPosition] = useState({ top: 0, left: 0, width: DROPDOWN_WIDTH });

    const buttonRef = useRef<HTMLImageElement | null>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // 🌗 Theme toggle
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

    // 📍 Position updater (same pattern as SearchFilter)
    const updatePosition = () => {
        if (buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();

            setPosition({
                top: rect.bottom + 6,
                left: rect.right - DROPDOWN_WIDTH, // 🔥 right-aligned
                width: DROPDOWN_WIDTH,
            });
        }
    };

    // 🧠 Events (copied pattern from SearchFilter)
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") setShowDropdown(false);
        };

        const handleClickOutside = (e: MouseEvent) => {
            const target = e.target as Node;

            if (
                buttonRef.current &&
                !buttonRef.current.contains(target) &&
                dropdownRef.current &&
                !dropdownRef.current.contains(target)
            ) {
                setShowDropdown(false);
            }
        };

        const handleResize = () => {
            if (showDropdown) updatePosition();
        };

        document.addEventListener("keydown", handleKeyDown);
        document.addEventListener("mousedown", handleClickOutside);
        window.addEventListener("resize", handleResize);

        return () => {
            document.removeEventListener("keydown", handleKeyDown);
            document.removeEventListener("mousedown", handleClickOutside);
            window.removeEventListener("resize", handleResize);
        };
    }, [showDropdown]);

    const viewportHeight = window.innerHeight;
    const spaceBelow = viewportHeight - position.top;
    const maxHeight = Math.min(300, spaceBelow - 20);

    return (
        <div className={styles.profilePicContainer}>

            {/* ✅ Inline username (fixed earlier issue) */}
            <span className={styles.username}>{username}</span>

            {/* 👤 Avatar trigger */}
            <img
                ref={buttonRef}
                src={profilePicUrl || "src/assets/defaultProfileImg.jpg"}
                alt="Profile"
                onClick={() => {
                    setShowDropdown(prev => !prev);
                    if (!showDropdown) {
                        setTimeout(updatePosition, 0);
                    }
                }}
                onError={(e) => {
                    (e.target as HTMLImageElement).src = "src/assets/defaultProfileImg.jpg";
                }}
            />

            {/* ✅ Portal Dropdown (same system as SearchFilter) */}
            <PortalDropdown
                show={showDropdown}
                position={position}
                maxHeight={maxHeight}
                dropdownRef={dropdownRef}
            >
                <button className={styles.dropdownItem} onClick={() => navigate("/profile/me/overview")}>
                    <i className="bi bi-person-circle"></i> Profile
                </button>

                <button className={styles.dropdownItem} onClick={() => navigate("/profile/me/servies")}>
                    <i className="bi bi-film"></i> Servies
                </button>

                <button className={styles.dropdownItem} onClick={() => navigate("/profile/me/lists")}>
                    <i className="bi bi-list"></i> Lists
                </button>

                <button className={styles.dropdownItem} onClick={() => navigate("/profile/me/watchlist")}>
                    <i className="bi bi-clock-fill"></i> Watchlist
                </button>

                <button className={styles.dropdownItem} onClick={() => navigate("/profile/me/network")}>
                    <i className="bi bi-people"></i> Networks
                </button>

                <button className={styles.dropdownItem} onClick={toggleTheme}>
                    <i className={`bi ${darkMode ? "bi-lightbulb-fill" : "bi-lightbulb-off-fill"}`}></i>
                    {darkMode ? " Light Mode" : " Dark Mode"}
                </button>

                <button className={styles.dropdownItem} onClick={() => navigate("/settings")}>
                    <i className="bi bi-sliders"></i> Settings
                </button>

                <button
                    className={`${styles.dropdownItem} ${styles.logout}`}
                    onClick={() => handleLogout(navigate)}
                >
                    <i className="bi bi-box-arrow-left"></i> Logout
                </button>
            </PortalDropdown>
        </div>
    );
};

export default ProfilePic;