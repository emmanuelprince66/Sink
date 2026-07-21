import { useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ToastContainer, toast } from "react-toastify";
import { format, parseISO } from "date-fns";
import {
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";
import {
  PaidOutlined as PaidIcon,
  TrendingUpOutlined as ProfitIcon,
  SmsOutlined as SmsIcon,
  AccountBalanceWalletOutlined as WalletIcon,
  BoltOutlined as BoltIcon,
  CampaignOutlined as CampaignIcon,
  PeopleAltOutlined as PeopleIcon,
  PendingActionsOutlined as PendingIcon,
  CheckCircleRounded as CheckIcon,
  CancelRounded as XIcon,
  HourglassEmptyRounded as HourglassIcon,
  ClearRounded as ClearIcon,
} from "@mui/icons-material";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip as RTooltip,
  Legend,
  BarChart,
  Bar,
} from "recharts";
import FormattedPrice from "../../utils/FormattedPrice";
import CustomPagination from "../../components/CustomPagination";
import CustomModal from "../../components/CustomModal";
import {
  transactionsCampaignUnitDataUrl,
  campaignTopSpendersUrl,
  campaignRevenueSeriesUrl,
  campaignMessagesSeriesUrl,
  campaignRecentActivityUrl,
  campaignRecentTransactionsUrl,
  senderIdsUrl,
  senderIdApproveUrl,
  senderIdRejectUrl,
} from "../../api/endpoint";
import useFetchData from "../../hooks/useFetchData";
import { AuthAxios } from "../../helpers/axiosInstance";
import { useDateContext } from "../../utils/DateContext";

// ── UI helpers ──
const fmtDate = (iso) => {
  if (!iso) return "—";
  try {
    // API sends "2026-05-19 07:04:11.175952+00:00" — swap the space for "T"
    // so parseISO accepts it.
    const norm = typeof iso === "string" ? iso.replace(" ", "T") : iso;
    return format(parseISO(norm), "dd MMM yyyy · HH:mm");
  } catch {
    return iso;
  }
};

// `merchant` comes back as an object { name, business, email } (or sometimes a
// plain string). Pull a business label and an owner label out of either shape.
const merchantLabel = (m, fallback = "—") => {
  if (!m) return fallback;
  if (typeof m === "string") return m;
  return m.business || m.business_name || m.name || fallback;
};
const ownerLabel = (m) => {
  if (!m || typeof m === "string") return null;
  return m.name || m.owner_name || null;
};

// Normalize the various list envelopes ({data}, {results}, {series}, bare array)
const asArray = (d) =>
  Array.isArray(d?.data)
    ? d.data
    : Array.isArray(d?.results)
    ? d.results
    : Array.isArray(d?.series)
    ? d.series
    : Array.isArray(d)
    ? d
    : [];

// delivery_rate may be a fraction (0.98), a percent number (98), or "98%"
const fmtRate = (v) => {
  if (v === null || v === undefined || v === "") return "—";
  if (typeof v === "string") return v.includes("%") ? v : `${v}%`;
  const n = Number(v);
  if (Number.isNaN(n)) return "—";
  return `${Math.round(n <= 1 ? n * 100 : n)}%`;
};

const totalPagesOf = (d, pageSize, fallbackLen) =>
  d?.pagination?.total_pages ||
  d?.total_pages ||
  d?.pages ||
  Math.max(
    1,
    Math.ceil(
      (d?.total ||
        d?.count ||
        d?.pagination?.total_count ||
        fallbackLen) / (d?.page_size || pageSize)
    )
  );

