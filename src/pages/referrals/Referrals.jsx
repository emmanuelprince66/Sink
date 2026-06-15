import { useMemo, useState } from "react";
import {
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Grid,
  InputAdornment,
  LinearProgress,
  TextField,
} from "@mui/material";
import {
  GroupAddOutlined as ReferralsIcon,
  HourglassEmpty as PendingIcon,
  LockOpenRounded as UnlockedIcon,
  PaidOutlined as PaidIcon,
  ScheduleSendOutlined as ExpiringIcon,
  PeopleAltOutlined as PeopleIcon,
  SearchOutlined as SearchIcon,
  ChevronRightRounded as ChevronRightIcon,
  ClearRounded as ClearIcon,
  AccessTimeOutlined as ClockIcon,
  CheckCircleRounded as CheckIcon,
  ArrowBackRounded as BackIcon,
  ShieldOutlined as ShieldIcon,
} from "@mui/icons-material";
import FormattedPrice from "../../utils/FormattedPrice";
import CustomModal from "../../components/CustomModal";

// ── Sample data ──
const PLATFORM = {
  totalReferrals: 3421,
  activeReferrers: 721,
  pendingRewards: 18_200_000,
  unlockedRewards: 4_300_000,
  paidOut: 2_100_000,
  expiringRewards: 5_800_000,
};

const REFERRERS = [
  {
    id: "tobi",
    name: "Tobi Olarinde",
    email: "tobi@example.com",
    code: "Tobi123",
    referrals: 25,
    pending: 300_000,
    unlocked: 100_000,
    withdrawn: 75_000,
    joined: "2025-08-12",
    businesses: [
      {
        id: "abc",
        name: "ABC Store",
        status: "Active",
        plan: "Growth Plan",
        currentSubscription: 5000,
        totalSubscriptionValue: 15000,
        totalReward: 20000,
        unlocked: 3000,
        pending: 17000,
        expiresInDays: 170,
        activity: [
          { date: "Jun 2", subscription: 5000, reward: 1000 },
          { date: "Jul 2", subscription: 5000, reward: 1000 },
        ],
      },
      {
        id: "fresh",
        name: "Fresh Mart",
        status: "Active",
        plan: "Starter Plan",
        currentSubscription: 4000,
        totalSubscriptionValue: 24000,
        totalReward: 20000,
        unlocked: 8000,
        pending: 12000,
        expiresInDays: 145,
        activity: [
          { date: "May 12", subscription: 4000, reward: 2000 },
          { date: "Jun 12", subscription: 4000, reward: 2000 },
        ],
      },
      {
        id: "dee",
        name: "Dee Pharmacy",
        status: "Not Subscribed",
        plan: "—",
        currentSubscription: 0,
        totalSubscriptionValue: 0,
        totalReward: 20000,
        unlocked: 0,
        pending: 20000,
        expiresInDays: 178,
        activity: [],
      },
    ],
  },
  {
    id: "sarah",
    name: "Sarah Adekunle",
    email: "sarah@example.com",
    code: "Sarah42",
    referrals: 10,
    pending: 150_000,
    unlocked: 40_000,
    withdrawn: 20_000,
    joined: "2025-10-08",
    businesses: [
      {
        id: "kano",
        name: "Kano Foods Co.",
        status: "Active",
        plan: "Growth Plan",
        currentSubscription: 6000,
        totalSubscriptionValue: 18000,
        totalReward: 20000,
        unlocked: 6000,
        pending: 14000,
        expiresInDays: 120,
        activity: [
          { date: "Apr 1", subscription: 6000, reward: 2000 },
          { date: "May 1", subscription: 6000, reward: 2000 },
          { date: "Jun 1", subscription: 6000, reward: 2000 },
        ],
      },
    ],
  },
  {
    id: "ifeanyi",
    name: "Ifeanyi Johnson",
    email: "ifeanyi@example.com",
    code: "IfeJ99",
    referrals: 42,
    pending: 540_000,
    unlocked: 220_000,
    withdrawn: 180_000,
    joined: "2025-06-22",
    businesses: [],
  },
  {
    id: "bola",
    name: "Bola Salami",
    email: "bola.s@example.com",
    code: "Bola21",
    referrals: 6,
    pending: 80_000,
    unlocked: 10_000,
    withdrawn: 0,
    joined: "2026-02-14",
    businesses: [],
  },
  {
    id: "chinedu",
    name: "Chinedu Eze",
    email: "chinedu@example.com",
    code: "Chin77",
    referrals: 18,
    pending: 220_000,
    unlocked: 85_000,
    withdrawn: 60_000,
    joined: "2025-11-30",
    businesses: [],
  },
];

