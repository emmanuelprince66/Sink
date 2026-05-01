import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Card,
  CardContent,
  Chip,
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

// ─────────────── Sample data ───────────────
const SUMMARY = {
  totalFunding: 38420000,
  netProfit: 8120400,
  smsEmailCost: 642300,
  totalCreditsLiability: 14820000,
  creditsUsedToday: 248000,
  messagesSentToday: 12480,
  activeUsersToday: 1284,
  pendingSenderIds: 7,
};

const REVENUE_TREND = [
  { day: "Apr 23", revenue: 1240000, profit: 412000 },
  { day: "Apr 24", revenue: 1480000, profit: 521000 },
  { day: "Apr 25", revenue: 1180000, profit: 386000 },
  { day: "Apr 26", revenue: 1620000, profit: 612000 },
  { day: "Apr 27", revenue: 1820000, profit: 720000 },
  { day: "Apr 28", revenue: 2120000, profit: 880000 },
  { day: "Apr 29", revenue: 2480000, profit: 1020000 },
];

const MESSAGE_TREND = [
  { day: "Apr 23", sms: 6200, email: 4100 },
  { day: "Apr 24", sms: 7400, email: 4800 },
  { day: "Apr 25", sms: 5900, email: 4300 },
  { day: "Apr 26", sms: 8100, email: 5400 },
  { day: "Apr 27", sms: 9200, email: 6100 },
  { day: "Apr 28", sms: 10800, email: 7200 },
  { day: "Apr 29", sms: 12480, email: 8420 },
];

const RECENT_TRANSACTIONS = [
  {
    id: "TRX-9821",
    user: "Adaeze Beauty Hub",
    type: "Funding",
    amount: 250000,
    unit: "₦",
    status: "Successful",
    date: "2026-04-29 14:22",
  },
  {
    id: "TRX-9820",
    user: "Sunde Logistics Ltd",
    type: "SMS",
    amount: 18000,
    unit: "credits",
    status: "Successful",
    date: "2026-04-29 13:08",
  },
  {
    id: "TRX-9819",
    user: "Lagos Mart Ventures",
    type: "Email",
    amount: 4200,
    unit: "credits",
    status: "Pending",
    date: "2026-04-29 11:42",
  },
  {
    id: "TRX-9818",
    user: "Kano Foods Co.",
    type: "Funding",
    amount: 75000,
    unit: "₦",
    status: "Successful",
    date: "2026-04-29 10:11",
  },
  {
    id: "TRX-9817",
    user: "Ifeanyi Johnson",
    type: "SMS",
    amount: 1200,
    unit: "credits",
    status: "Failed",
    date: "2026-04-29 09:32",
  },
];

const TOP_USERS = [
  {
    name: "Sunde Logistics Ltd",
    purchased: 480000,
    used: 412800,
    spend: 4200000,
    lastActive: "2026-04-29 14:30",
  },
  {
    name: "Adaeze Beauty Hub",
    purchased: 320000,
    used: 248000,
    spend: 2980000,
    lastActive: "2026-04-29 14:22",
  },
  {
    name: "Kano Foods Co.",
    purchased: 280000,
    used: 198000,
    spend: 2410000,
    lastActive: "2026-04-29 11:08",
  },
  {
    name: "Lagos Mart Ventures",
    purchased: 180000,
    used: 142000,
    spend: 1680000,
    lastActive: "2026-04-28 17:42",
  },
  {
    name: "Ifeanyi Johnson",
    purchased: 60000,
    used: 42000,
    spend: 540000,
    lastActive: "2026-04-28 12:11",
  },
];

