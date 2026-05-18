import { useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CircularProgress,
  Grid,
  TextField,
} from "@mui/material";
import {
  CheckCircleOutline as ActiveIcon,
  HighlightOffOutlined as InactiveIcon,
  HourglassEmpty as DormantIcon,
  TrendingDownOutlined as ChurnedIcon,
} from "@mui/icons-material";
import {
  allMembersUrl,
  transactionsPaymentDataUrl,
} from "../../api/endpoint";
import useFetchData from "../../hooks/useFetchData";

// ── helpers ──
const todayStr = () => new Date().toISOString().slice(0, 10);
const daysAgoStr = (n) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
};
const norm = (s) => (s || "").toString().trim().toLowerCase();

const PERIODS = [
  { key: "today", label: "Today", days: 0 },
  { key: "7d", label: "Last 7 Days", days: 7 },
  { key: "30d", label: "Last 30 Days", days: 30 },
  { key: "90d", label: "Last 90 Days", days: 90 },
  { key: "custom", label: "Custom", days: null },
];

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
          <p className="text-[22px] font-semibold text-general mt-1.5">
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

const UserActivityMonitor = () => {
  const [period, setPeriod] = useState("today");
  const [customStart, setCustomStart] = useState(daysAgoStr(7));
  const [customEnd, setCustomEnd] = useState(todayStr());

  // Resolve the actual date range for the picked period
  const { startDate, endDate } = useMemo(() => {
    if (period === "custom") {
      return { startDate: customStart, endDate: customEnd };
    }
    const p = PERIODS.find((x) => x.key === period);
    return { startDate: daysAgoStr(p?.days || 0), endDate: todayStr() };
  }, [period, customStart, customEnd]);

  // Fetch up to 500 owners — enough for the activity overview
  const usersUrl = allMembersUrl(1, 500, "ALL", "");
  const { data: usersData, isLoading: usersLoading } = useFetchData(
    ["fetchUsersForActivity", usersUrl],
    usersUrl
  );

  // Fetch payment transactions in the selected window — used to derive activity
  const trxUrl = transactionsPaymentDataUrl(1, 500, "", "", {
    startDate,
    endDate,
  });
  const { data: trxData, isLoading: trxLoading } = useFetchData(
    ["fetchTrxForActivity", trxUrl, startDate, endDate],
    trxUrl
  );

  // Dormant pull: anyone active in last 90d but NOT in last 30d → dormant
  const dormantStart = daysAgoStr(90);
  const dormantEnd = daysAgoStr(30);
  const dormantUrl = transactionsPaymentDataUrl(1, 500, "", "", {
    startDate: dormantStart,
    endDate: dormantEnd,
  });
  const { data: dormantData } = useFetchData(
    ["fetchTrxForDormant", dormantUrl],
    dormantUrl
  );

  // Active for ALL time (last 365 days) — used to find churned (vs is_active flag)
  const longUrl = transactionsPaymentDataUrl(1, 1000, "", "", {
    startDate: daysAgoStr(365),
    endDate: todayStr(),
  });
  const { data: longData } = useFetchData(
    ["fetchTrxForChurn", longUrl],
    longUrl
  );

  // Build a set of account-name keys that appeared in the period's trx
  const extractActiveNames = (raw) => {
    const list = Array.isArray(raw?.data)
      ? raw.data
      : Array.isArray(raw?.transactions?.data)
      ? raw.transactions.data
      : Array.isArray(raw?.results)
      ? raw.results
      : Array.isArray(raw)
      ? raw
      : [];
    const names = new Set();
    list.forEach((t) => {
      [t?.account_name, t?.merchant_name, t?.user_name, t?.full_name].forEach(
        (n) => n && names.add(norm(n))
      );
    });
    return names;
  };

  const activeInPeriod = useMemo(
    () => extractActiveNames(trxData),
    [trxData]
  );
  const dormantWindow = useMemo(
    () => extractActiveNames(dormantData),
    [dormantData]
  );
  const everActive = useMemo(() => extractActiveNames(longData), [longData]);

  // Filter user list to OWNER role only (the actual businesses)
  const owners = useMemo(() => {
    const raw = Array.isArray(usersData?.data)
      ? usersData.data
      : Array.isArray(usersData?.results)
      ? usersData.results
      : Array.isArray(usersData)
      ? usersData
      : [];
    return raw
      .filter((u) => (u?.role || "").toUpperCase() === "OWNER")
      .map((u) => ({
        id: u?.id,
        name: u?.full_name || "—",
        email: u?.email,
        subscription: u?.subscription || "—",
        subscriptionEnd: u?.subscription_end_date || null,
        isActive: u?.is_active !== false,
      }));
  }, [usersData]);

  // Bucket each owner into Active / Inactive / Dormant / Churned
  const buckets = useMemo(() => {
    const active = [];
    const inactive = [];
    const dormant = [];
    const churned = [];

    owners.forEach((o) => {
      const key = norm(o.name);
      const subExpired =
        o.subscriptionEnd &&
        new Date(o.subscriptionEnd) < new Date();

      const inSelected = activeInPeriod.has(key);
      const inDormantWindow = dormantWindow.has(key);
      const everSeen = everActive.has(key);

      if (inSelected) {
        active.push(o);
      } else {
        inactive.push(o);
        // Refinement on top of "inactive in selected period":
        if (subExpired || !everSeen) {
          churned.push(o);
        } else if (inDormantWindow) {
          dormant.push(o);
        }
      }
    });
    return { active, inactive, dormant, churned };
  }, [owners, activeInPeriod, dormantWindow, everActive]);

  const loading = usersLoading || trxLoading;
  const totalOwners = owners.length;

  return (
    <Card
      sx={{
        borderRadius: "14px",
        boxShadow: "0 1px 3px rgba(16,24,40,.06)",
        border: "1px solid #EFEFEF",
      }}
    >
      <CardContent sx={{ p: { xs: 2, md: 3 } }}>
        {/* Header + period selector */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 mb-4">
          <div>
            <h2 className="text-[16px] md:text-[18px] font-semibold text-general">
              User Activity Monitoring
            </h2>
            <p className="text-[12px] text-primary_grey_2 mt-1">
              Active = at least 1 transaction in the selected period. Dormant =
              30–90d quiet. Churned = 90+d quiet or subscription expired.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {PERIODS.map((p) => {
              const on = period === p.key;
              return (
                <button
                  key={p.key}
                  onClick={() => setPeriod(p.key)}
                  className={`text-[12px] font-medium px-3 py-1.5 rounded-md border transition ${
                    on
                      ? "bg-[#F6FFF8] border-[#02981D] text-[#02981D]"
                      : "bg-white border-[#E3E3E3] text-[#5E5E5E] hover:border-[#02981D]"
                  }`}
                >
                  {p.label}
                </button>
              );
            })}
          </div>
        </div>

        {period === "custom" && (
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <TextField
              type="date"
              size="small"
              label="Start"
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              type="date"
              size="small"
              label="End"
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </div>
        )}

        {/* Stat tiles */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={6} md={3}>
            <StatTile
              icon={<ActiveIcon fontSize="small" />}
              color="#02981D"
              bg="#E6F7EA"
              label="Active"
              value={buckets.active.length.toLocaleString()}
              sub={
                totalOwners
                  ? `${Math.round(
                      (buckets.active.length / totalOwners) * 100
                    )}% of ${totalOwners} businesses`
                  : "—"
              }
            />
          </Grid>
          <Grid item xs={6} md={3}>
            <StatTile
              icon={<InactiveIcon fontSize="small" />}
              color="#5E5E5E"
              bg="#F5F5F5"
              label="Inactive"
              value={buckets.inactive.length.toLocaleString()}
              sub="No qualifying transaction"
            />
          </Grid>
          <Grid item xs={6} md={3}>
            <StatTile
              icon={<DormantIcon fontSize="small" />}
              color="#B26A00"
              bg="#FFF7E8"
              label="Dormant"
              value={buckets.dormant.length.toLocaleString()}
              sub="Last seen 30–90 days ago"
            />
          </Grid>
          <Grid item xs={6} md={3}>
            <StatTile
              icon={<ChurnedIcon fontSize="small" />}
              color="#DC3545"
              bg="#FDECEC"
              label="Churned"
              value={buckets.churned.length.toLocaleString()}
              sub="90+d quiet or sub expired"
            />
          </Grid>
        </Grid>

        {/* Side-by-side name lists */}
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <div className="border border-[#EFEFEF] rounded-xl">
              <div className="flex items-center justify-between p-3 border-b border-[#EFEFEF]">
                <p className="text-[13px] font-semibold text-[#02981D]">
                  Active Businesses ({buckets.active.length})
                </p>
                <span className="text-[11px] text-primary_grey_2">
                  {startDate === endDate ? startDate : `${startDate} → ${endDate}`}
                </span>
              </div>
              <div className="max-h-[280px] overflow-y-auto">
                {loading ? (
                  <div className="p-6 text-center">
                    <CircularProgress
                      size="1.5rem"
                      sx={{ color: "#02981D" }}
                    />
                  </div>
                ) : buckets.active.length === 0 ? (
                  <p className="p-6 text-center text-[13px] text-primary_grey_2">
                    No active businesses in this period.
                  </p>
                ) : (
                  buckets.active.map((o) => (
                    <div
                      key={o.id}
                      className="flex items-center justify-between p-3 border-b border-[#F5F5F5] last:border-0"
                    >
                      <div className="min-w-0">
                        <p className="text-[13px] text-general font-medium truncate">
                          {o.name}
                        </p>
                        <p className="text-[11px] text-primary_grey_2 truncate">
                          {o.email}
                        </p>
                      </div>
                      <span
                        className="text-[11px] font-semibold px-2 py-0.5 rounded-md"
                        style={{ background: "#E6F7EA", color: "#02981D" }}
                      >
                        {o.subscription}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </Grid>

          <Grid item xs={12} md={6}>
            <div className="border border-[#EFEFEF] rounded-xl">
              <div className="flex items-center justify-between p-3 border-b border-[#EFEFEF]">
                <p className="text-[13px] font-semibold text-[#5E5E5E]">
                  Inactive Businesses ({buckets.inactive.length})
                </p>
                <span className="text-[11px] text-primary_grey_2">
                  Same period
                </span>
              </div>
              <div className="max-h-[280px] overflow-y-auto">
                {loading ? (
                  <div className="p-6 text-center">
                    <CircularProgress
                      size="1.5rem"
                      sx={{ color: "#02981D" }}
                    />
                  </div>
                ) : buckets.inactive.length === 0 ? (
                  <p className="p-6 text-center text-[13px] text-primary_grey_2">
                    Everyone transacted in this period.
                  </p>
                ) : (
                  buckets.inactive.map((o) => {
                    const churn = buckets.churned.includes(o);
                    const dorm = buckets.dormant.includes(o);
                    const tag = churn ? "Churned" : dorm ? "Dormant" : "Inactive";
                    const tagStyle = churn
                      ? { bg: "#FDECEC", color: "#DC3545" }
                      : dorm
                      ? { bg: "#FFF7E8", color: "#B26A00" }
                      : { bg: "#F5F5F5", color: "#5E5E5E" };
                    return (
                      <div
                        key={o.id}
                        className="flex items-center justify-between p-3 border-b border-[#F5F5F5] last:border-0"
                      >
                        <div className="min-w-0">
                          <p className="text-[13px] text-general font-medium truncate">
                            {o.name}
                          </p>
                          <p className="text-[11px] text-primary_grey_2 truncate">
                            {o.email}
                          </p>
                        </div>
                        <span
                          className="text-[11px] font-semibold px-2 py-0.5 rounded-md"
                          style={{
                            background: tagStyle.bg,
                            color: tagStyle.color,
                          }}
                        >
                          {tag}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default UserActivityMonitor;
