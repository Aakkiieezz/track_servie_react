import React, { useEffect, useState } from "react";
import axiosInstance from "@/utils/axiosInstance";
import styles from "./ProfileTab.module.css";
import FavoritesManager from "@/components/ProfilePage/OverviewTab/FavouritesManager";
import { useAlert } from '@/contexts/AlertContext';

type AuthProvider = "JWT" | "GOOGLE" | "JWT_AND_GOOGLE";

interface UserProfile {
    username: string;
    email: string;
    bio: string | null;       // null is valid from backend
    location: string | null;
    profileImgUrl?: string;
    emailVerified: boolean;
    authProvider: AuthProvider;
}

interface ProfileTabProps {
    userId: number;
    profilePicUrl: string | null;
    setProfilePicUrl: (url: string | null) => void;
}

const emptyProfile: UserProfile = {
    username: "",
    email: "",
    bio: "",
    location: "",
    emailVerified: false,
    authProvider: "JWT",
};

const ProfileTab: React.FC<ProfileTabProps> = ({
    userId,
    profilePicUrl,
    setProfilePicUrl,
}) => {
    const { setAlert } = useAlert();
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const [formData, setFormData] = useState<UserProfile>(emptyProfile);
    const [originalData, setOriginalData] = useState<UserProfile>(emptyProfile);
    const [hasChanges, setHasChanges] = useState(false);

    // true for GOOGLE and JWT_AND_GOOGLE users — email is read-only and always verified
    const isOAuthUser =
        formData.authProvider === "GOOGLE" ||
        formData.authProvider === "JWT_AND_GOOGLE";

    // Fetch user profile
    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                setLoading(true);
                const response = await axiosInstance.get<UserProfile>("user/profile");
                setFormData(response.data);
                setOriginalData(response.data);
            } catch (error) {
                console.error("Failed to fetch profile:", error);
                setAlert({
                    type: "danger",
                    message: "Failed to load profile information",
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
        // Guard: email must not be empty for JWT users
        if (!isOAuthUser && !formData.email.trim()) {
            setAlert({ type: "warning", message: "Email cannot be empty" });
            return;
        }
        try {
            setSaving(true);
            await axiosInstance.put("user/profile", {
                email: formData.email,
                bio: formData.bio || null,
                location: formData.location || null,
            });

            // If email changed, backend will send verification silently.
            // Reflect that locally — email is now unverified until user clicks the link.
            const emailChanged = formData.email !== originalData.email;
            const updatedData = {
                ...formData,
                emailVerified: emailChanged ? false : formData.emailVerified,
            };
            setOriginalData(updatedData);
            setFormData(updatedData);
            setHasChanges(false);
            setAlert({ type: "success", message: "Profile updated successfully" });
        }
        catch (error: any) {
            console.error("Failed to save profile:", error);
            const data = error.response?.data;
            if (data && typeof data === "object") {
                const firstMessage = Object.values(data)[0] as string;
                setAlert({ type: "danger", message: firstMessage });
            } else
                setAlert({ type: "danger", message: "Failed to save profile changes" });
        }
        finally {
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
                headers: { "Content-Type": "multipart/form-data" },
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
                const response = await axiosInstance.post("user/image/upload",
                    formDataToSend,
                    { headers: { "Content-Type": "multipart/form-data" } }
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
            if (
                !target.closest(`.${styles.profilePictureWrapper}`) &&
                !target.closest(`.${styles.dropdownMenu}`)
            ) {
                setIsDropdownOpen(false);
            }
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

    // Determine email verification icon
    // OAuth users → always verified; JWT users → based on emailVerified field
    const showVerifiedIcon = isOAuthUser || formData.emailVerified;

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
                                <div className={styles.profilePictureContainer}>
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

                                    <button
                                        className={styles.editButton}
                                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                        title="Edit profile picture"
                                    >
                                        <i className="bi bi-camera"></i>
                                    </button>

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

                                {/* Username — always read-only */}
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

                                {/* Email — editable for JWT users, read-only for OAuth users */}
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Email</label>
                                    <div className={styles.emailFieldWrapper}>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            disabled={isOAuthUser}
                                            className={`${styles.input} ${isOAuthUser ? styles.readOnly : ""}`}
                                            placeholder="Enter your email"
                                        />
                                        {showVerifiedIcon ? (
                                            <i
                                                className={`bi bi-patch-check-fill ${styles.verifiedIcon}`}
                                                title="Email verified"
                                            />
                                        ) : (
                                            <i
                                                className={`bi bi-exclamation-circle-fill ${styles.unverifiedIcon}`}
                                                title="Email not verified"
                                            />
                                        )}
                                    </div>
                                </div>

                                {/* Bio */}
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Bio</label>
                                    <textarea
                                        name="bio"
                                        value={formData.bio ?? ""}
                                        onChange={handleInputChange}
                                        className={styles.textarea}
                                        placeholder="Tell us about yourself..."
                                        rows={4}
                                    />
                                    <span className={styles.charCount}>
                                        {(formData.bio ?? "").length} / 500
                                    </span>
                                </div>

                                {/* Country */}
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Country</label>
                                    <input
                                        type="text"
                                        name="location"
                                        value={formData.location ?? ""}
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

                {/* Right Column: Favorite Series */}
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