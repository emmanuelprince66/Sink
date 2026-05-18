import ClearRoundedIcon from "@mui/icons-material/ClearRounded";
import React, { useEffect, useState } from "react";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import {
  Button,
  FormControl,
  Grid,
  TextField,
  Select,
  MenuItem,
  FormHelperText,
  CircularProgress,
  Box,
} from "@mui/material";
import { useMutation } from "@tanstack/react-query";
import { getCookie } from "../../utils/cookieAuth";
import { AuthAxios } from "../../helpers/axiosInstance";
import { notiError, notiSuccess } from "../../utils/noti";
import { ToastContainer } from "react-toastify";

const EditAdministrator = ({
  teamMemberModalData,
  handleCloseAdminInfo,
  setRefetchTeam,
}) => {
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [id, setId] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState("");
  const [buttonLoading, setButtonLoading] = useState(false);
  const token = getCookie("authToken");
  const [emailError, setEmailError] = useState(false);
  const [firstNameError, setFirstNameError] = useState(false);
  const [lastNameError, setLastNameError] = useState(false);

  // Step 3: Handle the change event to update the state
  const handleRoleChange = (event) => {
    setRole(event.target.value);
  };
  const handleStatusChange = (event) => {
    setStatus(event.target.value);
  };

  const validateEmail = (email) => {
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return regex.test(email);
  };

  const validateName = (name) => {
    const regex = /^[a-zA-Z]+$/;
    return regex.test(name);
  };

  const handleChangeEmail = (event) => {
    const value = event.target.value;
    setEmail(value);
    setEmailError(!validateEmail(value));
  };

  const handleChangeFirstName = (event) => {
    const value = event.target.value;
    setFirstName(value);
    setFirstNameError(!validateName(value));
  };

  const handleChangeLastName = (event) => {
    const value = event.target.value;
    setLastName(value);
    setLastNameError(!validateName(value));
  };

  const adminEditInviteMutation = useMutation({
    mutationFn: async (payload) => {
      try {
        // PATCH /profile/staff/{id}/ — body: { status: "active"|"inactive", role?: "accountant"|"manager"|"moderator"|"support" }
        const response = await AuthAxios({
          url: `/profile/staff/${id}/`,
          method: "PATCH",
          data: payload,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.status !== 200) {
          setButtonLoading(false);
          throw new Error(response.data.message);
        }
        return response.data;
      } catch (error) {
        setButtonLoading(false);
        console.log(error);

        notiError("Error!");
        throw new Error(error.response.data.message);
      }
    },
    onSuccess: (data) => {
      setButtonLoading(false);
      notiSuccess("Successfull Updated!");
      setRefetchTeam((prev) => !prev);
    },
    onError: (error) => {
      setButtonLoading(false);
    },
  });

  const handleEditSubmit = () => {
    const isEmailValid = validateEmail(email);
    const isFirstNameValid = validateName(firstName);
    const isLastNameValid = validateName(lastName);

    setEmailError(!isEmailValid);
    setFirstNameError(!isFirstNameValid);
    setLastNameError(!isLastNameValid);

    if (
      isEmailValid &&
      isFirstNameValid &&
      isLastNameValid &&
      role !== "" &&
      status !== null
    ) {
      // Perform your submit logic here

      const payload = {
        role,
        status,
      };

      setButtonLoading(true);
      adminEditInviteMutation.mutate(payload);
    } else {
      notiError("Fill all fields!");
    }
  };

  useEffect(() => {
    if (!teamMemberModalData) return;
    // Name may come as firstname/lastname or single full_name
    const fn =
      teamMemberModalData?.firstname ||
      (teamMemberModalData?.full_name || "").split(" ")[0] ||
      "";
    const ln =
      teamMemberModalData?.lastname ||
      (teamMemberModalData?.full_name || "").split(" ").slice(1).join(" ") ||
      "";
    setFirstName(fn);
    setLastName(ln);
    setEmail(teamMemberModalData?.email || "");
    setId(teamMemberModalData?.id || "");
    // Status: prefer explicit "active"/"inactive" string; fall back to is_active boolean
    const apiStatus =
      typeof teamMemberModalData?.status === "string"
        ? teamMemberModalData.status.toLowerCase()
        : teamMemberModalData?.is_active === false
        ? "inactive"
        : "active";
    setStatus(apiStatus === "inactive" ? "inactive" : "active");
    // Role: only set if it matches one of the allowed API enum values
    const r = (teamMemberModalData?.role || "").toLowerCase();
    const allowed = ["manager", "accountant", "moderator", "support"];
    setRole(allowed.includes(r) ? r : "");
  }, [teamMemberModalData]);

  return (
    <>
      <div className="w-full">
        <FormControl fullwidth>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <div className="w-full flex flex-col items-start gap-1 my-2">
                <span className="flex items-center mb-1  justify-between w-full">
                  <p className="text-[#001533] font-[500] text-[16px]">
                    FIRST NAME
                    <sup className="text-[#DC3545]">*</sup>
                  </p>
                </span>
                <TextField
                  value={firstName}
                  onChange={handleChangeFirstName}
                  placeholder="First Name"
                  disabled
                  sx={{
                    width: "100%",
                    marginTop: "16px",
                    "& .MuiOutlinedInput-root": {
                      "& input": {
                        backgroundColor: "#E3E3E3", // Background color of the input
                        color: "#ACACAC", // Font color of the input
                        borderRadius: "10px", // Border radius of the input
                      },
                      "& fieldset": {
                        borderRadius: "10px",
                        border: "none",
                      },
                      "&:hover fieldset": {},
                      "&.Mui-focused fieldset": {
                        border: "none",
                      },
                    },
                  }}
                />
                {firstNameError && (
                  <FormHelperText error>
                    First name can only contain letters
                  </FormHelperText>
                )}
              </div>
            </Grid>
            <Grid item xs={6}>
              <div className="w-full flex flex-col items-start gap-1 my-2">
                <span className="flex items-center mb-1  justify-between w-full">
                  <p className="text-[#001533] font-[500] text-[16px]">
                    LAST NAME/SURNAME
                    <sup className="text-[#DC3545]">*</sup>
                  </p>
                </span>

                <TextField
                  value={lastName}
                  onChange={handleChangeLastName}
                  placeholder="Last Name"
                  disabled
                  sx={{
                    width: "100%",
                    marginTop: "16px",
                    "& .MuiOutlinedInput-root": {
                      "& input": {
                        backgroundColor: "#E3E3E3", // Background color of the input
                        color: "#ACACAC", // Font color of the input
                        borderRadius: "10px", // Border radius of the input
                      },
                      "& fieldset": {
                        borderRadius: "10px",
                        border: "none",
                      },
                      "&:hover fieldset": {},
                      "&.Mui-focused fieldset": {
                        border: "none",
                      },
                    },
                  }}
                />
                {lastNameError && (
                  <FormHelperText error>
                    Last name can only contain letters
                  </FormHelperText>
                )}
              </div>
            </Grid>
            <Grid item xs={12}>
              <div className="w-full flex flex-col items-start gap-1 my-2">
                <span className="flex items-center mb-1  justify-between w-full">
                  <p className="text-[#001533] font-[500] text-[16px]">
                    EMAIL ADDRESS
                    <sup className="text-[#DC3545]">*</sup>
                  </p>
                </span>

                <TextField
                  value={email}
                  onChange={handleChangeEmail}
                  placeholder="example@domain.com"
                  disabled
                  sx={{
                    width: "100%",
                    "& .MuiOutlinedInput-root": {
                      "& input": {
                        backgroundColor: "#E3E3E3", // Background color of the input
                        color: "#ACACAC", // Font color of the input
                        borderRadius: "10px", // Border radius of the input
                      },
                      "& fieldset": {
                        borderRadius: "10px",
                        border: "none",
                      },
                      "&:hover fieldset": {},
                      "&.Mui-focused fieldset": {
                        border: "none",
                      },
                    },
                  }}
                  inputProps={{
                    pattern: "[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$",
                    title: "Invalid email address",
                  }}
                />
                {emailError && (
                  <FormHelperText error>Invalid email address</FormHelperText>
                )}
              </div>
            </Grid>
            <Grid item xs={6}>
              <div className="w-full flex flex-col items-start gap-1 my-2">
                <span className="flex items-center mb-1  justify-between w-full">
                  <p className="text-[#001533] font-[500] text-[16px]">
                    Role
                    <sup className="text-[#DC3545]">*</sup>
                  </p>
                </span>
                <FormControl sx={{ mb: "1rem", width: "100%" }}>
                  <Select
                    value={role || ""}
                    onChange={handleRoleChange}
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
                  >
                    <MenuItem value="" disabled>
                      <Box>Select Administrator Role</Box>
                    </MenuItem>
                    <MenuItem value="manager">Manager</MenuItem>
                    <MenuItem value="accountant">Accountant</MenuItem>
                    <MenuItem value="moderator">Moderator</MenuItem>
                    <MenuItem value="support">Support</MenuItem>
                  </Select>
                </FormControl>
              </div>
            </Grid>
            <Grid item xs={6}>
              <div className="w-full flex flex-col items-start gap-1 my-2">
                <span className="flex items-center mb-1  justify-between w-full">
                  <p className="text-[#001533] font-[500] text-[16px]">
                    Status
                    <sup className="text-[#DaC3545]">*</sup>
                  </p>
                </span>
                <FormControl sx={{ mb: "1rem", width: "100%" }}>
                  <Select
                    value={status || ""}
                    onChange={handleStatusChange}
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
                  >
                    <MenuItem value="" disabled>
                      <Box> Select Status</Box>
                    </MenuItem>
                    <MenuItem value="active">Active</MenuItem>
                    <MenuItem value="inactive">Inactive</MenuItem>
                  </Select>
                </FormControl>
              </div>
            </Grid>

            <div className="flex justify-end  w-[70%] gap-5 ml-auto mt-6 items-center">
              <Button
                onClick={handleCloseAdminInfo}
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
                    border: "1px solid #02981D",
                  },
                  // lineHeight: "26.4px",
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleEditSubmit}
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
                  "Done"
                )}
              </Button>
            </div>
          </Grid>
        </FormControl>
      </div>
    </>
  );
};

export default EditAdministrator;
