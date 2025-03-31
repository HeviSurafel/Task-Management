const express = require("express");
const router = express.Router();
const {
  protectRoute,
  adminRoute,
  EmployeeRoute,
} = require("../middleware/auth");
const {
  signup,
  login,
  logout,
  attendance,
  updateProfile,
  refreshToken,
  getProfile,
  updatePassword,
  getAllUser,
  requestPasswordReset,
  resetPassword,
  notification
} = require("../controller/auth.controller");
router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.post("/refreshtoken", refreshToken);
router.get("/profile", protectRoute, getProfile);
router.post("/resetpassword", requestPasswordReset);
router.put("/updateNewPassword", resetPassword);
router.put("/update-password", protectRoute, updatePassword);
router.get("/alluser", protectRoute, adminRoute, getAllUser);
router.put("/updateprofile", protectRoute, updateProfile);
router.post("/attendance", protectRoute, attendance);
router.post('/notification',protectRoute,notification
);
module.exports = router;
