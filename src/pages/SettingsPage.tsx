import React, { useState } from "react";
import styles from "./SettingsPage.module.css";
import AppHeader from "@/components/common/AppHeader/AppHeader";

import ProfileTab from "@/components/SettingsPage/ProfileTab";
import AuthTab from "@/components/SettingsPage/AuthTab";
import DataTab from "@/components/SettingsPage/DataTab";

type TabType = "profile" | "auth" | "data";

const SetttingsPage: React.FC = () => {
    const username = localStorage.getItem("username");
    const userId = Number(localStorage.getItem("userId"));
    const [activeTab, setActiveTab] = useState<TabType>("profile");
    const [profilePicUrl, setProfilePicUrl] = useState<string | null>(localStorage.getItem("profileImgUrl"));

    const handleTabChange = (tab: TabType) => {
        setActiveTab(tab);
    };

    const renderTabContent = () => {
        switch (activeTab) {
            case "profile":
                return (
                    <ProfileTab
                        userId={userId}
                        profilePicUrl={profilePicUrl}
                        setProfilePicUrl={setProfilePicUrl}
                    />
                );
            case "auth":
                return <AuthTab />;
            case "data":
                return <DataTab />;
            default:
                return null;
        }
    };

    return (
        <>
            <AppHeader />
            <div className={styles.pageContainer}>
                <div className={styles.container}>

                    {/* Tabs + Mini Header */}
                    <div className={styles.tabsContainer}>
                        <div className={styles.tabsRow}>

                            {/* Left — mini profile */}
                            <div className={styles.miniHeader}>
                                <img
                                    src={profilePicUrl || "src/assets/defaultProfileImg.jpg"}
                                    alt="Profile"
                                    className={styles.miniAvatar}
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src =
                                            "src/assets/defaultProfileImg.jpg";
                                    }}
                                />
                                <span className={styles.miniUsername}>{username}</span>
                            </div>

                            {/* Center — tabs */}
                            <div className={styles.tabs}>
                                <button
                                    className={`${styles.tab} ${activeTab === "profile" ? styles.tabActive : ""}`}
                                    onClick={() => handleTabChange("profile")}
                                >
                                    Profile
                                </button>

                                <button
                                    className={`${styles.tab} ${activeTab === "auth" ? styles.tabActive : ""}`}
                                    onClick={() => handleTabChange("auth")}
                                >
                                    Auth
                                </button>

                                <button
                                    className={`${styles.tab} ${activeTab === "data" ? styles.tabActive : ""}`}
                                    onClick={() => handleTabChange("data")}
                                >
                                    Data
                                </button>
                            </div>

                            {/* Right spacer */}
                            <div className={styles.miniHeaderSpacer} />

                        </div>
                    </div>

                    {/* Tab Content */}
                    <div className={styles.tabContent}>{renderTabContent()}</div>
                </div>
            </div>
        </>
    );
};

export default SetttingsPage;