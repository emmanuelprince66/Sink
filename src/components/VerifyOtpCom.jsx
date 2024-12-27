import React from "react";
import { useRef } from "react";
import { CheckCircleOutlineOutlined } from "@mui/icons-material";
import {
  Box,
  Typography,
  Button,
  Dialog,
  Slide,
  CircularProgress,
  Card,
  Modal,
  TextField,
} from "@mui/material";
import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { BaseAxios } from "../helpers/axiosInstance";
import "react-toastify/dist/ReactToastify.min.css";
import { ToastContainer } from "react-toastify";
import { notiError, notiSuccess } from "../utils/noti";

const VerifyOtpCom = ({ setComponent, userEmail, setUuid }) => {
  const [pins, setPins] = useState(["", "", "", "", "", ""]);
  const pinRef = [useRef(), useRef(), useRef(), useRef(), useRef(), useRef()];
  const [key, setKey] = useState(Math.random());
  const [buttonDisabled, setButtonDisabled] = useState(false);

  // verify otp mutation
  const verifyOtpMutation = useMutation({
    mutationFn: async (formData) => {
      console.log(formData);
      try {
        const response = await BaseAxios({
          url: "/auth/verify-password-token/",
          method: "POST",
          data: formData,
        });

        if (response.status !== 200) {
          throw new Error(response.data.message);
        }

        return response.data;
      } catch (error) {
        notiError(error?.response?.data?.error);
        console.log(error?.response?.data?.error);
        throw new Error(error.response.data.error);
      }
    },
    onSuccess: (data) => {
      notiSuccess("OTP verified successfully");

      console.log(data);
      setUuid(data?.uid64);

      setTimeout(() => {
        setButtonDisabled(false);
        setComponent("Change");
      }, 1000);

      // Handle success, update state, or perform further actions
    },
    onError: (error) => {
      setButtonDisabled(false);
    },
  });

  // -------

  const forgetMutation = useMutation({
    mutationFn: async (formData) => {
      console.log(formData);
      try {
        const response = await BaseAxios({
          url: "/auth/reset-password/",
          method: "POST",
          data: formData,
        });

        if (response.status !== 200) {
          throw new Error(response.data.message);
        }

        return response.data;
      } catch (error) {
        notiError(error?.response?.data?.error);
        console.log(error?.response?.data?.error);
        throw new Error(error.response.data.error);
      }
    },
    onSuccess: (data) => {
      notiSuccess(data.message);
      // Handle success, update state, or perform further actions
    },
    onError: (error) => {
      setButtonDisabled(false);
    },
  });

  const initialSeconds = 60;
  const [time, setTime] = useState({
    minutes: Math.floor(initialSeconds / 60),
    seconds: initialSeconds % 60,
  });
  const [isActive, setIsActive] = useState(true);

  const [isTimerFinished, setIsTimerFinished] = useState(false);

  useEffect(() => {
    let interval;

    if (isActive && (time.minutes > 0 || time.seconds > 0)) {
      interval = setInterval(() => {
        if (time.seconds === 0) {
          if (time.minutes === 0) {
            setIsTimerFinished(true);
            clearInterval(interval); // Stop the interval
          } else {
            setTime((prevTime) => ({
              minutes: prevTime.minutes - 1,
              seconds: 59,
            }));
          }
        } else {
          setTime((prevTime) => ({
            ...prevTime,
            seconds: prevTime.seconds - 1,
          }));
        }
      }, 1000);
    } else {
      setIsTimerFinished(true);
    }

    return () => clearInterval(interval);
  }, [isActive, time]);
  const resetTimer = async () => {
    if (!isTimerFinished) return;
    setTime({
      minutes: Math.floor(initialSeconds / 60),
      seconds: initialSeconds % 60,
    });

    const formData = {
      email: userEmail,
    };
    forgetMutation.mutate(formData); // Pass the phone number here
    // Handle error if needed
    setIsActive(true);
    setIsTimerFinished(false); // Reset timer finished state
  };

  const formattedTime = `${time.minutes}:${
    time.seconds < 10 ? `0${time.seconds}` : time.seconds
  }`;
  const buttonText = isTimerFinished ? "Timer Finished" : "Start Timer";

  const handleChange = (index, value) => {
    // Ensure that the value is only one digit
    if (value.length > 1) return;

    if (!/^\d*$/.test(value)) return;

    const newPins = [...pins];
    newPins[index] = value;
    setPins(newPins);

    // Automatically focus on the next TextField if not already at the last one
    if (index < pinRef.length - 1) {
      pinRef[index + 1].current.focus();
    }
  };
  const handlePinKeyDown = (index, e) => {
    if (index > 0 && e.key === "Backspace" && e.target.value === "") {
      // If Backspace is pressed and the field is empty (not the first field), move focus to the previous input field
      pinRef[index - 1].current.focus();
    } else if (index === 0 && e.key === "Backspace" && e.target.value === "") {
      // If Backspace is pressed in the first field and it's empty, focus remains in the first field
      e.preventDefault(); // Prevent the Backspace key from navigating away
    } else if (e.key === "Backspace" && e.target.selectionStart === 0) {
      // If Backspace is pressed at the beginning of the field
      // and it's not the first field, move focus to the previous input field and set cursor position to the end
      if (index > 0) {
        pinRef[index - 1].current.focus();

        // Use requestAnimationFrame for smoother transitions
        requestAnimationFrame(() => {
          pinRef[index - 1].current.setSelectionRange(1, 1);
        });
      }
    }
  };

  const verifyGetOTP = () => {
    // Check if all the PINs have been entered

    setButtonDisabled(true);

    // Loop through each instance and perform the check
    const allPinsEntered = pins.every((pin) => pin !== "");
    console.log(allPinsEntered);

    if (allPinsEntered) {
      // api call
      const verifyPinsOTP = pins.join("");
      const payload = {
        token: verifyPinsOTP,
        email: userEmail,
      };

      verifyOtpMutation.mutate(payload);
    } else {
      notiError("Please enter all four PIN digits.");
      setButtonDisabled(false);
    }
  };
  return (
    <>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
        }}
      >
        <Typography
          sx={{
            textAlign: "center",
            fontWeight: "900",
            fontSize: "20px",
            fontFamily: "Montserrat",
            my: "1rem",
          }}
        >
          Check your Mail!
        </Typography>

        <Typography
          sx={{
            textAlign: "center",
            fontWeight: "200",
            fontSize: "16px",
            fontFamily: "Montserrat",
          }}
        >
          An email containing a 4-digit verification code has been sent to
          <p className="font-[600]">{userEmail}</p> Please enter the code below
          to continue to reset your password.
        </Typography>

        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "15px",
            padding: "1rem 0",
            borderRadius: "10px",
            my: "1rem",
          }}
        >
          {pins.map((pin, index) => (
            <TextField
              onFocus={() => handleShowOrderText()}
              sx={{
                "& input": {
                  fontSize: "1.5rem",
                  padding: "5px",
                },
                "& .MuiOutlinedInput-root": {
                  "& fieldset": {
                    borderColor: "#CACACA",
                    borderRadius: "10px",
                  },
                  "&:hover fieldset": {
                    borderColor: "#CACACA", // Set the border color on hover here
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#C57600", // Set the border color on focus here
                  },
                },
              }}
              key={index}
              variant="outlined"
              type="password"
              value={pin}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handlePinKeyDown(index, e)}
              inputProps={{
                inputMode: "numeric",
                pattern: "[0-9]*", // Ensure only numeric input is allowed
                maxLength: 1, // Limit input to one character
                style: { textAlign: "center" }, // Center-align the input
              }}
              inputRef={pinRef[index]}
            />
          ))}
        </Box>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Button
            onClick={verifyGetOTP}
            disabled={buttonDisabled || verifyOtpMutation.isLoading}
            sx={{
              background: "#02981D",
              width: "100%",
              padding: "10px, 16px, 10px, 16px",
              textTransform: "capitalize",
              fontFamily: "Montserrat",
              fontWeight: "400",
              width: {
                xs: "300px",
                sm: "333px",
                md: "333px",
                lg: "333px",
              },
              height: "48px",
              fontSize: "16px",
              borderRadius: "8px",
              color: "#fff",
              "&:hover": {
                backgroundColor: "#02981D",
              },
            }}
          >
            {buttonDisabled || verifyOtpMutation.isLoading ? (
              <CircularProgress size="1.2rem" sx={{ color: "white" }} />
            ) : (
              "Verify OTP"
            )}
          </Button>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              textAlign: "center",
              justifyContent: "center",
              my: "1.5rem",
            }}
          >
            <Typography
              sx={{
                fontWeight: "400",
                mx: "3px",
                fontFamily: "Montserrat",
              }}
            >
              Didn't get the code?
            </Typography>
            <Typography
              onClick={resetTimer} //
              sx={{
                fontWeight: "400",
                fontFamily: "Montserrat",
                mx: "3px",
                cursor: "pointer", // Adding cursor pointer to indicate it's clickable
              }}
            >
              {isTimerFinished ? (
                <Typography sx={{ color: "#dc0019", fontFamily: "Montserrat" }}>
                  Resend Code
                </Typography>
              ) : (
                "Can Resend in"
              )}
            </Typography>

            <Typography
              // Attach resetTimer function to restart the timer
              sx={{
                fontWeight: "400",
                fontFamily: "Montserrat",
              }}
            >
              &nbsp;{formattedTime}
            </Typography>
          </Box>
          <Button
            sx={{
              background: "#fff",
              padding: "10px",
              mb: "10px",
              borderRadius: "8px",
              fontWeight: "700",
              width: "100%",
              borderColor: "#333333",

              color: "#02981D",
              "&:hover": {
                borderColor: "#02981D",
              },
              textTransform: "capitalize",
              fontWeight: "500",
            }}
            variant="outlined"
          >
            <Box sx={{ display: "flex", gap: "10px", alignItems: "center" }}>
              {/* <img src={backRedArrow} alt="back-arrow" /> */}
              <Typography
                onClick={() => setComponent("Forget")}
                sx={{
                  fontSize: "15px",
                  fontWeight: "600",
                  color: "#02981D",
                  fontFamily: "Montserrat",
                }}
              >
                Change Email Address
              </Typography>
            </Box>
          </Button>

          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              gap: "10px",
              alignItems: "center",
              cursor: "pointer",
            }}
          >
            {/* <img src={backRedArrow} alt="back-arrow" /> */}
            <Typography
              onClick={() => setComponent("Login")}
              sx={{
                fontSize: "15px",
                fontWeight: "600",
                color: "#02981D",
                fontFamily: "Montserrat",
                "&:hover ": {
                  color: "#333333",
                },
              }}
            >
              Back to login
            </Typography>
            <p
              className="cursor-pointer"
              onClick={() => setComponent("Change")}
            >
              Change pass
            </p>
          </Box>
        </Box>

        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
      </Box>
    </>
  );
};

export default VerifyOtpCom;
