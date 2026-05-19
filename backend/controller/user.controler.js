import mongoose from "mongoose";
import userModel from "../model/user.model.js";
import complainantModel from "../model/complainant.model.js";
import employeeModel from "../model/employee.model.js";
import bcrypt from "bcrypt";
import sendToken_Cookie from "../utils/JWT-Cookies.js";
import sendEmail from "../utils/email.js";
import {sendResetEmail} from "../utils/resetPassEmail.js";
import getResetToken from "../utils/resetPassToken.js";
import CryptoJS from "crypto-js";
import cityModel from "../model/city.model.js";
import jwt from "jsonwebtoken";
import complaintModel from "../model/complaint.model.js";
import feedbackModel from "../model/feedback.model.js";
import ComplaintCategoryModel from "../model/complaint-Category.model.js";
import contactUSModel from "../model/contactUS.model.js";
let registerUser = async (req, res,next) => {
 
    try {
        let { email, passwordHash, fullName, contactNumber, location } = req.body;
        let {currentLatitude, currentLongitude}= location
        if(typeof location === "string"){
            location = JSON.parse(location);
            currentLatitude = location.currentLatitude;
            currentLongitude = location.currentLongitude;
         }
             
        let userExisted = await userModel.findOne({ email: email });
        if (userExisted) {
            let error = new Error("User already exists with this email");
            error.status = 400;
            return next(error);
        }   
        let hashedPassword = await bcrypt.hash(passwordHash, 10);
        let otp=Math.floor(100000 + Math.random() * 900000).toString();
        let otpExpiry= Date.now() + 1000 * 60 * 20; // 20 minute from now
        console.log("OTP IS: ",otp);
        // Create User
        let newUser = new userModel({
            email: email,
            passwordHash: hashedPassword,
            otp:otp,
            otpExpiry:otpExpiry,
        });
        
        let savedUser = await newUser.save();
        // Create Complainant
        let newComplainant = new complainantModel({
            userID: savedUser._id,
            fullName: fullName,
            contactNumber: contactNumber,
            currentLatitude: currentLatitude,
            currentLongitude: currentLongitude,
        });
        let savedComplainant = await newComplainant.save();
        let mailOptions = {
            to: savedUser.email,
            subject: "CityCare - Verify your email",
            name : newComplainant.fullName,
            otp : otp,
        }
         await sendEmail(mailOptions); 
       
        res.status(201).json(
            {
                success: true,
                message: "User registered successfully",
                data: {_id: savedUser._id, email: savedUser.email, fullName: savedComplainant.fullName,contactNumber:savedComplainant.contactNumber,currentLatitude:savedComplainant.currentLatitude,currentLongitude:savedComplainant.currentLongitude  },
            }
        )


    } catch (error) {
         next(error);
    }

}

let verifyOtp = async (req, res,next) => {
    try {

        let { email, otp } = req.body;
        console.log("Email: ", email, "OTP: ", otp);
        let user = await userModel.findOne({ email: email });
        if (!user) {
            let error = new Error("User not found");
            error.status = 404;
            return next(error);
        }
        if (user.otp !== otp) {
        let error = new Error("Invalid otp");
        error.status = 400;
        return next(error);
      } else if (user.otpExpiry < Date.now()) {
        let error = new Error("otp time is expired");
        error.status = 400;
        return next(error);
      } else {
        user.isVerified = true;
        user.otp = null;
        user.otpExpiry = null;
        await user.save();
        return res.status(200).json({
          success: true,
          message: "User is Verified SuccessFully",
        });
      }
    } catch (error) {
        next(error);
    }
}

let loginUser = async (req, res,next) => {

    try {

        let { email, passwordHash } = req.body;
        console.log("Login attempt for email: ", email);
        let user = await userModel.findOne({ email: email });
        if (!user) {
            let error = new Error("User not found");
            error.status = 404;
            return next(error);
        }
        if (!user.isVerified) {
            let error = new Error("User is not verified");
            error.status = 400;
            return next(error);
        }
        let isPasswordValid = await bcrypt.compare(passwordHash, user.passwordHash);
        if (!isPasswordValid) {
            let error = new Error("Invalid password");
            error.status = 400;
            return next(error);
        }
        // find name from complainant model using user._id
        let complainant = await complainantModel.findOne({ userID: user._id });
        // need city name from city model using city id from complainant model
        let employee = await employeeModel.findOne({ userID: user._id }).populate("city");
        let data = {
            _id: user._id,
            role: user.role,
            roleUser: user.role == "employee" ? employee?.role : null,
            email: user.email,
            fullName: complainant?.fullName || null,
            employeeId: employee?._id || null,
            emCity: employee?.city ? employee.city.name : null,
        }
        sendToken_Cookie(data, 200, res, "Login Successful");  
    } catch (error) {
        next(error);
    }

}



