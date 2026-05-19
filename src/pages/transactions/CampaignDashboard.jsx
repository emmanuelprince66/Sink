import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { format, parseISO } from "date-fns";
import {
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Grid,
  MenuItem,
  Select,
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
import { transactionsCampaignUnitDataUrl } from "../../api/endpoint";
import useFetchData from "../../hooks/useFetchData";
import { useDateContext } from "../../utils/DateContext";

// ── Sample data for fields the API doesn't yet expose ──
// Replaced with API values where possible — see comments on each card.
const SAMPLE = {
  netProfit: 8120400,
  smsEmailCost: 642300,
  creditsUsedToday: 248000,
  messagesSentToday: 12480,
  activeUsersToday: 1284,
  pendingSenderIds: 7,
};

const REVENUE_TREND = [
  { day: "Day 1", revenue: 1240000, profit: 412000 },
  { day: "Day 2", revenue: 1480000, profit: 521000 },
  { day: "Day 3", revenue: 1180000, profit: 386000 },
  { day: "Day 4", revenue: 1620000, profit: 612000 },
  { day: "Day 5", revenue: 1820000, profit: 720000 },
  { day: "Day 6", revenue: 2120000, profit: 880000 },
  { day: "Day 7", revenue: 2480000, profit: 1020000 },
];

const MESSAGE_TREND = [
  { day: "Day 1", sms: 6200, email: 4100 },
  { day: "Day 2", sms: 7400, email: 4800 },
  { day: "Day 3", sms: 5900, email: 4300 },
  { day: "Day 4", sms: 8100, email: 5400 },
  { day: "Day 5", sms: 9200, email: 6100 },
  { day: "Day 6", sms: 10800, email: 7200 },
  { day: "Day 7", sms: 12480, email: 8420 },
];

const SAMPLE_TOP_USERS = [
  { name: "Sunde Logistics Ltd", purchased: 480000, used: 412800, spend: 4200000, lastActive: "2026-04-22 14:30" },
  { name: "Adaeze Beauty Hub", purchased: 320000, used: 248000, spend: 2980000, lastActive: "2026-04-22 14:22" },
  { name: "Kano Foods Co.", purchased: 280000, used: 198000, spend: 2410000, lastActive: "2026-04-22 11:08" },
  { name: "Lagos Mart Ventures", purchased: 180000, used: 142000, spend: 1680000, lastActive: "2026-04-21 17:42" },
  { name: "Ifeanyi Johnson", purchased: 60000, used: 42000, spend: 540000, lastActive: "2026-04-21 12:11" },
];

const SAMPLE_CAMPAIGNS = [
  { user: "Adaeze Beauty Hub", channel: "SMS", sent: 12480, deliveryRate: 0.982, status: "Delivered", date: "2026-04-22 09:00" },
  { user: "Sunde Logistics Ltd", channel: "Email", sent: 8420, deliveryRate: 0.961, status: "Delivered", date: "2026-04-21 14:12" },
  { user: "Lagos Mart Ventures", channel: "SMS", sent: 4210, deliveryRate: 0.91, status: "Delivered", date: "2026-04-21 10:30" },
  { user: "Kano Foods Co.", channel: "Email", sent: 0, deliveryRate: 0, status: "Scheduled", date: "2026-04-23 08:00" },
  { user: "Ifeanyi Johnson", channel: "SMS", sent: 1200, deliveryRate: 0.78, status: "Failed", date: "2026-04-22 09:32" },
];

const SAMPLE_SENDER_IDS = [
  { id: "ADAEZE-HUB", user: "Adaeze Beauty Hub", status: "Approved", submitted: "2026-03-12" },
  { id: "SUNDE-LOG", user: "Sunde Logistics Ltd", status: "Approved", submitted: "2026-03-04" },
  { id: "LAGOS-MART", user: "Lagos Mart Ventures", status: "Pending", submitted: "2026-04-19" },
  { id: "KANO-FOODS", user: "Kano Foods Co.", status: "Pending", submitted: "2026-04-20" },
  { id: "FAST-CASH", user: "Chinedu Eze", status: "Rejected", submitted: "2026-04-15" },
];

// ── UI helpers ──
const fmtDate = (iso) => {
  if (!iso) return "—";
  try {
    return format(parseISO(iso), "dd MMM yyyy · HH:mm");
  } catch {
    return iso;
  }
};

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

const StatusPill = ({ status }) => {
  const map = {
    Successful: { bg: "#E6F7EA", color: "#02981D", icon: <CheckIcon sx={{ fontSize: 12 }} /> },
    Delivered: { bg: "#E6F7EA", color: "#02981D", icon: <CheckIcon sx={{ fontSize: 12 }} /> },
    Approved: { bg: "#E6F7EA", color: "#02981D", icon: <CheckIcon sx={{ fontSize: 12 }} /> },
    Failed: { bg: "#FDECEC", color: "#DC3545", icon: <XIcon sx={{ fontSize: 12 }} /> },
    Rejected: { bg: "#FDECEC", color: "#DC3545", icon: <XIcon sx={{ fontSize: 12 }} /> },
    Pending: { bg: "#FFF7E8", color: "#B26A00", icon: <HourglassIcon sx={{ fontSize: 12 }} /> },
    Scheduled: { bg: "#FFF7E8", color: "#B26A00", icon: <HourglassIcon sx={{ fontSize: 12 }} /> },
  }[status] || { bg: "#F5F5F5", color: "#5E5E5E", icon: null };
  return (
    <span
      className="inline-flex items-center gap-1 text-[12px] font-medium px-3 py-1 rounded-full"
      style={{ background: map.bg, color: map.color }}
    >
      {map.icon}
      {status}
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

const CampaignDashboard = () => {
  const navigate = useNavigate();
  const { selectedDates } = useDateContext();
  const [trendRange, setTrendRange] = useState("7d");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage] = useState(50);
  const [unitType, setUnitType] = useState("All");

  // Live data: GET /transaction/campaign-overview/
  const apiUrl = transactionsCampaignUnitDataUrl(
    currentPage,
    rowsPerPage,
    "",
    unitType,
    selectedDates
  );
  const { data, isLoading } = useFetchData(
    [
      "fetchCampaignOverview",
      apiUrl,
      currentPage,
      unitType,
      selectedDates?.startDate,
      selectedDates?.endDate,
    ],
    apiUrl
  );

  const summary = data?.summary || {};
  const rows = useMemo(() => {
    const raw =
      data?.results ||
      data?.data ||
      (Array.isArray(data) ? data : []);
    return Array.isArray(raw) ? raw : [];
  }, [data]);

  const totalPages =
    data?.pagination?.total_pages ||
    data?.total_pages ||
    Math.max(1, Math.ceil((data?.pagination?.total_count || rows.length) / rowsPerPage));

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
            value={<FormattedPrice amount={SAMPLE.netProfit} />}
            sub="After SMS / Email cost (sample)"
          />
        </Grid>
        <Grid item xs={6} md={4} lg={3}>
          <StatCard
            icon={<SmsIcon fontSize="small" />}
            color="#DC3545"
            bg="#FDECEC"
            label="SMS / Email Cost"
            value={<FormattedPrice amount={SAMPLE.smsEmailCost} />}
            sub="Carrier + ESP cost (sample)"
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
            value={<FormattedPrice amount={SAMPLE.creditsUsedToday} />}
            sub="₦ value of usage (sample)"
          />
        </Grid>
        <Grid item xs={6} md={4} lg={3}>
          <StatCard
            icon={<CampaignIcon fontSize="small" />}
            color="#3949AB"
            bg="#EEF2FF"
            label="Messages Sent Today"
            value={SAMPLE.messagesSentToday.toLocaleString()}
            sub="SMS + Email (sample)"
          />
        </Grid>
        <Grid item xs={6} md={4} lg={3}>
          <StatCard
            icon={<PeopleIcon fontSize="small" />}
            color="#02981D"
            bg="#E6F7EA"
            label="Active Users (Today)"
            value={SAMPLE.activeUsersToday.toLocaleString()}
            sub="Logged in past 24h (sample)"
          />
        </Grid>
        <Grid item xs={6} md={4} lg={3}>
          <StatCard
            icon={<PendingIcon fontSize="small" />}
            color="#C2410C"
            bg="#FFF1E0"
            label="Pending Sender IDs"
            value={SAMPLE.pendingSenderIds}
            sub="Awaiting approval (sample)"
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
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={REVENUE_TREND}>
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
            </div>
          </SectionCard>
        </Grid>

        <Grid item xs={12} lg={5}>
          <SectionCard title="Messages Sent — SMS vs Email">
            <div className="w-full h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={MESSAGE_TREND}>
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
            </div>
          </SectionCard>
        </Grid>
      </Grid>

      {/* Recent Campaign Activity — LIVE from /transaction/campaign-overview/ */}
      <SectionCard
        title="Campaign Activity"
        action={
          <div className="flex items-center gap-2">
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
          </div>
        }
      >
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[11px] uppercase tracking-wide text-primary_grey_2 border-b border-[#EFEFEF]">
                <th className="py-3 px-2">Merchant</th>
                <th className="py-3 px-2">Unit Type</th>
                <th className="py-3 px-2 text-right">Funding</th>
                <th className="py-3 px-2 text-right">Credits Used</th>
                <th className="py-3 px-2 text-right">Credits Left</th>
                <th className="py-3 px-2">Last Activity</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center">
                    <CircularProgress sx={{ color: "#02981D" }} />
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-primary_grey_2">
                    No campaign activity in this range.
                  </td>
                </tr>
              ) : (
                rows.map((r, i) => (
                  <tr key={r?.id || i} className="border-b border-[#F5F5F5] hover:bg-[#FAFAFA]">
                    <td className="py-3 px-2 text-[13px] font-medium text-general">
                      {r?.merchant_name || r?.merchant || r?.name || "—"}
                    </td>
                    <td className="py-3 px-2">
                      <span
                        className="text-[12px] font-semibold px-2 py-1 rounded-md"
                        style={{
                          background:
                            (r?.unit_type || "").toUpperCase() === "EMAIL"
                              ? "#EEF2FF"
                              : "#E6F7EA",
                          color:
                            (r?.unit_type || "").toUpperCase() === "EMAIL"
                              ? "#3949AB"
                              : "#02981D",
                        }}
                      >
                        {r?.unit_type || "—"}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-[13px] text-general text-right">
                      <FormattedPrice
                        amount={Number(r?.funding || r?.total_funding || 0)}
                      />
                    </td>
                    <td className="py-3 px-2 text-[13px] text-general text-right">
                      {Number(r?.credits_used || r?.used || 0).toLocaleString()}
                    </td>
                    <td className="py-3 px-2 text-[13px] text-general text-right">
                      {Number(r?.credits_left || r?.balance || 0).toLocaleString()}
                    </td>
                    <td className="py-3 px-2 text-[12px] text-primary_grey_2">
                      {fmtDate(r?.last_activity || r?.updated_at)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {!isLoading && rows.length > 0 && (
          <CustomPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        )}
      </SectionCard>

      {/* Bottom tables (sample for now — these need dedicated endpoints) */}
      <Grid container spacing={2}>
        {/* Top Users by Spend */}
        <Grid item xs={12} lg={6}>
          <SectionCard
            title="Top Users by Spend"
            action={
              <Button
                size="small"
                onClick={() => navigate("/users")}
                sx={{ textTransform: "none", color: "#02981D", fontWeight: 600 }}
              >
                View All →
              </Button>
            }
          >
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
                  {SAMPLE_TOP_USERS.map((u) => (
                    <tr key={u.name} className="border-b border-[#F5F5F5] hover:bg-[#FAFAFA]">
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
                        {u.lastActive}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SectionCard>
        </Grid>

        {/* Recent Campaign Activity (sample) */}
        <Grid item xs={12} lg={6}>
          <SectionCard
            title="Recent Campaign Activity"
            action={
              <Button
                size="small"
                onClick={() => navigate("/engagement")}
                sx={{ textTransform: "none", color: "#02981D", fontWeight: 600 }}
              >
                View All →
              </Button>
            }
          >
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
                  {SAMPLE_CAMPAIGNS.map((c, i) => (
                    <tr key={i} className="border-b border-[#F5F5F5] hover:bg-[#FAFAFA]">
                      <td className="py-3 px-2 text-[13px] text-general font-medium truncate max-w-[160px]">
                        {c.user}
                      </td>
                      <td className="py-3 px-2">
                        <Chip
                          size="small"
                          label={c.channel}
                          sx={{
                            background: c.channel === "SMS" ? "#E6F7EA" : "#EEF2FF",
                            color: c.channel === "SMS" ? "#02981D" : "#3949AB",
                            fontWeight: 600,
                          }}
                        />
                      </td>
                      <td className="py-3 px-2 text-[12px] text-general text-right">
                        {c.sent.toLocaleString()}
                      </td>
                      <td className="py-3 px-2 text-[12px] text-general text-right">
                        {c.deliveryRate ? `${Math.round(c.deliveryRate * 100)}%` : "—"}
                      </td>
                      <td className="py-3 px-2">
                        <StatusPill status={c.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SectionCard>
        </Grid>

        {/* Sender ID Status (sample) */}
        <Grid item xs={12} lg={6}>
          <SectionCard
            title="Sender ID Status"
            action={
              <Button
                size="small"
                onClick={() => navigate("/engagement")}
                sx={{ textTransform: "none", color: "#02981D", fontWeight: 600 }}
              >
                Manage →
              </Button>
            }
          >
            <div className="w-full overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[11px] uppercase tracking-wide text-primary_grey_2 border-b border-[#EFEFEF]">
                    <th className="py-3 px-2">Sender ID</th>
                    <th className="py-3 px-2">User</th>
                    <th className="py-3 px-2">Status</th>
                    <th className="py-3 px-2">Submitted</th>
                  </tr>
                </thead>
                <tbody>
                  {SAMPLE_SENDER_IDS.map((s) => (
                    <tr key={s.id} className="border-b border-[#F5F5F5] hover:bg-[#FAFAFA]">
                      <td className="py-3 px-2 text-[13px] text-general font-medium font-mono">
                        {s.id}
                      </td>
                      <td className="py-3 px-2 text-[12px] text-general truncate max-w-[160px]">
                        {s.user}
                      </td>
                      <td className="py-3 px-2">
                        <StatusPill status={s.status} />
                      </td>
                      <td className="py-3 px-2 text-[11px] text-primary_grey_2">
                        {s.submitted}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SectionCard>
        </Grid>

        {/* Recent Transactions placeholder linking to Payments */}
        <Grid item xs={12} lg={6}>
          <SectionCard
            title="Recent Transactions"
            action={
              <Button
                size="small"
                onClick={() => navigate("/payments")}
                sx={{ textTransform: "none", color: "#02981D", fontWeight: 600 }}
              >
                View All →
              </Button>
            }
          >
            <p className="text-[13px] text-primary_grey_2 text-center py-8">
              Full transaction feed lives on the Payments page.
            </p>
          </SectionCard>
        </Grid>
      </Grid>
    </div>
  );
};

export default CampaignDashboard;
