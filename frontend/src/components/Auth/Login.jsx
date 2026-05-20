import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { loginUser } from "../../feature/user/userSlice";
import { Link, useNavigate } from "react-router-dom";
import Loader from "../utilities/Loader";
import { toast } from "react-hot-toast";


const Login = () => {

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, isAuthenticated, user } = useSelector((state) => state.user);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = (data) => {
    dispatch(loginUser(data))
      .unwrap()
      .then((res) => {

        if (res?.data?.roleUser === "teamLead") {
          navigate("/teamLead/dashboard");
        } else if (res?.data?.roleUser === "admin") {
          navigate("/admin/dashboard");
        }
        else if (res?.data?.roleUser === "cityManager") {
          navigate("/cityManager/dashboard");
        }
        else {
          navigate("/");
        }
        toast.success(res?.message || "Login successful");
      })
      .catch((error) => {
        toast.error(error?.message || "Login failed");
      });
  };




  return (
    <main className="flex h-[calc(100vh-160px)] p-2 sm:p-11 gap-8">
      <Loader isOpen={loading} />
      {/* Left side */}
      <div className="w-full md:w-1/2 flex items-center justify-center">
        <div className="w-full max-w-md p-8 sm:border-4 rounded-2xl">
          <h1 className="text-4xl font-bold mb-6 text-gray-950">Login</h1>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-4 mb-5"
          >
            <label
              className="text-sm font-medium text-gray-700"
              htmlFor="email"
            >
              Email
            </label>
            <input
              required
              id="email"
              type="email"
              className="w-full p-2 bg-gray-200"
              placeholder="john@example.com"
              {...register("email", { required: "Email is required" })}
            />
            {errors.email && (
              <p className="text-red-500 text-sm">{errors.email.message}</p>
            )}

            <label
              className="text-sm font-medium text-gray-700"
              htmlFor="password"
            >
              Password
            </label>
            <input
              required
              id="password"
              type="password"
              placeholder="••••••••"
              className="w-full p-2 bg-gray-200"
              {...register("passwordHash", { required: "Password is required" })}
            />
            {errors.passwordHash && (
              <p className="text-red-500 text-sm">{errors.passwordHash.message}</p>
            )}

            <button className="text-red-500 text-left cursor-pointer">
              <Link to="/forget-password">Forgot Password?</Link>
            </button>

            <button
              type="submit"
              className="w-full bg-blue-700 text-white font-bold py-2 rounded-sm cursor-pointer"
            >
              Login
            </button>
          </form>
          <span>
            Don't have an account?{" "}
            <Link to="/signup" className="text-red-500 cursor-pointer">
              Sign up
            </Link>
          </span>
        </div>
      </div>

      {/* Right side */}
      <div className="hidden w-1/2 h-full md:flex items-center justify-center">
        <div className="w-[80%] h-[80%]">
          <img
            src="/assets/login-image.png"
            alt="Login"
            className="w-full h-full object-cover rounded-2xl"
          />
        </div>
      </div>
    </main>
  );
};

export default Login;
