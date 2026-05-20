// import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./App.css";
import PaymentPage from "./components/Payment/PaymentPage.jsx";
import PaymentSuccess from "./components/Payment/PaymentSuccess.jsx";
import PaymentFailure from "./components/Payment/PaymentFailure.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import SignupPage from "./pages/SignupPage.jsx";
import ForgetPasswordPage from "./pages/ForgetPasswordPage.jsx";
import ResetPasswordPage from "./pages/ResetPasswordPage.jsx";
import ComplaintPage from "./pages/ComplaintPage.jsx";
import LandingPage from "./pages/LandingPage.jsx";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AboutUs from "./pages/AboutUs.jsx";
import Userprofile from "./pages/Userprofile.jsx";
import Contactus from "./pages/Contactus.jsx";
import Layout from "./components/Layout/Layout.jsx";
import ScrollToTop from "./components/Scroll/ScrollToTop.jsx";
import { Toaster, toast } from "react-hot-toast";
import OTPInput from "./components/utilities/OTPinput.jsx";
import { useEffect } from "react";
const apiUrl = import.meta.env.VITE_API_URL;
const userRoute = import.meta.env.VITE_API_USER_ROUTE;
import { useDispatch } from "react-redux";
import { setUser, logout } from "./feature/user/userSlice.js";
import axios from "axios";
import ComplaintHistory from "./pages/ComplaintHistory.jsx";
import ProtectedRoute from "./components/Auth/ProtectedRoute.jsx";
import NotFound from "./pages/NotFound.jsx";
import TeamLeadHome from "./pages/TeamLeadHome.jsx";
import AccesDenied from "./components/Auth/AccesDenied.jsx";
import DashboardLayout from "./components/Sidebar/DashboardLayout.jsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHome, faClipboardList, faUsers } from "@fortawesome/free-solid-svg-icons";
import TeamLeadTeams from "./pages/TeamLeadTeams.jsx";
import TeamLeadsComplaints from "./pages/TeamLeadsComplaints.jsx";
import UpdateComplaint from "./pages/UpdateComplaint.jsx";
import AdminDashboard from "./pages/admin/AdminDashboard.jsx";
import Employess from "./pages/admin/Employess.jsx";
import { faMapMarkedAlt } from "@fortawesome/free-solid-svg-icons";
import Zones from "./pages/admin/Zones.jsx";
import EmployeesWithAccouns from "./pages/admin/EmployeesWithAccouns.jsx";
import { faUser } from "@fortawesome/free-solid-svg-icons";
import Cities from "./pages/admin/Cities.jsx";
import { faCity } from "@fortawesome/free-solid-svg-icons";
import Donations from "./pages/admin/Donations.jsx";
import AllContactUs from "./pages/admin/ContactUs.jsx";
import { faEnvelope } from "@fortawesome/free-solid-svg-icons";
import { faHeart } from "@fortawesome/free-solid-svg-icons";
import CityDashboard from "./pages/CityManager/CityDashboard.jsx";
import ComplaintsCM from "./pages/CityManager/Complaints.jsx";
import Teams from "./pages/CityManager/Teams.jsx";
import TeamLeadRequests from "./pages/TeamLeadRequests.jsx";
import { faPaperPlane, faInbox } from "@fortawesome/free-solid-svg-icons";
import CityManagerRequests from "./pages/CityManager/CityManagerRequests.jsx";

