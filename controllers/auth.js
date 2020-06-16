const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middlewares/async');
const sendEmail = require('../utils/sendEmail');
const crypto = require('crypto');

//@desc     Register User
//@route    GET /api/v1/auth/register
//@access   Public
exports.registerUser = asyncHandler(async (req, res, next) => {
  const { name, email, password, role } = req.body;

  const user = await User.create({
    name,
    email,
    password,
    role,
  });

  sendTokenResponse(user, 200, res);
});

//@desc     Login User
//@route    GET /api/v1/auth/login
//@access   Public
exports.loginUser = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new ErrorResponse('Please enter a email and password!', 400));
  }

  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    return next(new ErrorResponse('Invalid Credentials!', 401));
  }

  // Match Password
  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    return next(new ErrorResponse('Invalid Credentials!', 401));
  }

  sendTokenResponse(user, 200, res);
});

//@desc     Get Logged in User
//@route    GET /api/v1/auth/me
//@access   Private
exports.getMe = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  res.status(200).json({ success: true, data: user });
});

//@desc     Log out User
//@route    GET /api/v1/auth/logout
//@access   Private
exports.logout = asyncHandler(async (req, res, next) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  const user = await User.findById(req.user.id);

  res.status(200).json({ success: true, data: {} });
});

//@desc     Update Password
//@route    GET /api/v1/auth/updatepassword
//@access   Private
exports.updatePassword = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id).select('+password');

  if (!(await user.matchPassword(req.body.currentPassword))) {
    return next(new ErrorResponse('Invalid Password!', 401));
  }

  user.password = req.body.newPassword;

  await user.save();

  sendTokenResponse(user, 200, res);
});

//@desc     Update Details
//@route    PUT /api/v1/auth/updatedetails
//@access   Private
exports.updateDetails = asyncHandler(async (req, res, next) => {
  const updtatedDetails = {
    email: req.body.email,
    name: req.body.name,
  };

  const user = await User.findByIdAndUpdate(req.user.id, updtatedDetails, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({ success: true, data: user });
});

//@desc     Forgot Password
//@route    GET /api/v1/auth/forgotpassword
//@access   Public
exports.forgotPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(
      new ErrorResponse(
        `User with given email ${req.body.email} is not found`,
        404
      )
    );
  }

  const resetToken = user.getResetPasswordToken();

  await user.save({ validateBeforeSave: false });

  const resetLink = `${req.protocol}//${req.get(
    'host'
  )}/api/v1/auth/resetpassword/${resetToken}`;

  const message = `You are receiving this mail because you or someone else has opted for reset password option for your account. Please click the following link, if you want to reset your password ${resetLink}`;

  const options = {
    email: user.email,
    subject: 'Reset Password Token',
    message: message,
  };

  try {
    await sendEmail(options);
    res.status(200).json({ success: true, data: 'Email Sent..' });
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save({ validateBeforeSave: false });

    res.status(500).json({ success: true, data: 'Email could not be sent..' });
  }
  res.status(200).json({ success: true, data: user });
});

//@desc     Reset Password
//@route    GET /api/v1/auth/resetpassword/:resettoken
//@access   Public
exports.resetPassword = asyncHandler(async (req, res, next) => {
  // Get Hashed Token
  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(req.params.resettoken)
    .digest('hex');
  console.log(resetPasswordToken);
  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return next(new ErrorResponse('Invalid Token!', 400));
  }

  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  sendTokenResponse(user, 200, res);
});

// Send token to user as a cookie
const sendTokenResponse = (user, statusCode, res) => {
  const token = user.getSignedJwtToken();

  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRY * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === 'production') {
    options.secure = true;
  }

  res
    .status(statusCode)
    .cookie('token', token, options)
    .json({ success: true, token });
};
