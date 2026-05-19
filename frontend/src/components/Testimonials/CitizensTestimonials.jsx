import React from 'react'

export default function CitizensTestimonials() {
  return (
    <div className='md:mx-15 mx-2 mb-6'>
    <h1 className='text-center text-4xl font-bold m-4 text-[#4D4D4D]'>Citizen Testimonials</h1>
    <div className="flex flex-wrap items-center justify-center gap-4"> 
            <div className="text-sm w-70 border border-gray-200 pb-6 rounded-lg bg-white shadow-[0px_4px_15px_0px] shadow-black/5 overflow-hidden">
                <div className="flex items-center gap-4 px-5 py-4 bg-[#F5F7FA]">
                    <img className="h-12 w-12 rounded-full" src="https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=100" alt="userImage1" />
                    <div>
                        <h1 className="text-lg font-medium text-gray-800">Ali Usman</h1>
                        <p className="text-gray-800/80">Shahdra, Lahore</p>
                    </div>
                </div>
                <div className="p-5 pb-7">
                    
                    <p className=" mt-1">I reported a garbage problem in our neighbourhood, and it was resolved quickly. The area is much cleaner and healthier for everyone.</p>
                </div>
                
            </div>
        
            <div className="text-sm w-70 border border-gray-200 pb-6 rounded-lg bg-white shadow-[0px_4px_15px_0px] shadow-black/5 overflow-hidden">
                <div className="flex items-center gap-4 px-5 py-4 bg-[#F5F7FA]">
                    <img className="h-12 w-12 rounded-full" src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=100" alt="userImage2" />
                    <div>
                        <h1 className="text-lg font-medium text-gray-800">Kashif Subhan</h1>
                        <p className="text-gray-800/80">Korangi, Karachi</p>
                    </div>
                </div>
                <div className="p-5 pb-7">
                    
                    <p className=" mt-1">The damaged road in our 
                                     area caused a lot of inconvenience .After 
                                     reporting it here,it was repaired quickly.Thanks to CityCare..</p>
                </div>
               
            </div>
        
            <div className="text-sm w-70 border border-gray-200 pb-6 rounded-lg bg-white shadow-[0px_4px_15px_0px] shadow-black/5 overflow-hidden">
                <div className="flex items-center gap-4 px-5 py-4 bg-[#F5F7FA]">
                    <img className="h-12 w-12 rounded-full" src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=100&h=100&auto=format&fit=crop" alt="userImage3" />
                    <div>
                        <h1 className="text-lg font-medium text-gray-800">Sidra Nawaz</h1>
                        <p className="text-gray-800/80">Gulshan Ravi, Lahore</p>
                    </div>
                </div>
                <div className="p-5 pb-7">
                    
                    <p className=" mt-1">Our street lights were not working for weeks, making the area unsafe at night. Thanks to CityCare that it was resolved quickly</p>
                </div>
                
            </div>
        </div>
  
    </div>)
}
