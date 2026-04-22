import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Grid,
  Tab,
  Tabs,
  Tooltip,
} from "@mui/material";
import {
  ArrowBackRounded as BackIcon,
  PauseCircleOutline as SuspendIcon,
  PlayCircleOutline as ActivateIcon,
  EditOutlined as EditIcon,
  TrendingUpOutlined as InflowIcon,
  TrendingDownOutlined as OutflowIcon,
  ReceiptLongOutlined as TrxIcon,
  PaidOutlined as CommissionIcon,
  LocalShippingOutlined as ShippingIcon,
  AccessTimeOutlined as TimeIcon,
  VerifiedUserOutlined as VerifiedIcon,
  OpenInNewRounded as OpenIcon,
} from "@mui/icons-material";
import FormattedPrice from "../../utils/FormattedPrice";
import { findUser, findPlan } from "./userData";

const STATUS_STYLE = {
  active: { bg: "#E6F7EA", color: "#02981D", label: "Active" },
  suspended: { bg: "#FDECEC", color: "#DC3545", label: "Suspended" },
  pending: { bg: "#FFF7E8", color: "#B26A00", label: "Pending" },
};

const PLAN_STATUS = {
  active: { bg: "#E6F7EA", color: "#02981D", label: "Active" },
  trial: { bg: "#FFF7E8", color: "#B26A00", label: "Trial" },
  expired: { bg: "#FDECEC", color: "#DC3545", label: "Expired" },
};

const KYC_STATUS = {
  approved: { bg: "#E6F7EA", color: "#02981D", label: "Approved" },
  pending: { bg: "#FFF7E8", color: "#B26A00", label: "Pending" },
  "re-upload": { bg: "#EEF2FF", color: "#3949AB", label: "Re-upload" },
  rejected: { bg: "#FDECEC", color: "#DC3545", label: "Rejected" },
};

const Pill = ({ map, value }) => {
  const s = map[value] || { bg: "#F5F5F5", color: "#5E5E5E", label: value };
  return (
    <span
      className="text-[12px] font-medium px-3 py-1 rounded-full whitespace-nowrap"
      style={{ background: s.bg, color: s.color }}
    >
      {s.label}
    </span>
  );
};

const InfoRow = ({ label, value, action }) => (
  <div className="flex items-center justify-between py-2 gap-3">
    <span className="text-[13px] text-primary_grey_2">{label}</span>
    <span className="text-[13px] text-general font-medium text-right flex items-center gap-2">
      {value}
      {action}
    </span>
  </div>
);

const StatTile = ({ icon, color, bg, label, value, sub }) => (
  <Card
    sx={{
      borderRadius: "14px",
      boxShadow: "0 1px 3px rgba(16,24,40,.06)",
      border: "1px solid #EFEFEF",
      height: "100%",
    }}
  >
    <CardContent sx={{ p: 2.5 }}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[12px] text-primary_grey_2 font-medium">{label}</p>
          <p className="text-[18px] font-semibold text-general mt-1.5">
            {value}
          </p>
          {sub && (
            <p className="text-[11px] text-[#9CA3AF] mt-0.5">{sub}</p>
          )}
        </div>
        <div
          className="h-9 w-9 rounded-full flex items-center justify-center flex-none"
          style={{ background: bg, color }}
        >
          {icon}
        </div>
      </div>
    </CardContent>
  </Card>
);

const RECENT_TRANSACTIONS = [
  {
    id: "TRX-9821",
    type: "Wallet Credit",
    amount: 25000,
    date: "2026-04-21 14:22",
    status: "Successful",
  },
  {
    id: "TRX-9820",
    type: "Subscription",
    amount: 25000,
    date: "2026-04-12 09:00",
    status: "Successful",
  },
  {
    id: "TRX-9787",
    type: "Withdrawal",
    amount: 12000,
    date: "2026-04-10 16:42",
    status: "Successful",
  },
  {
    id: "TRX-9712",
    type: "Data Purchase",
    amount: 1500,
    date: "2026-04-08 11:11",
    status: "Failed",
  },
];

const RECENT_DELIVERIES = [
  {
    id: "ORD-10298",
    receiver: "Adaeze Okoro",
    status: "in_transit",
    amount: 4500,
    date: "2026-04-22",
  },
  {
    id: "ORD-10301",
    receiver: "Ifeanyi Johnson",
    status: "failed",
    amount: 5500,
    date: "2026-04-21",
  },
  {
    id: "ORD-10300",
    receiver: "Chinedu Eze",
    status: "delivered",
    amount: 6800,
    date: "2026-04-21",
  },
];

