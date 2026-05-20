import React from "react";
import { Link, NavLink } from "react-router-dom";
import { useState } from "react";
import NavLinks from "./NavLinks";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars } from "@fortawesome/free-solid-svg-icons";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { useSelector } from "react-redux";
import DropDown from "./DropDown";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(true);
  const isAuthenticated = useSelector((state) => state.user.isAuthenticated);

  function toggleMenu() {
    setIsMenuOpen(!isMenuOpen);
  }

  return (
    <div className="flex items-center justify-between p-2 bg-[#ffffff] border-b-2 border-gray-300 gap-4 sticky top-0 z-10">
      <div className="sm:ml-8 ml-1 max-w-80">
        <Link to={"/"} className="">
          <img src="/assets/logo.png" alt="logo" className="h-24" />
        </Link>
      </div>
      <div className="md:block hidden">
        <NavLinks></NavLinks>
      </div>
      {isAuthenticated ? (<div className="mr-8 flex justify-between items-center gap-4">

        <DropDown></DropDown>

      </div>) : (<div className="mr-8 flex justify-between items-center gap-4">
        <NavLink to={"/login"} className={({ isActive }) => `${isActive ? "underline text-orange-900 underline-offset-4" : ""}`}>
          <button className="sm:text-lg font-medium cursor-pointer
        ">Login</button>
        </NavLink>
        <NavLink to={"/signup"} className={({ isActive }) => `${isActive ? "underline text-orange-900 underline-offset-4" : ""}`}>
          <button className="sm:text-lg font-medium cursor-pointer ">Sign Up</button>
        </NavLink>

      </div>)}
      <div className="md:hidden">
        {isMenuOpen ? (<button className="md:hidden" onClick={() => toggleMenu()}><FontAwesomeIcon className="text-xl" icon={faBars} /></button>) : (<button className="md:hidden " onClick={() => toggleMenu()}><FontAwesomeIcon className="text-xl" icon={faXmark} /></button>)}
      </div>

      <div className={`md:hidden z-40 w-full absolute left-0 top-24 border-b-2 border-gray-300 ${isMenuOpen ? "hidden" : "block"}`} >
        <NavLinks></NavLinks>
      </div>


    </div>
  );
};

export default Navbar;
