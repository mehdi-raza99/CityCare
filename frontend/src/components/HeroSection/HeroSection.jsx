import React from 'react'
import axios from 'axios'
const apiUrl = import.meta.env.VITE_API_URL;
const userRoute = import.meta.env.VITE_API_USER_ROUTE;
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux';
export default function HeroSection() {
  const navigate = useNavigate()
  const isAuthenticated = useSelector((state) => state.user.isAuthenticated);
  const handleReportComplaint = () => {
    // navigate('/register-complaint')
    // if user is not logged in, navigate to login page, otherwise navigate to complaint form
    axios.get(`${apiUrl}${userRoute}/check-login`, {
      withCredentials: true,
    })
      .then((response) => {
        if (response.data.success) {
          navigate('/register-complaint');
        } else {
          navigate('/login');
        }
      })
      .catch((error) => {
        console.error('Error checking login status:', error);
        navigate('/login');
      });

  }
  const handleComplaintHistory = () => {
    navigate('/complaint-history')
  }

  return (
    <div className=" grid lg:grid-cols-2 bg-[#F5F7FA] gap-4">

      <div className='flex flex-col gap-4 justify-start items-start md:p-16 p-5 lg:p-24 ml-5  '>
        <h1 className='text-lg md:text-2xl lg:text-4xl font-bold'>Report Civic Problems</h1>
        <h1 className='text-lg md:text-2xl lg:text-4xl font-bold'>Improve Your Community</h1>
        <p className='text-sm  md:text-lg'>Easily Report Issuses Like Potholes,Street Lights and Garbage in your area</p>
        <div className='flex flex-col sm:flex-row justify-center items-start md:gap-8 gap-4'>
          <button className='bg-blue-500 text-white px-4 py-2 rounded text-sm lg:text-lg cursor-pointer' onClick={handleReportComplaint}>
            Report Complaint
          </button>
          {isAuthenticated && <button className='bg-green-500 text-white px-4 py-2 rounded text-sm lg:text-lg cursor-pointer' onClick={handleComplaintHistory}>
            Complaint History
          </button>}
        </div>
      </div>

      <div className='md:w-full md:h-132 p-5 mx-auto '>
        <img src="/assets/hero-image.png" alt="hero" className='w-full h-full rounded-2xl object-cover' />
      </div>

    </div>
  )
}
