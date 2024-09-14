import React, { useState } from "react";
import axios from "axios";

const Register: React.FC = () => {
 const [email, setEmail] = useState<string>("");
 const [password, setPassword] = useState<string>("");
 const [confirmPassword, setConfirmPassword] = useState<string>("");

 const handleSubmit = async (event: React.FormEvent) => {
  event.preventDefault();
  if (password !== confirmPassword) {
   alert("Passwords do not match");
   return;
  }

  try {
   await axios.post("/api/auth/register", { email, password });
   alert("Registration successful, you can now log in.");
  } catch (error) {
   console.error("Registration failed", error);
  }
 };

 return (
  <div>
   <h2>Register</h2>
   <form onSubmit={handleSubmit}>
    <div>
     <label>Email: </label>
     <input
      type="email"
      value={email}
      onChange={(e) => setEmail(e.target.value)}
     />
    </div>
    <div>
     <label>Password: </label>
     <input
      type="password"
      value={password}
      onChange={(e) => setPassword(e.target.value)}
     />
    </div>
    <div>
     <label>Confirm Password: </label>
     <input
      type="password"
      value={confirmPassword}
      onChange={(e) => setConfirmPassword(e.target.value)}
     />
    </div>
    <button type="submit">Register</button>
   </form>
  </div>
 );
};

export default Register;
