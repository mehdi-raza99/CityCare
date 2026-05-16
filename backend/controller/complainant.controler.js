import complainantModel from "../model/complainant.model.js";
import ComplaintModel from "../model/complaint.model.js";
import mongoose from "mongoose";
import cloudinary from "../utils/cloudinary.js";
import Zone from "../model/zone.model.js";
import path from "path";
import fs from "fs";
import CityModel from "../model/city.model.js";
import { autoAssignTeam } from "../utils/autoAssignedTeam.js";
import ComplaintHistoryModel from "../model/complaint-history.model.js";
import ComplaintCategoryModel from "../model/complaint-Category.model.js";
import feedbackModel from "../model/feedback.model.js";
import { uploadMedia } from "../utils/mediaUpload.js";  

let createComplaint = async (req, res, next) => {
    
    let mediaByUser = [];
    let session;
    
    try {
 
      let {city,category, description, addressDescription,location } = req.body;
      location = JSON.parse(location);
      let {lng, lat} = location;
      lng = parseFloat(lng);
      lat = parseFloat(lat);

    let complainant = await complainantModel.findOne({
      userID: req.user._id,
    });
   
    if (!complainant) {
      
      let error = new Error("Only registered complainant can create complaint");
      error.status = 403;
      return next(error);
    }
    
    let cityRecord = await CityModel.findOne({name:city, isActive:true});
    if(!cityRecord){
       
        let error = new Error("City is not serviceable");
        error.status = 404;
       return next(error);
      }

    let DUPLICATE_RADIUS_METERS = parseInt(process.env.DUPLICATE_RADIUS_METERS) || 200;

    //  Auto‑detect zone using GeoJSON polygon
    let theZone = await Zone.findOne({
      city: cityRecord._id,
      geometry: {
        $geoIntersects: {
          $geometry: {
            type: "Point",
            coordinates: [lng, lat],
          },
        },
      },
    });
   console.log("Auto-detected zone: ", theZone);
   let outOfServiceZone = false;
    if (!theZone) {//-----------TODO
      
      // assign to zone close to location. Not far than 5 km
      let nearbyZone = await Zone.findOne({
        city: cityRecord._id,
        geometry: {
          $near: {
            $geometry: {
              type: "Point",
              coordinates: [lng, lat],
            },
            $maxDistance: 5000, // 5 km
          },
        },
      });
      if (nearbyZone) {
        theZone = nearbyZone;
        outOfServiceZone = true;
        
      }else{
        // Out of service zone
        let error = new Error("Location is out of service zone");
        error.status = 400;
       return next(error);
       }

    }
    //  Check for duplicate complaint
    let duplicateComplaint = await ComplaintModel.findOne({
      category,
      city: cityRecord._id,
      CurrentStatus: { $in: ["Pending", "Assigned", "In-Progress"] },
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [lng, lat],
          },
          $maxDistance: DUPLICATE_RADIUS_METERS,
        },
      },
      
    });

    if (duplicateComplaint) {
      // Add complainant to votesBy array if not already present
      if (!duplicateComplaint.votesBy.includes(complainant._id)) {
        duplicateComplaint.votesBy.push(complainant._id);
        duplicateComplaint.votes += 1;
        await duplicateComplaint.save();
        return res.status(200).json({
        success: true,
        message: "Duplicate complaint detected. Your vote has been counted.",
        complaint: duplicateComplaint,
        status: 200
      });
      }
      return res.status(409).json({
        success: true,
        message: "Duplicate complaint detected. You have already voted for this complaint.",
        complaint: duplicateComplaint,
        status: 409
      });
    
    }
      //  Upload media files to Cloudinary
      mediaByUser = await uploadMedia(req.files);

      //  Start of session and transaction
      session=await mongoose.startSession();
      session.startTransaction();
        //  Create complaint
      let complaint = await ComplaintModel.create([
            {
                complainant: complainant._id,
                category,
                city: cityRecord._id,
                zone: theZone._id,
                description,
                location: {
                    type: "Point",
                    coordinates: [lng, lat],
                },
                media: [
                    ...mediaByUser
                ],
                votesBy: [complainant._id],
                votes: 1,
                outOfServiceZone: outOfServiceZone,
                addressDescription: addressDescription
            }
        ], { session });

        //  Log complaint creation in history
         await ComplaintHistoryModel.create([
          {
            complaint: complaint[0]._id,
          actionType: "CREATED",
          newStatus: complaint[0].CurrentStatus,
          actedBy: req.user._id,
          remarks: "Complaint created by complainant",
          }
        ],{ session });
 
        // Auto-assign team
        let assignedTeam = await autoAssignTeam(complaint[0], session);
        if (assignedTeam) {
          complaint[0].assignedTeam = assignedTeam._id;
          complaint[0].CurrentStatus = "Assigned";
          await complaint[0].save({ session });

        
        // log complaint history creation 
        await ComplaintHistoryModel.create([
          {
        complaint: complaint[0]._id,
        actionType: "ASSIGNED",
        oldStatus: "Pending",
        newStatus: "Assigned",
        team: assignedTeam?._id || null,
        actedBy: null, // system auto assignment
        remarks: "Auto-assigned to zone team"
                                            }
        ],{session});
       await session.commitTransaction();
       session.endSession();
        res.status(201).json({ success: true, message: "Complaint created successfully", complaint: complaint[0],status:201 });

        }
        else{
          await session.commitTransaction();
          session.endSession();
          res.status(201).json({ success: true, message: "Complaint created successfully ", complaint: complaint[0],status:201 });
        } 
       
        
    } catch (error) {
        if(session){
          await session.abortTransaction();
          session.endSession();
        }
        if(mediaByUser.length > 0){
          // Rollback uploaded media in case of any error
          for (let m of mediaByUser) {
            await cloudinary.uploader.destroy(m.publicId);
          }
        }
        next(error);
    }
}

