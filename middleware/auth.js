const express = require("express");
const router = express.Router();
const User = require("../models/users");
const jwt = require("jsonwebtoken");
const dotenv=require("dotenv");
dotenv.config();
const protectRoute = async (req, res, next) => {
  try {
    const accessToken = req.cookies.accessToken;
    if (!accessToken) {
      return res
        .status(401)
        .json({ message: "Unauthorized - No access token provided" });
    }
    try {
      const decoded = jwt.verify(accessToken, "accessTokenSecret");
      const user = await User.findById(decoded.userId).select("-password");

      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }

      req.user = user;

      next();
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        return res
          .status(401)
          .json({ message: "Unauthorized - Access token expired" });
      }
      throw error;
    }
  } catch (error) {
    console.log("Error in protectRoute middleware", error.message);
    return res
      .status(401)
      .json({ message: "Unauthorized - Invalid access token" });
  }
};
const EmployeeRoute=(req,res,next)=>{
  if(req.user && req.user.role==="employee"){
    next();
  }else{
    res.status(501).json({
      message:"unauthorized user,instructor only",
    });
  }
}

const adminRoute = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(501).json({
      message: "unauthorized user,admin only",
    });
  }
};
module.exports = { protectRoute, adminRoute,EmployeeRoute };
