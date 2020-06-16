const express = require('express');
const {
  registerUser,
  loginUser,
  getMe,
  forgotPassword,
  resetPassword,
  updateDetails,
  updatePassword,
  logout,
} = require('../controllers/auth');

const router = express.Router();
const { protect } = require('../middlewares/auth');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getMe);
router.get('/logout', protect, logout);
router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:resettoken', resetPassword);
router.put('/updatedetails', protect, updateDetails);
router.put('/updatepassword', protect, updatePassword);

module.exports = router;
