import React from "react";
import {
  Grid,
  IconButton,
  TextField,
  Switch,
  Box,
  InputAdornment,
  CircularProgress,
  Button,
  FormControlLabel,
  MenuItem,
  Radio,
  Select,
  RadioGroup,
  FormControl,
} from "@mui/material";
import { useState } from "react";
import ChevronRightOutlinedIcon from "@mui/icons-material/ChevronRightOutlined";
import WestOutlinedIcon from "@mui/icons-material/WestOutlined";
import iOne from "../../assets/investment/i-1.svg";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import { useForm, Controller } from "react-hook-form";

const Rmerchant = () => {
  const [buttonDisabled, setButtonDisabled] = useState(false);

  const {
    handleSubmit,
    control,
    watch,
    register,
    formState: { isValid, errors },
  } = useForm({ mode: "all" });

  const onFormSubmit = (data) => {};
  return (
    <>
      <div className="w-[40%] mx-auto p-2">
        <form onSubmit={handleSubmit(onFormSubmit)} className="w-full">
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <div className="w-full flex flex-col items-start gap-1 my-2">
                <span className="flex items-center justify-between w-full">
                  <p className="text-[#001533] font-[500] text-[16px]">
                    NAME
                    <sup className="text-[#DC3545]">*</sup>
                  </p>
                </span>

                <Controller
                  name="sampleName"
                  control={control}
                  defaultValue=""
                  rules={{
                    required: "This field is required", // Add required validation
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      placeholder="Merchant Name"
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
                      error={!!errors.sampleName}
                      helperText={
                        errors.sampleName && errors.sampleName.message
                      }
                    />
                  )}
                />
              </div>
            </Grid>
            <Grid item xs={12}>
              <div className="w-full flex flex-col items-start gap-1 my-2">
                <span className="flex items-center justify-between w-full">
                  <p className="text-[#001533] font-[500] text-[16px]">
                    Email
                    <sup className="text-[#DC3545]">*</sup>
                  </p>
                </span>

                <Controller
                  name="email"
                  control={control}
                  defaultValue=""
                  type="email"
                  rules={{
                    required: "This field is required", // Add required validation
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      placeholder="Merchant Email"
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
            <Grid item xs={12}>
              <div className="w-full flex flex-col items-start gap-1 my-2">
                <span className="flex items-center justify-between w-full">
                  <p className="text-[#001533] font-[500] text-[16px]">
                    Phone Number
                    <sup className="text-[#DC3545]">*</sup>
                  </p>
                </span>

                <Controller
                  name="phone"
                  control={control}
                  defaultValue=""
                  rules={{
                    required: "This field is required", // Add required validation
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      placeholder="Merchant Phone Number"
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
                      error={!!errors.phone}
                      helperText={errors.phone && errors.phone.message}
                    />
                  )}
                />
              </div>
            </Grid>
            <Grid item xs={6}>
              <div className="w-full flex flex-col items-start gap-1 my-2">
                <span className="flex items-center justify-between w-full">
                  <p className="text-[#001533] font-[500] text-[16px]">
                    Location
                    <sup className="text-[#DC3545]">*</sup>
                  </p>
                </span>

                <Controller
                  name="location"
                  control={control}
                  defaultValue=""
                  rules={{
                    required: "This field is required", // Add required validation
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      placeholder="Merchant Location "
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
                      error={!!errors.location}
                      helperText={errors.location && errors.location.message}
                    />
                  )}
                />
              </div>
            </Grid>
            <Grid item xs={6}>
              <div className="w-full flex flex-col items-start gap-1 my-2">
                <span className="flex items-center justify-between w-full">
                  <p className="text-[#001533] font-[500] text-[16px]">
                    State
                    <sup className="text-[#DC3545]">*</sup>
                  </p>
                </span>

                <Controller
                  name="state"
                  control={control}
                  defaultValue=""
                  rules={{
                    required: "This field is required", // Add required validation
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      placeholder="Merchant State "
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
                      error={!!errors.state}
                      helperText={errors.state && errors.state.message}
                    />
                  )}
                />
              </div>
            </Grid>
            <Grid item xs={12}>
              <div className="w-full flex flex-col items-start gap-1 my-2">
                <span className="flex items-center mb-1 justify-between w-full">
                  <p className="text-[#001533] font-[500] text-[16px]">
                    Gender
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
                          <Box> Select Gender</Box>
                        </MenuItem>
                        <MenuItem value="male">Male</MenuItem>
                        <MenuItem value="female">Female</MenuItem>

                        {/* Corrected spelling */}
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
            <Grid item xs={12}>
              <div className="w-full flex flex-col items-start gap-1 my-2">
                <span className="flex items-center justify-between w-full">
                  <p className="text-[#001533] font-[500] text-[16px]">
                    How they hear about sync
                    <sup className="text-[#DC3545]">*</sup>
                  </p>
                </span>

                <Controller
                  name="how"
                  control={control}
                  defaultValue=""
                  rules={{
                    required: "This field is required", // Add required validation
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      placeholder="Heared about us from? "
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
                      error={!!errors.how}
                      helperText={errors.how && errors.how.message}
                    />
                  )}
                />
              </div>
            </Grid>
            <Grid item xs={12}>
              <div className="w-full flex flex-col items-start gap-1 my-2">
                <span className="flex items-center justify-between w-full">
                  <p className="text-[#001533] font-[500] text-[16px]">
                    Qualification
                    <sup className="text-[#DC3545]">*</sup>
                  </p>
                </span>

                <Controller
                  name="qualification"
                  control={control}
                  defaultValue=""
                  rules={{
                    required: "This field is required", // Add required validation
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      placeholder="Qualification "
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
                      error={!!errors.qualification}
                      helperText={
                        errors.qualification && errors.qualification.message
                      }
                    />
                  )}
                />
              </div>
            </Grid>
            <Grid item xs={12}>
              <div className="w-full flex flex-col items-start gap-1 my-2">
                <span className="flex items-center justify-between w-full">
                  <p className="text-[#001533] font-[500] text-[16px]">
                    Account Number
                    <sup className="text-[#DC3545]">*</sup>
                  </p>
                </span>

                <Controller
                  name="acnumber"
                  control={control}
                  defaultValue=""
                  rules={{
                    required: "This field is required", // Add required validation
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      placeholder="Account Number "
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
                      error={!!errors.acnumber}
                      helperText={errors.acnumber && errors.acnumber.message}
                    />
                  )}
                />
              </div>
            </Grid>
            <Grid item xs={12}>
              <div className="w-full flex flex-col items-start gap-1 my-2">
                <span className="flex items-center justify-between w-full">
                  <p className="text-[#001533] font-[500] text-[16px]">
                    Bank
                    <sup className="text-[#DC3545]">*</sup>
                  </p>
                </span>

                <Controller
                  name="bank"
                  control={control}
                  defaultValue=""
                  rules={{
                    required: "This field is required", // Add required validation
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      placeholder="Bank Name "
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
                      error={!!errors.bank}
                      helperText={errors.bank && errors.bank.message}
                    />
                  )}
                />
              </div>
            </Grid>
            <Grid item xs={12}>
              <div className="w-full flex flex-col items-start gap-1 my-2">
                <span className="flex items-center justify-between w-full">
                  <p className="text-[#001533] font-[500] text-[16px]">
                    Account Name
                    <sup className="text-[#DC3545]">*</sup>
                  </p>
                </span>

                <Controller
                  name="acname"
                  control={control}
                  defaultValue=""
                  rules={{
                    required: "This field is required", // Add required validation
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      placeholder="Account Number "
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
                      error={!!errors.acname}
                      helperText={errors.acname && errors.acname.message}
                    />
                  )}
                />
              </div>
            </Grid>

            {/* <Grid item xs={12}>
              <div className="flex items-center justify-between">
                <p className="text-general text-[16px] ">
                  Set this plan as sold out
                </p>

                <Switch
                  sx={{
                    "& .MuiSwitch-switchBase.Mui-checked": {
                      color: "#fff",
                      // "&:hover": {
                      //   backgroundColor: alpha(
                      //     pink[600],
                      //     theme.palette.action.hoverOpacity
                      //   ),
                      // },
                    },
                    "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                      backgroundColor: "#02981D",
                    },
                  }}
                  defaultChecked
                  color="default"
                />
              </div>
            </Grid> */}
            <Grid item xs={12}>
              <div className="flex items-center gap-4 w-full justify-end mt-4">
                <Button
                  disabled={buttonDisabled}
                  type="submit"
                  variant="contained"
                  sx={{
                    color: "#fff",
                    minWidth: "20rem",
                    background: "#02981D",
                    padding: ".9em",
                    boxShadow: "none",
                    "&:hover": {
                      background: "#02981d",
                    },
                  }}
                >
                  {buttonDisabled ? (
                    <CircularProgress
                      size="1.2rem"
                      sx={{ color: "white", mb: "17px" }}
                    />
                  ) : (
                    <span className="w-full">
                      <AddRoundedIcon />
                      Register
                    </span>
                  )}
                </Button>
              </div>
            </Grid>
          </Grid>
        </form>
      </div>
    </>
  );
};

export default Rmerchant;
