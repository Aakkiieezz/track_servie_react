import React, { useState } from "react";
import axiosInstance from "@/utils/axiosInstance";
import styles from "./AuthTab.module.css";
import { useAlert } from "@/contexts/AlertContext";
import { Eye, EyeOff } from "lucide-react";

interface PasswordFormData {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}

const AuthTab: React.FC = () => {
    const { setAlert } = useAlert();
    const [loading, setLoading] = useState(false);
    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false,
    });

    const [formData, setFormData] = useState<PasswordFormData>({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

    const [errors, setErrors] = useState<Partial<PasswordFormData>>({});
    const [passwordStrength, setPasswordStrength] = useState(0); // 0-4

    // Calculate password strength
    const calculatePasswordStrength = (password: string): number => {
        if (!password) return 0;

        let strength = 0;
        if (password.length >= 8) strength++;
        if (password.length >= 12) strength++;
        if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
        if (/\d/.test(password) && /[!@#$%^&*]/.test(password)) strength++;

        return Math.min(strength, 4);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));

        // Update password strength only for new password
        if (name === "newPassword")
            setPasswordStrength(calculatePasswordStrength(value));

        // Clear error for this field
        if (errors[name as keyof PasswordFormData])
            setErrors((prev) => ({ ...prev, [name]: undefined }));
    };

    const validateForm = (): boolean => {
        const newErrors: Partial<PasswordFormData> = {};

        if (!formData.currentPassword)
            newErrors.currentPassword = "Current password is required";

        if (!formData.newPassword)
            newErrors.newPassword = "New password is required";
        else if (formData.newPassword.length < 8)
            newErrors.newPassword = "Password must be at least 8 characters";

        if (!formData.confirmPassword)
            newErrors.confirmPassword = "Please confirm your new password";
        else if (formData.newPassword !== formData.confirmPassword)
            newErrors.confirmPassword = "Passwords do not match";

        if (formData.currentPassword === formData.newPassword)
            newErrors.newPassword = "New password must be different from current";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm())
            return;

        try {
            setLoading(true);
            await axiosInstance.post("user/change-password", {
                currentPassword: formData.currentPassword,
                newPassword: formData.newPassword,
            });

            setAlert({ type: "success", message: "Password changed successfully" });

            // Reset form
            setFormData({
                currentPassword: "",
                newPassword: "",
                confirmPassword: "",
            });
            setPasswordStrength(0);
        } catch (error: any) {
            const errorMessage = error.response?.data || "Failed to change password";
            setAlert({ type: "danger", message: errorMessage });
        } finally {
            setLoading(false);
        }
    };

    const getPasswordStrengthLabel = (): string => {
        const labels = ["Very Weak", "Weak", "Fair", "Good", "Strong"];
        return labels[passwordStrength] || "Very Weak";
    };

    const getPasswordStrengthColor = (): string => {
        const colors = [
            "var(--danger-color)",
            "#ff9500",
            "#ffc107",
            "#66bb6a",
            "#2e7d32",
        ];
        return colors[passwordStrength] || "var(--danger-color)";
    };

    return (
        <div className={styles.authTabContent}>
            <div className={styles.centeredContent}>
                {/* Change Password Section */}
                <div className={styles.section}>
                    <h3 className={styles.sectionTitle}>
                        <i className="bi bi-shield-lock"></i>
                        Change Password
                    </h3>

                    <div className={styles.authCardWrapper}>
                        <form className={styles.authCard} onSubmit={handleChangePassword}>
                            {/* Current Password */}
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Current Password</label>
                                <div className={styles.passwordInputWrapper}>
                                    <input
                                        type={showPasswords.current ? "text" : "password"}
                                        name="currentPassword"
                                        value={formData.currentPassword}
                                        onChange={handleInputChange}
                                        className={`${styles.input} ${errors.currentPassword ? styles.inputError : ""
                                            }`}
                                        placeholder="Enter your current password"
                                        disabled={loading}
                                    />
                                    <button
                                        type="button"
                                        className={styles.togglePassword}
                                        onClick={() =>
                                            setShowPasswords((prev) => ({
                                                ...prev,
                                                current: !prev.current,
                                            }))
                                        }
                                        tabIndex={-1}
                                    >
                                        {showPasswords.current ? (
                                            <EyeOff size={18} />
                                        ) : (
                                            <Eye size={18} />
                                        )}
                                    </button>
                                </div>
                                {errors.currentPassword && (
                                    <span className={styles.errorText}>
                                        {errors.currentPassword}
                                    </span>
                                )}
                            </div>

                            {/* New Password */}
                            <div className={styles.formGroup}>
                                <label className={styles.label}>New Password</label>
                                <div className={styles.passwordInputWrapper}>
                                    <input
                                        type={showPasswords.new ? "text" : "password"}
                                        name="newPassword"
                                        value={formData.newPassword}
                                        onChange={handleInputChange}
                                        className={`${styles.input} ${errors.newPassword ? styles.inputError : ""
                                            }`}
                                        placeholder="Enter a new password"
                                        disabled={loading}
                                    />
                                    <button
                                        type="button"
                                        className={styles.togglePassword}
                                        onClick={() =>
                                            setShowPasswords((prev) => ({
                                                ...prev,
                                                new: !prev.new,
                                            }))
                                        }
                                        tabIndex={-1}
                                    >
                                        {showPasswords.new ? (
                                            <EyeOff size={18} />
                                        ) : (
                                            <Eye size={18} />
                                        )}
                                    </button>
                                </div>

                                {/* Password Strength Indicator */}
                                {formData.newPassword && (
                                    <div className={styles.strengthContainer}>
                                        <div className={styles.strengthBar}>
                                            <div
                                                className={styles.strengthFill}
                                                style={{
                                                    width: `${(passwordStrength / 4) * 100}%`,
                                                    backgroundColor: getPasswordStrengthColor(),
                                                }}
                                            />
                                        </div>
                                        <span
                                            className={styles.strengthLabel}
                                            style={{ color: getPasswordStrengthColor() }}
                                        >
                                            {getPasswordStrengthLabel()}
                                        </span>
                                    </div>
                                )}

                                {errors.newPassword && (
                                    <span className={styles.errorText}>{errors.newPassword}</span>
                                )}

                                <div className={styles.passwordRequirements}>
                                    <p className={styles.requirementsTitle}>Password must have:</p>
                                    <ul className={styles.requirementsList}>
                                        <li
                                            className={
                                                formData.newPassword.length >= 8
                                                    ? styles.requirementMet
                                                    : ""
                                            }
                                        >
                                            <i className="bi bi-check-circle"></i>
                                            At least 8 characters
                                        </li>
                                        <li
                                            className={
                                                /[a-z]/.test(formData.newPassword) &&
                                                    /[A-Z]/.test(formData.newPassword)
                                                    ? styles.requirementMet
                                                    : ""
                                            }
                                        >
                                            <i className="bi bi-check-circle"></i>
                                            Mix of uppercase & lowercase letters
                                        </li>
                                        <li
                                            className={
                                                /\d/.test(formData.newPassword) &&
                                                    /[!@#$%^&*]/.test(formData.newPassword)
                                                    ? styles.requirementMet
                                                    : ""
                                            }
                                        >
                                            <i className="bi bi-check-circle"></i>
                                            Numbers and special characters
                                        </li>
                                    </ul>
                                </div>
                            </div>

                            {/* Confirm Password */}
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Confirm New Password</label>
                                <div className={styles.passwordInputWrapper}>
                                    <input
                                        type={showPasswords.confirm ? "text" : "password"}
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleInputChange}
                                        className={`${styles.input} ${errors.confirmPassword ? styles.inputError : ""
                                            }`}
                                        placeholder="Re-enter your new password"
                                        disabled={loading}
                                    />
                                    <button
                                        type="button"
                                        className={styles.togglePassword}
                                        onClick={() =>
                                            setShowPasswords((prev) => ({
                                                ...prev,
                                                confirm: !prev.confirm,
                                            }))
                                        }
                                        tabIndex={-1}
                                    >
                                        {showPasswords.confirm ? (
                                            <EyeOff size={18} />
                                        ) : (
                                            <Eye size={18} />
                                        )}
                                    </button>
                                </div>
                                {errors.confirmPassword && (
                                    <span className={styles.errorText}>
                                        {errors.confirmPassword}
                                    </span>
                                )}
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={loading}
                                className={styles.changePasswordButton}
                            >
                                {loading ? (
                                    <>
                                        <i className="bi bi-hourglass-split"></i>
                                        Updating...
                                    </>
                                ) : (
                                    <>
                                        <i className="bi bi-check-circle"></i>
                                        Change Password
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Security Info Section */}
                <div className={styles.section}>
                    <h3 className={styles.sectionTitle}>
                        <i className="bi bi-info-circle"></i>
                        Security Information
                    </h3>

                    <div className={styles.securityCardWrapper}>
                        <div className={styles.securityCard}>
                            <div className={styles.securityItem}>
                                <i className="bi bi-key"></i>
                                <div className={styles.securityContent}>
                                    <span className={styles.securityLabel}>Strong Passwords</span>
                                    <span className={styles.securityDescription}>
                                        Use unique, strong passwords to protect your account
                                    </span>
                                </div>
                            </div>

                            <div className={styles.securityItem}>
                                <i className="bi bi-shield-check"></i>
                                <div className={styles.securityContent}>
                                    <span className={styles.securityLabel}>Regular Updates</span>
                                    <span className={styles.securityDescription}>
                                        Change your password regularly for better security
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuthTab;