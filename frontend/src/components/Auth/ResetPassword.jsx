import React, { useState } from "react";

import axios from "axios";
let apiUrl = import.meta.env.VITE_API_URL;
let userRoute = import.meta.env.VITE_API_USER_ROUTE;
import toast from "react-hot-toast";
import { useParams, useNavigate } from "react-router-dom";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { token } = useParams();

  const handleSubmit = (e) => {
    e.preventDefault();

    // Check if both passwords match
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (password.length < 5) {
      setError("Password must be at least 5 characters long");
      return;
    }

    setError("");
    console.log("Passwords match. Proceed with reset.");

    try {
      // send password as newPassword
      // token from url

      console.log("Reset password token: ", token);
      let link = `${apiUrl}${userRoute}/reset-password/${token}`;
      axios
        .post(link, { newPassword: password })
        .then((response) => {

          toast.success(response.data.message || "Password reset successfully!");
          navigate("/login");
        })
        .catch((error) => {

          toast.error(error.response?.data?.message || error.message || "Failed to reset password. Please try again.");
        });


    } catch (error) {
      console.error("Error in reset password: ", error.response?.data || error.message || "An error occurred while resetting the password.");

    }


  };

  return (
    <main className="p-6 lg:p-18 gap-8 bg-gray-50 overflow-hidden flex justify-around">
      {/* Left-side */}
      <div className="flex flex-col p-4 md:p-16 pb-0 gap-6 bg-gray-100">
        <h1 className="text-3xl sm:text-4xl font-bold">Set a Password</h1>
        <p>
          Please set a new password for your account. Make sure to choose a
          strong password.
        </p>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col justify-center gap-2 w-full sm:w-[60%]"
        >
          <input
            className="p-1 w-full px-4 py-3 bg-gray-200 border border-gray-200 rounded-lg
                       focus:ring-2 focus:ring-blue-200 focus:border-blue-400
                       outline-none transition"
            type="password"
            placeholder="New Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <input
            className="p-1 w-full px-4 py-3 bg-gray-200 border border-gray-200 rounded-lg
                       focus:ring-2 focus:ring-blue-200 focus:border-blue-400
                       outline-none transition"
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />

          {error && <p className="text-red-500 text-sm mt-1">{error}</p>}

          <button
            type="submit"
            className="w-full bg-blue-600 text-white font-semibold py-3 px-4 
                       rounded-lg hover:bg-blue-700 active:bg-blue-800
                       transition duration-200 transform hover:scale-[1.02]
                       focus:ring-4 focus:ring-blue-200 mt-4 cursor-pointer"
          >
            Reset Password
          </button>
        </form>
      </div>

      {/* Right-side */}
      <div className="hidden lg:block">
        <img
          src="/assets/forget-password.png"
          alt="Forget Password Illustration"
        />
      </div>
    </main>
  );
};

export default ResetPassword;
