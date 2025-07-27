import ChevronRightOutlinedIcon from "@mui/icons-material/ChevronRightOutlined";
import NorthEastRoundedIcon from "@mui/icons-material/NorthEastRounded";
import SouthWestRoundedIcon from "@mui/icons-material/SouthWestRounded";
import WestOutlinedIcon from "@mui/icons-material/WestOutlined";
import { Skeleton } from "@mui/material";
import { useEffect, useState } from "react";
import mOne from "../../assets/member-profile/m-1.svg";
import mTen from "../../assets/member-profile/m-10.svg";
import mEl from "../../assets/member-profile/m-11.svg";
import mTwo from "../../assets/member-profile/m-2.svg";
import mThree from "../../assets/member-profile/m-3.svg";
import mFour from "../../assets/member-profile/m-4.svg";
import mFive from "../../assets/member-profile/m-5.svg";
import mSix from "../../assets/member-profile/m-6.svg";
import mSeven from "../../assets/member-profile/m-7.svg";
import mEight from "../../assets/member-profile/m-8.svg";
import mNine from "../../assets/member-profile/m-9.svg";

import {
  Box,
  CircularProgress,
  Grid,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { useParams } from "react-router-dom";
import { membersProfileUrl } from "../../api/endpoint";
import CustomCard from "../../components/CustomCard";
import CustomModal from "../../components/CustomModal";
import SelectDate from "../../components/SelectDate";
import { AuthAxios } from "../../helpers/axiosInstance";
import useFetchData from "../../hooks/useFetchData";
import FormattedPrice from "../../utils/FormattedPrice";
import formattedDate from "../../utils/formattedDate";
import RefereeModal from "../transactions/RefereeModal";
import CorporativeSavingsModal from "./CorporativeSavingsModal";
import InvestmentDetailsModal from "./InvestmentDetailsModal";
import MemberFullTransaction from "./MemberFullTransaction";
import PersonalSavingsModal from "./PersonalSavingsModal";

// Summary Card Component
const SummaryCard = ({ title, amount, icon, color = "#02981D", isLoading }) => {
  if (isLoading) {
    return <Skeleton variant="rounded" width="100%" height={120} />;
  }

  return (
    <CustomCard style="w-full">
      <div className="flex flex-col items-start gap-3 p-4">
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ backgroundColor: `${color}20` }}
          >
            <img src={icon} alt="" className="w-4 h-4" />
          </div>
          <p className="text-primary_grey_2 text-[12px] font-medium">{title}</p>
        </div>
        <p className="text-general font-[700] text-[28px]">
          <FormattedPrice amount={amount} />
        </p>
      </div>
    </CustomCard>
  );
};

// Info Item Component
const InfoItem = ({ icon, label, value }) => (
  <div className="flex gap-3 items-center mb-2">
    <img src={icon} alt="" className="w-4 h-4" />
    <div className="flex flex-col items-start gap-1">
      <p className="text-primary_grey_2 text-[12px]">{label}</p>
      <p className="text-general text-[16px]">{value || "---"}</p>
    </div>
  </div>
);

// Status Toggle Component
const StatusToggle = ({ isActive, onToggle, isLoading }) => (
  <div className="flex gap-3 items-center">
    <img src={mEight} alt="" />
    <div className="flex items-center gap-3">
      <p className="text-primary_red text-[16px]">Disable Account</p>
      <Switch
        checked={isActive}
        onChange={onToggle}
        disabled={isLoading}
        sx={{
          "& .MuiSwitch-switchBase.Mui-checked": {
            color: "#fff",
          },
          "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
            backgroundColor: "#E52929",
          },
        }}
      />
      {isLoading && (
        <CircularProgress
          sx={{
            color: "#E52929",
            width: "20px !important",
            height: "20px !important",
          }}
        />
      )}
      <Box
        className="p-2 rounded-lg"
        sx={{
          backgroundColor: !isActive ? "#FEE2E2" : "#E6F4EA",
          color: !isActive ? "#E52929" : "#1B5E20",
          fontWeight: "bold",
          fontSize: "12px",
        }}
      >
        {isActive ? "Enabled" : "Disabled"}
      </Box>
    </div>
  </div>
);