let ComplaintMadeByUser = async (req, res,next) => {

    try {
        let userId = req.user._id;
        let complainat = await complainantModel.findOne({ userID: userId });
        if(!complainat){
            let error = new Error("Complainant record not found for the user");
            error.status = 404;
            return next(error);
        }
        let complaints = await ComplaintModel.find({ complainant: complainat._id }).populate("complainant", "fullName").populate("zone", "name").populate("assignedTeam", "name");
        if(complaints.length === 0){
            return res.status(200).json({
                success: true,
                message: "No complaints found for the user",
                data: [],
            });
        }
        res.status(200).json({
            success: true,
            message: "Complaints made by user fetched successfully",
            data: complaints,
        });
    } catch (error) {
        next(error);
    }


}

let ComplaintsOfUserArea = async (req, res,next) => {

    try {
        let userId = req.user._id;
        let complainat = await complainantModel.findOne({ userID: userId });
        if(!complainat){
            let error = new Error("Complainant record not found for the user");
            error.status = 404;
            return next(error);
        
        }

        console.log("complainant: ",complainat);

        let { currentLatitude, currentLongitude } = complainat;
        let radiusInMeters = 3000; // 2 km
        let complaints = await ComplaintModel.find({
            location: {
                $near: {
                    $geometry: {
                        type: "Point",
                        coordinates: [currentLongitude, currentLatitude],
                    },
                    $maxDistance: radiusInMeters,
                },
            },
            // not show the complaints made by user itself in this list
            complainant: { $ne: complainat._id },
        }).populate("complainant", "fullName").populate("zone", "name").populate("assignedTeam", "name");

        if(complaints.length === 0){
            return res.status(200).json({
                success: true,
                message: "No complaints found in your area",
                data: [],
            });
        }

        res.status(200).json({
            success: true,
            message: "Complaints of user's area fetched successfully",
            data: complaints,
        });
        
    } catch (error) {
        next(error);
    }

}

let ComplaintsVotedByUser = async (req, res,next) => {
    try {
        
        let userId = req.user._id;
        let complainat = await complainantModel.findOne({ userID: userId });
        if(!complainat){
            let error = new Error("Complainant record not found for the user");
            error.status = 404;
            return next(error);
        }
        // and votes >1
        let complaints = await ComplaintModel.find({ votesBy: complainat._id, votes: { $gt: 1 } }).populate("complainant", "fullName").populate("zone", "name").populate("assignedTeam", "name");
        console.log("Complaints voted by user: ", complaints);
        if(complaints.length === 0){
            return res.status(200).json({
                success: true,
                message: "No complaints found that you have voted",
                data: [],
            });
        }
        res.status(200).json({
            success: true,
            message: "Complaints voted by user fetched successfully",
            data: complaints,
        });

    } catch (error) {
        next(error);
    }
}



let postFeedbacksOfUser = async (req, res,next) => {

    try {
        let {complaintId,text,rating  }=req.body
        let userId = req.user._id;
        let complainat = await complainantModel.findOne({ userID: userId });
        if(!complainat){
            let error = new Error("Complainant record not found for the user");
            error.status = 404;
            return next(error);
        }
        let feedbackData = {
            complaint: complaintId,
            complainant: complainat._id,
            text: text,
            rating: rating,
        }
        let newFeedback = new feedbackModel(feedbackData);
        await newFeedback.save();
        res.status(200).json({
            success: true,
            message: "Feedback submitted successfully",
        });
       
    } catch (error) {
        next(error);
    }
}

let getComplaintCategories = async (req, res,next) => {
    try {
        // get active categories only and sorted
        let categories = await ComplaintCategoryModel.find({ isActive: true }).sort({ name: 1 });
        res.status(200).json({
            success: true,
            message: "Complaint categories fetched successfully",
            categories,
        });
    } catch (error) {
        next(error);
    }
}



export { createComplaint, ComplaintsOfUserArea, ComplaintsVotedByUser, postFeedbacksOfUser, getComplaintCategories ,ComplaintMadeByUser};