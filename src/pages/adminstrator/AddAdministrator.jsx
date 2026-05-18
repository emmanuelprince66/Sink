import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import {
  Grid,
  TextField,
  Button,
  Select,
  MenuItem,
  Box,
  FormControl,
  CircularProgress,
} from "@mui/material";
import { useMutation } from "@tanstack/react-query";
import { getCookie } from "../../utils/cookieAuth";
import { AuthAxios } from "../../helpers/axiosInstance";
import { notiError, notiSuccess } from "../../utils/noti";
import { ToastContainer } from "react-toastify";

const AddAdministrator = ({ handleCloseAddAdminModal, setRefetchTeam }) => {
  const [buttonLoading, setButtonLoading] = useState(false);
  const {
    handleSubmit,
    control,
    watch,
    register,
    reset,
    formState: { isValid, errors },
  } = useForm({ mode: "all" });

  const token = getCookie("authToken");

  const adminInviteMutation = useMutation({
    mutationFn: async (formData) => {
      try {
        const response = await AuthAxios({
          url: "/auth/invite/",
          method: "POST",
          data: formData,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.status !== 201) {
          setButtonLoading(false);
          throw new Error(response.data.message);
        }
        console.log(response);
        return response;
      } catch (error) {
        setButtonLoading(false);

        notiError(error.response.data.message);
        throw new Error(error.response.data.message);
      }
    },
    onSuccess: (data) => {
      setButtonLoading(false);
      notiSuccess(data?.data?.message);
      setRefetchTeam((prev) => !prev);
      reset();
    },
    onError: (error) => {
      setButtonLoading(false);
    },
  });

  const onSubmit = (formData) => {
    console.log(formData);
    setButtonLoading(true);
    adminInviteMutation.mutate(formData);
  };
  return (
    <>
      a
      <div className="w-full">
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <div className="w-full flex flex-col items-start gap-1 my-2">
                <span className="flex items-center mb-1 justify-between w-full">
                  <p className="text-[#001533] font-[500] text-[16px]">
                    FIRST NAME
                    <sup className="text-[#DC3545]">*</sup>
                  </p>
                </span>

                <Controller
                  name="firstname"
                  control={control}
                  defaultValue=""
                  rules={{
                    required: "First Name is required",
                    validate: (value) =>
                      /^[^\d]+$/.test(value) ||
                      "First Name cannot contain digits",
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      placeholder="Enter First Name"
                      sx={{
                        width: "100%",
                        "& .MuiOutlinedInput-root": {
                          "& fieldset": {
                            borderRadius: "10px",
                          },
                          "&:hover fieldset": {
                            borderColor: "#015B11",
                          },
                          "&.Mui-focused fieldset": {
                            borderColor: "#015B11",
                          },
                        },
                      }}
                      error={!!errors.firstname}
                      helperText={errors.firstname && errors.firstname.message}
                    />
                  )}
                />
              </div>
            </Grid>
            <Grid item xs={6}>
              <div className="w-full flex flex-col items-start gap-1 my-2">
                <span className="flex items-center mb-1 justify-between w-full">
                  <p className="text-[#001533] font-[500] text-[16px]">
                    LAST NAME/SURNAME
                    <sup className="text-[#DC3545]">*</sup>
                  </p>
                </span>

                <Controller
                  name="lastname"
                  control={control}
                  defaultValue=""
                  rules={{
                    required: "Last Name is required",
                    validate: (value) =>
                      /^[^\d]+$/.test(value) ||
                      "Last Name cannot contain digits",
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      placeholder="Enter Last name/Surname"
                      sx={{
                        width: "100%",
                        "& .MuiOutlinedInput-root": {
                          "& fieldset": {
                            borderRadius: "10px",
                          },
                          "&:hover fieldset": {
                            borderColor: "#015B11",
                          },
                          "&.Mui-focused fieldset": {
                            borderColor: "#015B11",
                          },
                        },
                      }}
                      error={!!errors.lastname}
                      helperText={errors.lastname && errors.lastname.message}
                    />
                  )}
                />
              </div>
            </Grid>
            <Grid item xs={6}>
              <div className="w-full flex flex-col items-start gap-1 my-2">
                <span className="flex items-center mb-1 justify-between w-full">
                  <p className="text-[#001533] font-[500] text-[16px]">
                    EMAIL ADDRESS
                    <sup className="text-[#DC3545]">*</sup>
                  </p>
                </span>

                <Controller
                  name="email"
                  control={control}
                  defaultValue=""
                  rules={{
                    required: "Email is required",
                    pattern: {
                      value:
                        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/i,
                      message: "Enter a valid email address",
                    },
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      placeholder="example@domain.com"
                      sx={{
                        width: "100%",
                        "& .MuiOutlinedInput-root": {
                          "& fieldset": {
                            borderRadius: "10px",
                          },
                          "&:hover fieldset": {
                            borderColor: "#015B11",
                          },
                          "&.Mui-focused fieldset": {
                            borderColor: "#015B11",
                          },
                        },
                      }}
                      error={!!errors.email}
                      helperText={errors.email && errors.email.message}
                    />
                  )}
                />
              </div>
            </Grid>
            <Grid item xs={6}>
              <div className="w-full flex flex-col items-start gap-1 my-2">
                <span className="flex items-center mb-1 justify-between w-full">
                  <p className="text-[#001533] font-[500] text-[16px]">
                    Role
                    <sup className="text-[#DC3545]">*</sup>
                  </p>
                </span>

                <FormControl sx={{ mb: "1rem", width: "100%" }}>
                  <Controller
                    name="role"
                    control={control}
                    rules={{ required: "Role is required" }}
                    defaultValue=""
                    render={({ field }) => (
                      <Select
                        {...field}
                        sx={{
                          "& .MuiOutlinedInput-notchedOutline": {},
                          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                            borderColor: "#757575",
                          },
                          "&:hover .MuiOutlinedInput-notchedOutline": {
                            borderColor: "#757575",
                          },
                        }}
                        displayEmpty
                        error={!!errors.role}
                      >
                        <MenuItem value="" disabled>
                          <Box>Select Administrator Role</Box>
                        </MenuItem>
                        <MenuItem value="manager">Manager</MenuItem>
                        <MenuItem value="accountant">Accountant</MenuItem>
                        <MenuItem value="moderator">Moderator</MenuItem>
                        <MenuItem value="support">Support</MenuItem>
                      </Select>
                    )}
                  />

                  {errors.role && (
                    <span
                      style={{
                        color: "#DC3545",
                        fontSize: "12px",
                        marginTop: "5px",
                        marginLeft: "10px",
                      }}
                    >
                      {errors.role.message}
                    </span>
                  )}
                </FormControl>
              </div>
            </Grid>

            <div className="flex justify-end w-[70%] gap-5 ml-auto mt-6 items-center">
              <Button
                onClick={handleCloseAddAdminModal}
                variant="outlined"
                sx={{
                  textTransform: "capitalize",
                  display: "flex",
                  gap: "4px",
                  width: "100%",
                  alignItems: "center",
                  color: "#02981D",
                  padding: ".6em",
                  border: "1px solid #02981D",
                  "&:hover": {
                    border: "1px solid a#02981D",
                  },
                }}
              >
                Cancel
              </Button>
              <Button
                disabled={buttonLoading}
                variant="contained"
                type="submit"
                sx={{
                  color: "#fff",
                  width: "100%",
                  background: "#02981D",
                  padding: ".6em",
                  boxShadow: "none",
                  "&:hover": {
                    background: "#02981d",
                  },
                }}
              >
                {buttonLoading ? (
                  <CircularProgress size="1.2rem" sx={{ color: "white" }} />
                ) : (
                  "Add New Admin"
                )}
              </Button>
            </div>
          </Grid>
        </form>

        {/* <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        /> */}
      </div>
    </>
  );
};

export default AddAdministrator;
