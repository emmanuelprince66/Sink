import React from "react";
import Login from "./pages/Login";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ForgetPassword from "./pages/ForgetPassword";
import MainLayout from "./layout/MainLayout";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./helpers/queryClient";
import { AuthProvider } from "./utils/AuthContext";
import Overview from "./pages/Overview";
import Members from "./pages/members/Members";
import Loans from "./pages/Loans";
import Notifications from "./pages/Notifications";
import Administrators from "./pages/Administrators";
import Savings from "./pages/savings/Savings";
import { DateProvider } from "./utils/DateContext";

import { createTheme, ThemeProvider } from "@mui/material/styles";
import Investment from "./pages/investments/Investment";
import Transactions from "./pages/Transactions";
import Rmerchant from "./pages/r-merchant/Rmerchant";
import MemberProfile from "./pages/members/MemberProfile";

const theme = createTheme({
  typography: {
    fontFamily: "Montserrat",
  },
});

const RoutesContainer = () => {
  const myRoutes = [
    { component: <Login />, path: "/", name: "Login Page" },
    { component: <Overview />, path: "/overview", name: "Overview" },
    { component: <Members />, path: "/members", name: "Members" },
    { component: <Savings />, path: "/savings", name: "Savings" },
    { component: <Investment />, path: "/investments", name: "Investments" },
    { component: <Transactions />, path: "/transactions", name: "Transaction" },
    { component: <Loans />, path: "/loans", name: "Loans" },
    { component: <Rmerchant />, path: "/r-merchant", name: "Rmerchant" },
    {
      component: <MemberProfile />,
      path: "/member/:id",
      name: "MemberProfile",
    },
    {
      component: <Notifications />,
      path: "/notifications",
      name: "Notifications",
    },
    {
      component: <Administrators />,
      path: "/administrator",
      name: "Administrator",
    },
  ];
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <DateProvider>
          <Router>
            <Routes>
              {myRoutes.map((item) => {
                // For the login page, render without AuthProvider
                if (item.path === "/") {
                  return (
                    <Route
                      key={item.name}
                      path={item.path}
                      element={item.component}
                    />
                  );
                } else {
                  // For other pages, wrap with AuthProvider
                  const ComponentWithAuth = (
                    <AuthProvider>
                      <MainLayout component={item.component} />
                    </AuthProvider>
                  );
                  return (
                    <Route
                      key={item.name}
                      path={item.path}
                      element={ComponentWithAuth}
                    />
                  );
                }
              })}
              <Route index path="/f-password" element={<ForgetPassword />} />
            </Routes>
          </Router>
        </DateProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default RoutesContainer;
