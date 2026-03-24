import React, { useEffect, useState } from "react";
import axiosInstance from '../utils/axiosInstance';

import styles from "./SettingsPage.module.css";
import { useAlert } from "../contexts/AlertContext";
import { Link } from "react-router-dom";
import AppHeader from "@/components/common/AppHeader/AppHeader";

const SetingsPage: React.FC = () => {

  const username = localStorage.getItem("username");
  const [activeTab, setActiveTab] = useState("Overview");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [profilePicUrl, setProfilePicUrl] = useState<string | null>(localStorage.getItem("profileImgUrl"));
  const { setAlert } = useAlert();

  const [watchedCounts, setWatchedCounts] = useState<{ movie: number; tv: number }>({ movie: 0, tv: 0 });

  useEffect(() => {
    const fetchWatchedCounts = async () => {
      try {
        const response = await axiosInstance.get("user/watched-counts");
        setWatchedCounts({
          movie: response.data.movie,
          tv: response.data.tv,
        });
      } catch (error) {
        setWatchedCounts({ movie: 0, tv: 0 });
      }
    };
    fetchWatchedCounts();
  }, []);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  const deleteImage = async () => {
    try {
      const response = await axiosInstance.post(
        "user/image/delete",
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.status === 200) {
        setProfilePicUrl(null);
        localStorage.removeItem("profileImgUrl");
        setAlert({ type: "success", message: "Profile image deleted successfully." });
      } else
        setAlert({ type: "warning", message: `${response.status} : ${response.data}` });
    } catch (error) {
      setAlert({ type: "danger", message: "Error deleting the profile image." });
    }
    setIsDropdownOpen(false);
  };

  const uploadImage = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const formData = new FormData();
      formData.append("file", file);

      try {
        const response = await axiosInstance.post(
          "user/image/upload",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        if (response.status === 200) {
          const uploadedImageUrl = `http://localhost:8080/track-servie/${response.data.profileImgUrl}`;
          localStorage.setItem("profileImgUrl", uploadedImageUrl);
          setProfilePicUrl(uploadedImageUrl);
          setAlert({ type: "success", message: "Profile image uploaded successfully." });
        } else {
          setAlert({ type: "warning", message: `${response.status} : ${response.data}` });
        }
      } catch (error) {
        setAlert({ type: "danger", message: "Error uploading the profile image." });
      }
      setIsDropdownOpen(false);
    }
  };

  const handleExportData = async () => {
    try {
      const response = await axiosInstance.get("http://localhost:8080/track-servie/export/user-data", {
        responseType: "blob",
      });

      const fileName = response.headers["x-filename"] || "backup.zip";
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      setAlert({ type: "success", message: "Downloaded file successfully." });
    } catch (error) {
      console.error("Error downloading file:", error);
      setAlert({ type: "danger", message: "Error downloading file : " + error });
    }
  };

  const handleImportData = async () => {
    try {
      const response = await axiosInstance.get("user/data/export", { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "account_data.csv");
      document.body.appendChild(link);
      link.click();
      link.remove();
      setAlert({ type: "success", message: "Data exported successfully." });
    } catch (error) {
      setAlert({ type: "danger", message: "Error exporting data." });
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "Overview":
        return (
          <div className={styles.overviewContent}>
            <div className={styles.statsGrid}>
              <div className={styles.statCard}>
                <i className="bi bi-film"></i>
                <div className={styles.statInfo}>
                  <span className={styles.statValue}>{watchedCounts.movie}</span>
                  <span className={styles.statLabel}>Movies Watched</span>
                </div>
              </div>
              <div className={styles.statCard}>
                <i className="bi bi-tv"></i>
                <div className={styles.statInfo}>
                  <span className={styles.statValue}>{watchedCounts.tv}</span>
                  <span className={styles.statLabel}>Series Watched</span>
                </div>
              </div>
              <div className={styles.statCard}>
                <i className="bi bi-calendar-check"></i>
                <div className={styles.statInfo}>
                  <span className={styles.statValue}>{watchedCounts.movie + watchedCounts.tv}</span>
                  <span className={styles.statLabel}>Total Watched</span>
                </div>
              </div>
            </div>

            <div className={styles.quickLinks}>
              <h3 className={styles.sectionTitle}>Quick Links</h3>
              <div className={styles.linksGrid}>
                <Link to="/stats" className={styles.linkCard}>
                  <i className="bi bi-graph-up"></i>
                  <span>Statistics</span>
                </Link>
                <Link to="/statslangbarlog" className={styles.linkCard}>
                  <i className="bi bi-bar-chart"></i>
                  <span>Language Stats</span>
                </Link>
              </div>
            </div>
          </div>
        );
      case "Settings":
        return (
          <div className={styles.settingsContent}>
            <h3 className={styles.sectionTitle}>Settings</h3>
            <p className={styles.placeholderText}>Settings panel coming soon...</p>
          </div>
        );
      case "Data":
        return (
          <div className={styles.dataContent}>
            <h3 className={styles.sectionTitle}>Account Data</h3>
            <p className={styles.dataDescription}>
              Import data to your account, or export your account in CSV format
            </p>
            <div className={styles.dataActions}>
              <button className={styles.primaryButton} onClick={handleImportData}>
                <i className="bi bi-upload"></i>
                Import Your Data
              </button>
              <button className={styles.secondaryButton} onClick={handleExportData}>
                <i className="bi bi-download"></i>
                Export Your Data
              </button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <AppHeader />

      <div className={styles.pageContainer}>
        <div className={styles.container}>
          {/* Profile Header */}
          <div className={styles.profileHeader}>
            <div className={styles.profilePicWrapper}>
              <img
                src={profilePicUrl || "src/assets/defaultProfileImg.jpg"}
                alt="Profile"
                className={styles.profilePic}
                onClick={toggleDropdown}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "src/assets/defaultProfileImg.jpg";
                }}
              />
              <button className={styles.editButton} onClick={toggleDropdown}>
                <i className="bi bi-camera"></i>
              </button>

              {isDropdownOpen && (
                <div className={styles.dropdownMenu}>
                  <label htmlFor="uploadImage" className={styles.dropdownItem}>
                    <i className="bi bi-upload"></i>
                    Upload Image
                    <input
                      type="file"
                      id="uploadImage"
                      className={styles.fileInput}
                      onChange={uploadImage}
                      accept="image/*"
                    />
                  </label>
                  <button className={styles.dropdownItem} onClick={deleteImage}>
                    <i className="bi bi-trash"></i>
                    Delete Image
                  </button>
                </div>
              )}
            </div>

            <div className={styles.profileInfo}>
              <h1 className={styles.username}>{username}</h1>
              <div className={styles.userStats}>
                <span className={styles.userStat}>
                  <i className="bi bi-film"></i> {watchedCounts.movie} movies
                </span>
                <span className={styles.statsSeparator}>•</span>
                <span className={styles.userStat}>
                  <i className="bi bi-tv"></i> {watchedCounts.tv} series
                </span>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className={styles.tabNavigation}>
            <button
              className={`${styles.tabButton} ${activeTab === "Overview" ? styles.active : ""}`}
              onClick={() => handleTabChange("Overview")}
            >
              Overview
            </button>
            <button
              className={`${styles.tabButton} ${activeTab === "Settings" ? styles.active : ""}`}
              onClick={() => handleTabChange("Settings")}
            >
              Settings
            </button>
            <button
              className={`${styles.tabButton} ${activeTab === "Data" ? styles.active : ""}`}
              onClick={() => handleTabChange("Data")}
            >
              Data
            </button>
          </div>

          {/* Tab Content */}
          <div className={styles.tabContent}>
            {renderTabContent()}
          </div>
        </div>
      </div>
    </>
  );
};

export default SetingsPage;