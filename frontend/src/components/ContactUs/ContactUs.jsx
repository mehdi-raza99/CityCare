import React from 'react'
import { Link } from 'react-router-dom'
import {useNavigate} from "react-router-dom"
// react hook form
import { useForm } from "react-hook-form";
const apiUrl = import.meta.env.VITE_API_URL;
const userRoute = import.meta.env.VITE_API_USER_ROUTE;
import axios from "axios";
import tost from "react-hot-toast";

export default function ContactUs() {
  let [loading, setLoading] = React.useState(false);
  

  const navigate = useNavigate();
  const { handleSubmit,register,formState: { errors } } = useForm();
  let onDonateUS=()=>{
    navigate("/payment");
  }
  let onSubmit = async (data) => {
    console.log(data);
    setLoading(true);

    let link = `${apiUrl}${userRoute}/contact-us`;
    
    axios.post(link, data, { withCredentials: true })
      .then((response) => {
        
        tost.success(response.data.message || "Message sent successfully");
        setLoading(false);
       
        
      })
      .catch((error) => {
        
        tost.error(error.response?.data?.message || "Failed to send message");
        setLoading(false);
      });


  }

  
  

  return (
    <div className='md:mx-20 mx-2 mb-2 mt-5'>
      <h1 className='text-center text-4xl font-bold m-4 text-[#4D4D4D]'>Contact Us</h1>
      <div className="p-4">
      <div className="grid lg:grid-cols-2  items-start gap-12 p-8 mx-auto max-w-5xl max-lg:max-w-2xl bg-[#f8f9fa] [box-shadow:0_2px_10px_-3px_rgba(6,81,237,0.3)] rounded-md ">
        {/* on message add max message length */}
        {/* om email add pattern */}
         <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <input type='text' placeholder='Name'
            className="w-full  rounded-md py-2.5 px-4 border border-gray-300 text-sm outline-0 focus:border-black"
            {...register("name", { required: true,maxLength: 100 })} />
            {errors.name && <p className="text-red-500 text-sm">Name is required</p>}
          <input type='email' placeholder='Email'
            className="w-full  rounded-md py-2.5 px-4 border border-gray-300 text-sm outline-0 focus:border-black"
            {...register("email", { required: true, pattern: /^\S+@\S+$/i })} />
            {errors.email && <p className="text-red-500 text-sm">Valid email is required</p>}
          <textarea placeholder='Message' rows="6"
            className="w-full rounded-md px-4 border border-gray-300 text-sm pt-2.5 outline-0 focus:border-black"
            {...register("message", { required: true, maxLength: 800 })}></textarea>
            {errors.message && <p className="text-red-500 text-sm">Message is required (max 800 characters)</p>}
          <button type='submit'
            disabled={loading}
            className="text-white bg-blue-600 hover:bg-blue-700 rounded-md text-sm font-medium px-4 py-2.5 w-full cursor-pointer border-0 mt-2">{loading ? "Sending..." : "Send message"}</button>
        </form>
        <div>
          <h2 className="text-slate-900 text-3xl font-bold">Support Our Mission</h2>
          <p className="text-[15px] text-slate-600 mt-4 leading-relaxed">Help Us Improve Our Communities! </p>
          <p className="text-[15px] text-slate-600 mt-4 leading-relaxed">A small donation can make a big difference in improving local communities. <br /> Help us continue our work. <br /> Donate today and be the part of change. </p>
          
          <button
            className="text-white bg-green-600 hover:bg-green-700 rounded-md text-sm font-medium px-4 py-4 cursor-pointer border-0  mt-5"
            onClick={onDonateUS}
          >
            Donate Now
          </button>
         

        </div>

       
      </div>
    </div>
    </div>
  )
}
