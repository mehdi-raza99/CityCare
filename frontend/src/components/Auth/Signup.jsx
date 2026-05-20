import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { registerUser } from "../../feature/user/userSlice";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLocationDot } from "@fortawesome/free-solid-svg-icons";
import Loader from "../utilities/Loader";
import { toast } from "react-hot-toast";


const Signup = () => {

  const { register, handleSubmit, setValue, formState: { errors }, watch } = useForm();
  watch("password");
  let { error, loading, success, isAuthenticated } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [locationLoaded, setLocationLoaded] = useState(false);

  // ✅ Register location manually
  useEffect(() => {
    console.log("hui");

    register("location", { required: "Location is required" });
  }, [register]);

  const getLocation = () => {

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const locationData = {
          currentLatitude: position.coords.latitude,
          currentLongitude: position.coords.longitude,
        };

        setValue("location", JSON.stringify(locationData), {
          shouldValidate: true,
        });
        console.log("lsd", locationData);

        setLocationLoaded(true);
      },
      () => {
        alert("Please allow location access");
      }
    );
  };


  const onSubmit = (data) => {
    console.log("Registration data: ", data);
    dispatch(registerUser(data))
      .unwrap()
      .then(() => {
        navigate("/otp");
      })
      .catch((error) => {
        toast.error(error || "Registration failed");
        console.error("Registration failed:", error);
      });

    console.log(data);

  };



  return (
    <main className="flex p-4 sm:p-11 gap-8 bg-gray-50 overflow-hidden  ">
      <Loader isOpen={loading} />

      {/* Left side - Image with overlay text */}
      <div className="hidden md:block w-1/2 h-full relative rounded-2xl overflow-hidden lg:p-6">
        <img
          src="/assets/signup.jpg"
          alt="Signup"
          className="w-full h-full object-cover"
        />
        <div
          className="absolute inset-0 bg-linear-to-t from-black/50 to-transparent 
                      flex flex-col justify-end p-9  text-white"
        >
          <h2 className="text-3xl font-bold">Join us today!</h2>
          <p className="text-lg opacity-90">Create your account in seconds</p>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center">
        <div className="w-full max-w-md bg-white p-2 sm:p-8 rounded-2xl shadow-black sm:shadow-xs">
          {/* Header */}
          <div className="mt-10">
            <h1 className="text-3xl font-bold text-gray-800">Create account</h1>
          </div>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-2 mt-8 p-3">
            {/* Full name */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700"
                htmlFor="fullName">
                Full name
              </label>
              <input
                required
                type="text"
                placeholder="John Doe"


                className="w-full px-4 py-3 bg-gray-200 border border-gray-200 rounded-lg
                         focus:ring-2 focus:ring-blue-200 focus:border-blue-400
                         outline-none transition"
                {...register("fullName", {
                  required: {
                    value: true,
                    message: "Fullname is Requried",
                  },
                  maxLength: {
                    value: 25,
                    message:
                      "Username must not be greater than 25 characters",
                  },
                })}
              />
            </div>
            {errors.fullName && (
              <p className="text-red-400">{errors.fullName.message}</p>
            )}

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Email</label>
              <input
                required
                type="email"
                placeholder="john@example.com"
                className="w-full px-4 py-3 bg-gray-200 border border-gray-200 rounded-lg
                         focus:ring-2 focus:ring-blue-200 focus:border-blue-400
                         outline-none transition"
                {...register("email", {
                  required: "Email is requried",
                  pattern: {
                    value:
                      /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,4}$/,
                    message: "Invalid email address",
                  },
                })}
              />
            </div>
            {errors.email && (
              <p className="text-red-400">{errors.email.message}</p>
            )}

            {/* Phone */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">
                Phone number
              </label>
              <input
                required
                type="tel"
                placeholder="+92 300 1234567"
                className="w-full px-4 py-3 bg-gray-200 border border-gray-200 rounded-lg
                         focus:ring-2 focus:ring-blue-200 focus:border-blue-400
                         outline-none transition"
                {...register("contactNumber", {
                  required: "Phone number is requried",
                  pattern: {
                    value: /^\+92\s\d{10}$/,
                    message:
                      "Use format: +92 3000000000",
                  },
                })}
              />
            </div>
            {errors.contactNumber && (
              <p className="text-red-400">{errors.contactNumber.message}</p>
            )}

            {/* City */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">City</label>
              <div className="relative">
                <select
                  required
                  defaultValue=""
                  className="w-full px-4 py-3 bg-gray-200 border border-gray-200 rounded-lg
                            appearance-none cursor-pointer
                           focus:ring-2 focus:ring-blue-200 focus:border-blue-400
                           outline-none transition"
                  {...register("city", {
                    required: "City is requried",
                  })}

                >
                  <option value="" disabled>
                    Select your city
                  </option>
                  <option value="Lahore">Lahore</option>
                  <option value="Karachi">Karachi</option>
                  <option value="Peshawar">Peshawar</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                  ▼
                </div>
              </div>
            </div>
            {errors.city && (
              <p className="text-red-400">{errors.city.message}</p>
            )}

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                required
                type="password"
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-gray-200 border border-gray-200 rounded-lg
                         focus:ring-2 focus:ring-blue-200 focus:border-blue-400
                         outline-none transition"
                {...register("passwordHash", {
                  required: "Password is Requried",
                  minLength: {
                    value: 5,
                    message: "Password must be at least 5 characters long",
                  },
                  maxLength: {
                    value: 10,
                    message:
                      "Password must not be greater than 8 characters",
                  },
                })}
              />

            </div>
            {errors.passwordHash && (
              <p className="text-red-400">{errors.passwordHash.message}</p>
            )}

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">
                Confirm Password
              </label>
              <input
                required
                type="password"
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-gray-200 border border-gray-200 rounded-lg
                         focus:ring-2 focus:ring-blue-200 focus:border-blue-400
                         outline-none transition"
                {...register("confirmPassword", {
                  required: "Confirm Password is Requried",
                  validate: (value) =>
                    value === watch("passwordHash") || "Passwords do not match",
                })}
              />
            </div>
            {errors.confirmPassword && (
              <p className="text-red-400">{errors.confirmPassword.message}</p>
            )}
            {/* Location getting button */}

            <div className="space-y-1.5">
              <button
                type="button"
                onClick={getLocation}
                className="w-[70%] px-4 py-3 bg-green-500 text-white rounded-md hover:bg-green-600 cursor-pointer"
                {...register("location", {
                  required: "Location is Requried",

                })}
              >
                Current Location <FontAwesomeIcon icon={faLocationDot} className="ml-2"

                />
              </button>
            </div>
            {locationLoaded && (
              <p className="text-green-600 text-sm">
                ✅ Location captured successfully
              </p>
            )}
            {errors.location && (
              <p className="text-red-500">{errors.location.message}</p>
            )}


            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-blue-600 text-white font-semibold py-3 px-4 
                       rounded-lg hover:bg-blue-700 active:bg-blue-800
                       transition duration-200 transform hover:scale-[1.02]
                       focus:ring-4 focus:ring-blue-200 mt-4 cursor-pointer"
            >
              Sign up
            </button>
          </form>

          {/* Footer */}
          <p className="text-center text-gray-600 mt-6">
            Already have an account?{" "}
            <a
              className="text-blue-600 font-medium hover:text-blue-700 
                        hover:underline cursor-pointer transition"
              href="/"
            >
              Sign in
            </a>
          </p>
        </div>
      </div>
    </main>
  );
};

export default Signup;
