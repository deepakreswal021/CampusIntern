import React, { useContext, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { FaRegUser } from "react-icons/fa";
import { FaPencilAlt } from "react-icons/fa";
import { FaPhoneFlip } from "react-icons/fa6";
import { MdOutlineMailOutline } from "react-icons/md";
import { RiLock2Fill } from "react-icons/ri";
import { Link, Navigate } from "react-router-dom";
import { Context } from "../../main";

const Register = () => {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [otp, setOtp] = useState("");
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const { isAuthorized, setIsAuthorized, baseurl } = useContext(Context);

  // Send OTP via nodemailer
  const sendOtp = async () => {
    if (!email.endsWith("@gmail.com")) {
      toast.error("Email must end with @nitt.edu");
      return;
    }

    try {
      const randomOtp = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedOtp(randomOtp);

      await axios.post(`${baseurl}/api/v1/user/send-otp`, {
        email,
        otp: randomOtp,
      });

      toast.success("OTP sent to your email!");
      setIsOtpSent(true);
    } catch (error) {
      toast.error("Failed to send OTP. Try again!");
    }
  };

  // Verify entered OTP
  const verifyOtp = () => {
    if (otp === generatedOtp) {
      toast.success("OTP verified successfully!");
      setIsVerified(true);
    } else {
      toast.error("Incorrect OTP!");
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!isVerified) {
      toast.error("Please verify your email first!");
      return;
    }

    try {
      const data = await axios.post(
        `${baseurl}/api/v1/user/register`,
        { name, phone, email, role, password },
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );

      toast.success(data.data.message);
      setName("");
      setEmail("");
      setPassword("");
      setPhone("");
      setRole("");
      setOtp("");
      setIsAuthorized(true);
    } catch (error) {
      const msg = await error.response.data.message;
      toast.error(msg);
    }
  };

  if (isAuthorized) {
    return <Navigate to={"/"} />;
  }

  return (
    <>
      <section className="authPage">
        <div className="container">
          <div className="header">
            <img src="/CareerLinklogo.png" alt="logo" />
            <h3>Create a new account</h3>
          </div>
          <form>
            {/* Email Field */}
            {!isVerified && (
              <div className="inputTag">
                <label>Email Address</label>
                <div>
                  <input
                    type="email"
                    placeholder="205122021@nitt.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isOtpSent} // Disable after OTP is sent
                  />
                  <MdOutlineMailOutline />
                </div>
              </div>
            )}

            {/* Show Verify Email button until OTP is sent */}
            {!isOtpSent && (
              <button type="button" onClick={sendOtp}>
                Verify Email
              </button>
            )}

            {/* OTP Input, visible only after OTP is sent */}
            {isOtpSent && !isVerified && (
              <div className="inputTag">
                <label>Enter OTP</label>
                <div>
                  <input
                    type="number"
                    placeholder="Enter OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                  />
                  <button type="button" onClick={verifyOtp}>
                    Verify OTP
                  </button>
                </div>
              </div>
            )}

            {/* After OTP is verified, show email as read-only */}
            {isVerified && (
              <>
                <div className="inputTag">
                  <label>Email Address</label>
                  <div>
                    <input
                      type="email"
                      value={email}
                      readOnly // Email is visible but not editable after verification
                    />
                    <MdOutlineMailOutline />
                  </div>
                </div>

                {/* Now display other form fields */}
                <div className="inputTag">
                  <label>Register As</label>
                  <div>
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      disabled={!isVerified} // Only editable after OTP verification
                    >
                      <option value="">Select Role</option>
                      <option value="Employer">Professor</option>
                      <option value="Job Seeker">Student</option>
                    </select>
                    <FaRegUser />
                  </div>
                </div>
                <div className="inputTag">
                  <label>Name</label>
                  <div>
                    <input
                      type="text"
                      placeholder="Deepak"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      disabled={!isVerified} // Only editable after OTP verification
                    />
                    <FaPencilAlt />
                  </div>
                </div>
                
                <div className="inputTag">
                  <label>Phone Number</label>
                  <div>
                    <input
                      type="number"
                      placeholder="1745129635"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      disabled={!isVerified} // Only editable after OTP verification
                    />
                    <FaPhoneFlip />
                  </div>
                </div>
                <div className="inputTag">
                  <label>Password</label>
                  <div>
                    <input
                      type="password"
                      placeholder="Your Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={!isVerified} // Only editable after OTP verification
                    />
                    <RiLock2Fill />
                  </div>
                </div>

                {/* Register Button */}
                <button type="submit" onClick={handleRegister} disabled={!isVerified}>
                  Register
                </button>
              </>
            )}

            <Link to={"/login"}>Login Now</Link>
          </form>
        </div>
        <div className="banner">
          <img src="/register.png" alt="login" />
        </div>
      </section>
    </>
  );
};

export default Register;
