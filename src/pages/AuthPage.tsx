import React, { useState } from "react";
import axiosInstance from '../utils/axiosInstance';
import { useNavigate } from "react-router-dom";
import Alert from "../components/Alert";
import "bootstrap/dist/css/bootstrap.min.css";

const AuthPage: React.FC = () => {
    const [username, setUsername] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [confirmPassword, setConfirmPassword] = useState<string>("");
    const [email, setEmail] = useState<string>("");
    const [isRegister, setIsRegister] = useState<boolean>(false);
    const [alert, setAlert] = useState<{ type: string; message: string } | null>(null);
    const navigate = useNavigate();

    const handleGoogleSignIn = () => {
        window.location.href = "http://localhost:8080/track-servie/oauth2/authorization/google";
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        if (isRegister) {
            if (password !== confirmPassword) {
                setAlert({ type: "warning", message: "Passwords do not match !!" });
                return;
            }

            try {
                const response = await axiosInstance.post(
                    "auth/register",
                    { username, password, email },
                );
                if (response.status === 200) {
                    setIsRegister(false);
                    setAlert({ type: "success", message: "Registration Successful !!" });
                } else
                    setAlert({ type: "warning", message: `${response.status} : ${response.data}` });

            } catch (error) {
                setAlert({ type: "danger", message: "Registration failed !!" });
            }
        } else {
            try {
                const response = await axiosInstance.post(
                    "auth/login",
                    { username, password },
                );
                if (response.status === 200) {
                    localStorage.setItem("token", response.data.token);
                    localStorage.setItem("username", response.data.username);
                    console.log("Fetching profile img from : ", "http://localhost:8080/track-servie/" + response.data.profileImgUrl)
                    localStorage.setItem("profileImgUrl", "http://localhost:8080/track-servie/" + response.data.profileImgUrl);
                    setAlert({ type: "success", message: "Logged in Successfully !!" });
                    navigate("/");
                } else {
                    setAlert({ type: "warning", message: `${response.status} : ${response.data}` });
                }
            } catch (error) {
                setAlert({ type: "danger", message: "Login failed !!" });
            }
        }
    };

    return (
        <>
            <div className="container d-flex justify-content-center">
                {/* Alert Component */}
                {alert && (
                    <Alert
                        type={alert.type}
                        message={alert.message}
                        onClose={() => setAlert(null)}
                    />
                )}
            </div>
            <div className="container d-flex justify-content-center align-items-center vh-100">
                <div className="col-md-4 col-sm-8 col-xs-10 text-center">
                    <img
                        src="src/assets/logo.png"
                        alt="Application Logo"
                        className="mb-4"
                        style={{ width: "100%", maxWidth: "500px" }} // Ensure it's responsive
                    />
                    <form onSubmit={handleSubmit}>
                        {/* username */}
                        <div className="form-group mb-3">
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                            />
                        </div>

                        {/* email */}
                        {isRegister && (
                            <div className="form-group mb-3">
                                <input
                                    type="email"
                                    className="form-control"
                                    placeholder="Email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        )}

                        {/* password */}
                        <div className="form-group mb-3">
                            <input
                                type="password"
                                className="form-control"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>

                        {/* confirmPassword */}
                        {isRegister && (
                            <div className="form-group mb-3">
                                <input
                                    type="password"
                                    className="form-control"
                                    placeholder="Confirm Password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                />
                            </div>
                        )}

                        <div className="d-grid gap-2 mb-3">
                            <button type="submit" className="btn btn-primary">
                                {isRegister ? "Register" : "Login"}
                            </button>
                        </div>
                    </form>

                    {/* Google Login Button */}
                    {!isRegister && (
                        <div className="d-grid gap-2 mb-3">
                            <button className="btn btn-primary d-flex align-items-center justify-content-center position-relative"
                                onClick={handleGoogleSignIn}>
                                <img
                                    src="src/assets/google-logo.jpg"
                                    alt="Google Logo"
                                    // style={{ height: "90%", aspectRatio: "1 / 1", position: "absolute", left: "0", borderRadius: "4px" }} />
                                    style={{ height: "90%", aspectRatio: "1 / 1", position: "absolute", left: "2px", borderRadius: "4px" }} />
                                Login with Google
                            </button>
                        </div>
                    )}

                    <div className="text-center">
                        <p>
                            {isRegister ? "Already have an account?" : "Don't have an account?"}{" "}
                            <a href="#" onClick={() => setIsRegister((prev) => !prev)}>
                                {isRegister ? "Login here" : "Register here"}
                            </a>
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
};

export default AuthPage;
