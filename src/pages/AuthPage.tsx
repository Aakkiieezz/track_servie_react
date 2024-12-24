import React, { useState } from "react";
import axios from "axios";
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

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        if (isRegister) {
            if (password !== confirmPassword) {
                setAlert({ type: "warning", message: "Passwords do not match !!" });
                return;
            }

            try {
                const response = await axios.post(
                    "http://localhost:8080/track-servie/auth/register",
                    { username, password, email },
                    {
                        headers: {
                            "Content-Type": "application/json",
                        },
                    }
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
                const response = await axios.post(
                    "http://localhost:8080/track-servie/auth/login",
                    { username, password },
                    {
                        headers: {
                            "Content-Type": "application/json",
                        },
                    }
                );
                if (response.status === 200) {
                    localStorage.setItem("token", response.data.token);
                    localStorage.setItem("username", response.data.username);
                    localStorage.setItem("profileImgUrl", "http://localhost:8080/" + response.data.profileImgUrl);
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
                    <h2 className="text-center mb-4">{isRegister ? "Register" : "Login"}</h2>
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
