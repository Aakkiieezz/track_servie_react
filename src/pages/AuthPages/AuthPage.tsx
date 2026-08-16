import React, { useState } from "react";
import axiosInstance from "../../utils/axiosInstance";
import { useNavigate } from "react-router-dom";
import { useAlert } from "../../contexts/AlertContext";
import "bootstrap-icons/font/bootstrap-icons.css";
import styles from "./AuthPage.module.css";

const AuthPage: React.FC = () => {
    const [username, setUsername] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [confirmPassword, setConfirmPassword] = useState<string>("");
    const [email, setEmail] = useState<string>("");
    const [isRegister, setIsRegister] = useState<boolean>(false);
    const { setAlert } = useAlert();
    const navigate = useNavigate();

    const handleGoogleSignIn = () => {
        window.location.href = `${import.meta.env.VITE_API_BASE_URL}/oauth2/authorization/google`;
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        if (isRegister) {
            if (password !== confirmPassword) {
                setAlert({ type: "warning", message: "Passwords do not match !!" });
                return;
            }

            try {
                const response = await axiosInstance.post("auth/register",
                    { username, password, email },
                );
                if (response.status === 200) {
                    setIsRegister(false);
                    setAlert({
                        type: "success",
                        message: "Registration Successful !!",
                    });
                } else {
                    setAlert({
                        type: "warning",
                        message: `${response.status} : ${response.data}`,
                    });
                }
            } catch (error) {
                setAlert({ type: "danger", message: "Registration failed !!" });
            }
        } else {
            try {
                const response = await axiosInstance.post("auth/login", {
                    username,
                    password,
                });

                if (response.status === 200) {
                    localStorage.setItem("token", response.data.token);
                    localStorage.setItem("userId", String(response.data.userId));
                    localStorage.setItem("username", response.data.username);
                    localStorage.setItem("profileImgUrl", `${import.meta.env.VITE_API_BASE_URL}/${response.data.profileImgUrl}`);
                    setAlert({ type: "success", message: "Logged in Successfully !!" });
                    navigate("/");
                } else {
                    setAlert({
                        type: "warning",
                        message: `${response.status} : ${response.data}`,
                    });
                }
            } catch (error) {
                setAlert({
                    type: "danger",
                    message: "Login failed !!",
                });
            }
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

                {/* Authentication Card */}
                <section className={styles.authCard}>
                    <div className={styles.cardHeader}>
                        <h1>
                            {isRegister ? "Create your account" : "Welcome back"}
                        </h1>

                        <p>
                            {isRegister
                                ? "Join TrackServie and start tracking your movies and series."
                                : "Sign in to continue to TrackServie."}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className={styles.form}>

                        {/* Username */}
                        <div className={styles.field}>
                            <label htmlFor="username">Username</label>

                            <div className={styles.inputWrapper}>
                                <i className="bi bi-person" />

                                <input
                                    id="username"
                                    type="text"
                                    placeholder="Enter your username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    autoComplete="username"
                                    required
                                />
                            </div>
                        </div>

                        {/* Email */}
                        {isRegister && (
                            <div className={styles.field}>
                                <label htmlFor="email">Email</label>

                                <div className={styles.inputWrapper}>
                                    <i className="bi bi-envelope" />

                                    <input
                                        id="email"
                                        type="email"
                                        placeholder="Enter your email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        autoComplete="email"
                                        required
                                    />
                                </div>
                            </div>
                        )}

                        {/* Password */}
                        <div className={styles.field}>
                            <label htmlFor="password">Password</label>

                            <div className={styles.inputWrapper}>
                                <i className="bi bi-lock" />

                                <input
                                    id="password"
                                    type="password"
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    autoComplete={
                                        isRegister ? "new-password" : "current-password"
                                    }
                                    required
                                />
                            </div>
                        </div>

                        {/* Confirm Password */}
                        {isRegister && (
                            <div className={styles.field}>
                                <label htmlFor="confirmPassword">
                                    Confirm Password
                                </label>

                                <div className={styles.inputWrapper}>
                                    <i className="bi bi-lock-fill" />

                                    <input
                                        id="confirmPassword"
                                        type="password"
                                        placeholder="Confirm your password"
                                        value={confirmPassword}
                                        onChange={(e) =>
                                            setConfirmPassword(e.target.value)
                                        }
                                        autoComplete="new-password"
                                        required
                                    />
                                </div>
                            </div>
                        )}

                        {/* Forgot password */}
                        {!isRegister && (
                            <div className={styles.forgotPassword}>
                                <button
                                    type="button"
                                    onClick={() => navigate("/forgot-password")}
                                >
                                    Forgot password?
                                </button>
                            </div>
                        )}

                        {/* Primary action */}
                        <button type="submit" className={styles.primaryButton}>
                            <span>{isRegister ? "Create Account" : "Login"}</span>
                            <i
                                className={`bi ${isRegister
                                    ? "bi-person-plus"
                                    : "bi-arrow-right"
                                    }`}
                            />
                        </button>
                    </form>

                    {/* Google login */}
                    {!isRegister && (
                        <>
                            <div className={styles.divider}>
                                <span>or</span>
                            </div>

                            <button
                                type="button"
                                className={styles.googleButton}
                                onClick={handleGoogleSignIn}
                            >
                                <img
                                    src="/google-logo.jpg"
                                    alt=""
                                />

                                <span>Continue with Google</span>
                            </button>
                        </>
                    )}

                    {/* Register / Login switch */}
                    <div className={styles.switchAuth}>
                        <span>
                            {isRegister
                                ? "Already have an account?"
                                : "Don't have an account?"}
                        </span>

                        <button
                            type="button"
                            onClick={() => setIsRegister((prev) => !prev)}
                        >
                            {isRegister ? "Login" : "Register"}
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

export default AuthPage;