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
  CircularProgress,
  InputLabel,
} from "@mui/material";

import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { BaseAxios } from "../helpers/axiosInstance";
import "react-toastify/dist/ReactToastify.min.css";
import { ToastContainer } from "react-toastify";
import CustomCard from "../components/CustomCard";
import { notiError, notiSuccess } from "../utils/noti";
import MailOutlineOutlinedIcon from "@mui/icons-material/MailOutlineOutlined";

const ForgetCom = ({ setComponent, setUserEmail }) => {
  const [buttonDisabled, setButtonDisabled] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm();

  const forgetMutation = useMutation({
    mutationFn: async (formData) => {
      console.log(formData);
      try {
        const response = await BaseAxios({
          url: "/auth/forget-password/",
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

      setTimeout(() => {
        setButtonDisabled(false);
        setComponent("Verify");
      }, 1000);

      // Handle success, update state, or perform further actions
    },
    onError: (error) => {
      setButtonDisabled(false);
      notifyError(String(error));
    },
  });

  const onSubmit = (formData) => {
    // Handle form submission here
    setUserEmail(formData.email);

    setButtonDisabled(true);

    forgetMutation.mutate(formData);
  };
  return (
    <>
      <CustomCard>
        <div className="w-full flex flex-col items-center justify-center">
          <p className="font-bold text-[32px] mb-3">Reset your Password</p>
          <p className="font-normal text-[16px] mb-4">
            Please enter your registered email.
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
              </Grid>

              <Button
                // onClick={() => setComponent("Verify")}
                variant="contained"
                type="submit"
                disabled={buttonDisabled || forgetMutation.isLoading}
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
                {buttonDisabled || forgetMutation.isLoading ? (
                  <CircularProgress size="1.2rem" sx={{ color: "white" }} />
                ) : (
                  "Send Verification Code"
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

export default ForgetCom;
