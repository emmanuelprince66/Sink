import {
  CheckRounded as CheckRoundedIcon,
  ClearRounded as ClearRoundedIcon,
  SearchOutlined as SearchOutlinedIcon,
} from "@mui/icons-material";
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  Grid,
  InputAdornment,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { ToastContainer } from "react-toastify";
import CampaignUnit from "./transactions/CampaignUnit";
import Funding from "./transactions/Funding";
import Subscription from "./transactions/Subscription";
import CampaignDashboard from "./transactions/CampaignDashboard";
// Components and Utils
import CustomCard from "../components/CustomCard";
import CustomModal from "../components/CustomModal";
import CustomSuccessModal from "../components/CustomSuccessModal";
import CustomSuccessRequestModal from "../components/CustomSuccessRequestModal";
import SelectDate from "../components/SelectDate";
import DeclineModal from "./transactions/DeclineModal";
import PaymentTable from "./transactions/PaymentTable";
import Referrals from "./transactions/Referrals";
import TransactionTable from "./transactions/TransactionTable";

// API and Hooks
import {
  acceptWithdrawalUrl,
  checkNameForWithdrawalApprovalUrl,
  transactionsCampaignUnitDataUrl,
  transactionsMarketAutomationDataUrl,
  transactionsPaymentDataUrl,
  transactionsSubscriptionDataUrl,
} from "../api/endpoint";

import { AuthAxios } from "../helpers/axiosInstance";
import useFetchData from "../hooks/useFetchData";

// Utils and Assets
import tOne from "../assets/transactions/t-1.svg";
import { useDateContext } from "../utils/DateContext";
import FormattedPrice from "../utils/FormattedPrice";
import formattedDate from "../utils/formattedDate";
import { notiError } from "../utils/noti";

// Constants
const TRANSACTION_TABS = {
  PAYMENT: 0,
  SUBSCRIPTION: 1,
  MARKETING: 2,
  CAMPAIGN: 3,
};

const MARKETING_TABS = {
  FUNDING: 0,
  CAMPAIGNS: 1,
};

const FILTER_OPTIONS = [
  { key: "", label: "All Transactions", isDefault: true },
  { key: "WALLET-CREDIT", label: "Wallet Credit" },
  { key: "DATA_AND_AIRTIME", label: "Data Purchase" },
  { key: "WITHDRAWAL", label: "Withdrawal" },
  { key: "referral", label: "Referral" },
];

const STATUS_OPTIONS = ["Pending", "Successful", "Failed"];

// Custom Hooks
const useTransactionState = () => {
  const [activeTab, setActiveTab] = useState(TRANSACTION_TABS.CAMPAIGN);
  const [marketingTab, setMarketingTab] = useState(MARKETING_TABS.FUNDING);
  const [searchValue, setSearchValue] = useState("");
  const [trxFilter, setTrxFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(100);
  const [page, setPage] = useState(0);

  return {
    activeTab,
    setActiveTab,
    marketingTab,
    setMarketingTab,
    searchValue,
    setSearchValue,
    trxFilter,
    setTrxFilter,
    currentPage,
    setCurrentPage,
    rowsPerPage,
    setRowsPerPage,
    page,
    setPage,
  };
};

const useModalState = () => {
  const [modals, setModals] = useState({
    transaction: false,
    withdrawal: false,
    success: false,
    request: false,
    decline: false,
  });

  const [modalData, setModalData] = useState({
    transaction: null,
    withdrawal: null,
  });

  const openModal = (modalName, data = null) => {
    setModals((prev) => ({ ...prev, [modalName]: true }));
    if (data) {
      setModalData((prev) => ({
        ...prev,
        [modalName.replace("Modal", "")]: data,
      }));
    }
  };

  const closeModal = (modalName) => {
    setModals((prev) => ({ ...prev, [modalName]: false }));
    if (modalName !== "success" && modalName !== "request") {
      setModalData((prev) => ({
        ...prev,
        [modalName.replace("Modal", "")]: null,
      }));
    }
  };

  return { modals, modalData, openModal, closeModal };
};

// Components
const TransactionHeader = ({ onDateChange }) => (
  <div className="w-full flex items-center justify-between mb-2">
    <h1 className="font-semibold text-xl text-gray-900">Campaign</h1>
    <SelectDate onChange={onDateChange} />
  </div>
);

const SearchAndExport = ({ searchValue, onSearchChange }) => (
  <div className="w-full flex items-center justify-between mb-4">
    <TextField
      value={searchValue}
      onChange={(e) => onSearchChange(e.target.value)}
      placeholder="Search recipient name"
      size="small"
      sx={{ width: "50%" }}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchOutlinedIcon sx={{ color: "#757575" }} />
          </InputAdornment>
        ),
      }}
    />

    <Button
      sx={{
        background: "#FAFAFA",
        borderRadius: "8px",
        px: 3,
        border: "1px solid #C8C8C8",
        color: "#02981D",
        "&:hover": { backgroundColor: "#FAFAFA" },
        textTransform: "capitalize",
        fontWeight: 600,
        display: "flex",
        alignItems: "center",
        gap: 1,
      }}
    >
      <img src={tOne} alt="export" />
      Export
    </Button>
  </div>
);