function App() {


  const dispatch = useDispatch();
  useEffect(() => {
    let checkLoginStatus = async () => {
      try {
        let link = `${apiUrl}${userRoute}/check-login`
        let response = await axios.get(link, {
          headers: {
            "Content-Type": "application/json"
          },
          withCredentials: true, // Include cookies in the request

        });
        // console.log("Login status response: ", response.data);
        if (response.data.success) {
          dispatch(setUser(response.data?.user));
        } else {
          dispatch(logout());
        }
      }
      catch (error) {
        // console.log("Error checking login status--: ", error.response?.data || "An error occurred while checking login status.");
        dispatch(logout());

      }
    };
    checkLoginStatus();
  }, [])


  return (
    <div>
      <Toaster position="top-right" reverseOrder={false} toastOptions={
        {
          duration: 5000,
          style: {
            fontSize: "16px",
            fontWeight: "600",
          },
        }
      } />
      <BrowserRouter>
        <ScrollToTop />
        <Routes>

          <Route path="/" element={<Layout />}>
            <Route path="" element={<LandingPage />} />
            <Route path="forget-password" element={<ForgetPasswordPage />} />
            <Route path="reset-password/:token" element={<ResetPasswordPage />} />
            <Route path="otp" element={<OTPInput />} />
            <Route path="about-us" element={<AboutUs />} />
            {/* <Route path="complaint-history" element={<ComplaintHistory />} /> */}
            {/* <Route path="user-profile" element={<Userprofile />} /> */}
            <Route path="contact-us" element={<Contactus />} />
            <Route path="login" element={<LoginPage />} />
            <Route path="signup" element={<SignupPage />} />
            <Route path="access-denied" element={<AccesDenied />} />
            {/* <Route path="register-complaint" element={<ComplaintPage />} /> */}
            <Route path="payment">
              <Route index element={<PaymentPage />} />
              <Route path="success" element={<PaymentSuccess />} />
              <Route path="failure" element={<PaymentFailure />} />
            </Route>

            {/* protected routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="register-complaint" element={<ComplaintPage />} />
              <Route path="complaint-history" element={<ComplaintHistory />} />
              <Route path="user-profile" element={<Userprofile />} />

            </Route>

          </Route>

          {/* Team lead routes */}
          <Route element={<ProtectedRoute allowedRoles={['teamLead']} />}>

            <Route element={<DashboardLayout menuItems={[
              { to: "/teamLead/dashboard", label: "Dashboard", icon: <FontAwesomeIcon icon={faHome} /> },
              { to: "/teamLead/complaints", label: "Complaints", icon: <FontAwesomeIcon icon={faClipboardList} /> },
              { to: "/teamLead/team", label: "Team", icon: <FontAwesomeIcon icon={faUsers} /> },
              { to: "/teamLead/requests", label: "Requests", icon: <FontAwesomeIcon icon={faPaperPlane} /> },
            ]} />}>
              <Route path="teamLead/dashboard" element={<TeamLeadHome />} />
              <Route path="teamLead/complaints" element={<TeamLeadsComplaints />} />
              <Route path="teamLead/team" element={<TeamLeadTeams />} />
              <Route path="teamLead/complaints/update/:id" element={<UpdateComplaint />} />
              <Route path="teamLead/requests" element={<TeamLeadRequests />} />
            </Route>

          </Route>

          {/* admin routes */}
          <Route element={<ProtectedRoute allowedRoles={['admin']} />}>

            <Route element={<DashboardLayout menuItems={[
              { to: "/admin/dashboard", label: "Dashboard", icon: <FontAwesomeIcon icon={faHome} /> },
              { to: "/admin/employees", label: "Employees", icon: <FontAwesomeIcon icon={faUsers} /> },
              { to: "/admin/zones", label: "Zones", icon: <FontAwesomeIcon icon={faMapMarkedAlt} /> },
              { to: "/admin/employees-accounts", label: "Accounts", icon: <FontAwesomeIcon icon={faUser} /> },
              { to: "/admin/cities", label: "Cities", icon: <FontAwesomeIcon icon={faCity} /> },
              { to: "/admin/donations", label: "Donations", icon: <FontAwesomeIcon icon={faHeart} /> },
              { to: "/admin/contact-us", label: "Contact Us", icon: <FontAwesomeIcon icon={faEnvelope} /> }

            ]} />}>
              <Route path="admin/dashboard" element={<AdminDashboard />} />
              <Route path="admin/employees" element={<Employess />} />
              <Route path="admin/zones" element={<Zones />} />
              <Route path="admin/employees-accounts" element={<EmployeesWithAccouns />} />
              <Route path="admin/cities" element={<Cities />} />
              <Route path="admin/donations" element={<Donations />} />
              <Route path="admin/contact-us" element={<AllContactUs />} />
            </Route>

          </Route>
          {/* City Manager Routes */}
          <Route element={<ProtectedRoute allowedRoles={['cityManager']} />}>

            <Route element={<DashboardLayout menuItems={[
              { to: "/cityManager/dashboard", label: "Dashboard", icon: <FontAwesomeIcon icon={faHome} /> },
              { to: "/cityManager/employees", label: "Employees", icon: <FontAwesomeIcon icon={faUsers} /> },
              { to: "/cityManager/complaints", label: "Complaints", icon: <FontAwesomeIcon icon={faClipboardList} /> },
              { to: "/cityManager/teams", label: "Teams", icon: <FontAwesomeIcon icon={faUsers} /> },
              { to: "/cityManager/requests", label: "Requests", icon: <FontAwesomeIcon icon={faInbox} /> },
            ]} />}>
              <Route path="cityManager/dashboard" element={<CityDashboard />} />
              <Route path="cityManager/employees" element={<Employess />} />
              <Route path="cityManager/complaints" element={<ComplaintsCM />} />
              <Route path="cityManager/teams" element={<Teams />} />
              <Route path="cityManager/requests" element={<CityManagerRequests />} />


            </Route>

          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>

      </BrowserRouter>
    </div>
  )

}

export default App;