// Portfolio Card Component
const PortfolioCard = ({
  title,
  amount,
  linkText,
  onLinkClick,
  color = "#02981D",
}) => (
  <div className="flex-col flex items-start gap-1">
    <p className="text-[14px] text-primary_grey_2">{title}:</p>
    <p className="font-[600] text-[24px]" style={{ color }}>
      <FormattedPrice amount={amount} />
    </p>
    <span
      className="flex gap-3 items-center cursor-pointer"
      onClick={onLinkClick}
    >
      <p className="text-primary_green text-[12px] font-[500]">{linkText}</p>
      <ChevronRightOutlinedIcon sx={{ color: "#02981D" }} />
    </span>
  </div>
);

const MemberProfile = ({ setShowComp }) => {
  const { id: memberId } = useParams();

  // State management
  const [openRefereeModal, setOpenRefreeModal] = useState(false);
  const [statusChanging, setStatusChanging] = useState(false);
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(100);
  const [openCorporateSavingsModal, setOpenCorporateSavingsModal] =
    useState(false);
  const [isSwitchChecked, setIsSwitchChecked] = useState(null);
  const [showInvDetailsModal, setShowInvDetailsModal] = useState(false);
  const [openPersonalModal, setOpenPersonalModal] = useState(false);
  const [showFullUserTransactions, setShowFullUserTransactions] =
    useState(false);

  // API call
  const apiUrl = membersProfileUrl(memberId);
  const queryKey = ["fetchMembersProfile", apiUrl];
  const { data, error, isLoading } = useFetchData(queryKey, apiUrl);

  // Modal handlers
  const modalHandlers = {
    closeReferee: () => setOpenRefreeModal(false),
    closeCorporate: () => setOpenCorporateSavingsModal(false),
    closeInvestment: () => setShowInvDetailsModal(false),
    closePersonal: () => setOpenPersonalModal(false),
  };

  // Update user status function
  const updateUserStatus = async ({ memberId, status }) => {
    setStatusChanging(true);
    try {
      const response = await AuthAxios.post(`/admin/suspend/${memberId}`, {
        status: status,
      });

      setStatusChanging(false);

      if (response.status !== 201) {
        throw new Error(response.data.message || "Failed to update status");
      }

      return response.data;
    } catch (error) {
      setStatusChanging(false);
      throw new Error(error.response?.data?.message || "Network Error");
    }
  };

  const handleSwitchChange = (event) => {
    setIsSwitchChecked(event.target.checked);
    const status = event.target.checked;
    updateUserStatus({ memberId, status });
  };

  const close = () => {
    if (setShowComp) setShowComp(false);
  };

  useEffect(() => {
    setIsSwitchChecked(data?.is_active);
  }, [data]);

  // Summary cards data
  const summaryCards = [
    {
      title: "Wallet Balance",
      amount: data?.wallet_balance || 0,
      icon: mNine,
      color: "#02981D",
    },
    {
      title: "Total Inflow",
      amount: data?.total_inflow || 0,
      icon: mTen,
      color: "#0066CC",
    },
    {
      title: "Total Outflow",
      amount: data?.total_outflow || 0,
      icon: mEl,
      color: "#E52929",
    },
    {
      title: "Commission Earned",
      amount: data?.commission_earned || 0,
      icon: mSeven,
      color: "#FF8C00",
    },
  ];

  // Account information fields
  const accountFields = [
    {
      icon: mNine,
      label: "Wallet Balance",
      value: <FormattedPrice amount={data?.wallet_balance} />,
    },
    { icon: mNine, label: "Business Name", value: data?.business_name },
    { icon: mNine, label: "Business Type", value: data?.business_type },
    { icon: mNine, label: "Country", value: data?.country },
    { icon: mNine, label: "State", value: data?.state },
    { icon: mNine, label: "Town", value: data?.town },
    {
      icon: mNine,
      label: "Daily Active Appearance",
      value: data?.daily_active,
    },
    { icon: mFour, label: "Membership ID", value: data?.membership_id },
    { icon: mFour, label: "Account Number", value: data?.membership_id },
    { icon: mFive, label: "KYC Level", value: data?.tier },
    {
      icon: mSix,
      label: "Date Joined",
      value: formattedDate(data?.created_at),
    },
    { icon: mSix, label: "Date Cancelled", value: "-" },
  ];

  // Personal details fields
  const personalFields = [
    { icon: mOne, label: "Surname / Lastname", value: data?.lastname },
    { icon: mOne, label: "First Name", value: data?.firstname },
    { icon: mTwo, label: "Phone Number", value: data?.phone },
    { icon: mThree, label: "Email", value: data?.email },
  ];

  // Campaign fields
  const campaignFields = [
    { icon: mTen, label: "Units Left", value: data?.wages_point },
    { icon: mEl, label: "Total SMS Sent", value: data?.total_referal_balance },
    { icon: mSeven, label: "Total Amount", value: data?.referal_count },
    { icon: null, label: "Total Users SMS", value: data?.referal_count },
  ];

  return (
    <div className="flex items-start flex-col gap-4">
      {/* Breadcrumb */}
      <div className="flex items-center gap-3">
        <div
          className="flex items-center gap-1 cursor-pointer hover:underline"
          onClick={close}
        >
          <img src={mSeven} alt="" />
          <p className="text-[14px] text-[#17171]">Members</p>
        </div>
        <ChevronRightOutlinedIcon sx={{ color: "#919191", pt: "2px" }} />
        <div className="flex items-center gap-1">
          <img src={mOne} alt="" className="w-[12px] h-[12px]" />
          <p className="text-[14px] text-[#17171]">
            {data?.lastname} {data?.firstname}
          </p>
        </div>
      </div>

      {/* Header */}
      {!showFullUserTransactions && (
        <div className="flex gap-2 items-center justify-between w-full">
          <div className="flex gap-2 items-center">
            <WestOutlinedIcon
              onClick={close}
              sx={{ color: "#919191", pt: "2px", cursor: "pointer" }}
            />
            <p className="text-[#171717] text-[20px] font-[600]">
              {data?.lastname} {data?.firstname}
            </p>
          </div>
          <SelectDate onChange={() => {}} />
        </div>
      )}

      {/* Summary Cards */}
      {!showFullUserTransactions && (
        <Grid container spacing={2}>
          {summaryCards.map((card, index) => (
            <Grid item xs={3} key={index}>
              <SummaryCard
                title={card.title}
                amount={card.amount}
                icon={card.icon}
                color={card.color}
                isLoading={isLoading}
              />
            </Grid>
          ))}
        </Grid>
      )}

      {/* Personal Details Card */}
      {isLoading || !data ? (
        <Skeleton variant="rounded" width="100%" height={250} />
      ) : (
        !showFullUserTransactions && (
          <CustomCard style="w-full">
            <div className="w-full bg-white">
              <div className="flex gap-4 items-end">
                <div className="flex flex-col items-start gap-6">
                  <p className="text-general font-[500] text-[16px]">
                    Personal Details
                  </p>
                  <div className="max-h-[100px] max-w-[100px]">
                    <img
                      src={data?.profile_picture || ""}
                      className="w-full h-full object-cover rounded-lg"
                      alt=""
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-3 items-start">
                  {personalFields.map((field, index) => (
                    <InfoItem
                      key={index}
                      icon={field.icon}
                      label={field.label}
                      value={field.value}
                    />
                  ))}
                </div>
              </div>
            </div>
          </CustomCard>
        )
      )}

      {/* Main Content Grid */}
      <Grid container spacing={2}>
        {showFullUserTransactions ? (
          <MemberFullTransaction
            setShowFullUserTransactions={setShowFullUserTransactions}
            memberId={memberId}
          />
        ) : (
          <>
            {/* Account Information */}
            <Grid item xs={6}>
              {!data || isLoading ? (
                <Skeleton variant="rounded" width="100%" height={410} />
              ) : (
                <CustomCard style="w-full h-full">
                  <div className="bg-text_white">
                    <div className="flex flex-col items-start gap-4">
                      <p className="text-general font-[500] text-[16px]">
                        Account Information
                      </p>
                      <div className="flex flex-col gap-3 items-start">
                        {accountFields.map((field, index) => (
                          <InfoItem
                            key={index}
                            icon={field.icon}
                            label={field.label}
                            value={field.value}
                          />
                        ))}
                        <StatusToggle
                          isActive={isSwitchChecked}
                          onToggle={handleSwitchChange}
                          isLoading={statusChanging}
                        />
                      </div>
                    </div>
                  </div>
                </CustomCard>
              )}
            </Grid>

            {/* Portfolio and Campaign */}
            <Grid item xs={6}>
              <div className="h-full w-full flex items-center flex-col gap-2">
                {/* Portfolio Card */}
                {!data || isLoading ? (
                  <Skeleton variant="rounded" width="100%" height={200} />
                ) : (
                  <CustomCard style="w-full h-full">
                    <div className="w-full flex items-start flex-col gap-2">
                      <div className="w-full flex justify-between items-center">
                        <PortfolioCard
                          title="Inventory Value"
                          amount={data?.total_coop_savings}
                          linkText="View Savings Plans"
                          onLinkClick={() => setOpenCorporateSavingsModal(true)}
                        />
                        <div className="min-h-[5rem] w-[1px] bg-[#E3E3E3]"></div>
                        <PortfolioCard
                          title="Total Product"
                          amount={data?.total_savings}
                          linkText="See Details"
                          onLinkClick={() => setOpenPersonalModal(true)}
                        />
                      </div>

                      <div className="w-full flex justify-between items-center">
                        <PortfolioCard
                          title="Total Expenses"
                          amount={data?.outstanding_loan}
                          linkText=""
                          color="#E52929"
                        />
                        <div className="min-h-[5rem] w-[1px] bg-[#E3E3E3]"></div>
                        <PortfolioCard
                          title="Total Sales"
                          amount={data?.total_investment}
                          linkText="See Details"
                          onLinkClick={() => setShowInvDetailsModal(true)}
                        />
                      </div>
                    </div>
                  </CustomCard>
                )}

                {/* Campaign Card */}
                {!data || isLoading ? (
                  <Skeleton variant="rounded" width="100%" height={200} />
                ) : (
                  <CustomCard style="w-full h-full">
                    <div className="w-full flex items-start flex-col gap-2">
                      <p className="text-general font-[500] text-[16px] mb-3">
                        Campaign
                      </p>
                      <div className="flex gap-9 items-center">
                        <div className="flex items-start gap-3 flex-col">
                          {campaignFields.slice(0, 3).map((field, index) => (
                            <div
                              key={index}
                              className="flex gap-3 items-center"
                            >
                              {field.icon && <img src={field.icon} alt="" />}
                              <div className="flex flex-col items-start gap-1">
                                <p className="text-primary_grey_2 text-[12px]">
                                  {field.label}:
                                </p>
                                <p className="text-general text-[16px] font-[600]">
                                  {field.value}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="flex flex-col gap-10 items-start">
                          <div className="flex gap-3 items-center">
                            <div className="flex flex-col items-start gap-1">
                              <p className="text-primary_grey_2 text-[12px]">
                                Total Users SMS:
                              </p>
                              <p className="text-general text-[16px] font-[600]">
                                {data?.referal_count}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CustomCard>
                )}
              </div>
            </Grid>

            {/* Recent Transactions */}
            <Grid item xs={12}>
              {!data || isLoading ? (
                <Skeleton variant="rounded" width="100%" height={250} />
              ) : (
                <CustomCard style="w-full h-full">
                  <div className="bg-text_white">
                    <div className="flex flex-col items-center">
                      <div className="flex w-full mb-6 justify-between items-center">
                        <p className="text-general text-[16px] font-[500]">
                          Recent Transactions
                        </p>

                        <span
                          className="flex gap-3 items-center cursor-pointer"
                          onClick={() => setShowFullUserTransactions(true)}
                        >
                          <p className="text-primary_green text-[12px] font-[500]">
                            See Full Transaction History
                          </p>
                          <ChevronRightOutlinedIcon sx={{ color: "#02981D" }} />
                        </span>
                      </div>

                      {/* Transactions Table */}
                      <Box className="w-full">
                        <TableContainer>
                          <Table sx={{ minWidth: 100, padding: "8px" }}>
                            <TableHead sx={{ background: "#F8F8F8" }}>
                              <TableRow>
                                <TableCell>S/N</TableCell>
                                <TableCell>Amount(N)</TableCell>
                                <TableCell>Customer Name</TableCell>
                                <TableCell>Wallet Balance</TableCell>
                                <TableCell>Transaction Type</TableCell>
                                <TableCell>Description</TableCell>
                                <TableCell>Date & Time</TableCell>
                                <TableCell>Action</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {!data?.transactions ? (
                                <TableRow>
                                  <TableCell
                                    colSpan="8"
                                    className="text-center"
                                  >
                                    <CircularProgress
                                      size="4.2rem"
                                      sx={{ color: "#02981D", padding: "1em" }}
                                    />
                                  </TableCell>
                                </TableRow>
                              ) : data?.transactions &&
                                Array.isArray(data?.transactions) &&
                                data?.transactions?.length > 0 ? (
                                data?.transactions?.map((item, i) => (
                                  <TableRow key={i + 2}>
                                    <TableCell>
                                      {page * rowsPerPage + i + 1}
                                    </TableCell>
                                    <TableCell>
                                      <Typography
                                        sx={{
                                          fontWeight: "400",
                                          fontSize: "16px",
                                          color: "#828282",
                                        }}
                                      >
                                        <FormattedPrice amount={item?.amount} />
                                      </Typography>
                                    </TableCell>
                                    <TableCell>
                                      {item?.customer_name || "N/A"}
                                    </TableCell>
                                    <TableCell>
                                      <FormattedPrice
                                        amount={item?.wallet_balance}
                                      />
                                    </TableCell>
                                    <TableCell>
                                      <Typography
                                        sx={{
                                          color:
                                            item?.status?.toLowerCase() ===
                                            "success"
                                              ? "#208637"
                                              : "#E52929",
                                          fontWeight: "500",
                                          fontSize: "12px",
                                          background:
                                            item?.status === "success"
                                              ? "#EBFFF3"
                                              : "#FBEBEC",
                                          py: "5px",
                                          borderRadius: "10px",
                                          display: "flex",
                                          alignItems: "center",
                                          gap: "10px",
                                          justifyContent: "center",
                                          width: "80px",
                                        }}
                                      >
                                        {item?.type?.toLowerCase() ===
                                        "withdrawal" ? (
                                          <NorthEastRoundedIcon
                                            sx={{ fontSize: "12px" }}
                                          />
                                        ) : (
                                          <SouthWestRoundedIcon
                                            sx={{ fontSize: "12px" }}
                                          />
                                        )}
                                        {item?.status?.toLowerCase()}
                                      </Typography>
                                    </TableCell>
                                    <TableCell>{item?.description}</TableCell>
                                    <TableCell>
                                      {formattedDate(item?.created_at)}
                                    </TableCell>
                                    <TableCell>
                                      {/* Add action buttons here if needed */}-
                                    </TableCell>
                                  </TableRow>
                                ))
                              ) : (
                                <TableRow>
                                  <TableCell
                                    colSpan="8"
                                    className="text-center"
                                  >
                                    No transactions found
                                  </TableCell>
                                </TableRow>
                              )}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </Box>
                    </div>
                  </div>
                </CustomCard>
              )}
            </Grid>
          </>
        )}
      </Grid>

      {/* Modals */}
      <CustomModal
        style="w-[55%]"
        open={openCorporateSavingsModal}
        closeModal={modalHandlers.closeCorporate}
      >
        <CorporativeSavingsModal
          close={modalHandlers.closeCorporate}
          memberId={memberId}
        />
      </CustomModal>

      <CustomModal
        style="w-[65%]"
        open={openPersonalModal}
        closeModal={modalHandlers.closePersonal}
      >
        <PersonalSavingsModal
          close={modalHandlers.closePersonal}
          memberId={memberId}
        />
      </CustomModal>

      <CustomModal
        style="w-[90%]"
        open={showInvDetailsModal}
        closeModal={modalHandlers.closeInvestment}
      >
        <InvestmentDetailsModal
          close={modalHandlers.closeInvestment}
          memberId={memberId}
        />
      </CustomModal>

      <CustomModal
        style="w-[50%]"
        open={openRefereeModal}
        closeModal={modalHandlers.closeReferee}
      >
        <RefereeModal
          refereeData={data || []}
          closeRefereeModal={modalHandlers.closeReferee}
        />
      </CustomModal>
    </div>
  );
};

export default MemberProfile;