const FilterButtons = ({ activeFilter, onFilterChange, activeTab }) => {
  // Filter options based on active tab
  const getFilterOptions = () => {
    if (activeTab === TRANSACTION_TABS.PAYMENT) {
      return FILTER_OPTIONS.filter((option) => option.key !== "referral");
    }
    return FILTER_OPTIONS; // For subscription tab, show all options
  };

  const filterOptions = getFilterOptions();

  return (
    <div className="flex gap-3 items-center mb-6 flex-wrap">
      {filterOptions.map((option) => (
        <Button
          key={option.key}
          onClick={() => onFilterChange(option.key)}
          sx={{
            background: activeFilter === option.key ? "#FAFAFA" : "#fff",
            borderRadius: "8px",
            px: 3,
            py: 1,
            border:
              activeFilter === option.key
                ? "1px solid #02981D"
                : "1px solid #C8C8C8",
            color: activeFilter === option.key ? "#02981D" : "#5E5E5E",
            "&:hover": {
              backgroundColor:
                activeFilter === option.key ? "#FAFAFA" : "#f5f5f5",
            },
            textTransform: "capitalize",
            fontWeight: 400,
            minWidth: "auto",
          }}
        >
          {option.label}
        </Button>
      ))}
    </div>
  );
};

// Payment Transaction Cards Component
const PaymentCards = ({ transactionsData }) => {
  // Mock data - replace with actual API data
  const paymentData = {
    totalInflow: transactionsData?.totals?.inflow, // in cents/kobo
    totalOutflow: transactionsData?.totals?.outflow,
    totalWalletBalance: transactionsData?.totals?.wallet_balance || 0,
    totalProfit: transactionsData?.totals?.revenue_profit || 0,
    totalRevenueLoss: transactionsData?.totals?.revenue_loss || 0,
  };

  return (
    <Grid container md={12} spacing={2} className="mb-6">
      <Grid item xs={12} sm={6} md={2}>
        <Card
          sx={{
            borderRadius: "12px",
            backgroundColor: "#fff",
            boxShadow:
              "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
            border: "1px solid #f3f4f6",
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Typography
              variant="body2"
              sx={{
                color: "#6b7280",
                mb: 1,
                fontSize: "14px",
                fontWeight: 500,
              }}
            >
              Total Inflow
            </Typography>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 500,
                color: "#111827",
                mb: 0.5,
                fontSize: "1rem",
              }}
            >
              <FormattedPrice amount={paymentData.totalInflow} />
            </Typography>
            <Typography variant="caption" sx={{ color: "#9ca3af" }}>
              Money received
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} sm={6} md={2.5}>
        <Card
          sx={{
            borderRadius: "12px",
            backgroundColor: "#fff",
            boxShadow:
              "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
            border: "1px solid #f3f4f6",
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Typography
              variant="body2"
              sx={{
                color: "#6b7280",
                mb: 1,
                fontSize: "14px",
                fontWeight: 500,
              }}
            >
              Total Outflow
            </Typography>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 500,
                color: "#111827",
                mb: 0.5,
                fontSize: "1rem",
              }}
            >
              <FormattedPrice amount={paymentData.totalOutflow} />
            </Typography>
            <Typography variant="caption" sx={{ color: "#9ca3af" }}>
              Money sent out
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} sm={6} md={2.5}>
        <Card
          sx={{
            borderRadius: "12px",
            backgroundColor: "#fff",
            boxShadow:
              "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
            border: "1px solid #f3f4f6",
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Typography
              variant="body2"
              sx={{
                color: "#6b7280",
                mb: 1,
                fontSize: "14px",
                fontWeight: 500,
              }}
            >
              Total Wallet Balance
            </Typography>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 500,
                color: "#111827",
                mb: 0.5,
                fontSize: "1rem",
              }}
            >
              <FormattedPrice amount={paymentData?.totalWalletBalance} />
            </Typography>
            <Typography variant="caption" sx={{ color: "#9ca3af" }}>
              Available balance
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} sm={6} md={2.5}>
        <Card
          sx={{
            borderRadius: "12px",
            backgroundColor: "#fff",
            boxShadow:
              "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
            border: "1px solid #f3f4f6",
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Typography
              variant="body2"
              sx={{
                color: "#6b7280",
                mb: 1,
                fontSize: "14px",
                fontWeight: 500,
              }}
            >
              Total Profit
            </Typography>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 500,
                color: "#111827",
                mb: 0.5,
                fontSize: "1rem",
              }}
            >
              <FormattedPrice amount={paymentData.totalProfit} />
            </Typography>
            <Typography variant="caption" sx={{ color: "#9ca3af" }}>
              Net profit earned
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} sm={6} md={2.5}>
        <Card
          sx={{
            borderRadius: "12px",
            backgroundColor: "#fff",
            boxShadow:
              "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
            border: "1px solid #f3f4f6",
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Typography
              variant="body2"
              sx={{
                color: "#6b7280",
                mb: 1,
                fontSize: "14px",
                fontWeight: 500,
              }}
            >
              Total Loss
            </Typography>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 500,
                color: "#111827",
                mb: 0.5,
                fontSize: "1rem",
              }}
            >
              <FormattedPrice amount={paymentData.totalRevenueLoss} />
            </Typography>
            <Typography variant="caption" sx={{ color: "#9ca3af" }}>
              Net loss incurred
            </Typography>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

