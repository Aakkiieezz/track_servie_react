import React, { useState } from "react";
import axiosInstance from "../../utils/axiosInstance";
import { useNavigate } from "react-router-dom";
import { useAlert } from "../../contexts/AlertContext";
import "bootstrap-icons/font/bootstrap-icons.css";
import styles from "./AuthPage.module.css";

const ForgotPasswordPage: React.FC = () => {
    const [email, setEmail] = useState<string>("");
    const [submitting, setSubmitting] = useState<boolean>(false);
    const [submitted, setSubmitted] = useState<boolean>(false);

    const { setAlert } = useAlert();
    const navigate = useNavigate();

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        if (!email.trim()) {
            setAlert({
                type: "warning",
                message: "Please enter your email address",
            });
            return;
        }

        try {
            setSubmitting(true);

            const response = await axiosInstance.post("password/forgot", {
                email,
            });

            setAlert({
                type: "success",
                message: response.data,
            });

            setSubmitted(true);
        } catch (error) {
            console.error("Forgot password request failed:", error);

            setAlert({
                type: "danger",
                message: "Something went wrong. Please try again.",
            });
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

                {/* Forgot Password Card */}
                <section className={styles.authCard}>

                    <div className={styles.cardHeader}>
                        <div className={styles.authIcon}>
                            <i className="bi bi-key" />
                        </div>

                        <h1>Forgot your password?</h1>

                        <p>
                            {!submitted
                                ? "Enter the email address linked to your account and we'll send you a link to reset your password."
                                : "If an account with that email exists and is verified, a reset link has been sent. Please check your inbox."}
                        </p>
                    </div>

                    {!submitted ? (
                        <form
                            onSubmit={handleSubmit}
                            className={styles.form}
                        >
                            <div className={styles.field}>
                                <label htmlFor="email">Email</label>

                                <div className={styles.inputWrapper}>
                                    <i className="bi bi-envelope" />

                                    <input
                                        id="email"
                                        type="email"
                                        placeholder="Enter your email"
                                        value={email}
                                        onChange={(e) =>
                                            setEmail(e.target.value)
                                        }
                                        autoComplete="email"
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
                                        ? "Sending..."
                                        : "Send Reset Link"}
                                </span>

                                <i
                                    className={`bi ${
                                        submitting
                                            ? "bi-hourglass-split"
                                            : "bi-arrow-right"
                                    }`}
                                />
                            </button>
                        </form>
                    ) : (
                        <div className={styles.successMessage}>
                            <div className={styles.successIcon}>
                                <i className="bi bi-envelope-check" />
                            </div>

                            <span>
                                Check your inbox for the password reset link.
                            </span>
                        </div>
                    )}

                    {/* Back to Login */}
                    <div className={styles.switchAuth}>
                        <button
                            type="button"
                            onClick={() => navigate("/login")}
                        >
                            <i className="bi bi-arrow-left" />
                            <span>Back to Login</span>
                        </button>
                    </div>
                </section>

                <div className={styles.footerText}>
                    Track your movies. Discover something new.
                </div>
            </div>
        </main>
    );
};

export default ForgotPasswordPage;