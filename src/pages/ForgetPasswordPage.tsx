import React, { useState } from "react";
import axiosInstance from "../utils/axiosInstance";
import { useNavigate } from "react-router-dom";
import { useAlert } from "../contexts/AlertContext";
import "bootstrap/dist/css/bootstrap.min.css";

const ForgotPasswordPage: React.FC = () => {
    const [email, setEmail] = useState<string>("");
    const [submitting, setSubmitting] = useState<boolean>(false);
    const [submitted, setSubmitted] = useState<boolean>(false);
    const { setAlert } = useAlert();
    const navigate = useNavigate();

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        if (!email.trim()) {
            setAlert({ type: "warning", message: "Please enter your email address" });
            return;
        }
        try {
            setSubmitting(true);
            const response = await axiosInstance.post("password/forgot", { email });
            setAlert({ type: "success", message: response.data });
            setSubmitted(true);
        } catch (error) {
            console.error("Forgot password request failed:", error);
            setAlert({ type: "danger", message: "Something went wrong. Please try again." });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="container d-flex justify-content-center align-items-center vh-100">
            <div className="col-md-4 col-sm-8 col-xs-10 text-center">
                <img
                    src="src/assets/logo.png"
                    alt="Application Logo"
                    className="mb-4"
                    style={{ width: "100%", maxWidth: "500px" }}
                />

                <h4 className="mb-3">Forgot your password?</h4>

                {!submitted ? (
                    <>
                        <p className="text-muted mb-4">
                            Enter the email address linked to your account, and we'll send you a link to reset your password.
                        </p>

                        <form onSubmit={handleSubmit}>
                            <div className="form-group mb-3">
                                <input
                                    type="email"
                                    className="form-control"
                                    placeholder="Email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>

                            <div className="d-grid gap-2 mb-3">
                                <button type="submit" className="btn btn-primary" disabled={submitting}>
                                    {submitting ? "Sending..." : "Send Reset Link"}
                                </button>
                            </div>
                        </form>
                    </>
                ) : (
                    <p className="text-muted mb-4">
                        If an account with that email exists and is verified, a reset link has been sent.
                        Please check your inbox.
                    </p>
                )}

                <div className="text-center">
                    <p>
                        <a
                            href="#"
                            onClick={(e) => {
                                e.preventDefault();
                                navigate("/login");
                            }}
                        >
                            Back to Login
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ForgotPasswordPage;