const RECENT_CAMPAIGNS = [
  {
    user: "Adaeze Beauty Hub",
    channel: "SMS",
    sent: 12480,
    deliveryRate: 0.982,
    status: "Delivered",
    date: "2026-04-29 09:00",
  },
  {
    user: "Sunde Logistics Ltd",
    channel: "Email",
    sent: 8420,
    deliveryRate: 0.961,
    status: "Delivered",
    date: "2026-04-28 14:12",
  },
  {
    user: "Lagos Mart Ventures",
    channel: "SMS",
    sent: 4210,
    deliveryRate: 0.91,
    status: "Delivered",
    date: "2026-04-28 10:30",
  },
  {
    user: "Kano Foods Co.",
    channel: "Email",
    sent: 0,
    deliveryRate: 0,
    status: "Scheduled",
    date: "2026-04-30 08:00",
  },
  {
    user: "Ifeanyi Johnson",
    channel: "SMS",
    sent: 1200,
    deliveryRate: 0.78,
    status: "Failed",
    date: "2026-04-29 09:32",
  },
];

const SENDER_IDS = [
  {
    id: "ADAEZE-HUB",
    user: "Adaeze Beauty Hub",
    status: "Approved",
    submitted: "2026-03-12",
  },
  {
    id: "SUNDE-LOG",
    user: "Sunde Logistics Ltd",
    status: "Approved",
    submitted: "2026-03-04",
  },
  {
    id: "LAGOS-MART",
    user: "Lagos Mart Ventures",
    status: "Pending",
    submitted: "2026-04-26",
  },
  {
    id: "KANO-FOODS",
    user: "Kano Foods Co.",
    status: "Pending",
    submitted: "2026-04-27",
  },
  {
    id: "FAST-CASH",
    user: "Chinedu Eze",
    status: "Rejected",
    submitted: "2026-04-22",
  },
];

// ─────────────── UI helpers ───────────────
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