// Subscription Cards Componentx
const SubscriptionCards = ({ subscriptionLoading, subscriptionData }) => {
  // Mock data - replace with actual API data
  const subscriptionDataOptions = {
    totalSubscribedUsers: subscriptionLoading
      ? 0
      : subscriptionData?.totals?.subscribers ?? 0,
    totalSubscriptionAmount: subscriptionLoading
      ? 0
      : subscriptionData?.totals?.subscription_amount ?? 0, // in cents/kobo
    totalSubscriptions: subscriptionLoading
      ? 0
      : subscriptionData?.totals?.subscriptions ?? 0, // in cents/kobo
  };

  return (
    <Grid container spacing={3} className="mb-6">
      <Grid item xs={12} md={4}>
        <Card
          sx={{
            borderRadius: "12px",
            backgroundColor: "#fff",
            boxShadow:
              "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
            border: "1px solid #f3f4f6",
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Typography
              variant="body2"
              sx={{
                color: "#6b7280",
                mb: 1,
                fontSize: "14px",
                fontWeight: 500,
              }}
            >
              Total Subscribed Users
            </Typography>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 600,
                color: "#111827",
                mb: 0.5,
                fontSize: "1.5rem",
              }}
            >
              {subscriptionDataOptions.totalSubscribedUsers.toLocaleString()}
            </Typography>
            <Typography variant="caption" sx={{ color: "#9ca3af" }}>
              Active subscribers
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={4}>
        <Card
          sx={{
            borderRadius: "12px",
            backgroundColor: "#fff",
            boxShadow:
              "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
            border: "1px solid #f3f4f6",
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Typography
              variant="body2"
              sx={{
                color: "#6b7280",
                mb: 1,
                fontSize: "14px",
                fontWeight: 500,
              }}
            >
              Total Subscription Amount
            </Typography>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 600,
                color: "#111827",
                mb: 0.5,
                fontSize: "1.5rem",
              }}
            >
              <FormattedPrice
                amount={subscriptionDataOptions.totalSubscriptionAmount}
              />
            </Typography>
            <Typography variant="caption" sx={{ color: "#9ca3af" }}>
              Revenue generated
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={4}>
        <Card
          sx={{
            borderRadius: "12px",
            backgroundColor: "#fff",
            boxShadow:
              "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
            border: "1px solid #f3f4f6",
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Typography
              variant="body2"
              sx={{
                color: "#6b7280",
                mb: 1,
                fontSize: "14px",
                fontWeight: 500,
              }}
            >
              Total Subscriptions
            </Typography>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 600,
                color: "#111827",
                mb: 0.5,
                fontSize: "1.5rem",
              }}
            >
              {subscriptionDataOptions.totalSubscriptions}
            </Typography>
            <Typography variant="caption" sx={{ color: "#9ca3af" }}>
              Total Number Of Subscriptions
            </Typography>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

// Marketing Automation Cards Component
const MarketingCards = ({ automationData, automationLoading }) => {
  // Mock data - replace with actual API data
  const marketingData = {
    totalCredit: automationData?.total_available_credit, // in cents/kobo
    totalFunding: automationData?.total_funding,
    totalCreditUsed: automationData?.total_credit_used,
  };

  return (
    <Grid container spacing={3} className="mb-6">
      <Grid item xs={12} md={4}>
        <Card
          sx={{
            borderRadius: "12px",
            backgroundColor: "#fff",
            boxShadow:
              "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
            border: "1px solid #f3f4f6",
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Typography
              variant="body2"
              sx={{
                color: "#6b7280",
                mb: 1,
                fontSize: "14px",
                fontWeight: 500,
              }}
            >
              Total Credit
            </Typography>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 600,
                color: "#111827",
                mb: 0.5,
                fontSize: "1.5rem",
              }}
            >
              <FormattedPrice amount={marketingData.totalCredit} />
            </Typography>
            <Typography variant="caption" sx={{ color: "#9ca3af" }}>
              Available credits
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={4}>
        <Card
          sx={{
            borderRadius: "12px",
            backgroundColor: "#fff",
            boxShadow:
              "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
            border: "1px solid #f3f4f6",
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Typography
              variant="body2"
              sx={{
                color: "#6b7280",
                mb: 1,
                fontSize: "14px",
                fontWeight: 500,
              }}
            >
              Total Funding
            </Typography>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 600,
                color: "#111827",
                mb: 0.5,
                fontSize: "1.5rem",
              }}
            >
              <FormattedPrice amount={marketingData.totalFunding} />
            </Typography>
            <Typography variant="caption" sx={{ color: "#9ca3af" }}>
              Total funded amount
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={4}>
        <Card
          sx={{
            borderRadius: "12px",
            backgroundColor: "#fff",
            boxShadow:
              "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
            border: "1px solid #f3f4f6",
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Typography
              variant="body2"
              sx={{
                color: "#6b7280",
                mb: 1,
                fontSize: "14px",
                fontWeight: 500,
              }}
            >
              Total Credit Used
            </Typography>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 600,
                color: "#111827",
                mb: 0.5,
                fontSize: "1.5rem",
              }}
            >
              <FormattedPrice amount={marketingData.totalCreditUsed} />
            </Typography>
            <Typography variant="caption" sx={{ color: "#9ca3af" }}>
              Credits utilized
            </Typography>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

// Marketing Automation Sub-tabs Component
const MarketingSubTabs = ({ activeTab, onTabChange }) => (
  <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 4 }}>
    <Tabs
      value={activeTab}
      onChange={onTabChange}
      sx={{
        "& .MuiTab-root": {
          textTransform: "none",
          fontSize: "14px",
          fontWeight: 500,
          minWidth: "auto",
          px: 3,
        },
        "& .Mui-selected": {
          color: "#02981D !important",
        },
        "& .MuiTabs-indicator": {
          backgroundColor: "#02981D",
        },
      }}
    >
      <Tab label="Funding" />
      <Tab label="Campaign Units" />
    </Tabs>
  </Box>
);

const TransactionModal = ({ open, onClose, data }) => (
  <CustomModal open={open} closeModal={onClose}>
    <div className="w-full flex flex-col items-start gap-4">
      <div className="flex items-center justify-between w-full">
        <ClearRoundedIcon
          onClick={onClose}
          sx={{ color: "#1E1E1E", cursor: "pointer" }}
        />
      </div>

      <div className="flex flex-col items-start gap-4 w-full">
        <h3 className="text-gray-900 font-medium text-sm">
          TRANSACTION DETAILS
        </h3>

        <div className="rounded-md w-full border border-gray-300 p-4 flex flex-col gap-3">
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">Origin:</span>
            <span className="text-sm text-gray-900 font-medium">
              {data?.sender || "N/A"}
            </span>
          </div>
          <Divider />

          <div className="flex justify-between">
            <span className="text-sm text-gray-500">Recipient:</span>
            <span className="text-sm text-gray-900 font-medium">
              {data?.recipient || "N/A"}
            </span>
          </div>
          <Divider />

          <div className="flex justify-between">
            <span className="text-sm text-gray-500">Amount:</span>
            <span className="text-sm text-gray-900 font-medium">
              <FormattedPrice amount={data?.amount} />
            </span>
          </div>
          <Divider />

          <div className="flex justify-between">
            <span className="text-sm text-gray-500">Status:</span>
            <span className="text-sm text-gray-900 font-medium">
              {data?.status || "N/A"}
            </span>
          </div>
          <Divider />

          <div className="flex justify-between">
            <span className="text-sm text-gray-500">Date:</span>
            <span className="text-sm text-gray-900 font-medium">
              {formattedDate(data?.date)}
            </span>
          </div>
        </div>
      </div>

      <div className="flex justify-end w-full">
        <Button
          onClick={onClose}
          variant="contained"
          sx={{
            color: "#fff",
            background: "#02981D",
            px: 4,
            py: 1,
            boxShadow: "none",
            "&:hover": { background: "#02981D" },
          }}
        >
          Done
        </Button>
      </div>
    </div>
  </CustomModal>
);

const WithdrawalModal = ({
  open,
  onClose,
  data,
  showAcctDetails,
  onShowDetails,
  onApprove,
  onDecline,
  loading,
}) => (
  <CustomModal open={open} closeModal={onClose}>
    <div className="w-full flex flex-col items-start gap-4">
      <div className="flex items-center justify-between w-full">
        <h2 className="text-gray-900 font-medium text-xl">
          Withdrawal Request
        </h2>
        <ClearRoundedIcon
          onClick={onClose}
          sx={{ color: "#1E1E1E", cursor: "pointer" }}
        />
      </div>

      {/* User Details */}
      <div className="w-full">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-gray-900 font-medium text-sm">USER DETAILS</h3>
          <Button
            sx={{
              background: "#FAFAFA",
              borderRadius: "8px",
              px: 2,
              border: "1px solid #C8C8C8",
              color: "#02981D",
              "&:hover": { backgroundColor: "#FAFAFA" },
              fontWeight: 600,
              fontSize: "14px",
            }}
          >
            Go to profile
          </Button>
        </div>

        <div className="rounded-md w-full border border-gray-300 p-4 flex flex-col gap-3">
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">User:</span>
            <span className="text-sm text-gray-900 font-medium">
              {data?.lastname} {data?.firstname}
            </span>
          </div>
          <Divider />

          <div className="flex justify-between">
            <span className="text-sm text-gray-500">Email:</span>
            <span className="text-sm text-gray-900 font-medium">
              {data?.email}
            </span>
          </div>
          <Divider />

          <div className="flex justify-between">
            <span className="text-sm text-gray-500">Phone Number:</span>
            <span className="text-sm text-gray-900 font-medium">
              {data?.phone}
            </span>
          </div>
        </div>
      </div>

      {/* Transaction Details */}
      <div className="w-full">
        <h3 className="text-gray-900 font-medium text-sm mb-2">
          TRANSACTION DETAILS
        </h3>
        <div className="rounded-md w-full border border-gray-300 p-4 flex flex-col gap-3">
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">Description:</span>
            <span className="text-sm text-gray-900 font-medium">
              {data?.description}
            </span>
          </div>
          <Divider />

          <div className="flex justify-between">
            <span className="text-sm text-gray-500">Date:</span>
            <span className="text-sm text-gray-900 font-medium">
              {formattedDate(data?.created_at)}
            </span>
          </div>
        </div>
      </div>

      {/* Withdrawal Details */}
      {showAcctDetails && (
        <div className="w-full">
          <h3 className="text-gray-900 font-medium text-sm mb-2">
            WITHDRAWAL DETAILS
          </h3>
          <div className="rounded-md w-full border border-gray-300 bg-gray-50 p-4 flex flex-col gap-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Amount:</span>
              <span className="text-sm text-gray-900 font-medium">
                <FormattedPrice amount={data?.withdrawal_details?.amount} />
              </span>
            </div>
            <Divider />

            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Bank Name:</span>
              <span className="text-sm text-gray-900 font-medium">
                {data?.withdrawal_details?.bank_name}
              </span>
            </div>
            <Divider />

            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Account Number:</span>
              <span className="text-sm text-gray-900 font-medium">
                {data?.withdrawal_details?.account_number}
              </span>
            </div>
            <Divider />

            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Account Name:</span>
              <span className="text-sm text-gray-900 font-medium">
                {data?.withdrawal_details?.account_name || "N/A"}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      {showAcctDetails ? (
        <div className="w-full">
          <h3 className="text-gray-900 font-medium text-sm mb-3">ACTION</h3>
          <div className="flex gap-4">
            <Button
              onClick={() => onDecline(data?.withdrawal_details?.id)}
              variant="contained"
              sx={{
                color: "#DC3545",
                background: "#F7F7F7",
                boxShadow: "none",
                px: 4,
                py: 2,
                textTransform: "capitalize",
                "&:hover": { background: "#F7F7F7" },
              }}
            >
              <ClearRoundedIcon sx={{ mr: 1 }} />
              Decline
            </Button>

            <Button
              onClick={() => onApprove(data?.withdrawal_details?.id)}
              variant="contained"
              disabled={loading}
              sx={{
                color: "#02981D",
                background: "#F7F7F7",
                boxShadow: "none",
                px: 4,
                py: 2,
                textTransform: "capitalize",
                "&:hover": { background: "#F7F7F7" },
              }}
            >
              {loading ? (
                <CircularProgress size="1.2rem" sx={{ color: "#02981D" }} />
              ) : (
                <>
                  <CheckRoundedIcon sx={{ mr: 1 }} />
                  Approve
                </>
              )}
            </Button>
          </div>
        </div>
      ) : (
        <Button
          onClick={() => onShowDetails(data?.id)}
          variant="contained"
          sx={{
            color: "#02981D",
            background: "#F7F7F7",
            boxShadow: "none",
            px: 4,
            py: 2,
            textTransform: "capitalize",
            "&:hover": { background: "#F7F7F7" },
          }}
        >
          Proceed
        </Button>
      )}
    </div>
  </CustomModal>
);

// Main Component
const Transactions = () => {
  // Hooks
  const { selectedDates } = useDateContext();

  console.log("selectedDates", selectedDates);

  console.log(selectedDates?.startDate, selectedDates?.endDate);

  const transactionState = useTransactionState();
  const { modals, modalData, openModal, closeModal } = useModalState();
  const { handleSubmit, control } = useForm({ mode: "all" });

  // Additional State
  const [showAcctName, setShowAcctName] = useState(false);
  const [buttonLoading, setButtonLoading] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  const [sessionId, setSessionId] = useState("");
  const [approveWithId, setApproveWithId] = useState("");
  const [declineId, setDeclineId] = useState("");

  console.log("transactionState", transactionState);

  // API Calls
  const apiUrl = transactionsPaymentDataUrl(
    transactionState.currentPage,
    transactionState.rowsPerPage,
    transactionState.searchValue,
    transactionState.trxFilter,
    selectedDates
  );
  const subscriptionApiUrl = transactionsSubscriptionDataUrl(
    transactionState.currentPage,
    transactionState.rowsPerPage,
    transactionState.searchValue,
    transactionState.trxFilter,
    selectedDates
  );
  const automationApiUrl = transactionsMarketAutomationDataUrl(
    transactionState.currentPage,
    transactionState.rowsPerPage,
    transactionState.searchValue,
    transactionState.trxFilter,
    selectedDates
  );
  const campaignUnitApiUrl = transactionsCampaignUnitDataUrl(
    transactionState.currentPage,
    transactionState.rowsPerPage,
    transactionState.searchValue,
    transactionState.trxFilter,
    selectedDates
  );

  const queryKey = [
    "fetchTransactionData",
    apiUrl,
    transactionState.trxFilter,
    transactionState.searchValue,
  ];
  const queryKeySub = [
    "fetchSubscriptionTransactionData",
    subscriptionApiUrl,
    transactionState.trxFilter,
    transactionState.searchValue,
  ];
  const queryKeyAut = [
    "fetchAutomationTransactionData",
    automationApiUrl,
    transactionState.trxFilter,
    transactionState.searchValue,
  ];
  const queryKeyCampaign = [
    "fetchCampaignUnitTransactionData",
    campaignUnitApiUrl,
    transactionState.trxFilter,
    transactionState.searchValue,
  ];
  const {
    isLoading,
    data: transactionsData,
    refetch,
  } = useFetchData(queryKey, apiUrl);
  const {
    isLoading: subscriptionLoading,
    data: subscriptionData,
    refetch: refetchSubscription,
  } = useFetchData(queryKeySub, subscriptionApiUrl);
  const {
    isLoading: automationLoading,
    data: automationData,
    refetch: refetchAutomation,
  } = useFetchData(queryKeyAut, automationApiUrl);
  const {
    isLoading: campaignLoading,
    data: campaignUnitData,
    refetch: refetchCampaign,
  } = useFetchData(queryKeyCampaign, campaignUnitApiUrl);

  console.log("transactionsData", transactionsData);

  // Event Handlers
  const handleTabChange = (event, newValue) => {
    transactionState.setActiveTab(newValue);
    // Reset filters when changing tabs
    transactionState.setTrxFilter("");
    transactionState.setSearchValue("");
  };

  const handleMarketingTabChange = (event, newValue) => {
    transactionState.setMarketingTab(newValue);
  };

  const handleOpenModal = (item) => {
    console.log("Opening modal for item:", item);

    if (item?.type === "WITHDRAWAL") {
      openModal("withdrawal", item);
    } else {
      openModal("transaction", item);
    }
  };

  const handleShowAcctName = (id) => {
    console.log("Showing account details for:", id);
    setShowAcctName(true);
  };

  const handleOpenApproveReq = async (id) => {
    setApproveWithId(id);
    const isValid = await checkNameValidator(id);

    if (isValid) {
      openModal("request");
      closeModal("withdrawal");
    }
  };

  const handleOpenDeclineReq = (id) => {
    setDeclineId(id);
    openModal("decline");
    closeModal("withdrawal");
  };

  const checkNameValidator = async (id) => {
    try {
      setButtonLoading(true);
      const response = await AuthAxios.get(
        checkNameForWithdrawalApprovalUrl(id)
      );
      setSessionId(response?.data?.id);
      return true;
    } catch (error) {
      notiError(error?.response?.data?.message);
      return false;
    } finally {
      setButtonLoading(false);
    }
  };

  const PaymentCardsSkeleton = () => (
    <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
      {[...Array(5)].map((_, idx) => (
        <Box
          key={idx}
          sx={{
            flex: 1,
            height: 120,
            borderRadius: "12px",
            backgroundColor: "#f3f4f6",
            boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            animation: "pulse 1.5s infinite",
          }}
          className="animate-pulse"
        >
          <Box
            sx={{
              width: "60%",
              height: 18,
              borderRadius: "4px",
              backgroundColor: "#e0e0e0",
              mb: 1,
            }}
          />
          <Box
            sx={{
              width: "40%",
              height: 28,
              borderRadius: "4px",
              backgroundColor: "#e0e0e0",
              mb: 1,
            }}
          />
          <Box
            sx={{
              width: "50%",
              height: 14,
              borderRadius: "4px",
              backgroundColor: "#e0e0e0",
            }}
          />
        </Box>
      ))}
    </Box>
  );
  // ...existing code...

  const checkNameForWithdrawalReq = async () => {
    try {
      setIsPosting(true);
      const payload = { session_id: sessionId };
      const response = await AuthAxios.post(
        acceptWithdrawalUrl(approveWithId),
        payload
      );
      console.log("Approval response:", response);
      openModal("success");
      closeModal("request");
      refetch();
    } catch (error) {
      notiError(error?.response?.data?.message);
    } finally {
      setIsPosting(false);
    }
  };

  const handlePageChange = (page) => {
    transactionState.setCurrentPage(page);
  };

  const renderTabContent = () => {
    if (transactionState.trxFilter === "referral") {
      return <Referrals />;
    }

    switch (transactionState.activeTab) {
      case TRANSACTION_TABS.PAYMENT:
        return (
          <>
            {isLoading ? (
              <PaymentCardsSkeleton />
            ) : (
              <PaymentCards transactionsData={transactionsData} />
            )}
            <PaymentTable
              isLoading={isLoading}
              handleOpenModal={handleOpenModal}
              transactionsData={transactionsData}
              page={transactionState.page}
              onPageChange={handlePageChange}
              totalPages={transactionsData?.transactions?.total_pages}
              rowsPerPage={transactionState.rowsPerPage}
              currentPage={transactionState.currentPage}
            />
          </>
        );

      case TRANSACTION_TABS.SUBSCRIPTION:
        return (
          <>
            <SubscriptionCards
              subscriptionLoading={subscriptionLoading}
              subscriptionData={subscriptionData}
            />
            <Subscription
              subscriptionLoading={subscriptionLoading}
              subscriptionData={subscriptionData}
              rowsPerPage={transactionState.rowsPerPage}
              currentPage={transactionState.currentPage}
              onPageChange={handlePageChange}
              totalPages={subscriptionData?.pages || 20}
              page={transactionState.page}
            />
          </>
        );

      case TRANSACTION_TABS.MARKETING:
        return (
          <>
            <MarketingCards
              automationLoading={automationLoading}
              automationData={automationData}
            />
            <MarketingSubTabs
              activeTab={transactionState.marketingTab}
              onTabChange={handleMarketingTabChange}
            />
            {transactionState.marketingTab === MARKETING_TABS.FUNDING ? (
              <Funding
                automationData={automationData}
                automationLoading={automationLoading}
                page={transactionState.page}
                onPageChange={handlePageChange}
                totalPages={automationData?.total_pages}
                rowsPerPage={transactionState.rowsPerPage}
                currentPage={automationData?.page || 1}
              />
            ) : (
              <CampaignUnit
                campaignUnitData={campaignUnitData}
                campaignLoading={campaignLoading}
                page={transactionState.page}
                rowsPerPage={transactionState.rowsPerPage}
                totalPages={campaignUnitData?.total_pages}
                currentPage={campaignUnitData?.page || 1}
                onPageChange={handlePageChange}
              />
            )}
          </>
        );

      case TRANSACTION_TABS.CAMPAIGN:
        return <CampaignDashboard />;

      default:
        return (
          <TransactionTable
            isLoading={isLoading}
            handleOpenModal={handleOpenModal}
            transactionsData={transactionsData}
            page={transactionState.page}
            onPageChange={handlePageChange}
            totalPages={transactionsData?.pages}
            rowsPerPage={transactionState.rowsPerPage}
            currentPage={transactionState.currentPage}
          />
        );
    }
  };

  return (
    <div className="w-full flex flex-col items-start gap-6">
      <TransactionHeader />

      <CustomCard style="w-full">
        <div className="flex flex-col gap-6 p-6">
          {/* Main Transaction Tabs */}
          <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
            <Tabs
              value={transactionState.activeTab}
              onChange={handleTabChange}
              sx={{
                "& .MuiTab-root": {
                  textTransform: "none",
                  fontSize: "16px",
                  fontWeight: 500,
                },
                "& .Mui-selected": {
                  color: "#02981D !important",
                },
                "& .MuiTabs-indicator": {
                  backgroundColor: "#02981D",
                },
              }}
            >
              {/* <Tab value={TRANSACTION_TABS.PAYMENT} label="Payment Transactions" /> */}
              {/* <Tab value={TRANSACTION_TABS.SUBSCRIPTION} label="Subscription Transactions" /> */}
              <Tab
                value={TRANSACTION_TABS.MARKETING}
                label="Marketing Automation"
              />
              <Tab value={TRANSACTION_TABS.CAMPAIGN} label="Campaign" />
            </Tabs>
          </Box>

          {/* Show search and filter only for payment and subscription tabs */}
          {transactionState.activeTab !== TRANSACTION_TABS.MARKETING &&
            transactionState.activeTab !== TRANSACTION_TABS.CAMPAIGN && (
            <>
              <SearchAndExport
                searchValue={transactionState.searchValue}
                onSearchChange={transactionState.setSearchValue}
              />

              {/* <FilterButtons
                activeFilter={transactionState.trxFilter}
                onFilterChange={transactionState.setTrxFilter}
                activeTab={transactionState.activeTab}
              /> */}
            </>
          )}

          {/* Tab Content */}
          {renderTabContent()}
        </div>
      </CustomCard>

      {/* Modals */}
      <TransactionModal
        open={modals.transaction}
        onClose={() => closeModal("transaction")}
        data={modalData.transaction}
      />

      <WithdrawalModal
        open={modals.withdrawal}
        onClose={() => {
          closeModal("withdrawal");
          setShowAcctName(false);
        }}
        data={modalData.withdrawal}
        showAcctDetails={showAcctName}
        onShowDetails={handleShowAcctName}
        onApprove={handleOpenApproveReq}
        onDecline={handleOpenDeclineReq}
        loading={buttonLoading}
      />

      <CustomModal
        open={modals.request}
        closeModal={() => closeModal("request")}
      >
        <CustomSuccessRequestModal
          id={approveWithId}
          onClick={checkNameForWithdrawalReq}
          close={() => closeModal("request")}
          titleOne="Sure to Update Transaction Status?"
          titleTwo="User will be notified of this action."
          btnText={
            isPosting ? (
              <CircularProgress size="1.2rem" sx={{ color: "#fff" }} />
            ) : (
              "Update Status"
            )
          }
        />
      </CustomModal>

      <CustomModal
        open={modals.success}
        closeModal={() => closeModal("success")}
      >
        <CustomSuccessModal
          close={() => closeModal("success")}
          textOne="Transaction status has been updated."
        />
      </CustomModal>

      <CustomModal
        open={modals.decline}
        closeModal={() => closeModal("decline")}
      >
        <div className="w-full flex flex-col items-start gap-4">
          <div className="flex items-center justify-between w-full">
            <h2 className="text-gray-900 font-medium text-xl">
              Decline Withdrawal
            </h2>
            <ClearRoundedIcon
              onClick={() => closeModal("decline")}
              sx={{ color: "#1E1E1E", cursor: "pointer" }}
            />
          </div>
          <DeclineModal
            refetch={refetch}
            declineId={declineId}
            closeDeclineReqModal={() => closeModal("decline")}
          />
        </div>
      </CustomModal>

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
    </div>
  );
};

export default Transactions;
