import React, { useEffect, useState } from "react";
import axiosInstance from "@/utils/axiosInstance";
import styles from "./ProfileTab.module.css";
import FavoritesManager from "@/components/ProfilePage/OverviewTab/FavouritesManager";
import { useAlert } from '@/contexts/AlertContext';

interface UserProfile {
    username: string;
    email: string;
    bio: string;
    location: string;
    profileImgUrl?: string;
}

interface ProfileTabProps {
    userId: number;
    profilePicUrl: string | null;
    setProfilePicUrl: (url: string | null) => void;
}

const ProfileTab: React.FC<ProfileTabProps> = ({
    userId,
    profilePicUrl,
    setProfilePicUrl,
}) => {
    const { setAlert } = useAlert();
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const [formData, setFormData] = useState<UserProfile>({
        username: "",
        email: "",
        bio: "",
        location: "",
    });

    const [originalData, setOriginalData] = useState<UserProfile>({
        username: "",
        email: "",
        bio: "",
        location: "",
    });

    const [hasChanges, setHasChanges] = useState(false);

    // Fetch user profile
    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                setLoading(true);
                const response = await axiosInstance.get<UserProfile>(
                    `user/profile`
                );
                setFormData(response.data);
                setOriginalData(response.data);
            } catch (error) {
                console.error("Failed to fetch profile:", error);
                setAlert({
                    type: 'danger',
                    message: 'Failed to load profile information',
                });
            } finally {
                setLoading(false);
            }
        };

        fetchUserProfile();
    }, [userId]);

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        const updated = { ...formData, [name]: value };
        setFormData(updated);
        setHasChanges(JSON.stringify(updated) !== JSON.stringify(originalData));
    };

    const handleSaveChanges = async () => {
        try {
            setSaving(true);
            await axiosInstance.put(`user/profile`, {
                bio: formData.bio,
                location: formData.location,
            });

            setOriginalData(formData);
            setHasChanges(false);
            setAlert({ type: "success", message: "Profile updated successfully" });

        } catch (error) {
            console.error("Failed to save profile:", error);
            setAlert({ type: "danger", message: "Failed to save profile changes" });
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        setFormData(originalData);
        setHasChanges(false);
    };

    const deleteImage = async () => {
        try {
            const response = await axiosInstance.post("user/image/delete", {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

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
            const formDataToSend = new FormData();
            formDataToSend.append("file", file);

            try {
                const response = await axiosInstance.post(
                    "user/image/upload",
                    formDataToSend,
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
                }
            } catch (error) {
                setAlert({ type: "danger", message: "Error uploading the profile image." });
            }
            setIsDropdownOpen(false);
        }
    };

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (!target.closest(`.${styles.profilePictureWrapper}`) && !target.closest(`.${styles.dropdownMenu}`))
                setIsDropdownOpen(false);
        };

        if (isDropdownOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isDropdownOpen]);

    if (loading) {
        return (
            <div className={styles.tabContent}>
                <p className={styles.loadingText}>Loading profile...</p>
            </div>
        );
    }

    return (
        <div className={styles.profileTabContent}>
            {/* Two Column Layout: Profile Details (Left) + Favorites (Right) */}
            <div className={styles.twoColumnContainer}>

                {/* Left Column: Profile Information */}
                <div className={styles.leftColumn}>
                    <h3 className={styles.sectionTitle}>
                        <i className="bi bi-person-fill"></i>
                        Profile Information
                    </h3>

                    <div className={styles.profileCardWrapper}>
                        <div className={styles.profileCard}>
                            {/* Profile Picture */}
                            <div className={styles.profilePictureSection}>

                                {/* NEW container (this controls dropdown positioning) */}
                                <div className={styles.profilePictureContainer}>

                                    {/* KEEP this only for image */}
                                    <div className={styles.profilePictureWrapper}>
                                        <img
                                            src={profilePicUrl || "src/assets/defaultProfileImg.jpg"}
                                            alt="Profile"
                                            className={styles.profilePicture}
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).src = "src/assets/defaultProfileImg.jpg";
                                            }}
                                        />
                                    </div>

                                    {/* Move button OUTSIDE wrapper */}
                                    <button
                                        className={styles.editButton}
                                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                        title="Edit profile picture"
                                    >
                                        <i className="bi bi-camera"></i>
                                    </button>

                                    {/* Dropdown also OUTSIDE wrapper */}
                                    {isDropdownOpen && (
                                        <div className={styles.dropdownMenu}>

                                            <input
                                                type="file"
                                                id="uploadImage"
                                                className={styles.fileInput}
                                                onChange={uploadImage}
                                                accept="image/*"
                                            />

                                            <label htmlFor="uploadImage" className={styles.dropdownItem}>
                                                <i className="bi bi-upload"></i>
                                                Upload Image
                                            </label>

                                            <button
                                                className={styles.dropdownItem}
                                                onClick={deleteImage}
                                            >
                                                <i className="bi bi-trash"></i>
                                                Delete Image
                                            </button>

                                        </div>
                                    )}
                                </div>

                                <p className={styles.pictureHint}>Click to upload or change</p>
                            </div>

                            {/* Form Fields */}
                            <div className={styles.formFields}>
                                {/* Username (Read-only) */}
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Username</label>
                                    <input
                                        type="text"
                                        name="username"
                                        value={formData.username}
                                        disabled
                                        className={`${styles.input} ${styles.readOnly}`}
                                    />
                                </div>

                                {/* Email (Read-only) */}
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Email</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        disabled
                                        className={`${styles.input} ${styles.readOnly}`}
                                    />
                                </div>

                                {/* Bio (Editable) */}
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Bio</label>
                                    <textarea
                                        name="bio"
                                        value={formData.bio}
                                        onChange={handleInputChange}
                                        className={styles.textarea}
                                        placeholder="Tell us about yourself..."
                                        rows={4}
                                    />
                                    <span className={styles.charCount}>
                                        {formData.bio.length} / 500
                                    </span>
                                </div>

                                {/* Country (Editable) */}
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Country</label>
                                    <input
                                        type="text"
                                        name="location"
                                        value={formData.location}
                                        onChange={handleInputChange}
                                        className={styles.input}
                                        placeholder="Enter your location"
                                    />
                                </div>

                                {/* Action Buttons */}
                                <div className={styles.buttonGroup}>
                                    {hasChanges && (
                                        <>
                                            <button
                                                onClick={handleSaveChanges}
                                                disabled={saving}
                                                className={styles.saveButton}
                                            >
                                                {saving ? (
                                                    <>
                                                        <i className="bi bi-hourglass-split"></i>
                                                        Saving...
                                                    </>
                                                ) : (
                                                    <>
                                                        <i className="bi bi-check-circle"></i>
                                                        Save Changes
                                                    </>
                                                )}
                                            </button>
                                            <button
                                                onClick={handleCancel}
                                                className={styles.cancelButton}
                                            >
                                                <i className="bi bi-x-circle"></i>
                                                Cancel
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Favorite Servies */}
                <div className={styles.rightColumn}>
                    <h3 className={styles.sectionTitle}>
                        <i className="bi bi-star-fill"></i>
                        Favorite Servies
                    </h3>

                    <div className={styles.favoritesCardWrapper}>
                        <FavoritesManager
                            userId={userId}
                            isEditable={true}
                            layout="stacked"
                        />
                    </div>
                </div>

            </div>
        </div>
    );
};

export default ProfileTab;