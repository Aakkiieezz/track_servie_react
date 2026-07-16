import React, { useEffect, useState } from "react";
import axiosInstance from "../utils/axiosInstance";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAlert } from "../contexts/AlertContext";
import "bootstrap/dist/css/bootstrap.min.css";

type ValidationState = "checking" | "valid" | "invalid";

const ResetPasswordPage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token") || "";

    const [validationState, setValidationState] = useState<ValidationState>("checking");
    const [newPassword, setNewPassword] = useState<string>("");
    const [confirmPassword, setConfirmPassword] = useState<string>("");
    const [submitting, setSubmitting] = useState<boolean>(false);

    const { setAlert } = useAlert();
    const navigate = useNavigate();

    // Validate token on page load — avoids showing the form for a dead link
    useEffect(() => {
        const validateToken = async () => {
            if (!token) {
                setValidationState("invalid");
                return;
            }

            try {
                const response = await axiosInstance.get<{ valid: boolean }>("password/reset/validate",
                    { params: { token } }
                );
                setValidationState(response.data.valid ? "valid" : "invalid");
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
            setAlert({ type: "warning", message: "Password must be at least 8 characters" });
            return;
        }
        if (newPassword !== confirmPassword) {
            setAlert({ type: "warning", message: "Passwords do not match !!" });
            return;
        }
        
        try {
            setSubmitting(true);
            const response = await axiosInstance.post<{ token: string }>("password/reset", {
                token,
                newPassword,
            });
            
            // Auto-login — store the JWT returned by backend, same as normal login flow
            localStorage.setItem("token", response.data.token);

            setAlert({ type: "success", message: "Password reset successful. You're now logged in!" });
            navigate("/");
        } catch (error: any) {
            console.error("Password reset failed:", error);
            const data = error.response?.data;
            if (data && typeof data === "object") {
                const firstMessage = Object.values(data)[0] as string;
                setAlert({ type: "danger", message: firstMessage });
            } else
                setAlert({ type: "danger", message: "Failed to reset password. The link may have expired." });
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

                {validationState === "checking" && (
                    <p className="text-muted">Checking your reset link...</p>
                )}

                {validationState === "invalid" && (
                    <>
                        <h4 className="mb-3">This link has expired or is invalid</h4>
                        <p className="text-muted mb-4">
                            Please request a new password reset link.
                        </p>
                        <div className="d-grid gap-2 mb-3">
                            <button
                                className="btn btn-primary"
                                onClick={() => navigate("/forgot-password")}
                            >
                                Request New Link
                            </button>
                        </div>
                    </>
                )}

                {validationState === "valid" && (
                    <>
                        <h4 className="mb-3">Reset your password</h4>

                        <form onSubmit={handleSubmit}>
                            <div className="form-group mb-3">
                                <input
                                    type="password"
                                    className="form-control"
                                    placeholder="New Password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                />
                            </div>

                            <div className="form-group mb-3">
                                <input
                                    type="password"
                                    className="form-control"
                                    placeholder="Confirm New Password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                />
                            </div>

                            <div className="d-grid gap-2 mb-3">
                                <button type="submit" className="btn btn-primary" disabled={submitting}>
                                    {submitting ? "Resetting..." : "Reset Password"}
                                </button>
                            </div>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
};

export default ResetPasswordPage;