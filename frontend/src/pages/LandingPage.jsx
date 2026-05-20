import React from 'react'
import Navbar from '../components/Navbar/Navbar'
import HeroSection from '../components/HeroSection/HeroSection'
import Problems from '../components/CommonProblems/Problems'
import ImpactStats from '../components/Impact-Stats/ImpactStats'
import CitizensTestimonials from '../components/Testimonials/CitizensTestimonials'
import ContactUs from '../components/ContactUs/ContactUs'
import Footer from '../components/Footer/Footer'
export default function LandingPage() {
  return (
    <>

      <HeroSection></HeroSection>
      <Problems></Problems>
      <ImpactStats></ImpactStats>
      <CitizensTestimonials></CitizensTestimonials>
      <ContactUs></ContactUs>

    </>
  )
}
