import ErrorHandler from "../middlewares/error.js";
import nodemailer from "nodemailer";
import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import { User } from "../models/userSchema.js";
import { sendToken } from "../utils/jwtToken.js";

// Send OTP function
export const sendOtp = catchAsyncErrors(async (req, res, next) => {
  const { email, otp } = req.body;

  // Check if email is provided
  if (!email || !otp) {
    return next(new ErrorHandler("Email and OTP are required!", 400));
  }

  try {
    // Create transporter for sending email
    let transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      auth:{
          user : process.env.MAIL_USER,
          pass : process.env.MAIL_PASS,
      }
    });

    // Email options
    const mailOptions = {
      from: 'deepakreswal20@gmail.com',
      to: email,
      subject: 'Verification of Campus Intern with OTP',
      text: `Your OTP for verifying your email is: ${otp}`,
    };

    // Send email
    await transporter.sendMail(mailOptions);

    res.status(200).json({
      success: true,
      message: 'OTP sent successfully to your email!',
    });
    
  } catch (error) {
    return next(new ErrorHandler("Failed to send OTP. Please try again.", 500));
  }
});

export const register = catchAsyncErrors(async (req, res, next) => {
  const { name, email, phone, password, role } = req.body;
  // console.log("insider register block");
  if (!name || !email || !phone || !password || !role) {
    return next(new ErrorHandler("Please fill full form!"));
  }
  const isEmail = await User.findOne({ email });
  if (isEmail) {
    return next(new ErrorHandler("Email already registered!"));
  }

  const user = await User.create({
    name,
    email,
    phone,
    password,
    role,
  });
  sendToken(user, 201, res, "User Registered!");
});


export const login = catchAsyncErrors(async (req, res, next) => {
  const { email, password, role } = req.body;
  if (!email || !password || !role) {
    return next(new ErrorHandler("Please provide email ,password and role."));
  }
  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    return next(new ErrorHandler("Invalid Email Or Password.", 400));
  }
  const isPasswordMatched = await user.comparePassword(password);
  if (!isPasswordMatched) {
    return next(new ErrorHandler("Invalid Email Or Password.", 400));
  }
  if (user.role !== role) {
    return next(
      new ErrorHandler(`User with provided email and ${role} not found!`, 404)
    );
  }
  sendToken(user, 201, res, "User Logged In!");
});

export const logout = catchAsyncErrors(async (req, res, next) => {
  res
    .status(201)
    .cookie("token", "", {//token ko empty kr diya
      httpOnly: true,
      expires: new Date(Date.now()),
    })
    .json({
      success: true,
      message: "Logged Out Successfully.",
    });
});


export const getUser = catchAsyncErrors((req, res, next) => {
  const user = req.user;
  res.status(200).json({
    success: true,
    user,
  });
});