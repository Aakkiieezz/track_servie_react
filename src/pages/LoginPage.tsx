import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

const Login: React.FC = () => {
 const [username, setUsername] = useState<string>("");
 const [password, setPassword] = useState<string>("");
 const navigate = useNavigate();

 const handleSubmit = async (event: React.FormEvent) => {
  event.preventDefault();
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

   const token = response.data;
   localStorage.setItem("token", token); // Store token in localStorage
   navigate("/"); // Redirect to home page after successful login
  } catch (error) {
   console.error("Login failed", error);
  }
 };

 return (
  <div className="container d-flex justify-content-center align-items-center vh-100">
   <div className="col-md-4 col-sm-8 col-xs-10 text-center">
    <img
     src="/logo.png"
     alt="Application Logo"
     className="mb-4"
     style={{ width: "100%", maxWidth: "500px" }} // Ensure it's responsive
    />
    <h2 className="text-center mb-4">Login</h2>
    <form onSubmit={handleSubmit}>
     <div className="form-group mb-3">
      <input
       type="text"
       className="form-control"
       placeholder="Username"
       value={username}
       onChange={(e) => setUsername(e.target.value)}
      />
     </div>
     <div className="form-group mb-3">
      <input
       type="password"
       className="form-control"
       placeholder="Password"
       value={password}
       onChange={(e) => setPassword(e.target.value)}
      />
     </div>
     <div className="d-grid gap-2 mb-3">
      <button type="submit" className="btn btn-primary">
       Login
      </button>
     </div>
    </form>
    <div className="text-center">
     <p>
      Don't have an account?{" "}
      <a href="#" onClick={() => navigate("/register")}>
       Register here
      </a>
     </p>
    </div>
   </div>
  </div>
 );
};

export default Login;
