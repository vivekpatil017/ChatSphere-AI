import React, { useState, useContext} from "react";
import AuthCard from "../components/AuthCard";
import NeonInput from "../components/NeonInput";
import NeonButton from "../components/NeonButton";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { UserDataContext } from "../context/User.context";

const Register = () => {
  const { setUser } = useContext(UserDataContext);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { email, password } = formData; 
    console.log(email);
    console.log(password);

    try{

    const response = await axios.post("http://localhost:3000/user/register", {
      email,
      password,
    }, {
      withCredentials: true,
    })
    console.log("Registration page response: ", response.data);
    localStorage.setItem("token", response.data.token);
    setUser(response.data.user);
    
    navigate("/login");
    }

    catch(error){
      console.log("Registration page error: ", error);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0B0B] flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -right-[10%] w-[50%] h-[50%] bg-purple-600/10 rounded-full blur-[120px]"></div>
        <div className="absolute -bottom-[20%] -left-[10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[120px]"></div>
      </div>

      <AuthCard title="Join Now" subtitle="Start your journey with us today">
        <form onSubmit={handleSubmit} className="space-y-4">
          <NeonInput
            label="Email Address"
            type="email"
            name="email"
            placeholder="name@example.com"
            value={formData.email}
            onChange={handleChange}
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.206" />
              </svg>
            }
          />
          <NeonInput
            label="Password"
            type="password"
            name="password"
            placeholder="••••••••"
            value={formData.password}
            onChange={handleChange}
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            }
          />

          <NeonButton type="submit" className="mt-8">Sign Up</NeonButton>

          <p className="text-center text-sm text-gray-500 mt-8">
            Already have an account?{" "}
            <Link to="/login" className="text-cyan-400 font-bold hover:underline underline-offset-4">
              Log In
            </Link>
          </p>
        </form>
      </AuthCard>
    </div>
  );
};

export default Register;
