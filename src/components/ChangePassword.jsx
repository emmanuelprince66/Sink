import React from "react";
import { useState } from "react";

import {
  CardContent,
  Checkbox,
  TextField,
  FormControlLabel,
  Box,
  IconButton,
  InputAdornment,
  Button,
  Grid,
  FormControl,
  Typography,
  CircularProgress,
  InputLabel,
} from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { useMutation } from "@tanstack/react-query";
import { BaseAxios } from "../helpers/axiosInstance";
import CustomCard from "../components/CustomCard";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import rightLogo from "../assets/rightLogo.svg";
import wrongLogo from "../assets/wrongLogo.svg";
import HttpsOutlinedIcon from "@mui/icons-material/HttpsOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import { notiError, notiSuccess } from "../utils/noti";
const ChangePassword = ({ setComponent, uuid }) => {
  const [showPassword, setShowPassword] = React.useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [textSix, setTextSix] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [confirmPasswordInput, setConfirmPasswordInput] = useState("");
  const [confirmError, setConfirmError] = useState("");
  const [buttonDisabled, setButtonDisabled] = useState(false);

  const [weak, setWeak] = useState(false);
  const [medium, setMedium] = useState(false);
  const [strong, setStrong] = useState(false);

  // verify otp mutation
  const changeMutation = useMutation({
    mutationFn: async (formData) => {
      try {
        const response = await BaseAxios({
          url: "/auth/reset-password/",
          method: "POST",
          data: formData,
        });

        if (response.status !== 200) {
          throw new Error(response.data.message);
        }
        console.log("res", response);
        return response.data;
      } catch (error) {
        notiError(error?.response?.data?.error);
        console.log(error?.response?.data?.error);
        throw new Error(error.response.data.error);
      }
    },
    onSuccess: (data) => {
      console.log(data);
      notiSuccess(data?.message);
      setTimeout(() => {
        setButtonDisabled(false);
        setComponent("Login");
      }, 800);
    },
    onError: (error) => {
      setButtonDisabled(false);
    },
  });

  const handleClickShowPassword = () => setShowPassword((show) => !show);

  const handleConfirmPasswordChange = (event) => {
    const value = event.target.value;

    setConfirmPasswordInput(value);

    if (passwordInput === value) {
      setConfirmError("");
    } else {
      setConfirmError("Password do not match");
    }
  };

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };
  const handlePasswordBlur = () => {
    if (!passwordInput) {
      setPasswordError("Please enter your password");
      setTextSix(true);
    }
  };
  const handlePasswordChange = (event) => {
    const value = event.target.value;
    setPasswordInput(value);
    const hasCapital = /[A-Z]/.test(value);
    const hasNumber = /[0-9]/.test(value);
    const hasSpecial = /[!@#$%^&*]/.test(value);

    // Evaluate each criteria separately
    if (hasCapital) {
      setWeak(true);
    } else {
      setWeak(false);
    }

    if (hasNumber) {
      setMedium(true);
    } else {
      setMedium(false);
    }

    if (hasSpecial) {
      setStrong(true);
    } else {
      setStrong(false);
    }
  };

  const handleResetPassword = () => {
    setButtonDisabled(true);

    console.log(passwordInput, confirmPasswordInput);

    if (passwordInput !== confirmPasswordInput) {
      notiError("Password do not match!");
      setButtonDisabled(false);
    } else if (passwordInput.length < 6) {
      notiError("Password must be six or more characters");
      setButtonDisabled(false);
    } else {
      const payload = {
        password: passwordInput,
        uid64: uuid,
      };
      changeMutation.mutate(payload);
    }

    // if (passwordInput === confirmPasswordInput) {
    //   mutationReset.mutate(passwordInput);
    // } else {
    //   notiError("Password do not match");
    //   setButtonDisabled(false);
    // }
  };

  return (
    <>
      <CustomCard>
        <div className="w-full flex flex-col items-center justify-center">
          <div className="flex gap-1 items-center mb-3">
            <p className="font-bold text-[32px] ">OTP Verified!</p>
            <div className="bg-[#00b300]  flex  rounded-sm items-center justify-center">
              <CheckRoundedIcon sx={{ color: "#fff" }} />
            </div>
          </div>
          <p className="font-normal text-[16px] mb-4">
            Now Proceed to create a new password.
          </p>

          <div className="w-full">
            <form
              style={{
                width: "100%",
                display: "flex",
                flexDirection: "column",
                gap: "1em",
              }}
            >
              <Grid container spacing={2}>
                <Grid
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: ".2em",
                  }}
                  item
                  xs={12}
                >
                  <div>
                    <FormControl
                      sx={{ width: "327px", marginBottom: "0.5rem" }}
                    >
                      <Typography
                        htmlFor="input"
                        sx={{
                          paddingX: { xs: "15px", sm: "0px", md: "0px" },
                          fontWeight: 500,
                          marginBottom: "1ch",
                          color: "#001533",
                          fontFamily: "Montserrat",
                          fontSize: "16px",
                        }}
                      >
                        New Password
                      </Typography>
                      <TextField
                        sx={{
                          width: {
                            xs: "300px",
                            sm: "100%",
                            md: "327px",
                          },
                          mx: "auto",
                          "& .MuiOutlinedInput-root": {
                            fontFamily: "Montserrat",
                            "& fieldset": {
                              borderColor: "#04c82e", // Set the desired border color here
                            },
                            "&:hover fieldset": {
                              borderColor: "#04c82e", // Set the border color on hover here
                            },
                            "&.Mui-focused fieldset": {
                              borderColor: "#04c82e", // Set the border color on hover here
                            },
                          },
                        }}
                        onChange={handlePasswordChange}
                        onBlur={handlePasswordBlur}
                        value={passwordInput}
                        required
                        helperText={
                          passwordError && <span>{passwordError}</span>
                        }
                        placeholder="Enter your Password"
                        id="password-input"
                        type={showPassword ? "text" : "password"}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment>
                              <HttpsOutlinedIcon />
                              &nbsp;&nbsp;
                            </InputAdornment>
                          ),
                          endAdornment: (
                            <InputAdornment>
                              <IconButton
                                aria-label="toggle password visibility"
                                onClick={handleClickShowPassword}
                                onMouseDown={handleMouseDownPassword}
                                edge="end"
                              >
                                {showPassword ? (
                                  <VisibilityOffOutlinedIcon />
                                ) : (
                                  <VisibilityOutlinedIcon />
                                )}
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                        endAdornment={
                          <InputAdornment position="end">
                            <IconButton
                              aria-label="toggle password visibility"
                              onClick={handleClickShowPassword}
                              onMouseDown={handleMouseDownPassword}
                              edge="end"
                            >
                              {showPassword ? (
                                <VisibilityOff />
                              ) : (
                                <Visibility />
                              )}
                            </IconButton>
                          </InputAdornment>
                        }
                        aria-describedby="outlined-weight-helper-text"
                        inputProps={{
                          "aria-label": "weight",
                        }}
                      />

                      <div className="gpt3__password-strength">
                        <p className="text-[12px] font-[600] text-[#171717] my-2">
                          Password Must Contain
                        </p>
                      </div>

                      <div className="gpt3__requirement">
                        <div className="flex gap-1 mb-1 items-center">
                          <img src={weak ? rightLogo : wrongLogo} alt="" />
                          <p className="text-[12px] font-normal">
                            a capital letter
                          </p>
                        </div>

                        <div className="flex gap-1 items-center mb-1">
                          <img src={medium ? rightLogo : wrongLogo} alt="" />
                          <p className="text-[12px] font-normal">a number.</p>
                        </div>

                        <div className="flex gap-1 items-center ">
                          <img src={strong ? rightLogo : wrongLogo} alt="" />
                          <p className="text-[12px] font-normal">{`a special character [e.g. <>^_@.]`}</p>
                        </div>
                      </div>
                    </FormControl>
                  </div>
                  <div>
                    <FormControl
                      sx={{ width: "327px", marginBottom: "0.5rem" }}
                    >
                      <Typography
                        htmlFor="input"
                        sx={{
                          paddingX: { xs: "15px", sm: "0px", md: "0px" },
                          fontWeight: 500,
                          marginBottom: "1ch",
                          color: "#001533",
                          fontFamily: "Montserrat",
                          fontSize: "16px",
                        }}
                      >
                        Re-Enter Password
                      </Typography>
                      <TextField
                        sx={{
                          width: {
                            xs: "300px",
                            sm: "100%",
                            md: "327px",
                          },
                          mx: "auto",
                          "& .MuiOutlinedInput-root": {
                            fontFamily: "Montserrat",
                            "& fieldset": {
                              borderColor: "#04c82e", // Set the desired border color here
                            },
                            "&:hover fieldset": {
                              borderColor: "#04c82e", // Set the border color on hover here
                            },
                            "&.Mui-focused fieldset": {
                              borderColor: "#04c82e", // Set the border color on hover here
                            },
                          },
                        }}
                        onChange={handleConfirmPasswordChange}
                        value={confirmPasswordInput}
                        required
                        helperText={
                          confirmError && (
                            <Box sx={{ color: "#DC0019" }}>{confirmError}</Box>
                          )
                        }
                        placeholder="Enter your Password"
                        id="password-input"
                        type={showPassword ? "text" : "password"}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment>
                              <HttpsOutlinedIcon />
                              &nbsp;&nbsp;
                            </InputAdornment>
                          ),
                          endAdornment: (
                            <InputAdornment>
                              <IconButton
                                aria-label="toggle password visibility"
                                onClick={handleClickShowPassword}
                                onMouseDown={handleMouseDownPassword}
                                edge="end"
                              >
                                {showPassword ? (
                                  <VisibilityOffOutlinedIcon />
                                ) : (
                                  <VisibilityOutlinedIcon />
                                )}
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                        endAdornment={
                          <InputAdornment position="end">
                            <IconButton
                              aria-label="toggle password visibility"
                              onClick={handleClickShowPassword}
                              onMouseDown={handleMouseDownPassword}
                              edge="end"
                            >
                              {showPassword ? (
                                <VisibilityOff />
                              ) : (
                                <Visibility />
                              )}
                            </IconButton>
                          </InputAdornment>
                        }
                        aria-describedby="outlined-weight-helper-text"
                        inputProps={{
                          "aria-label": "weight",
                        }}
                      />
                    </FormControl>
                  </div>
                </Grid>
              </Grid>

              <Button
                onClick={handleResetPassword}
                variant="contained"
                // type="submit"
                disabled={buttonDisabled || changeMutation.isLoading}
                sx={{
                  color: "#fff",
                  background: "#02981D",
                  padding: ".6em",
                  fontFamily: "Montserrat",
                  boxShadow: "none",
                  "&:hover": {
                    background: "#02981d",
                  },
                }}
              >
                {buttonDisabled || changeMutation.isLoading ? (
                  <CircularProgress size="1.2rem" sx={{ color: "white" }} />
                ) : (
                  "Reset Password"
                )}
              </Button>
              <p
                onClick={() => setComponent("Login")}
                className="cursor-pointer my-3 text-center font-bold text-[#02981D] "
              >
                Back to Login
              </p>
            </form>
          </div>
        </div>
      </CustomCard>
    </>
  );
};

export default ChangePassword;