// ── UI helpers ──
const StatCard = ({ icon, color, bg, label, value, subtitle }) => (
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
          <p className="text-[20px] font-semibold text-general mt-1.5">
            {value}
          </p>
          {subtitle && (
            <p className="text-[11px] text-[#9CA3AF] mt-0.5">{subtitle}</p>
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
    Active: { bg: "#E6F7EA", color: "#02981D" },
    "Not Subscribed": { bg: "#FFF7E8", color: "#B26A00" },
    Expired: { bg: "#FDECEC", color: "#DC3545" },
  };
  const s = map[status] || { bg: "#F5F5F5", color: "#5E5E5E" };
  return (
    <span
      className="inline-flex items-center gap-1 text-[12px] font-medium px-3 py-1 rounded-full whitespace-nowrap"
      style={{ background: s.bg, color: s.color }}
    >
      {status === "Active" && <CheckIcon sx={{ fontSize: 12 }} />}
      {status}
    </span>
  );
};

const initials = (name) =>
  (name || "")
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

const Referrals = () => {
  const [selectedReferrer, setSelectedReferrer] = useState(null);
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search) return REFERRERS;
    const q = search.toLowerCase();
    return REFERRERS.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.email.toLowerCase().includes(q) ||
        r.code.toLowerCase().includes(q)
    );
  }, [search]);

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShieldIcon sx={{ color: "#02981D", fontSize: 20 }} />
            <h1 className="text-[20px] md:text-[22px] font-semibold text-general">
              Referrals — Admin Dashboard
            </h1>
          </div>
          <p className="text-[13px] text-primary_grey_2">
            Fraud protection, referral ROI, and reward lifecycle monitoring.
          </p>
        </div>
      </div>

      {/* Executive Overview — 6 cards */}
      <Grid container spacing={2}>
        <Grid item xs={6} md={4} lg={2}>
          <StatCard
            icon={<ReferralsIcon fontSize="small" />}
            color="#3949AB"
            bg="#EEF2FF"
            label="Total Referrals"
            value={PLATFORM.totalReferrals.toLocaleString()}
            subtitle="All-time"
          />
        </Grid>
        <Grid item xs={6} md={4} lg={2}>
          <StatCard
            icon={<PeopleIcon fontSize="small" />}
            color="#02981D"
            bg="#E6F7EA"
            label="Active Referrers"
            value={PLATFORM.activeReferrers.toLocaleString()}
            subtitle="≥ 1 referral"
          />
        </Grid>
        <Grid item xs={6} md={4} lg={2}>
          <StatCard
            icon={<PendingIcon fontSize="small" />}
            color="#B26A00"
            bg="#FFF7E8"
            label="Pending Rewards"
            value={<FormattedPrice amount={PLATFORM.pendingRewards} />}
            subtitle="Locked liability"
          />
        </Grid>
        <Grid item xs={6} md={4} lg={2}>
          <StatCard
            icon={<UnlockedIcon fontSize="small" />}
            color="#0369A1"
            bg="#E0F2FE"
            label="Unlocked Rewards"
            value={<FormattedPrice amount={PLATFORM.unlockedRewards} />}
            subtitle="Withdrawable"
          />
        </Grid>
        <Grid item xs={6} md={4} lg={2}>
          <StatCard
            icon={<PaidIcon fontSize="small" />}
            color="#02981D"
            bg="#E6F7EA"
            label="Paid Out"
            value={<FormattedPrice amount={PLATFORM.paidOut} />}
            subtitle="All-time payouts"
          />
        </Grid>
        <Grid item xs={6} md={4} lg={2}>
          <StatCard
            icon={<ExpiringIcon fontSize="small" />}
            color="#DC3545"
            bg="#FDECEC"
            label="Expiring Rewards"
            value={<FormattedPrice amount={PLATFORM.expiringRewards} />}
            subtitle="Next 30 days"
          />
        </Grid>
      </Grid>

      {/* Referrer Monitoring */}
      <Card
        sx={{
          borderRadius: "14px",
          boxShadow: "0 1px 3px rgba(16,24,40,.06)",
          border: "1px solid #EFEFEF",
        }}
      >
        <CardContent sx={{ p: { xs: 2, md: 3 } }}>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 mb-4">
            <div>
              <p className="text-[15px] font-semibold text-general">
                Referrer Monitoring
              </p>
              <p className="text-[12px] text-primary_grey_2 mt-0.5">
                Click a referrer to see their referred businesses.
              </p>
            </div>
            <TextField
              size="small"
              placeholder="Search by name, email, or code"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              sx={{ minWidth: { lg: 320 } }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: "#757575" }} />
                  </InputAdornment>
                ),
              }}
            />
          </div>

          {/* Desktop table */}
          <div className="hidden md:block w-full overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[12px] uppercase tracking-wide text-primary_grey_2 border-b border-[#EFEFEF]">
                  <th className="py-3 px-3">Referrer</th>
                  <th className="py-3 px-3 text-right">Referrals</th>
                  <th className="py-3 px-3 text-right">Pending</th>
                  <th className="py-3 px-3 text-right">Unlocked</th>
                  <th className="py-3 px-3 text-right">Withdrawn</th>
                  <th className="py-3 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="py-10 text-center text-primary_grey_2"
                    >
                      No referrers match your search.
                    </td>
                  </tr>
                ) : (
                  filtered.map((r) => (
                    <tr
                      key={r.id}
                      onClick={() => setSelectedReferrer(r)}
                      className="border-b border-[#F5F5F5] hover:bg-[#FAFAFA] cursor-pointer"
                    >
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-[#F6FFF8] text-[#02981D] flex items-center justify-center font-semibold text-[12px] flex-none">
                            {initials(r.name)}
                          </div>
                          <div className="min-w-0">
                            <p className="text-[13px] font-medium text-general truncate">
                              {r.name}
                            </p>
                            <p className="text-[11px] text-primary_grey_2 truncate">
                              {r.email} ·{" "}
                              <span className="font-mono">{r.code}</span>
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-[13px] text-general text-right">
                        {r.referrals.toLocaleString()}
                      </td>
                      <td className="py-3 px-3 text-[13px] text-[#B26A00] text-right">
                        <FormattedPrice amount={r.pending} />
                      </td>
                      <td className="py-3 px-3 text-[13px] text-[#02981D] text-right font-semibold">
                        <FormattedPrice amount={r.unlocked} />
                      </td>
                      <td className="py-3 px-3 text-[13px] text-general text-right">
                        <FormattedPrice amount={r.withdrawn} />
                      </td>
                      <td className="py-3 px-3 text-right">
                        <ChevronRightIcon sx={{ color: "#5E5E5E" }} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden flex flex-col gap-3">
            {filtered.map((r) => (
              <div
                key={r.id}
                onClick={() => setSelectedReferrer(r)}
                className="border border-[#EFEFEF] rounded-xl p-4 active:bg-[#FAFAFA]"
              >
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-[#F6FFF8] text-[#02981D] flex items-center justify-center font-semibold text-[12px] flex-none">
                    {initials(r.name)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[14px] font-medium text-general truncate">
                      {r.name}
                    </p>
                    <p className="text-[11px] text-primary_grey_2 truncate">
                      {r.email}
                    </p>
                  </div>
                </div>
                <Divider sx={{ my: 1.5 }} />
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-[11px] text-primary_grey_2">Referrals</p>
                    <p className="text-[13px] font-medium text-general">
                      {r.referrals}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[11px] text-primary_grey_2">Withdrawn</p>
                    <p className="text-[13px] font-medium text-general">
                      <FormattedPrice amount={r.withdrawn} />
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] text-primary_grey_2">Pending</p>
                    <p className="text-[13px] text-[#B26A00] font-medium">
                      <FormattedPrice amount={r.pending} />
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[11px] text-primary_grey_2">Unlocked</p>
                    <p className="text-[13px] text-[#02981D] font-semibold">
                      <FormattedPrice amount={r.unlocked} />
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Referrer detail modal */}
      <CustomModal
        open={!!selectedReferrer && !selectedBusiness}
        closeModal={() => setSelectedReferrer(null)}
        style="w-[95%] md:w-3/5 lg:w-1/2"
      >
        {selectedReferrer && !selectedBusiness && (
          <ReferrerDetail
            referrer={selectedReferrer}
            close={() => setSelectedReferrer(null)}
            onPickBusiness={(b) => setSelectedBusiness(b)}
          />
        )}
      </CustomModal>

      {/* Business detail modal */}
      <CustomModal
        open={!!selectedBusiness}
        closeModal={() => setSelectedBusiness(null)}
        style="w-[95%] md:w-3/5 lg:w-1/2"
      >
        {selectedBusiness && (
          <BusinessDetail
            business={selectedBusiness}
            referrer={selectedReferrer}
            back={() => setSelectedBusiness(null)}
          />
        )}
      </CustomModal>
    </div>
  );
};

// ── Referrer detail (lists their referred businesses) ──
const ReferrerDetail = ({ referrer, close, onPickBusiness }) => (
  <div className="flex flex-col gap-4">
    <div className="flex items-start justify-between">
      <div className="flex items-center gap-3">
        <div className="h-12 w-12 rounded-full bg-[#F6FFF8] text-[#02981D] flex items-center justify-center font-semibold text-[16px] flex-none">
          {initials(referrer.name)}
        </div>
        <div>
          <p className="text-[18px] font-semibold text-general">
            {referrer.name}
          </p>
          <p className="text-[12px] text-primary_grey_2">
            {referrer.email} ·{" "}
            <span className="font-mono">{referrer.code}</span>
          </p>
          <p className="text-[11px] text-[#9CA3AF] mt-0.5">
            Joined {referrer.joined}
          </p>
        </div>
      </div>
      <ClearIcon
        onClick={close}
        sx={{ color: "#1E1E1E", cursor: "pointer" }}
      />
    </div>

    {/* Wallet snapshot */}
    <Grid container spacing={2}>
      <Grid item xs={6} md={3}>
        <div className="border border-[#EFEFEF] rounded-xl p-3">
          <p className="text-[11px] text-primary_grey_2">Referrals</p>
          <p className="text-[16px] font-semibold text-general mt-1">
            {referrer.referrals}
          </p>
        </div>
      </Grid>
      <Grid item xs={6} md={3}>
        <div className="border border-[#EFEFEF] rounded-xl p-3">
          <p className="text-[11px] text-primary_grey_2">Pending</p>
          <p className="text-[16px] font-semibold text-[#B26A00] mt-1">
            <FormattedPrice amount={referrer.pending} />
          </p>
        </div>
      </Grid>
      <Grid item xs={6} md={3}>
        <div className="border border-[#EFEFEF] rounded-xl p-3">
          <p className="text-[11px] text-primary_grey_2">Unlocked</p>
          <p className="text-[16px] font-semibold text-[#02981D] mt-1">
            <FormattedPrice amount={referrer.unlocked} />
          </p>
        </div>
      </Grid>
      <Grid item xs={6} md={3}>
        <div className="border border-[#EFEFEF] rounded-xl p-3">
          <p className="text-[11px] text-primary_grey_2">Withdrawn</p>
          <p className="text-[16px] font-semibold text-general mt-1">
            <FormattedPrice amount={referrer.withdrawn} />
          </p>
        </div>
      </Grid>
    </Grid>

    {/* Businesses they referred */}
    <div className="border border-[#EFEFEF] rounded-xl">
      <div className="px-4 py-3 border-b border-[#EFEFEF]">
        <p className="text-[13px] font-semibold text-general">
          Referred Businesses ({referrer.businesses?.length || 0})
        </p>
      </div>
      {!referrer.businesses || referrer.businesses.length === 0 ? (
        <p className="text-[13px] text-primary_grey_2 text-center py-6">
          No businesses linked to this referrer yet.
        </p>
      ) : (
        <div className="divide-y divide-[#F5F5F5]">
          {referrer.businesses.map((b) => (
            <div
              key={b.id}
              onClick={() => onPickBusiness(b)}
              className="flex items-center justify-between p-4 hover:bg-[#FAFAFA] cursor-pointer"
            >
              <div className="min-w-0">
                <p className="text-[13px] font-medium text-general truncate">
                  {b.name}
                </p>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <StatusPill status={b.status} />
                  {b.plan !== "—" && (
                    <Chip
                      size="small"
                      label={b.plan}
                      sx={{
                        background: "#F6FFF8",
                        color: "#02981D",
                        fontWeight: 600,
                      }}
                    />
                  )}
                </div>
              </div>
              <div className="text-right flex-none">
                <p className="text-[12px] text-primary_grey_2">Unlocked</p>
                <p className="text-[14px] font-semibold text-[#02981D]">
                  <FormattedPrice amount={b.unlocked} />
                </p>
                <p className="text-[11px] text-primary_grey_2 mt-1">
                  <ClockIcon sx={{ fontSize: 12, mr: 0.3 }} />
                  {b.expiresInDays}d
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  </div>
);

// ── Business detail ──
const BusinessDetail = ({ business, referrer, back }) => {
  const pct = useMemo(() => {
    if (!business.totalReward) return 0;
    return Math.min(
      100,
      Math.round((business.unlocked / business.totalReward) * 100)
    );
  }, [business]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={back}
            className="h-9 w-9 rounded-full bg-white border border-[#E3E3E3] flex items-center justify-center hover:bg-[#F5F5F5]"
          >
            <BackIcon sx={{ color: "#5E5E5E", fontSize: 18 }} />
          </button>
          <div>
            <p className="text-[18px] font-semibold text-general">
              {business.name}
            </p>
            <p className="text-[12px] text-primary_grey_2">
              Referred by{" "}
              <span className="font-medium text-general">{referrer?.name}</span>
            </p>
          </div>
        </div>
        <StatusPill status={business.status} />
      </div>

      {/* Reward allocation */}
      <div className="border border-[#EFEFEF] rounded-xl p-4">
        <p className="text-[12px] uppercase tracking-wide text-primary_grey_2 mb-3">
          Reward Allocation
        </p>
        <Grid container spacing={2}>
          <Grid item xs={4}>
            <p className="text-[11px] text-primary_grey_2">Total Reward</p>
            <p className="text-[16px] font-semibold text-general mt-0.5">
              <FormattedPrice amount={business.totalReward} />
            </p>
          </Grid>
          <Grid item xs={4}>
            <p className="text-[11px] text-primary_grey_2">Unlocked</p>
            <p className="text-[16px] font-semibold text-[#02981D] mt-0.5">
              <FormattedPrice amount={business.unlocked} />
            </p>
          </Grid>
          <Grid item xs={4}>
            <p className="text-[11px] text-primary_grey_2">Remaining</p>
            <p className="text-[16px] font-semibold text-[#B26A00] mt-0.5">
              <FormattedPrice amount={business.pending} />
            </p>
          </Grid>
        </Grid>
        <div className="mt-4">
          <div className="flex items-center justify-between mb-1.5">
            <p className="text-[12px] text-primary_grey_2">Progress</p>
            <p className="text-[12px] text-general font-semibold">{pct}%</p>
          </div>
          <LinearProgress
            variant="determinate"
            value={pct}
            sx={{
              height: 8,
              borderRadius: 4,
              backgroundColor: "#F5F5F5",
              "& .MuiLinearProgress-bar": { backgroundColor: "#02981D" },
            }}
          />
        </div>
      </div>

      {/* Plan & Subscription */}
      <div className="border border-[#EFEFEF] rounded-xl p-4">
        <p className="text-[12px] uppercase tracking-wide text-primary_grey_2 mb-2">
          Plan & Subscription
        </p>
        <Divider />
        {[
          ["Plan", business.plan],
          [
            "Current Subscription",
            <FormattedPrice key="c" amount={business.currentSubscription} />,
          ],
          [
            "Total Subscription Value",
            <FormattedPrice
              key="t"
              amount={business.totalSubscriptionValue}
            />,
          ],
          [
            "Unlocked Reward",
            <FormattedPrice key="u" amount={business.unlocked} />,
          ],
          [
            "Remaining Reward",
            <FormattedPrice key="r" amount={business.pending} />,
          ],
          ["Expiry", `${business.expiresInDays} Days`],
        ].map(([label, value], i, arr) => (
          <div key={label}>
            <div className="flex items-center justify-between py-2 gap-3">
              <span className="text-[13px] text-primary_grey_2">{label}</span>
              <span className="text-[13px] text-general font-medium text-right">
                {value}
              </span>
            </div>
            {i !== arr.length - 1 && <Divider />}
          </div>
        ))}
      </div>

      {/* Activity log */}
      <div className="border border-[#EFEFEF] rounded-xl p-4">
        <p className="text-[12px] uppercase tracking-wide text-primary_grey_2 mb-3">
          Recent Subscription Activity
        </p>
        {business.activity.length === 0 ? (
          <p className="text-[13px] text-primary_grey_2 text-center py-4">
            No subscription activity yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[11px] uppercase tracking-wide text-primary_grey_2 border-b border-[#EFEFEF]">
                  <th className="py-2 px-2">Date</th>
                  <th className="py-2 px-2 text-right">Subscription</th>
                  <th className="py-2 px-2 text-right">Reward Unlocked</th>
                </tr>
              </thead>
              <tbody>
                {business.activity.map((a, i) => (
                  <tr
                    key={i}
                    className="border-b border-[#F5F5F5] last:border-0"
                  >
                    <td className="py-2 px-2 text-[12px] text-general">
                      {a.date}
                    </td>
                    <td className="py-2 px-2 text-[12px] text-general text-right">
                      <FormattedPrice amount={a.subscription} />
                    </td>
                    <td className="py-2 px-2 text-[12px] text-[#02981D] font-semibold text-right">
                      <FormattedPrice amount={a.reward} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="flex justify-end">
        <Button
          onClick={back}
          variant="contained"
          sx={{
            textTransform: "none",
            background: "#02981D",
            boxShadow: "none",
            "&:hover": { background: "#017a17" },
          }}
        >
          Back to Referrer
        </Button>
      </div>
    </div>
  );
};

export default Referrals;
