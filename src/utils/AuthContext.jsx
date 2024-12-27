import React, { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { Box, CircularProgress } from "@mui/material";
import { getCookie, setCookie } from "./cookieAuth";
import { getUserToken } from "../helpers/getNewToken";

export function AuthProvider({ children }) {
  const refreshToken = getCookie("refreshToken");
  const [showSpinner, setShowSpinner] = useState(false);
  const [redirectToLogin, setRedirectToLogin] = useState(false);
  const token = getCookie("authToken");

  useEffect(() => {
    setShowSpinner(true);
    async function fetchUserDetails() {
      if (!token || token === "undefined" || token === "null") {
        if (
          refreshToken &&
          refreshToken !== "undefined" &&
          refreshToken !== "null"
        ) {
          try {
            const newToken = await getUserToken(refreshToken);
            if (newToken) {
              setCookie("authToken", newToken);
              setShowSpinner(false);
            } else {
              throw new Error("Failed to refresh token");
            }
          } catch (error) {
            console.error("Error fetching user details:", error.message);
            // setRedirectToLogin(true); // Redirect to login on error
            setShowSpinner(false);
          }
        } else {
          // setRedirectToLogin(true); // Redirect to login if no refresh token
          setShowSpinner(false);
        }
      } else {
        setShowSpinner(false); // Hide spinner if token is present
      }
    }

    fetchUserDetails();
  }, [refreshToken, token]);

  if (redirectToLogin) {
    return <Navigate to="/" />;
  }

  if (showSpinner) {
    return (
      <Box
        sx={{ display: "flex", justifyContent: "center", marginTop: "20vh" }}
      >
        <CircularProgress
          size="4.2rem"
          sx={{
            color: "#DC0019",
          }}
        />
      </Box>
    );
  }

  return <>{children}</>; // Proceed to render children if authenticated
}
