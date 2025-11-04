import React, { useEffect, useState } from "react";
import axiosInstance from '../utils/axiosInstance';

import styles from "../components/ProfilePage/ProfilePage.module.css";
import 'bootstrap/dist/css/bootstrap.min.css';
import Alert from "../components/Alert";
import { Link } from "react-router-dom";
import NetworkTab from "@/components/NetworkTab";
import AppHeader from "@/components/AppHeader";

const ProfilePage: React.FC = () => {

  const username = localStorage.getItem("username");
  const [activeTab, setActiveTab] = useState("Overview");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [profilePicUrl, setProfilePicUrl] = useState<string | null>(localStorage.getItem("profileImgUrl"));
  const [alert, setAlert] = useState<{ type: string; message: string } | null>(null);

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

  const [activeNetworkTab, setActiveNetworkTab] = useState<"Following" | "Followers">("Following");

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  const deleteImage = async () => {
    console.log("Deleting profile image...");
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
      console.log("Uploading new profile image...", file);
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
        responseType: "blob", // important!
      });

      // Fetch filename from our custom header
      const fileName = response.headers["x-filename"] || "backup.zip";

      // Create a blob URL
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
      // Example: GET to export endpoint
      const response = await axiosInstance.get("user/data/export", { responseType: "blob" });
      // Download CSV file
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
      case "Profile":
        return <p>This is the overview content for {username}.</p>;
      case "Settings":
        return <p>Here are the posts by {username}.</p>;
      case "Network":
        return (
          <NetworkTab
            activeNetworkTab={activeNetworkTab}
            setActiveNetworkTab={setActiveNetworkTab}
          />
        );
      case "Data":
        return (
          <div>
            <h3>Account data</h3>
            <p>Import data to your account, or export your account in CSV format:</p>
            <button className="btn btn-primary me-2" onClick={handleImportData}>
              Import your data
            </button>
            <button className="btn btn-secondary" onClick={handleExportData}>
              Export your data
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <AppHeader />

      <div className={styles.profilePageContainer}>
        {/* Alert Component */}
        {alert && (
          <Alert
            type={alert.type}
            message={alert.message}
            onClose={() => setAlert(null)}
          />
        )}

        <nav className="bg-gray-800 p-4">
          <Link to="/stats" className="text-white hover:underline">Stats</Link>
          <br></br>
          <Link to="/statslangbarlog" className="text-white hover:underline">StatsLangBarLog</Link>
        </nav>

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

            {isDropdownOpen && (
              <div className={styles.dropdownMenu}>
                <label htmlFor="uploadImage" className={styles.dropdownItem}>
                  Upload Image
                  <input
                    type="file"
                    id="uploadImage"
                    className={styles.fileInput}
                    onChange={uploadImage}
                  />
                </label>
                <button className={styles.dropdownItem} onClick={deleteImage}>
                  Delete Image
                </button>
              </div>
            )}
          </div>
          <h1 className={styles.username}>{username}</h1>
        </div>

        <div>
          Movies watched: {watchedCounts.movie} <br />
          Series watched: {watchedCounts.tv}
        </div>

        <div className={styles.tabNavigation}>
          <button
            className={`${styles.tabButton} ${activeTab === "Profile" ? styles.active : ""
              }`}
            onClick={() => handleTabChange("Profile")}
          >
            Profile
          </button>

          <button
            className={`${styles.tabButton} ${activeTab === "Settings" ? styles.active : ""
              }`}
            onClick={() => handleTabChange("Settings")}
          >
            Settings
          </button>

          <button
            className={`${styles.tabButton} ${activeTab === "Network" ? styles.active : ""
              }`}
            onClick={() => handleTabChange("Network")}
          >
            Network
          </button>

          <button
            className={`${styles.tabButton} ${activeTab === "Data" ? styles.active : ""
              }`}
            onClick={() => handleTabChange("Data")}
          >
            Data
          </button>
        </div>
        <div className={styles.tabContent}>{renderTabContent()}</div>
      </div>
    </>
  );
};

export default ProfilePage;
