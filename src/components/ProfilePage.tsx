import React, { useState } from "react";
import axios from "axios";
import styles from "./ProfilePage.module.css";
import 'bootstrap/dist/css/bootstrap.min.css';
import Alert from "./Alert";
import { Link } from "react-router-dom";

const ProfilePage: React.FC = () => {
  const username = localStorage.getItem("username");
  const [activeTab, setActiveTab] = useState("Overview");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [profilePicUrl, setProfilePicUrl] = useState<string | null>(localStorage.getItem("profileImgUrl"));
  const [alert, setAlert] = useState<{ type: string; message: string } | null>(null);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  const deleteImage = async () => {
    console.log("Deleting profile image...");
    try {
      const response = await axios.post(
        "http://localhost:8080/track-servie/user/image/delete",
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
        const response = await axios.post(
          "http://localhost:8080/track-servie/user/image/upload",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        if (response.status === 200) {
          const uploadedImageUrl = `http://localhost:8080/${response.data.profileImgUrl}`;
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

  const renderTabContent = () => {
    switch (activeTab) {
      case "Profile":
        return <p>This is the overview content for {username}.</p>;
      case "Settings":
        return <p>Here are the posts by {username}.</p>;
      case "Data":
        return <p>Profile settings for {username}.</p>;
      default:
        return null;
    }
  };

  return (
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
        <Link to="/" className="text-white mr-4 hover:underline">Home</Link>
        <br></br>
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
          className={`${styles.tabButton} ${activeTab === "Data" ? styles.active : ""
            }`}
          onClick={() => handleTabChange("Data")}
        >
          Data
        </button>
      </div>
      <div className={styles.tabContent}>{renderTabContent()}</div>
    </div>
  );
};

export default ProfilePage;
