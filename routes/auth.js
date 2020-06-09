const express = require('express');
const {
  registerUser,
  loginUser,
  getMe,
  forgotPassword,
} = require('../controllers/auth');

const router = express.Router();
const { protect } = require('../middlewares/auth');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getMe);
router.post('/forgotpassword', forgotPassword);

module.exports = router;
