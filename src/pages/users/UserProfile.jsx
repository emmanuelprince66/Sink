import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  MenuItem,
  Select,
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
  AccountBalanceWalletOutlined as WalletIcon,
  AccessTimeOutlined as TimeIcon,
  OpenInNewRounded as OpenIcon,
} from "@mui/icons-material";
import FormattedPrice from "../../utils/FormattedPrice";
import { membersProfileUrl } from "../../api/endpoint";
import useFetchData from "../../hooks/useFetchData";

const STATUS_STYLE = {
  active: { bg: "#E6F7EA", color: "#02981D", label: "Active" },
  suspended: { bg: "#FDECEC", color: "#DC3545", label: "Suspended" },
  pending: { bg: "#FFF7E8", color: "#B26A00", label: "Pending" },
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

const DELIVERY_STATUS = {
  in_transit: { bg: "#E0F2FE", color: "#0369A1", label: "In Transit" },
  delivered: { bg: "#E6F7EA", color: "#02981D", label: "Delivered" },
  failed: { bg: "#FDECEC", color: "#DC3545", label: "Failed" },
};

// Map API user-detail payload (SingleUserResponse) — only fields the API
// actually returns. No invented data.
const mapApiUserDetail = (d) => {
  if (!d) return null;
  const fullName =
    [d?.firstname, d?.lastname].filter(Boolean).join(" ") ||
    d?.business?.[0]?.name ||
    "—";

  const outlets = (d?.business || []).map((b, i) => ({
    id: b?.id || `out-${i + 1}`,
    name: b?.name || `Outlet ${i + 1}`,
    location:
      [b?.street, b?.city, b?.state].filter(Boolean).join(", ") || "—",
    isActive: b?.is_active,
    logo: b?.logo || null,
  }));

  return {
    id: d?.id || "—",
    firstname: d?.firstname || "",
    lastname: d?.lastname || "",
    name: fullName,
    businessName: d?.business?.[0]?.name || null,
    type: outlets.length > 0 ? "Business" : "Individual",
    email: d?.email || "—",
    phone: d?.phone || "—",
    address:
      [d?.state, d?.country].filter(Boolean).join(", ") ||
      d?.business?.[0]?.street ||
      "—",
    country: d?.country || null,
    state: d?.state || null,
    plan: d?.subscription || "", // raw plan name from API
    startDate: d?.subscription_start_date || null,
    endDate: d?.subscription_end_date || null,
    status: d?.is_active === false ? "inactive" : "active",
    tier: d?.kyc_level || "—",
    joined: d?.created_at ? d.created_at.slice(0, 10) : "—",
    lastSeen: d?.last_seen || null,
    activeFor: d?.active_for || "N/A",
    inflow: Number(d?.total_inflow || 0),
    outflow: Number(d?.total_outflow || 0),
    transactions: Number(d?.total_transactions_count || 0),
    commission: Number(d?.commission_earned || 0),
    walletBalance: Number(d?.wallet_balance || 0),
    accountNumber: d?.account_number || null,
    profilePicture: d?.profile_picture || null,
    // Business metrics straight from the API
    totalProducts: Number(d?.total_products || 0),
    totalSales: Number(d?.total_sales || 0),
    totalExpenses: Number(d?.total_expenses || 0),
    totalInventory: Number(d?.total_inventory || 0),
    // Campaign fields the API returns
    campaignUnitsLeft: Number(d?.campaign_units_left || 0),
    campaignTotalAmount: Number(d?.campaign_total_amount || 0),
    campaignsCount: Number(d?.campaigns_count || 0),
    outlets,
    paymentTransactions:
      d?.recent_transactions?.payment_transactions || [],
    logisticTransactions:
      d?.recent_transactions?.logistic_transactions || [],
    raw: d,
  };
};

const UserProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tab, setTab] = useState(0);
  const [outlet, setOutlet] = useState("all");

  const apiUrl = membersProfileUrl(id);
  const { data, isLoading } = useFetchData(
    ["fetchUserDetail", apiUrl],
    apiUrl
  );
  const user = useMemo(() => mapApiUserDetail(data), [data]);

  if (isLoading) {
    return (
      <div className="w-full flex items-center justify-center min-h-[60vh]">
        <CircularProgress sx={{ color: "#02981D" }} />
      </div>
    );
  }

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

  const initials = user.name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  // Live payment_transactions from API
  const filteredPayments = (user.paymentTransactions || []).map((t) => ({
    id: t?.id || "—",
    type: t?.type || "—",
    amount: Number(t?.amount || 0),
    date: t?.created_at || "—",
    status: t?.status || "—",
    method: t?.bank_name || t?.account_name || "—",
    description: t?.description,
  }));
  // logistic_transactions is array of object with no schema yet — pass through
  const filteredLogistics = user.logisticTransactions || [];

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
            {user.profilePicture ? (
              <img
                src={user.profilePicture}
                alt={user.name}
                className="h-12 w-12 rounded-full object-cover border border-[#EFEFEF] flex-none"
              />
            ) : (
              <div className="h-12 w-12 rounded-full bg-[#F6FFF8] text-[#02981D] flex items-center justify-center font-semibold text-[16px] flex-none">
                {initials}
              </div>
            )}
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
              <div className="flex items-center gap-2 flex-wrap mt-2">
                <Chip
                  size="small"
                  label={user.tier}
                  sx={{
                    background: "#F6FFF8",
                    color: "#02981D",
                    fontWeight: 600,
                  }}
                />
                {user.plan && (
                  <Chip
                    size="small"
                    label={user.plan}
                    sx={{
                      background: "#EEF2FF",
                      color: "#3949AB",
                      fontWeight: 600,
                    }}
                  />
                )}
              </div>
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

      {/* Outlet filter (only for businesses with > 1 outlet) */}
      {user.outlets && user.outlets.length > 1 && (
        <div className="flex items-center gap-3 bg-[#F8F9FB] border border-[#EFEFEF] rounded-xl px-3 py-2">
          <span className="text-[12px] uppercase tracking-wide text-primary_grey_2 font-semibold">
            Outlet
          </span>
          <Select
            size="small"
            value={outlet}
            onChange={(e) => setOutlet(e.target.value)}
            sx={{ minWidth: 220, background: "#fff" }}
          >
            <MenuItem value="all">All Outlets ({user.outlets.length})</MenuItem>
            {user.outlets.map((o) => (
              <MenuItem key={o.id} value={o.id}>
                {o.name} — {o.location}
              </MenuItem>
            ))}
          </Select>
        </div>
      )}

      {/* Financial overview tiles */}
      <Grid container spacing={2}>
        <Grid item xs={6} md={2}>
          <StatTile
            icon={<WalletIcon fontSize="small" />}
            color="#7C3AED"
            bg="#F3E8FF"
            label="Wallet Balance"
            value={<FormattedPrice amount={user.walletBalance} />}
            sub={user.accountNumber ? `Acct: ${user.accountNumber}` : "—"}
          />
        </Grid>
        <Grid item xs={6} md={2}>
          <StatTile
            icon={<InflowIcon fontSize="small" />}
            color="#02981D"
            bg="#E6F7EA"
            label="Total Inflow"
            value={<FormattedPrice amount={user.inflow} />}
            sub="Money received"
          />
        </Grid>
        <Grid item xs={6} md={2}>
          <StatTile
            icon={<OutflowIcon fontSize="small" />}
            color="#DC3545"
            bg="#FDECEC"
            label="Total Outflow"
            value={<FormattedPrice amount={user.outflow} />}
            sub="Money sent"
          />
        </Grid>
        <Grid item xs={6} md={2}>
          <StatTile
            icon={<TrxIcon fontSize="small" />}
            color="#3949AB"
            bg="#EEF2FF"
            label="Total Transactions"
            value={user.transactions.toLocaleString()}
            sub="All time"
          />
        </Grid>
        <Grid item xs={6} md={2}>
          <StatTile
            icon={<CommissionIcon fontSize="small" />}
            color="#B26A00"
            bg="#FFF7E8"
            label="Commission"
            value={<FormattedPrice amount={user.commission} />}
            sub="Earned by platform"
          />
        </Grid>
        <Grid item xs={12} md={2}>
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
              <Tab label="Payment Transactions" />
              <Tab label="Logistic Transactions" />
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
                  {user.accountNumber && (
                    <>
                      <Divider />
                      <InfoRow
                        label="Account Number"
                        value={user.accountNumber}
                      />
                    </>
                  )}
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
                  <p className="text-[12px] uppercase tracking-wide text-primary_grey_2">
                    Current Plan
                  </p>
                  <p className="text-[24px] font-semibold mt-2 text-general">
                    {user.plan || "No plan"}
                  </p>
                </div>
              </Grid>

              <Grid item xs={12} md={7}>
                <div className="border border-[#EFEFEF] rounded-xl p-4 h-full">
                  <p className="text-[12px] uppercase tracking-wide text-primary_grey_2 mb-2">
                    Billing Details
                  </p>
                  <Divider />
                  <InfoRow
                    label="Start Date"
                    value={
                      user.startDate ? user.startDate.slice(0, 10) : "—"
                    }
                  />
                  <Divider />
                  <InfoRow
                    label="End Date"
                    value={user.endDate ? user.endDate.slice(0, 10) : "—"}
                  />
                </div>
              </Grid>
            </Grid>
          )}

          {/* Payment Transactions tab */}
          {tab === 2 && (
            <div className="w-full overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[12px] uppercase tracking-wide text-primary_grey_2 border-b border-[#EFEFEF]">
                    <th className="py-3 px-3">Reference</th>
                    <th className="py-3 px-3">Type</th>
                    <th className="py-3 px-3">Amount</th>
                    <th className="py-3 px-3">Method</th>
                    <th className="py-3 px-3">Date</th>
                    <th className="py-3 px-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPayments.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="py-10 text-center text-primary_grey_2"
                      >
                        No payment transactions for this outlet selection.
                      </td>
                    </tr>
                  ) : (
                    filteredPayments.map((t) => (
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
                          {t.method}
                        </td>
                        <td className="py-4 px-3 text-[12px] text-primary_grey_2">
                          {t.date}
                        </td>
                        <td className="py-4 px-3">
                          <span
                            className="text-[12px] font-medium px-3 py-1 rounded-full capitalize"
                            style={{
                              background:
                                /success/i.test(t.status)
                                  ? "#E6F7EA"
                                  : /pending/i.test(t.status)
                                  ? "#FFF7E8"
                                  : "#FDECEC",
                              color:
                                /success/i.test(t.status)
                                  ? "#02981D"
                                  : /pending/i.test(t.status)
                                  ? "#B26A00"
                                  : "#DC3545",
                            }}
                          >
                            {t.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
              <div className="mt-4 flex justify-end">
                <Button
                  onClick={() => navigate("/payments")}
                  endIcon={<OpenIcon />}
                  sx={{
                    textTransform: "none",
                    color: "#02981D",
                    fontWeight: 600,
                  }}
                >
                  View all payment transactions
                </Button>
              </div>
            </div>
          )}

          {/* Logistic Transactions tab */}
          {tab === 3 && (
            <>
              <div className="flex items-center justify-between mb-3">
                <p className="text-[14px] font-semibold text-general">
                  Logistic / Online Transactions ({filteredLogistics.length})
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
                    {filteredLogistics.length === 0 ? (
                      <tr>
                        <td
                          colSpan={5}
                          className="py-10 text-center text-primary_grey_2"
                        >
                          No logistic transactions yet.
                        </td>
                      </tr>
                    ) : (
                      filteredLogistics.map((d, i) => (
                        <tr
                          key={d?.id || i}
                          className="border-b border-[#F5F5F5] hover:bg-[#FAFAFA]"
                        >
                          <td className="py-4 px-3 text-[13px] font-medium text-general">
                            {d?.id || "—"}
                          </td>
                          <td className="py-4 px-3 text-[13px] text-general">
                            {d?.receiver || d?.recipient || "—"}
                          </td>
                          <td className="py-4 px-3 text-[13px] text-general">
                            <FormattedPrice amount={Number(d?.amount || 0)} />
                          </td>
                          <td className="py-4 px-3 text-[12px] text-primary_grey_2">
                            {d?.date || d?.created_at || "—"}
                          </td>
                          <td className="py-4 px-3">
                            <Pill
                              map={DELIVERY_STATUS}
                              value={d?.status || "—"}
                            />
                          </td>
                        </tr>
                      ))
                    )}
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
