import React from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import toast from "react-hot-toast";
let apiUrl = import.meta.env.VITE_API_URL;
let userRoute = import.meta.env.VITE_API_USER_ROUTE;
const Forget = () => {

  const { register, handleSubmit } = useForm();

  const onSubmit = (data) => {
    console.log("Forget password data: ", data);
    // Handle password reset logic here (e.g., send reset email)

    try {
      let link = `${apiUrl}${userRoute}/forgot-password`;
      axios.post(link, data)
        .then((response) => {
          console.log("Forget password response: ", response.data);
          toast.success(response.data.message || "Password reset email sent successfully!");
        })
        .catch((error) => {
          console.error("Error in forget password: ", error.response?.data || error.message || "An error occurred while sending the password reset email.");
          toast.error(error.response?.data?.message || error.message || "Failed to send password reset email. Please try again.");
        });

    } catch (error) {
      console.log("-- ");

    }



  };

  return (
    <main className="px-3 py-8 lg:p-18 gap-8 bg-gray-50 overflow-hidden flex justify-around">
      {/* Left-side */}
      <div className="w-full lg:w-1/2 flex flex-col p-6 lg:p-16 pb-0 gap-6 bg-gray-100">
        <a href="/">
          <button className="px-4 py-2 rounded-lg text-blue-600 hover:bg-blue-100 hover:text-blue-800 font-semibold transition-all duration-300 shadow-sm hover:shadow-md w-fit cursor-pointer">
            <span className="font-extrabold pt-2">&lt;</span> Back to Login
          </button>
        </a>

        <h1 className="text-2xl md:text-3xl font-bold">Forgotten Password?</h1>
        <p>
          Don't worry, happens to all of us. Enter your email address below to
          recover your password
        </p>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col justify-center gap-2 md:w-[60%]">
          <input
            className="p-1 w-full px-4 py-3 bg-gray-200 border border-gray-200 rounded-lg
                         focus:ring-2 focus:ring-blue-200 focus:border-blue-400
                         outline-none transition"
            type="email"
            placeholder="john@example.com"
            required
            {...register("email", { required: "Email is required" })}
          />
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
      <div className="hidden lg:block w-1/2">
        <img
          src="./assets/forget-password.png"
          alt="Forget Password Illustration"
        />
      </div>
    </main>
  );
};

export default Forget;
