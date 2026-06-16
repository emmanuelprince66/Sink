import { QueryClientProvider } from "@tanstack/react-query";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import { queryClient } from "./helpers/queryClient";
import MainLayout from "./layout/MainLayout";
import Administrators from "./pages/Administrators";
import ForgetPassword from "./pages/ForgetPassword";
import Loans from "./pages/Loans";
import Login from "./pages/Login";
import Notifications from "./pages/Notifications";
import Overview from "./pages/Overview";
import Members from "./pages/members/Members";
import Savings from "./pages/savings/Savings";
import { AuthProvider } from "./utils/AuthContext";
import { DateProvider } from "./utils/DateContext";

import { createTheme, ThemeProvider } from "@mui/material/styles";
import Transactions from "./pages/Transactions";
import RolesPermissions from "./pages/adminstrator/RolesPermissions";
import EngagementHub from "./pages/communications/EngagementHub";
import Investment from "./pages/investments/Investment";
import KYCDetailPage from "./pages/kyc/KYCDetailPage";
import KYCManagement from "./pages/kyc/KYCManagement";
import LogisticsDashboard from "./pages/logistics/LogisticsDashboard";
import MemberProfile from "./pages/members/MemberProfile";
import PaymentsDashboard from "./pages/payments/PaymentsDashboard";
import Partners from "./pages/partners/Partners";
import Referrals from "./pages/referrals/Referrals";
import ReferrerDetailPage from "./pages/referrals/ReferrerDetailPage";
import Rmerchant from "./pages/r-merchant/Rmerchant";
import SubscriptionManagement from "./pages/subscriptions/SubscriptionManagement";
import UserManagement from "./pages/users/UserManagement";
import UserProfile from "./pages/users/UserProfile";

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
    { component: <Transactions />, path: "/campaign", name: "Campaign" },
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
    {
      component: <KYCManagement />,
      path: "/kyc",
      name: "KYC Management",
    },
    {
      component: <KYCDetailPage />,
      path: "/kyc/:segment/:id",
      name: "KYC Detail",
    },
    {
      component: <EngagementHub />,
      path: "/engagement",
      name: "Engagement Hub",
    },
    {
      component: <LogisticsDashboard />,
      path: "/logistics",
      name: "Logistics",
    },
    {
      component: <RolesPermissions />,
      path: "/roles",
      name: "Roles & Permissions",
    },
    {
      component: <UserManagement />,
      path: "/users",
      name: "User Management",
    },
    {
      component: <UserProfile />,
      path: "/users/:id",
      name: "User Profile",
    },
    {
      component: <SubscriptionManagement />,
      path: "/subscriptions",
      name: "Subscription Management",
    },
    {
      component: <PaymentsDashboard />,
      path: "/payments",
      name: "Payments Dashboard",
    },
    {
      component: <Partners />,
      path: "/partners",
      name: "Partners",
    },
    {
      component: <Referrals />,
      path: "/referrals",
      name: "Referrals",
    },
    {
      component: <ReferrerDetailPage />,
      path: "/referrals/:id",
      name: "Referrer Detail",
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