let assignLoginToEmployee = async (req, res,next) => {

    try {
        let { email,passwordHash } = req.body;
        let { employeeId } = req.params; // get _id frm employee model
        if(!mongoose.Types.ObjectId.isValid(employeeId)){
            let error = new Error("Invalid employee ID");
            error.status = 400;
            return next(error);
        }
        let employee = await employeeModel.findById(employeeId);
        if (!employee) {
            let error = new Error("Employee not found for the given ID");
            error.status = 404;
            return next(error);
        }
       
        if(employee.userID){
            let error = new Error("Login already assigned to this employee");
            error.status = 400;
            return next(error);
        }
        let userExisted = await userModel.findOne({ email: email });
        if (userExisted) {
            let error = new Error("User already exists with this email");
            error.status = 400;
            return next(error);
        }
        let hashedPassword = await bcrypt.hash(passwordHash, 10);
        let newUser = new userModel({
            email: email,
            passwordHash: hashedPassword,
            role:"employee",
            isVerified:true,
        });
        let savedUser = await newUser.save();
    
        employee.userID = savedUser._id;
        await employee.save();
        res.status(200).json({
            success: true,
            message: "Login assigned to employee successfully",
            data: { userId: savedUser._id, email: savedUser.email, fullName: employee.fullName },
        });
        
    } catch (error) {
        next(error);
    }

}

let logOutUser = async (req, res,next) => {
    try {
        res.clearCookie("token", {
      secure: true, // Set to true in production (requires HTTPS)
      httpOnly: true,
      sameSite: "none",

    });
    res.status(200).json({
        success: true,
        message: "User logged out successfully",
    });
    } catch (error) {
        next(error);
    }
};

let changeUserPassword = async (req, res,next) => {

    try {
        let id= req.user._id;
        let {  oldPassword, newPassword  } = req.body;
        let user = await userModel.findOne({ _id: id });
        if (!user) {
            let error = new Error("User not found");
            error.status = 404;
            return next(error);
        }
        let isPasswordValid = await bcrypt.compare(oldPassword, user.passwordHash);
        if (!isPasswordValid) {
            let error = new Error("Wrong old password");
            error.status = 400;
            return next(error);
        }
        let hashedNewPassword = await bcrypt.hash(newPassword, 10);
        user.passwordHash = hashedNewPassword;
        await user.save();
        res.status(200).json({
            success: true,
            message: "Password changed successfully",
        });
        
    } catch (error) {
        next(error);
    }

};

let forgotPassword = async (req, res,next) => {
    try {
        
        let { email } = req.body;
        console.log("Forgot password request for email: ", email);
        let user = await userModel.findOne({ email: email });
        if (!user) {
            let error = new Error("User not found");
            error.status = 404;
            return next(error);
        }
        let { RawToken, hashToken } = getResetToken();
        user.resetPasswordToken = hashToken;
        user.resetPasswordExpiryDate = Date.now() + 1000 * 60 * 10; // 10 minute from now
        await user.save();
        let resetUrl = `${process.env.FRONTEND_URL}/reset-password/${RawToken}`;
        let mailOptions = {
            to: user.email,
            subject: "CityCare - Password Reset",
            name : user.email,
            resetUrl : resetUrl,
            temp:"resetEmail",
            text: `Hello ${user.email},\n\nPlease click on the following link to reset your password:\n\n${resetUrl}\n\nIf you did not request this, please ignore this email.\n\nThank you,\nCityCare Team`,
        }
         await sendResetEmail(mailOptions); 
         console.log("Raw Token: ",RawToken);
         
         res.status(200).json({
            success: true,
            message: `Email for reset password sent to ${user.email} successfully`,
        });

    } catch (error) {
        next(error);
    }
};

