import React from "react";
import { Link } from "react-router-dom";

export default function AboutUs() {
  return (
    <div className="w-full bg-gray-50 text-gray-800">

      {/* Hero Section */}
      <section className="bg-[#D9D9D9] py-20 px-6 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          Empowering Citizens. Improving Cities.
        </h1>
        <p className="max-w-2xl mx-auto text-lg opacity-90">
          CityCare is a smart complaint management platform that connects citizens with authorities to build cleaner and more efficient cities.
        </p>
      </section>

      {/* Who We Are */}
      <section className=" max-w-6xl mx-auto py-16 px-6 grid md:grid-cols-2 gap-10 items-center">
        <img
          src="https://pagedone.io/asset/uploads/1717741215.png"
          alt="city workers"
          className="rounded-2xl shadow-lg w-[60%] h-90 object-cover"
        />
        <div>
          <h2 className="text-3xl font-semibold mb-4">Who We Are</h2>
          <p className="text-gray-600 leading-relaxed">
            CityCare is a web-based platform designed to simplify reporting civic issues like broken roads, garbage, and street light problems. It creates a transparent communication channel between citizens and authorities.
          </p>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="bg-white py-16 px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-10">
          <div className="p-6 rounded-2xl shadow bg-gray-50">
            <h3 className="text-2xl font-semibold mb-3">Our Mission</h3>
            <p className="text-gray-600">
              To empower citizens by giving them a voice and ensuring their complaints are addressed efficiently using technology.
            </p>
          </div>

          <div className="p-6 rounded-2xl shadow bg-gray-50">
            <h3 className="text-2xl font-semibold mb-3">Our Vision</h3>
            <p className="text-gray-600">
              To build smarter cities where issues are resolved quickly and transparency is maintained at every step.
            </p>
          </div>
        </div>
      </section>

      {/* What We Do */}
      <section className="max-w-6xl mx-auto py-16 px-6">
        <h2 className="text-3xl font-semibold text-center mb-10">What We Do</h2>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
          {[
            "Report complaints with location",
            "Upload images for proof",
            "Track complaint status",
            "Connect with authorities",
            "Secure authentication",
            "Easy to use interface",
          ].map((item, index) => (
            <div key={index} className="bg-blue-50 p-6 rounded-2xl shadow hover:shadow-lg transition">
              <p className="text-gray-700">✔ {item}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Why Choose */}
      <section className="bg-blue-50 py-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-semibold mb-6">Why Choose CityCare?</h2>
          <p className="text-gray-600 leading-relaxed">
            CityCare focuses on simplicity, transparency, and efficiency. It ensures faster communication between citizens and authorities while providing real-time updates and accountability.
          </p>
        </div>
      </section>

    
      

      {/* CTA */}
      <section className="bg-blue-50  py-16 px-6 text-center">
        <h2 className="text-3xl font-semibold mb-4">Be Part of the Change</h2>
        <p className="mb-6 opacity-90">
          Join CityCare today and help make your city cleaner and better.
        </p>
        <Link to="/register-complaint" className="bg-white text-blue-600 px-6 py-3 rounded-full font-semibold hover:bg-gray-100 transition">
          Report a Complaint
        </Link>
      </section>

    </div>
  );
}