const StatCard = ({ icon, color, bg, label, value, sub }) => (
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
          {sub && <p className="text-[11px] text-[#9CA3AF] mt-0.5">{sub}</p>}
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

const StatusPill = ({ status }) => {
  const key = (status || "").toString();
  const map = {
    Successful: { bg: "#E6F7EA", color: "#02981D", icon: <CheckIcon sx={{ fontSize: 12 }} /> },
    SUCCESSFUL: { bg: "#E6F7EA", color: "#02981D", icon: <CheckIcon sx={{ fontSize: 12 }} /> },
    Delivered: { bg: "#E6F7EA", color: "#02981D", icon: <CheckIcon sx={{ fontSize: 12 }} /> },
    Approved: { bg: "#E6F7EA", color: "#02981D", icon: <CheckIcon sx={{ fontSize: 12 }} /> },
    APPROVED: { bg: "#E6F7EA", color: "#02981D", icon: <CheckIcon sx={{ fontSize: 12 }} /> },
    Failed: { bg: "#FDECEC", color: "#DC3545", icon: <XIcon sx={{ fontSize: 12 }} /> },
    Rejected: { bg: "#FDECEC", color: "#DC3545", icon: <XIcon sx={{ fontSize: 12 }} /> },
    REJECTED: { bg: "#FDECEC", color: "#DC3545", icon: <XIcon sx={{ fontSize: 12 }} /> },
    EXPIRED: { bg: "#FDECEC", color: "#DC3545", icon: <XIcon sx={{ fontSize: 12 }} /> },
    Pending: { bg: "#FFF7E8", color: "#B26A00", icon: <HourglassIcon sx={{ fontSize: 12 }} /> },
    PENDING: { bg: "#FFF7E8", color: "#B26A00", icon: <HourglassIcon sx={{ fontSize: 12 }} /> },
    Scheduled: { bg: "#FFF7E8", color: "#B26A00", icon: <HourglassIcon sx={{ fontSize: 12 }} /> },
  }[key] || { bg: "#F5F5F5", color: "#5E5E5E", icon: null };
  return (
    <span
      className="inline-flex items-center gap-1 text-[12px] font-medium px-3 py-1 rounded-full"
      style={{ background: map.bg, color: map.color }}
    >
      {map.icon}
      {key || "—"}
    </span>
  );
};

const SectionCard = ({ title, action, children }) => (
  <Card
    sx={{
      borderRadius: "14px",
      boxShadow: "0 1px 3px rgba(16,24,40,.06)",
      border: "1px solid #EFEFEF",
      height: "100%",
    }}
  >
    <CardContent sx={{ p: { xs: 2, md: 3 } }}>
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <p className="text-[15px] font-semibold text-general">{title}</p>
        {action}
      </div>
      {children}
    </CardContent>
  </Card>
);

const formatCompact = (n) => {
  if (n >= 1_000_000) return `₦${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `₦${(n / 1_000).toFixed(1)}K`;
  return `₦${n}`;
};

const UNIT_TYPES = [
  { key: "All", label: "All Units" },
  { key: "SMS", label: "SMS" },
  { key: "EMAIL", label: "Email" },
];

const TX_STATUSES = ["All", "PENDING", "SUCCESSFUL", "EXPIRED"];
const SENDER_STATUSES = ["All", "PENDING", "APPROVED", "REJECTED"];

const TableLoader = ({ span }) => (
  <tr>
    <td colSpan={span} className="py-10 text-center">
      <CircularProgress sx={{ color: "#02981D" }} />
    </td>
  </tr>
);

const TableEmpty = ({ span, children }) => (
  <tr>
    <td colSpan={span} className="py-10 text-center text-primary_grey_2">
      {children}
    </td>
  </tr>
);

const CampaignDashboard = () => {
  const queryClient = useQueryClient();
  const { selectedDates } = useDateContext();

  const [trendRange, setTrendRange] = useState("7d");
  const days = trendRange === "30d" ? 30 : 7;

  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage] = useState(50);
  const [unitType, setUnitType] = useState("All");

  const [topPage, setTopPage] = useState(1);
  const [activityPage, setActivityPage] = useState(1);
  const [txPage, setTxPage] = useState(1);
  const [txStatus, setTxStatus] = useState("All");
  const [senderStatus, setSenderStatus] = useState("All");
  const [senderSearch, setSenderSearch] = useState("");
  const [senderPage, setSenderPage] = useState(1);

  // Sender ID action modals
  const [approveTarget, setApproveTarget] = useState(null);
  const [rejectTarget, setRejectTarget] = useState(null);
  const [rejectReason, setRejectReason] = useState("");

  // ── Overview: GET /transaction/campaign-overview/ ──
  const overviewApi = transactionsCampaignUnitDataUrl(
    currentPage,
    rowsPerPage,
    "",
    unitType,
    selectedDates
  );
  const { data: overviewData, isLoading: overviewLoading } = useFetchData(
    [
      "fetchCampaignOverview",
      overviewApi,
      currentPage,
      unitType,
      selectedDates?.startDate,
      selectedDates?.endDate,
    ],
    overviewApi
  );
  const summary = overviewData?.summary || {};
  const overviewRows = useMemo(
    () =>
      asArray(overviewData).map((r) => ({
        business: merchantLabel(r?.merchant),
        owner: ownerLabel(r?.merchant),
        unitType: (r?.unit_type ?? "—").toString(),
        recipients: Number(r?.total_recipients ?? 0),
        date: r?.date ?? r?.last_activity ?? null,
      })),
    [overviewData]
  );
  const overviewTotalPages = totalPagesOf(
    overviewData,
    rowsPerPage,
    overviewRows.length
  );

  // ── Revenue series: GET /transaction/campaign-revenue-series/ ──
  const revenueApi = campaignRevenueSeriesUrl(days);
  const { data: revenueData, isLoading: revenueLoading } = useFetchData(
    ["fetchCampaignRevenueSeries", revenueApi, days],
    revenueApi
  );
  const revenueTrend = useMemo(
    () =>
      asArray(revenueData).map((d) => ({
        day: d?.label ?? d?.day ?? d?.date ?? "",
        revenue: Number(d?.revenue ?? 0),
        profit: Number(d?.profit ?? 0),
      })),
    [revenueData]
  );

  // ── Messages series: GET /transaction/campaign-messages-series/ ──
  const messagesApi = campaignMessagesSeriesUrl(days);
  const { data: messagesData, isLoading: messagesLoading } = useFetchData(
    ["fetchCampaignMessagesSeries", messagesApi, days],
    messagesApi
  );
  const messageTrend = useMemo(
    () =>
      asArray(messagesData).map((d) => ({
        day: d?.label ?? d?.day ?? d?.date ?? "",
        sms: Number(d?.sms ?? 0),
        email: Number(d?.email ?? 0),
      })),
    [messagesData]
  );

  // ── Top spenders: GET /transaction/campaign-top-spenders/ ──
  const topSpendersApi = campaignTopSpendersUrl(topPage, 10, selectedDates);
  const { data: topSpendersData, isLoading: topSpendersLoading } = useFetchData(
    [
      "fetchCampaignTopSpenders",
      topSpendersApi,
      topPage,
      selectedDates?.startDate,
      selectedDates?.endDate,
    ],
    topSpendersApi
  );
  const topSpenders = useMemo(
    () =>
      asArray(topSpendersData).map((r) => ({
        name: r?.business_name ?? r?.merchant_name ?? r?.name ?? "—",
        purchased: Number(r?.credits_purchased ?? r?.purchased ?? 0),
        used: Number(r?.credits_used ?? r?.used ?? 0),
        spend: Number(r?.total_spend ?? r?.naira_spend ?? r?.spend ?? r?.amount ?? 0),
        lastActive: r?.last_active ?? r?.last_activity ?? null,
      })),
    [topSpendersData]
  );
  const topSpendersTotalPages = totalPagesOf(topSpendersData, 10, topSpenders.length);

  // ── Recent activity: GET /transaction/campaign-recent-activity/ ──
  const recentActivityApi = campaignRecentActivityUrl(activityPage, 10);
  const { data: recentActivityData, isLoading: recentActivityLoading } =
    useFetchData(
      ["fetchCampaignRecentActivity", recentActivityApi, activityPage],
      recentActivityApi
    );
  const recentActivity = useMemo(
    () =>
      asArray(recentActivityData).map((c) => ({
        user:
          merchantLabel(c?.merchant, null) ??
          c?.merchant_name ??
          c?.business_name ??
          c?.user ??
          "—",
        channel: (c?.channel ?? c?.unit_type ?? "—").toString(),
        sent: Number(c?.sent ?? c?.messages_sent ?? c?.total_recipients ?? 0),
        rate: c?.delivery_rate ?? c?.deliveryRate,
        status: c?.status ?? "—",
      })),
    [recentActivityData]
  );
  const recentActivityTotalPages = totalPagesOf(
    recentActivityData,
    10,
    recentActivity.length
  );

  // ── Recent transactions: GET /transaction/campaign-recent-transactions/ ──
  const recentTxApi = campaignRecentTransactionsUrl(txPage, 10, txStatus);
  const { data: recentTxData, isLoading: recentTxLoading } = useFetchData(
    ["fetchCampaignRecentTransactions", recentTxApi, txPage, txStatus],
    recentTxApi
  );
  const recentTransactions = useMemo(
    () =>
      asArray(recentTxData).map((t) => ({
        merchant: t?.business_name ?? merchantLabel(t?.merchant),
        amount: Number(t?.amount ?? t?.funding ?? 0),
        status: t?.status ?? "—",
        date: t?.created_at ?? t?.date ?? null,
        reference: t?.reference ?? t?.ref ?? null,
      })),
    [recentTxData]
  );
  const recentTxTotalPages = totalPagesOf(recentTxData, 10, recentTransactions.length);

  // ── Sender IDs: GET /transaction/sender-ids/ ──
  const senderApi = senderIdsUrl(senderPage, 10, senderStatus, senderSearch);
  const { data: senderData, isLoading: senderLoading } = useFetchData(
    ["fetchSenderIds", senderApi, senderStatus, senderSearch, senderPage],
    senderApi
  );
  const senderIds = useMemo(
    () =>
      asArray(senderData).map((s) => ({
        requestId: s?.request_id ?? s?.id,
        senderId: s?.sender_id ?? s?.senderId ?? s?.sender ?? "—",
        business: s?.business_name ?? s?.business ?? "—",
        owner: ownerLabel(s?.owner) ?? s?.owner_name ?? null,
        status: (s?.status ?? "—").toString(),
        submitted: s?.submitted_at ?? s?.created_at ?? s?.submitted ?? null,
      })),
    [senderData]
  );
  const senderTotalPages = totalPagesOf(senderData, 10, senderIds.length);
  const pendingSenderIds =
    summary?.pending_sender_ids ??
    senderData?.pending_count ??
    senderData?.summary?.pending ??
    senderIds.filter((s) => s.status.toUpperCase() === "PENDING").length;

  // ── Sender ID mutations ──
  const approveSender = useMutation({
    mutationFn: (requestId) => AuthAxios.post(senderIdApproveUrl(requestId)),
    onSuccess: () => {
      toast.success("Sender ID approved");
      queryClient.invalidateQueries({ queryKey: ["fetchSenderIds"] });
      setApproveTarget(null);
    },
    onError: (err) =>
      toast.error(err?.response?.data?.detail?.[0]?.msg || "Failed to approve"),
  });

  const confirmApprove = () => {
    if (approveTarget?.requestId) approveSender.mutate(approveTarget.requestId);
  };

  const rejectSender = useMutation({
    mutationFn: ({ requestId, reason }) =>
      AuthAxios.post(senderIdRejectUrl(requestId), { rejection_reason: reason }),
    onSuccess: () => {
      toast.success("Sender ID rejected");
      queryClient.invalidateQueries({ queryKey: ["fetchSenderIds"] });
      setRejectTarget(null);
      setRejectReason("");
    },
    onError: (err) =>
      toast.error(err?.response?.data?.detail?.[0]?.msg || "Failed to reject"),
  });

  const confirmReject = () => {
    if (!rejectTarget?.requestId) return;
    if (!rejectReason.trim()) {
      toast.error("A rejection reason is required");
      return;
    }
    rejectSender.mutate({
      requestId: rejectTarget.requestId,
      reason: rejectReason.trim(),
    });
  };

  return (
    <div className="w-full flex flex-col gap-6">
      {/* 8 top summary cards */}
      <Grid container spacing={2}>
        <Grid item xs={6} md={4} lg={3}>
          <StatCard
            icon={<PaidIcon fontSize="small" />}
            color="#02981D"
            bg="#E6F7EA"
            label="Total Funding"
            value={
              <FormattedPrice amount={Number(summary.total_funding || 0)} />
            }
            sub="Inflow in selected range"
          />
        </Grid>
        <Grid item xs={6} md={4} lg={3}>
          <StatCard
            icon={<ProfitIcon fontSize="small" />}
            color="#0369A1"
            bg="#E0F2FE"
            label="Net Profit"
            value={<FormattedPrice amount={Number(summary.net_profit || 0)} />}
            sub="After SMS / Email cost"
          />
        </Grid>
        <Grid item xs={6} md={4} lg={3}>
          <StatCard
            icon={<SmsIcon fontSize="small" />}
            color="#DC3545"
            bg="#FDECEC"
            label="SMS / Email Cost"
            value={
              <FormattedPrice amount={Number(summary.cost_of_service || 0)} />
            }
            sub="Carrier + ESP cost"
          />
        </Grid>
        <Grid item xs={6} md={4} lg={3}>
          <StatCard
            icon={<WalletIcon fontSize="small" />}
            color="#7C3AED"
            bg="#F3E8FF"
            label="Credits Liability"
            value={
              <FormattedPrice amount={Number(summary.credits_liability || 0)} />
            }
            sub="Unspent credits on platform"
          />
        </Grid>
        <Grid item xs={6} md={4} lg={3}>
          <StatCard
            icon={<BoltIcon fontSize="small" />}
            color="#B26A00"
            bg="#FFF7E8"
            label="Credits Used Today"
            value={
              <FormattedPrice
                amount={Number(summary.credits_used_today || 0)}
              />
            }
            sub="₦ value of usage"
          />
        </Grid>
        <Grid item xs={6} md={4} lg={3}>
          <StatCard
            icon={<CampaignIcon fontSize="small" />}
            color="#3949AB"
            bg="#EEF2FF"
            label="Messages Sent Today"
            value={Number(summary.messages_sent_today || 0).toLocaleString()}
            sub="SMS + Email"
          />
        </Grid>
        <Grid item xs={6} md={4} lg={3}>
          <StatCard
            icon={<PeopleIcon fontSize="small" />}
            color="#02981D"
            bg="#E6F7EA"
            label="Active Users (Today)"
            value={Number(summary.active_users_today || 0).toLocaleString()}
            sub="Logged in past 24h"
          />
        </Grid>
        <Grid item xs={6} md={4} lg={3}>
          <StatCard
            icon={<PendingIcon fontSize="small" />}
            color="#C2410C"
            bg="#FFF1E0"
            label="Pending Sender IDs"
            value={Number(pendingSenderIds || 0).toLocaleString()}
            sub="Awaiting approval"
          />
        </Grid>
      </Grid>

      {/* Trend snapshot */}
      <Grid container spacing={2}>
        <Grid item xs={12} lg={7}>
          <SectionCard
            title="Revenue vs Profit"
            action={
              <Select
                size="small"
                value={trendRange}
                onChange={(e) => setTrendRange(e.target.value)}
                sx={{ minWidth: 140 }}
              >
                <MenuItem value="7d">Last 7 days</MenuItem>
                <MenuItem value="30d">Last 30 days</MenuItem>
              </Select>
            }
          >
            <div className="w-full h-[260px]">
              {revenueLoading ? (
                <div className="h-full flex items-center justify-center">
                  <CircularProgress sx={{ color: "#02981D" }} />
                </div>
              ) : revenueTrend.length === 0 ? (
                <div className="h-full flex items-center justify-center text-[13px] text-primary_grey_2">
                  No revenue data for this range.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={revenueTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" />
                    <XAxis dataKey="day" tick={{ fontSize: 12, fill: "#5E5E5E" }} />
                    <YAxis
                      tick={{ fontSize: 12, fill: "#5E5E5E" }}
                      tickFormatter={formatCompact}
                    />
                    <RTooltip
                      formatter={(v) => formatCompact(v)}
                      contentStyle={{
                        borderRadius: 8,
                        border: "1px solid #EFEFEF",
                        fontSize: 12,
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="#02981D"
                      strokeWidth={2.5}
                      dot={{ r: 3 }}
                      activeDot={{ r: 5 }}
                      name="Revenue"
                    />
                    <Line
                      type="monotone"
                      dataKey="profit"
                      stroke="#0369A1"
                      strokeWidth={2.5}
                      dot={{ r: 3 }}
                      activeDot={{ r: 5 }}
                      name="Profit"
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </SectionCard>
        </Grid>

        <Grid item xs={12} lg={5}>
          <SectionCard title="Messages Sent — SMS vs Email">
            <div className="w-full h-[260px]">
              {messagesLoading ? (
                <div className="h-full flex items-center justify-center">
                  <CircularProgress sx={{ color: "#02981D" }} />
                </div>
              ) : messageTrend.length === 0 ? (
                <div className="h-full flex items-center justify-center text-[13px] text-primary_grey_2">
                  No message data for this range.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={messageTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" />
                    <XAxis dataKey="day" tick={{ fontSize: 12, fill: "#5E5E5E" }} />
                    <YAxis tick={{ fontSize: 12, fill: "#5E5E5E" }} />
                    <RTooltip
                      contentStyle={{
                        borderRadius: 8,
                        border: "1px solid #EFEFEF",
                        fontSize: 12,
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Bar dataKey="sms" fill="#02981D" radius={[4, 4, 0, 0]} name="SMS" />
                    <Bar dataKey="email" fill="#3949AB" radius={[4, 4, 0, 0]} name="Email" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </SectionCard>
        </Grid>
      </Grid>

      {/* Campaign Activity — LIVE from /transaction/campaign-overview/ */}
      <SectionCard
        title="Campaign Activity"
        action={
          <Select
            size="small"
            value={unitType}
            onChange={(e) => {
              setUnitType(e.target.value);
              setCurrentPage(1);
            }}
            sx={{ minWidth: 140 }}
          >
            {UNIT_TYPES.map((u) => (
              <MenuItem key={u.key} value={u.key}>
                {u.label}
              </MenuItem>
            ))}
          </Select>
        }
      >
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[11px] uppercase tracking-wide text-primary_grey_2 border-b border-[#EFEFEF]">
                <th className="py-3 px-2">Merchant</th>
                <th className="py-3 px-2">Unit Type</th>
                <th className="py-3 px-2 text-right">Recipients</th>
                <th className="py-3 px-2">Date</th>
              </tr>
            </thead>
            <tbody>
              {overviewLoading ? (
                <TableLoader span={4} />
              ) : overviewRows.length === 0 ? (
                <TableEmpty span={4}>No campaign activity in this range.</TableEmpty>
              ) : (
                overviewRows.map((r, i) => (
                  <tr key={i} className="border-b border-[#F5F5F5] hover:bg-[#FAFAFA]">
                    <td className="py-3 px-2 text-[13px] font-medium text-general">
                      {r.business}
                      {r.owner && (
                        <span className="block text-[11px] text-primary_grey_2">
                          {r.owner}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-2">
                      <span
                        className="text-[12px] font-semibold px-2 py-1 rounded-md"
                        style={{
                          background:
                            r.unitType.toUpperCase() === "EMAIL"
                              ? "#EEF2FF"
                              : "#E6F7EA",
                          color:
                            r.unitType.toUpperCase() === "EMAIL"
                              ? "#3949AB"
                              : "#02981D",
                        }}
                      >
                        {r.unitType}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-[13px] text-general text-right">
                      {r.recipients.toLocaleString()}
                    </td>
                    <td className="py-3 px-2 text-[12px] text-primary_grey_2">
                      {fmtDate(r.date)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {!overviewLoading && overviewRows.length > 0 && (
          <CustomPagination
            currentPage={currentPage}
            totalPages={overviewTotalPages}
            onPageChange={setCurrentPage}
          />
        )}
      </SectionCard>

      {/* Bottom tables — all live */}
      <Grid container spacing={2}>
        {/* Top Users by Spend — /transaction/campaign-top-spenders/ */}
        <Grid item xs={12} lg={6}>
          <SectionCard title="Top Users by Spend">
            <div className="w-full overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[11px] uppercase tracking-wide text-primary_grey_2 border-b border-[#EFEFEF]">
                    <th className="py-3 px-2">Business</th>
                    <th className="py-3 px-2 text-right">Purchased</th>
                    <th className="py-3 px-2 text-right">Used</th>
                    <th className="py-3 px-2 text-right">Spend</th>
                    <th className="py-3 px-2">Last Active</th>
                  </tr>
                </thead>
                <tbody>
                  {topSpendersLoading ? (
                    <TableLoader span={5} />
                  ) : topSpenders.length === 0 ? (
                    <TableEmpty span={5}>No spend data yet.</TableEmpty>
                  ) : (
                    topSpenders.map((u, i) => (
                      <tr key={i} className="border-b border-[#F5F5F5] hover:bg-[#FAFAFA]">
                        <td className="py-3 px-2 text-[13px] text-general font-medium truncate max-w-[180px]">
                          {u.name}
                        </td>
                        <td className="py-3 px-2 text-[12px] text-general text-right">
                          {u.purchased.toLocaleString()}
                        </td>
                        <td className="py-3 px-2 text-[12px] text-general text-right">
                          {u.used.toLocaleString()}
                        </td>
                        <td className="py-3 px-2 text-[13px] text-general text-right font-medium">
                          <FormattedPrice amount={u.spend} />
                        </td>
                        <td className="py-3 px-2 text-[11px] text-primary_grey_2">
                          {fmtDate(u.lastActive)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            {!topSpendersLoading && topSpenders.length > 0 && (
              <CustomPagination
                currentPage={topPage}
                totalPages={topSpendersTotalPages}
                onPageChange={setTopPage}
              />
            )}
          </SectionCard>
        </Grid>

        {/* Recent Campaign Activity — /transaction/campaign-recent-activity/ */}
        <Grid item xs={12} lg={6}>
          <SectionCard title="Recent Campaign Activity">
            <div className="w-full overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[11px] uppercase tracking-wide text-primary_grey_2 border-b border-[#EFEFEF]">
                    <th className="py-3 px-2">User</th>
                    <th className="py-3 px-2">Channel</th>
                    <th className="py-3 px-2 text-right">Sent</th>
                    <th className="py-3 px-2 text-right">Delivery</th>
                    <th className="py-3 px-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentActivityLoading ? (
                    <TableLoader span={5} />
                  ) : recentActivity.length === 0 ? (
                    <TableEmpty span={5}>No recent activity.</TableEmpty>
                  ) : (
                    recentActivity.map((c, i) => (
                      <tr key={i} className="border-b border-[#F5F5F5] hover:bg-[#FAFAFA]">
                        <td className="py-3 px-2 text-[13px] text-general font-medium truncate max-w-[160px]">
                          {c.user}
                        </td>
                        <td className="py-3 px-2">
                          <Chip
                            size="small"
                            label={c.channel}
                            sx={{
                              background:
                                c.channel.toUpperCase() === "SMS"
                                  ? "#E6F7EA"
                                  : "#EEF2FF",
                              color:
                                c.channel.toUpperCase() === "SMS"
                                  ? "#02981D"
                                  : "#3949AB",
                              fontWeight: 600,
                            }}
                          />
                        </td>
                        <td className="py-3 px-2 text-[12px] text-general text-right">
                          {c.sent.toLocaleString()}
                        </td>
                        <td className="py-3 px-2 text-[12px] text-general text-right">
                          {fmtRate(c.rate)}
                        </td>
                        <td className="py-3 px-2">
                          <StatusPill status={c.status} />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            {!recentActivityLoading && recentActivity.length > 0 && (
              <CustomPagination
                currentPage={activityPage}
                totalPages={recentActivityTotalPages}
                onPageChange={setActivityPage}
              />
            )}
          </SectionCard>
        </Grid>

        {/* Sender ID Status — /transaction/sender-ids/ (+ approve/reject) */}
        <Grid item xs={12} lg={6}>
          <SectionCard
            title="Sender ID Status"
            action={
              <div className="flex items-center gap-2 flex-wrap">
                <TextField
                  size="small"
                  placeholder="Search"
                  value={senderSearch}
                  onChange={(e) => {
                    setSenderSearch(e.target.value);
                    setSenderPage(1);
                  }}
                  sx={{ width: 140 }}
                />
                <Select
                  size="small"
                  value={senderStatus}
                  onChange={(e) => {
                    setSenderStatus(e.target.value);
                    setSenderPage(1);
                  }}
                  sx={{ minWidth: 120 }}
                >
                  {SENDER_STATUSES.map((s) => (
                    <MenuItem key={s} value={s}>
                      {s === "All" ? "All Status" : s}
                    </MenuItem>
                  ))}
                </Select>
              </div>
            }
          >
            <div className="w-full overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[11px] uppercase tracking-wide text-primary_grey_2 border-b border-[#EFEFEF]">
                    <th className="py-3 px-2">Sender ID</th>
                    <th className="py-3 px-2">Business</th>
                    <th className="py-3 px-2">Status</th>
                    <th className="py-3 px-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {senderLoading ? (
                    <TableLoader span={4} />
                  ) : senderIds.length === 0 ? (
                    <TableEmpty span={4}>No sender ID requests.</TableEmpty>
                  ) : (
                    senderIds.map((s, i) => {
                      const isPending = s.status.toUpperCase() === "PENDING";
                      const busy =
                        approveSender.isPending || rejectSender.isPending;
                      return (
                        <tr
                          key={s.requestId || i}
                          className="border-b border-[#F5F5F5] hover:bg-[#FAFAFA]"
                        >
                          <td className="py-3 px-2 text-[13px] text-general font-medium font-mono">
                            {s.senderId}
                          </td>
                          <td className="py-3 px-2 text-[12px] text-general truncate max-w-[150px]">
                            {s.business}
                            {s.owner && (
                              <span className="block text-[11px] text-primary_grey_2 truncate">
                                {s.owner}
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-2">
                            <StatusPill status={s.status} />
                          </td>
                          <td className="py-3 px-2 text-right whitespace-nowrap">
                            {isPending ? (
                              <div className="inline-flex gap-1">
                                <Button
                                  size="small"
                                  disabled={busy}
                                  onClick={() => setApproveTarget(s)}
                                  sx={{
                                    minWidth: 0,
                                    textTransform: "none",
                                    color: "#02981D",
                                    fontWeight: 600,
                                  }}
                                >
                                  Approve
                                </Button>
                                <Button
                                  size="small"
                                  disabled={busy}
                                  onClick={() => {
                                    setRejectTarget(s);
                                    setRejectReason("");
                                  }}
                                  sx={{
                                    minWidth: 0,
                                    textTransform: "none",
                                    color: "#DC3545",
                                    fontWeight: 600,
                                  }}
                                >
                                  Reject
                                </Button>
                              </div>
                            ) : (
                              <span className="text-[12px] text-primary_grey_2">
                                {fmtDate(s.submitted)}
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
            {!senderLoading && senderIds.length > 0 && (
              <CustomPagination
                currentPage={senderPage}
                totalPages={senderTotalPages}
                onPageChange={setSenderPage}
              />
            )}
          </SectionCard>
        </Grid>

        {/* Recent Transactions — /transaction/campaign-recent-transactions/ */}
        <Grid item xs={12} lg={6}>
          <SectionCard
            title="Recent Transactions"
            action={
              <Select
                size="small"
                value={txStatus}
                onChange={(e) => {
                  setTxStatus(e.target.value);
                  setTxPage(1);
                }}
                sx={{ minWidth: 130 }}
              >
                {TX_STATUSES.map((s) => (
                  <MenuItem key={s} value={s}>
                    {s === "All" ? "All Status" : s}
                  </MenuItem>
                ))}
              </Select>
            }
          >
            <div className="w-full overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[11px] uppercase tracking-wide text-primary_grey_2 border-b border-[#EFEFEF]">
                    <th className="py-3 px-2">Merchant</th>
                    <th className="py-3 px-2 text-right">Amount</th>
                    <th className="py-3 px-2">Status</th>
                    <th className="py-3 px-2">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentTxLoading ? (
                    <TableLoader span={4} />
                  ) : recentTransactions.length === 0 ? (
                    <TableEmpty span={4}>No campaign fundings yet.</TableEmpty>
                  ) : (
                    recentTransactions.map((t, i) => (
                      <tr key={i} className="border-b border-[#F5F5F5] hover:bg-[#FAFAFA]">
                        <td className="py-3 px-2 text-[13px] text-general font-medium truncate max-w-[160px]">
                          {t.merchant}
                        </td>
                        <td className="py-3 px-2 text-[13px] text-general text-right font-medium">
                          <FormattedPrice amount={t.amount} />
                        </td>
                        <td className="py-3 px-2">
                          <StatusPill status={t.status} />
                        </td>
                        <td className="py-3 px-2 text-[11px] text-primary_grey_2">
                          {fmtDate(t.date)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            {!recentTxLoading && recentTransactions.length > 0 && (
              <CustomPagination
                currentPage={txPage}
                totalPages={recentTxTotalPages}
                onPageChange={setTxPage}
              />
            )}
          </SectionCard>
        </Grid>
      </Grid>

      {/* Approve sender ID modal */}
      <CustomModal
        open={!!approveTarget}
        closeModal={() => setApproveTarget(null)}
        style="w-[95%] sm:w-[440px]"
      >
        {approveTarget && (
          <div className="flex flex-col items-center text-center gap-4 p-2">
            <div className="h-14 w-14 rounded-full bg-[#E6F7EA] text-[#02981D] flex items-center justify-center">
              <CheckIcon sx={{ fontSize: 30 }} />
            </div>
            <div>
              <p className="text-[18px] font-semibold text-general">
                Approve Sender ID?
              </p>
              <p className="text-[13px] text-primary_grey_2 mt-1 leading-relaxed">
                The merchant will be able to send campaigns using this sender ID.
              </p>
            </div>

            <div className="w-full rounded-xl border border-[#EFEFEF] bg-[#FAFAFA] px-4 py-3 text-left">
              <div className="flex items-center justify-between">
                <span className="text-[12px] text-primary_grey_2">Sender ID</span>
                <span className="text-[13px] font-semibold font-mono text-general">
                  {approveTarget.senderId}
                </span>
              </div>
              <Divider sx={{ my: 1 }} />
              <div className="flex items-center justify-between">
                <span className="text-[12px] text-primary_grey_2">Business</span>
                <span className="text-[13px] font-medium text-general text-right">
                  {approveTarget.business}
                </span>
              </div>
            </div>

            <div className="w-full flex gap-2 mt-1">
              <Button
                fullWidth
                onClick={() => setApproveTarget(null)}
                disabled={approveSender.isPending}
                sx={{
                  textTransform: "none",
                  color: "#5E5E5E",
                  border: "1px solid #E3E3E3",
                  "&:hover": { background: "#F5F5F5" },
                }}
              >
                Cancel
              </Button>
              <Button
                fullWidth
                variant="contained"
                onClick={confirmApprove}
                disabled={approveSender.isPending}
                startIcon={!approveSender.isPending && <CheckIcon />}
                sx={{
                  textTransform: "none",
                  background: "#02981D",
                  boxShadow: "none",
                  "&:hover": { background: "#017a17" },
                }}
              >
                {approveSender.isPending ? (
                  <CircularProgress size="1.2rem" sx={{ color: "#fff" }} />
                ) : (
                  "Approve"
                )}
              </Button>
            </div>
          </div>
        )}
      </CustomModal>

      {/* Reject sender ID modal */}
      <CustomModal
        open={!!rejectTarget}
        closeModal={() => setRejectTarget(null)}
        style="w-[95%] sm:w-[460px]"
      >
        {rejectTarget && (
          <div className="flex flex-col gap-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-[#FDECEC] text-[#DC3545] flex items-center justify-center flex-none">
                  <XIcon sx={{ fontSize: 22 }} />
                </div>
                <p className="text-[18px] font-semibold text-general">
                  Reject Sender ID
                </p>
              </div>
              <ClearIcon
                onClick={() => setRejectTarget(null)}
                sx={{ color: "#1E1E1E", cursor: "pointer" }}
              />
            </div>
            <p className="text-[13px] text-general leading-relaxed">
              Rejecting{" "}
              <span className="font-semibold font-mono">
                {rejectTarget.senderId}
              </span>{" "}
              for{" "}
              <span className="font-medium">{rejectTarget.business}</span>. The
              reason is sent to the merchant.
            </p>
            <TextField
              fullWidth
              multiline
              minRows={3}
              label="Rejection reason"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              required
            />
            <div className="flex justify-end gap-2 mt-1">
              <Button
                onClick={() => setRejectTarget(null)}
                disabled={rejectSender.isPending}
                sx={{
                  textTransform: "none",
                  color: "#5E5E5E",
                  "&:hover": { background: "#F5F5F5" },
                }}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={confirmReject}
                disabled={rejectSender.isPending}
                sx={{
                  textTransform: "none",
                  background: "#DC3545",
                  boxShadow: "none",
                  "&:hover": { background: "#b52a37" },
                }}
              >
                {rejectSender.isPending ? (
                  <CircularProgress size="1.2rem" sx={{ color: "#fff" }} />
                ) : (
                  "Reject"
                )}
              </Button>
            </div>
          </div>
        )}
      </CustomModal>

      <ToastContainer position="top-right" autoClose={4000} />
    </div>
  );
};

export default CampaignDashboard;