let resetUserPassword = async (req, res,next) => {
    try {
         let token = req.params.token;
         let { newPassword } = req.body;
         
         let hashToken = CryptoJS.SHA256(token).toString(CryptoJS.enc.Hex);
         let user = await userModel.findOne({
            resetPasswordToken: hashToken,
            resetPasswordExpiryDate: { $gt: Date.now() },
         });
         if(!user){
            let error = new Error("Reset link is expired or invalid. Try again with a new link");
            error.status = 400;
            return next(error);
         }
         let hashedNewPassword = await bcrypt.hash(newPassword, 10);
         user.passwordHash = hashedNewPassword;
         user.resetPasswordToken = null;
         user.resetPasswordExpiryDate = null;
         await user.save();
         res.status(200).json({
            success: true,
            message: "Password reset successfully",
        });

    } catch (error) {
        next(error);
    }
};

let checkLoginStatus = async (req, res,next) => {

    try {
        
        let token = req.cookies.token;
        // remove space from token if exist
       
        
        if(!token){
            return res.status(200).json({
                success: false,
                isAuthenticated: false,
                message: "User is not authenticated",
            });
        }
        // get decoded token dat
        jwt.verify(token, process.env.JWTSECERET, (err, decodedToken) => {
                    if (err) {
                        res.status(200).json({
                            success: false,
                            isAuthenticated: false,
                            message: "User is not authenticated",
                        });
                    }
                    console.log("Decoded token data: ", decodedToken);
                    return res.status(200).json({
                        success: true,
                        isAuthenticated: true,
                        user: decodedToken,
                    });
                });
        


    } catch (error) {
        next(error);
    }
}

let getUserProfile = async (req, res,next) => {

    try {
        let userId = req.user._id;
         
        // only need fullName,contactNumber, city from complainant model
        // and email from user model
        let user = await userModel.findById(userId);
        if(!user){
            let error = new Error("User not found");
            error.status = 404;
            return next(error);
        }
       
        let complainant = await complainantModel.findOne({ userID: userId })
        if(!complainant){
            let error = new Error("Complainant record not found for the user");
            error.status = 404;
            return next(error);
        }
        
        res.status(200).json({
            success: true,
            message: "User profile fetched successfully",
            user: {
                email: user.email,
                fullName: complainant.fullName,
                contactNumber: complainant.contactNumber,
                city: complainant.city,
                _id: user._id,
                
            },
        });



    } catch (error) {
        next(error);
    }

}

let updateUserProfile = async (req, res,next) => {
  try {
    // update profile details like fullName, contactNumber, city
    let userId = req.user._id;
    let { fullName, contactNumber, city,lat,lng } = req.body;
    let complainant = await complainantModel.findOne({ userID: userId });
    if (!complainant) {
      let error = new Error("Complainant record not found for the user");
      error.status = 404;
      return next(error);
    }
    complainant.fullName = fullName || complainant.fullName;
    complainant.contactNumber = contactNumber || complainant.contactNumber;
    complainant.city = city || complainant.city;
    complainant.currentLatitude=lat || complainant.currentLatitude;
    complainant.currentLongitude=lng || complainant.currentLongitude;
    await complainant.save();
    res.status(200).json({
      success: true,
      message: "User profile updated successfully",
      user: {
        email: req.user.email,
        fullName: complainant.fullName,
        contactNumber: complainant.contactNumber,
        city: complainant.city,
      },
    });
    
  } catch (error) {
    next(error);
  }

}



let contactUs = async (req, res,next) => {

    try {
        
        let { name, email, message,newsletter } = req.body;
        let newMessage = new contactUSModel({
            name:name || "Anonymous",
            email,
            message: message || "",
            newsletter: newsletter || false,
        });
        await newMessage.save();
        res.status(200).json({
            success: true,
            message: "Your message has been received. We will get back to you shortly.",
        });

    } catch (error) {
        next(error);
    }

}

export { registerUser , verifyOtp,loginUser,assignLoginToEmployee,logOutUser, changeUserPassword,forgotPassword, resetUserPassword,checkLoginStatus,getUserProfile,updateUserProfile,contactUs};