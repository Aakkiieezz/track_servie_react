import React, { useEffect, useState } from "react";
import axiosInstance from "../../utils/axiosInstance";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAlert } from "../../contexts/AlertContext";
import "bootstrap-icons/font/bootstrap-icons.css";
import styles from "./AuthPage.module.css";

type ValidationState = "checking" | "valid" | "invalid";

const ResetPasswordPage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token") || "";

    const [validationState, setValidationState] =
        useState<ValidationState>("checking");

    const [newPassword, setNewPassword] = useState<string>("");
    const [confirmPassword, setConfirmPassword] = useState<string>("");
    const [submitting, setSubmitting] = useState<boolean>(false);

    const { setAlert } = useAlert();
    const navigate = useNavigate();

    useEffect(() => {
        const validateToken = async () => {
            if (!token) {
                setValidationState("invalid");
                return;
            }

            try {
                const response = await axiosInstance.get<{ valid: boolean }>(
                    "password/reset/validate",
                    { params: { token } }
                );

                setValidationState(
                    response.data.valid ? "valid" : "invalid"
                );
            } catch (error) {
                console.error("Token validation failed:", error);
                setValidationState("invalid");
            }
        };

        validateToken();
    }, [token]);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        if (newPassword.length < 8) {
            setAlert({
                type: "warning",
                message: "Password must be at least 8 characters",
            });
            return;
        }

        if (newPassword !== confirmPassword) {
            setAlert({
                type: "warning",
                message: "Passwords do not match !!",
            });
            return;
        }

        try {
            setSubmitting(true);

            const response = await axiosInstance.post<{ token: string }>(
                "password/reset",
                {
                    token,
                    newPassword,
                }
            );

            // Auto-login after successful password reset
            localStorage.setItem("token", response.data.token);

            setAlert({
                type: "success",
                message: "Password reset successful. You're now logged in!",
            });

            navigate("/");
        } catch (error: any) {
            console.error("Password reset failed:", error);

            const data = error.response?.data;

            if (data && typeof data === "object") {
                const firstMessage = Object.values(data)[0] as string;

                setAlert({
                    type: "danger",
                    message: firstMessage,
                });
            } else {
                setAlert({
                    type: "danger",
                    message:
                        "Failed to reset password. The link may have expired.",
                });
            }
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <main className={styles.authPage}>
            <div className={styles.authContent}>

                {/* Logo */}
                <div className={styles.logoWrapper}>
                    <img
                        src="/logo.png"
                        alt="TrackServie"
                        className={styles.logo}
                    />
                </div>

                <section className={styles.authCard}>

                    {/* Checking */}
                    {validationState === "checking" && (
                        <div className={styles.authState}>
                            <div className={styles.stateIcon}>
                                <i className="bi bi-shield-check" />
                            </div>

                            <h1>Checking your reset link</h1>

                            <p>
                                Please wait while we verify your password
                                reset link.
                            </p>

                            <div className={styles.spinner} />
                        </div>
                    )}

                    {/* Invalid */}
                    {validationState === "invalid" && (
                        <div className={styles.authState}>
                            <div className={styles.stateIcon}>
                                <i className="bi bi-link-45deg" />
                            </div>

                            <h1>
                                This link is invalid or expired
                            </h1>

                            <p>
                                Please request a new password reset link to
                                continue.
                            </p>

                            <button
                                type="button"
                                className={styles.primaryButton}
                                onClick={() =>
                                    navigate("/forgot-password")
                                }
                            >
                                <span>Request New Link</span>
                                <i className="bi bi-arrow-right" />
                            </button>

                            <div className={styles.switchAuth}>
                                <button
                                    type="button"
                                    onClick={() => navigate("/login")}
                                >
                                    <i className="bi bi-arrow-left" />
                                    <span>Back to Login</span>
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Valid */}
                    {validationState === "valid" && (
                        <>
                            <div className={styles.cardHeader}>
                                <div className={styles.authIcon}>
                                    <i className="bi bi-shield-lock" />
                                </div>

                                <h1>Reset your password</h1>

                                <p>
                                    Choose a new password for your TrackServie
                                    account.
                                </p>
                            </div>

                            <form
                                onSubmit={handleSubmit}
                                className={styles.form}
                            >
                                {/* New password */}
                                <div className={styles.field}>
                                    <label htmlFor="newPassword">
                                        New Password
                                    </label>

                                    <div className={styles.inputWrapper}>
                                        <i className="bi bi-lock" />

                                        <input
                                            id="newPassword"
                                            type="password"
                                            placeholder="Enter your new password"
                                            value={newPassword}
                                            onChange={(e) =>
                                                setNewPassword(e.target.value)
                                            }
                                            autoComplete="new-password"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Confirm password */}
                                <div className={styles.field}>
                                    <label htmlFor="confirmPassword">
                                        Confirm Password
                                    </label>

                                    <div className={styles.inputWrapper}>
                                        <i className="bi bi-lock-fill" />

                                        <input
                                            id="confirmPassword"
                                            type="password"
                                            placeholder="Confirm your new password"
                                            value={confirmPassword}
                                            onChange={(e) =>
                                                setConfirmPassword(
                                                    e.target.value
                                                )
                                            }
                                            autoComplete="new-password"
                                            required
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    className={styles.primaryButton}
                                    disabled={submitting}
                                >
                                    <span>
                                        {submitting
                                            ? "Resetting..."
                                            : "Reset Password"}
                                    </span>

                                    <i
                                        className={`bi ${
                                            submitting
                                                ? "bi-hourglass-split"
                                                : "bi-check-lg"
                                        }`}
                                    />
                                </button>
                            </form>

                            <div className={styles.switchAuth}>
                                <button
                                    type="button"
                                    onClick={() => navigate("/login")}
                                >
                                    <i className="bi bi-arrow-left" />
                                    <span>Back to Login</span>
                                </button>
                            </div>
                        </>
                    )}
                </section>

                <div className={styles.footerText}>
                    Track your movies. Discover something new.
                </div>
            </div>
        </main>
    );
};

export default ResetPasswordPage;