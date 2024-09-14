import React, { useState } from "react";
import styles from "./ProfilePage.module.css";

const ProfilePage: React.FC = () => {
 const [activeTab, setActiveTab] = useState("Overview");
 const [isDropdownOpen, setIsDropdownOpen] = useState(false);
 const [profilePicUrl, setProfilePicUrl] = useState("src/components/pro.jpg");
 const username = "JohnDoe"; // Assume this comes from user data

 const toggleDropdown = () => {
  setIsDropdownOpen(!isDropdownOpen);
 };

 const handleTabChange = (tab: string) => {
  setActiveTab(tab);
 };

 // Simulate an API call for deleting the profile image
 const deleteImage = async () => {
  console.log("Deleting profile image...");
  // Simulate successful delete action by removing the image
  setProfilePicUrl(""); // Set to empty to simulate deletion
  setIsDropdownOpen(false);
 };

 // Handle the image upload
 const uploadImage = async (event: React.ChangeEvent<HTMLInputElement>) => {
  const file = event.target.files?.[0];
  if (file) {
   console.log("Uploading new profile image...", file);
   const formData = new FormData();
   formData.append("image", file);

   // Simulate API call and update the profile image
   const dummyUploadedImageUrl = URL.createObjectURL(file); // Simulate the new uploaded image URL
   setProfilePicUrl(dummyUploadedImageUrl);
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
   <div className={styles.profileHeader}>
    <div className={styles.profilePicWrapper}>
     {profilePicUrl ? (
      <img
       src={profilePicUrl}
       alt="Profile"
       className={styles.profilePic}
       onClick={toggleDropdown}
      />
     ) : (
      <div className={styles.placeholderPic} onClick={toggleDropdown}>
       No Image
      </div>
     )}
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
     className={`${styles.tabButton} ${
      activeTab === "Profile" ? styles.active : ""
     }`}
     onClick={() => handleTabChange("Profile")}
    >
     Profile
    </button>

    <button
     className={`${styles.tabButton} ${
      activeTab === "Settings" ? styles.active : ""
     }`}
     onClick={() => handleTabChange("Settings")}
    >
     Settings
    </button>

    <button
     className={`${styles.tabButton} ${
      activeTab === "Data" ? styles.active : ""
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
