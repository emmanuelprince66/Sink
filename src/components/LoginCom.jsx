import React from "react";
import { useState } from "react";

import {
  CardContent,
  Checkbox,
  TextField,
  FormControlLabel,
  IconButton,
  InputAdornment,
  Button,
  Grid,
  Typography,
  InputLabel,
  CircularProgress,
} from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast, ToastContainer } from "react-toastify";

import CustomCard from "../components/CustomCard";
import MailOutlineOutlinedIcon from "@mui/icons-material/MailOutlineOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import HttpsOutlinedIcon from "@mui/icons-material/HttpsOutlined";
import { useNavigate } from "react-router";
import "react-toastify/dist/ReactToastify.min.css";
import { notiError, notiSuccess } from "../utils/noti";

import Cookies from "js-cookie";

import { AuthAxios, BaseAxios } from "../helpers/axiosInstance";

const LoginCom = ({ setComponent }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [buttonDisabled, setButtonDisabled] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm();

  const loginMutation = useMutation({
    mutationFn: async (formData) => {
      console.log(formData);
      try {
        const response = await BaseAxios({
          url: "/auth/login/",
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
      setButtonDisabled(false);
      navigate("/overview");

      const adminData = {
        email: data?.email,
        firstname: data?.firstname,
        role: data?.role,
      };

      localStorage.setItem("user", JSON.stringify(adminData));
      Cookies.set("authToken", data?.access_token);
      Cookies.set("refreshToken", data?.refresh_token);

      // Handle success, update state, or perform further actions
    },
    onError: (error) => {
      setButtonDisabled(false);
      notifyError(String(error));
    },
  });
  const handleClickShowPassword = () => setShowPassword((show) => !show);

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };
  const onSubmit = (formData) => {
    // Handle form submission here

    setButtonDisabled(true);

    loginMutation.mutate(formData);
  };

  return (
    <>
      <CustomCard>
        <div className="w-full flex flex-col items-center justify-center">
          <p className="font-bold text-[32px] mb-3">Welcome Back!</p>
          <p className="font-normal text-[16px]">
            Enter your details to login.
          </p>

          <div className="w-full">
            <form
              onSubmit={handleSubmit(onSubmit)}
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
                  <InputLabel className="text-black_0">
                    {" "}
                    <p className="font-[500] mt-3 text-[#001533]">
                      {" "}
                      Email Address{" "}
                    </p>{" "}
                  </InputLabel>
                  <TextField
                    {...register("email", {
                      required: "Email is required",
                    })}
                    required
                    fullWidth
                    sx={{
                      "& .MuiInputBase-root": { borderRadius: "8px" },
                      "& .MuiInputBase-input": { padding: "12px 0" },
                      "& .MuiOutlinedInput-root": {
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
                    id="email"
                    autoFocus
                    placeholder="example@domain.com"
                    error={Boolean(errors.email)}
                    helperText={errors.email?.message}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <MailOutlineOutlinedIcon />
                          <span className="bg-grey_1 ml-[.3em] w-[1px]">
                            {" "}
                            &nbsp;&nbsp;{" "}
                          </span>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: ".2em",
                  }}
                  item
                  xs={12}
                >
                  <InputLabel className="text-black">
                    <p className=" font-[500] text-[#001533] "> Password </p>
                  </InputLabel>
                  <TextField
                    {...register("password", {
                      required: "Password is required",
                      minLength: {
                        value: 8,
                        message: "Password must have at least 8 characters",
                      },
                    })}
                    variant="outlined"
                    required
                    fullWidth
                    sx={{
                      "& .MuiInputBase-root": { borderRadius: "8px" },
                      "& .MuiInputBase-input": { padding: "12px 0" },
                      "& .MuiOutlinedInput-root": {
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
                    className="rounded-[8px]"
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    error={Boolean(errors.password)}
                    helperText={errors.password?.message}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <HttpsOutlinedIcon />
                          <span className="bg-grey_1 ml-[.3em] w-[1px]">
                            {" "}
                            &nbsp;&nbsp;{" "}
                          </span>
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
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
                    aria-describedby="outlined-weight-helper-text"
                    inputProps={{
                      "aria-label": "weight",
                    }}
                  />
                </Grid>
              </Grid>
              <Grid
                container
                justifyContent="space-between"
                alignItems="center"
              >
                <Grid item>
                  <div className="flex items-center   ">
                    <FormControlLabel
                      control={
                        <Checkbox
                          color="primary"
                          sx={{
                            "&.Mui-checked": {
                              color: "#02981D", // Change color to red when checked
                            },
                          }}
                          //   {...register("rememberMe")}
                        />
                      }
                    />
                    <p className="ml-[-15px]">Remenber Me</p>
                  </div>
                </Grid>
                <Grid item>
                  <p
                    onClick={() => setComponent("Forget")}
                    variant="body2"
                    className="text-error_2 cursor-pointer"
                    component="a"
                    textDecoration={"none"}
                  >
                    Forgot Password?
                  </p>
                </Grid>
              </Grid>

              <Button
                variant="contained"
                type="submit"
                disabled={buttonDisabled}
                sx={{
                  color: "#fff",
                  background: "#02981D",
                  padding: ".6em",
                  boxShadow: "none",
                  "&:hover": {
                    background: "#02981d",
                  },
                }}
              >
                {buttonDisabled ? (
                  <CircularProgress size="1.2rem" sx={{ color: "white" }} />
                ) : (
                  "Login"
                )}
              </Button>
            </form>
          </div>
        </div>
      </CustomCard>

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
    </>
  );
};

export default LoginCom;
