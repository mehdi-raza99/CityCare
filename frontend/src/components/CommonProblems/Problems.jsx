import React from 'react'

export default function Problems() {
  return (
    <div className='md:mx-20 mx-2 mb-2'>
      <h1 className='text-center text-4xl font-bold m-4 text-[#4D4D4D]'>Common Problems</h1>
      <p className='text-center mb-4'>What We Can Solve?</p>

      <div className='grid md:grid-cols-3 gap-4 p-5'>
        <div className='bg-[#F5F7FA] p-5 rounded-lg shadow-md flex flex-col gap-2 justify-center items-center'>
          <img src="/assets/road.png" alt="road" width={100} height={100} />
          <h1 className='font-bold text-lg sm:text-2xl'>Road</h1>
          <h1 className='font-bold text-lg sm:text-2xl'>Damadge</h1>
          <p>We help communities report and fix road damage to make streets safer for everyone.</p>
        </div>
        <div className='bg-[#F5F7FA] p-5 rounded-lg shadow-md flex flex-col gap-2 justify-center items-center'>
          <img src="/assets/StreetLight.png" alt="StreetLight" width={100} height={100} />
          <h1 className='font-bold text-lg sm:text-2xl'>Broken Street</h1>
          <h1 className='font-bold text-lg sm:text-2xl'>Lights</h1>
          <p>Helping communities report and fix broken street lights to keep streets safe and well lit.</p>
        </div>
        <div className='bg-[#F5F7FA] p-5 rounded-lg shadow-md flex flex-col gap-2 justify-center items-center'>
          <img src="/assets/garbag.png" alt="garbad" width={80} height={80} />
          <h1 className='font-bold text-lg sm:text-2xl'>Garbage</h1>
          <h1 className='font-bold text-lg sm:text-2xl'>Issues</h1>
          <p>Working together to report and clear waste for cleaner, safer communities.</p>
        </div>


      </div>

    </div>
  )
}