const DELIVERY_STATUS = {
  in_transit: { bg: "#E0F2FE", color: "#0369A1", label: "In Transit" },
  delivered: { bg: "#E6F7EA", color: "#02981D", label: "Delivered" },
  failed: { bg: "#FDECEC", color: "#DC3545", label: "Failed" },
};

const UserProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = useMemo(() => findUser(id), [id]);
  const [tab, setTab] = useState(0);

  if (!user) {
    return (
      <div className="w-full flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <p className="text-[16px] font-semibold text-general">User not found</p>
        <Button
          onClick={() => navigate("/users")}
          variant="contained"
          startIcon={<BackIcon />}
          sx={{
            textTransform: "none",
            background: "#02981D",
            boxShadow: "none",
            "&:hover": { background: "#017a17" },
          }}
        >
          Back to User Management
        </Button>
      </div>
    );
  }

  const plan = findPlan(user.plan);
  const initials = user.name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
        <div className="flex items-start gap-3">
          <button
            onClick={() => navigate("/users")}
            className="h-10 w-10 rounded-full bg-white border border-[#E3E3E3] flex items-center justify-center hover:bg-[#F5F5F5] flex-none"
          >
            <BackIcon sx={{ color: "#5E5E5E", fontSize: 20 }} />
          </button>
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-[#F6FFF8] text-[#02981D] flex items-center justify-center font-semibold text-[16px] flex-none">
              {initials}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-[20px] md:text-[22px] font-semibold text-general">
                  {user.name}
                </h1>
                <Pill map={STATUS_STYLE} value={user.status} />
              </div>
              <p className="text-[13px] text-primary_grey_2 mt-0.5">
                {user.id} · {user.type} · Joined {user.joined}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            startIcon={<EditIcon />}
            sx={{
              textTransform: "none",
              color: "#5E5E5E",
              border: "1px solid #E3E3E3",
              background: "#fff",
              "&:hover": { background: "#F5F5F5" },
            }}
          >
            Edit
          </Button>
          {user.status === "active" ? (
            <Button
              startIcon={<SuspendIcon />}
              sx={{
                textTransform: "none",
                color: "#DC3545",
                border: "1px solid #F7C8CC",
                background: "#FDECEC",
                "&:hover": { background: "#FBDADC" },
              }}
            >
              Suspend
            </Button>
          ) : (
            <Button
              startIcon={<ActivateIcon />}
              variant="contained"
              sx={{
                textTransform: "none",
                background: "#02981D",
                boxShadow: "none",
                "&:hover": { background: "#017a17" },
              }}
            >
              Activate
            </Button>
          )}
        </div>
      </div>

      {/* Financial overview tiles */}
      <Grid container spacing={2}>
        <Grid item xs={6} md={2.4}>
          <StatTile
            icon={<InflowIcon fontSize="small" />}
            color="#02981D"
            bg="#E6F7EA"
            label="Total Inflow"
            value={<FormattedPrice amount={user.inflow} />}
            sub="Money received"
          />
        </Grid>
        <Grid item xs={6} md={2.4}>
          <StatTile
            icon={<OutflowIcon fontSize="small" />}
            color="#DC3545"
            bg="#FDECEC"
            label="Total Outflow"
            value={<FormattedPrice amount={user.outflow} />}
            sub="Money sent"
          />
        </Grid>
        <Grid item xs={6} md={2.4}>
          <StatTile
            icon={<TrxIcon fontSize="small" />}
            color="#3949AB"
            bg="#EEF2FF"
            label="Total Transactions"
            value={user.transactions.toLocaleString()}
            sub="All time"
          />
        </Grid>
        <Grid item xs={6} md={2.4}>
          <StatTile
            icon={<CommissionIcon fontSize="small" />}
            color="#B26A00"
            bg="#FFF7E8"
            label="Commission"
            value={<FormattedPrice amount={user.commission} />}
            sub="Generated for platform"
          />
        </Grid>
        <Grid item xs={12} md={2.4}>
          <StatTile
            icon={<TimeIcon fontSize="small" />}
            color="#0369A1"
            bg="#E0F2FE"
            label="Active For"
            value={user.activeFor}
            sub={`Since ${user.joined}`}
          />
        </Grid>
      </Grid>

      {/* Body: tabs */}
      <Card
        sx={{
          borderRadius: "14px",
          boxShadow: "0 1px 3px rgba(16,24,40,.06)",
          border: "1px solid #EFEFEF",
        }}
      >
        <CardContent sx={{ p: { xs: 2, md: 3 } }}>
          <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
            <Tabs
              value={tab}
              onChange={(_, v) => setTab(v)}
              variant="scrollable"
              sx={{
                "& .MuiTab-root": {
                  textTransform: "none",
                  fontSize: "15px",
                  fontWeight: 500,
                  minHeight: 44,
                },
                "& .Mui-selected": { color: "#02981D !important" },
                "& .MuiTabs-indicator": { backgroundColor: "#02981D" },
              }}
            >
              <Tab label="Overview" />
              <Tab label="Subscription" />
              <Tab label="Transactions" />
              <Tab label="Logistics" />
            </Tabs>
          </Box>

          {/* Overview tab */}
          {tab === 0 && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <div className="border border-[#EFEFEF] rounded-xl p-4 h-full">
                  <p className="text-[12px] uppercase tracking-wide text-primary_grey_2 mb-2">
                    Basic Info
                  </p>
                  <Divider />
                  <InfoRow label="Full Name" value={user.name} />
                  <Divider />
                  <InfoRow label="Email" value={user.email} />
                  <Divider />
                  <InfoRow label="Phone" value={user.phone} />
                  <Divider />
                  <InfoRow label="Address" value={user.address} />
                  <Divider />
                  {user.businessName && (
                    <>
                      <InfoRow
                        label="Business Name"
                        value={user.businessName}
                      />
                      <Divider />
                    </>
                  )}
                  <InfoRow label="Account Type" value={user.type} />
                </div>
              </Grid>

              <Grid item xs={12} md={6}>
                <div className="border border-[#EFEFEF] rounded-xl p-4 h-full">
                  <p className="text-[12px] uppercase tracking-wide text-primary_grey_2 mb-2">
                    Tier & KYC
                  </p>
                  <Divider />
                  <InfoRow
                    label="Tier"
                    value={
                      <Chip
                        size="small"
                        label={user.tier}
                        sx={{
                          background: "#F6FFF8",
                          color: "#02981D",
                          fontWeight: 600,
                        }}
                      />
                    }
                  />
                  <Divider />
                  <InfoRow
                    label="KYC Status"
                    value={<Pill map={KYC_STATUS} value={user.kycStatus} />}
                    action={
                      user.kycStatus !== "approved" &&
                      user.kycRef && (
                        <Tooltip title="View KYC submission">
                          <button
                            onClick={() =>
                              navigate(
                                `/kyc/${user.kycRef.segment}/${user.kycRef.id}`
                              )
                            }
                            className="text-[12px] text-[#02981D] font-semibold flex items-center gap-1 hover:underline"
                          >
                            View <OpenIcon sx={{ fontSize: 14 }} />
                          </button>
                        </Tooltip>
                      )
                    }
                  />
                  <Divider />
                  <InfoRow label="Date Joined" value={user.joined} />
                  <Divider />
                  <InfoRow label="Active For" value={user.activeFor} />
                </div>
              </Grid>
            </Grid>
          )}

          {/* Subscription tab */}
          {tab === 1 && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={5}>
                <div className="rounded-xl border border-[#EFEFEF] p-5 h-full">
                  <div className="flex items-center justify-between">
                    <p className="text-[12px] uppercase tracking-wide text-primary_grey_2">
                      Current Plan
                    </p>
                    <Pill map={PLAN_STATUS} value={user.planStatus} />
                  </div>
                  <p
                    className="text-[24px] font-semibold mt-2"
                    style={{ color: plan?.color || "#111827" }}
                  >
                    {plan?.name || "—"}
                  </p>
                  <p className="text-[14px] text-general mt-1">
                    {plan ? (
                      <>
                        <FormattedPrice amount={plan.price} /> · {plan.cycle}
                      </>
                    ) : (
                      "No plan attached"
                    )}
                  </p>
                  <p className="text-[12px] text-primary_grey_2 mt-2 leading-relaxed">
                    {plan?.description}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button
                      size="small"
                      sx={{
                        textTransform: "none",
                        color: "#5E5E5E",
                        border: "1px solid #E3E3E3",
                        background: "#fff",
                        "&:hover": { background: "#F5F5F5" },
                      }}
                    >
                      Change Plan
                    </Button>
                    <Button
                      size="small"
                      variant="contained"
                      sx={{
                        textTransform: "none",
                        background: "#02981D",
                        boxShadow: "none",
                        "&:hover": { background: "#017a17" },
                      }}
                    >
                      Renew
                    </Button>
                  </div>
                </div>
              </Grid>

              <Grid item xs={12} md={7}>
                <div className="border border-[#EFEFEF] rounded-xl p-4 h-full">
                  <p className="text-[12px] uppercase tracking-wide text-primary_grey_2 mb-2">
                    Billing Details
                  </p>
                  <Divider />
                  <InfoRow label="Start Date" value={user.startDate} />
                  <Divider />
                  <InfoRow label="End Date" value={user.endDate} />
                  <Divider />
                  <InfoRow label="Next Billing" value={user.nextBilling} />
                  <Divider />
                  <InfoRow
                    label="Plan Status"
                    value={<Pill map={PLAN_STATUS} value={user.planStatus} />}
                  />
                  <Divider />
                  <InfoRow
                    label="Cycle Cost"
                    value={<FormattedPrice amount={plan?.price || 0} />}
                  />
                </div>
              </Grid>
            </Grid>
          )}

          {/* Transactions tab */}
          {tab === 2 && (
            <div className="w-full overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[12px] uppercase tracking-wide text-primary_grey_2 border-b border-[#EFEFEF]">
                    <th className="py-3 px-3">Reference</th>
                    <th className="py-3 px-3">Type</th>
                    <th className="py-3 px-3">Amount</th>
                    <th className="py-3 px-3">Date</th>
                    <th className="py-3 px-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {RECENT_TRANSACTIONS.map((t) => (
                    <tr
                      key={t.id}
                      className="border-b border-[#F5F5F5] hover:bg-[#FAFAFA]"
                    >
                      <td className="py-4 px-3 text-[13px] font-medium text-general">
                        {t.id}
                      </td>
                      <td className="py-4 px-3 text-[13px] text-general">
                        {t.type}
                      </td>
                      <td className="py-4 px-3 text-[13px] text-general">
                        <FormattedPrice amount={t.amount} />
                      </td>
                      <td className="py-4 px-3 text-[12px] text-primary_grey_2">
                        {t.date}
                      </td>
                      <td className="py-4 px-3">
                        <span
                          className="text-[12px] font-medium px-3 py-1 rounded-full"
                          style={{
                            background:
                              t.status === "Successful"
                                ? "#E6F7EA"
                                : "#FDECEC",
                            color:
                              t.status === "Successful"
                                ? "#02981D"
                                : "#DC3545",
                          }}
                        >
                          {t.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="mt-4 flex justify-end">
                <Button
                  onClick={() => navigate("/transactions")}
                  endIcon={<OpenIcon />}
                  sx={{
                    textTransform: "none",
                    color: "#02981D",
                    fontWeight: 600,
                  }}
                >
                  View all transactions
                </Button>
              </div>
            </div>
          )}

          {/* Logistics tab */}
          {tab === 3 && (
            <>
              <div className="flex items-center justify-between mb-3">
                <p className="text-[14px] font-semibold text-general">
                  Recent Deliveries ({user.deliveries})
                </p>
                <Button
                  onClick={() => navigate("/logistics")}
                  endIcon={<OpenIcon />}
                  sx={{
                    textTransform: "none",
                    color: "#02981D",
                    fontWeight: 600,
                  }}
                >
                  View all
                </Button>
              </div>
              <div className="w-full overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-[12px] uppercase tracking-wide text-primary_grey_2 border-b border-[#EFEFEF]">
                      <th className="py-3 px-3">Order ID</th>
                      <th className="py-3 px-3">Receiver</th>
                      <th className="py-3 px-3">Amount</th>
                      <th className="py-3 px-3">Date</th>
                      <th className="py-3 px-3">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {RECENT_DELIVERIES.map((d) => (
                      <tr
                        key={d.id}
                        className="border-b border-[#F5F5F5] hover:bg-[#FAFAFA]"
                      >
                        <td className="py-4 px-3 text-[13px] font-medium text-general">
                          {d.id}
                        </td>
                        <td className="py-4 px-3 text-[13px] text-general">
                          {d.receiver}
                        </td>
                        <td className="py-4 px-3 text-[13px] text-general">
                          <FormattedPrice amount={d.amount} />
                        </td>
                        <td className="py-4 px-3 text-[12px] text-primary_grey_2">
                          {d.date}
                        </td>
                        <td className="py-4 px-3">
                          <Pill map={DELIVERY_STATUS} value={d.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UserProfile;