const CampaignDashboard = () => {
  const navigate = useNavigate();
  const [trendRange, setTrendRange] = useState("7d");

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Top summary cards */}
      <Grid container spacing={2}>
        <Grid item xs={6} md={4} lg={3}>
          <StatCard
            icon={<PaidIcon fontSize="small" />}
            color="#02981D"
            bg="#E6F7EA"
            label="Total Funding"
            value={<FormattedPrice amount={SUMMARY.totalFunding} />}
            sub="All-time inflow"
          />
        </Grid>
        <Grid item xs={6} md={4} lg={3}>
          <StatCard
            icon={<ProfitIcon fontSize="small" />}
            color="#0369A1"
            bg="#E0F2FE"
            label="Net Profit"
            value={<FormattedPrice amount={SUMMARY.netProfit} />}
            sub="After SMS / Email cost"
          />
        </Grid>
        <Grid item xs={6} md={4} lg={3}>
          <StatCard
            icon={<SmsIcon fontSize="small" />}
            color="#DC3545"
            bg="#FDECEC"
            label="SMS / Email Cost"
            value={<FormattedPrice amount={SUMMARY.smsEmailCost} />}
            sub="Carrier + ESP cost"
          />
        </Grid>
        <Grid item xs={6} md={4} lg={3}>
          <StatCard
            icon={<WalletIcon fontSize="small" />}
            color="#7C3AED"
            bg="#F3E8FF"
            label="Credits Liability"
            value={<FormattedPrice amount={SUMMARY.totalCreditsLiability} />}
            sub="Unspent credits on platform"
          />
        </Grid>
        <Grid item xs={6} md={4} lg={3}>
          <StatCard
            icon={<BoltIcon fontSize="small" />}
            color="#B26A00"
            bg="#FFF7E8"
            label="Credits Used Today"
            value={<FormattedPrice amount={SUMMARY.creditsUsedToday} />}
            sub="₦ value of usage"
          />
        </Grid>
        <Grid item xs={6} md={4} lg={3}>
          <StatCard
            icon={<CampaignIcon fontSize="small" />}
            color="#3949AB"
            bg="#EEF2FF"
            label="Messages Sent Today"
            value={SUMMARY.messagesSentToday.toLocaleString()}
            sub="SMS + Email"
          />
        </Grid>
        <Grid item xs={6} md={4} lg={3}>
          <StatCard
            icon={<PeopleIcon fontSize="small" />}
            color="#02981D"
            bg="#E6F7EA"
            label="Active Users (Today)"
            value={SUMMARY.activeUsersToday.toLocaleString()}
            sub="Logged in past 24h"
          />
        </Grid>
        <Grid item xs={6} md={4} lg={3}>
          <StatCard
            icon={<PendingIcon fontSize="small" />}
            color="#C2410C"
            bg="#FFF1E0"
            label="Pending Sender IDs"
            value={SUMMARY.pendingSenderIds}
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
                  <Bar
                    dataKey="sms"
                    fill="#02981D"
                    radius={[4, 4, 0, 0]}
                    name="SMS"
                  />
                  <Bar
                    dataKey="email"
                    fill="#3949AB"
                    radius={[4, 4, 0, 0]}
                    name="Email"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </SectionCard>
        </Grid>
      </Grid>

      {/* Tables grid */}
      <Grid container spacing={2}>
        {/* Recent Transactions */}
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
            <div className="w-full overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[11px] uppercase tracking-wide text-primary_grey_2 border-b border-[#EFEFEF]">
                    <th className="py-3 px-2">User / Business</th>
                    <th className="py-3 px-2">Type</th>
                    <th className="py-3 px-2 text-right">Amount</th>
                    <th className="py-3 px-2">Status</th>
                    <th className="py-3 px-2">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {RECENT_TRANSACTIONS.map((t) => (
                    <tr
                      key={t.id}
                      className="border-b border-[#F5F5F5] hover:bg-[#FAFAFA]"
                    >
                      <td className="py-3 px-2 text-[13px] text-general font-medium truncate max-w-[180px]">
                        {t.user}
                      </td>
                      <td className="py-3 px-2 text-[12px] text-primary_grey_2">
                        {t.type}
                      </td>
                      <td className="py-3 px-2 text-[13px] text-general text-right">
                        {t.unit === "₦" ? (
                          <FormattedPrice amount={t.amount} />
                        ) : (
                          `${t.amount.toLocaleString()} cr`
                        )}
                      </td>
                      <td className="py-3 px-2">
                        <StatusPill status={t.status} />
                      </td>
                      <td className="py-3 px-2 text-[11px] text-primary_grey_2">
                        {t.date}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SectionCard>
        </Grid>

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
                  {TOP_USERS.map((u) => (
                    <tr
                      key={u.name}
                      className="border-b border-[#F5F5F5] hover:bg-[#FAFAFA]"
                    >
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

        {/* Recent Campaign Activity */}
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
                  {RECENT_CAMPAIGNS.map((c, i) => (
                    <tr
                      key={i}
                      className="border-b border-[#F5F5F5] hover:bg-[#FAFAFA]"
                    >
                      <td className="py-3 px-2 text-[13px] text-general font-medium truncate max-w-[160px]">
                        {c.user}
                      </td>
                      <td className="py-3 px-2">
                        <Chip
                          size="small"
                          label={c.channel}
                          sx={{
                            background:
                              c.channel === "SMS" ? "#E6F7EA" : "#EEF2FF",
                            color: c.channel === "SMS" ? "#02981D" : "#3949AB",
                            fontWeight: 600,
                          }}
                        />
                      </td>
                      <td className="py-3 px-2 text-[12px] text-general text-right">
                        {c.sent.toLocaleString()}
                      </td>
                      <td className="py-3 px-2 text-[12px] text-general text-right">
                        {c.deliveryRate
                          ? `${Math.round(c.deliveryRate * 100)}%`
                          : "—"}
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

        {/* Sender ID Status */}
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
                  {SENDER_IDS.map((s) => (
                    <tr
                      key={s.id}
                      className="border-b border-[#F5F5F5] hover:bg-[#FAFAFA]"
                    >
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
      </Grid>
    </div>
  );
};

export default CampaignDashboard;
