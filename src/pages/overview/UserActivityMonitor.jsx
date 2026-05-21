import { useMemo, useState } from "react";
import { format, parseISO } from "date-fns";
import {
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Grid,
  TextField,
} from "@mui/material";
import {
  CheckCircleOutline as ActiveIcon,
  HighlightOffOutlined as InactiveIcon,
  HourglassEmpty as DormantIcon,
  TrendingDownOutlined as ChurnedIcon,
  PeopleAltOutlined as PeopleIcon,
} from "@mui/icons-material";
import { merchantActivityUrl } from "../../api/endpoint";
import useFetchData from "../../hooks/useFetchData";
import CustomPagination from "../../components/CustomPagination";

const todayStr = () => new Date().toISOString().slice(0, 10);
const daysAgoStr = (n) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
};

const PERIODS = [
  { key: "today", label: "Today" },
  { key: "last_7_days", label: "Last 7 Days" },
  { key: "last_30_days", label: "Last 30 Days" },
  { key: "last_90_days", label: "Last 90 Days" },
  { key: "custom", label: "Custom" },
];

const STATUS_FILTERS = [
  { key: "All", label: "All" },
  { key: "Active", label: "Active" },
  { key: "Inactive", label: "Inactive" },
  { key: "Dormant", label: "Dormant" },
  { key: "Churned", label: "Churned" },
];

const STATUS_PILL = {
  Active: { bg: "#E6F7EA", color: "#02981D" },
  Inactive: { bg: "#F5F5F5", color: "#5E5E5E" },
  Dormant: { bg: "#FFF7E8", color: "#B26A00" },
  Churned: { bg: "#FDECEC", color: "#DC3545" },
};

const fmtDate = (iso) => {
  if (!iso) return "—";
  try {
    return format(parseISO(iso), "dd MMM yyyy · HH:mm");
  } catch {
    return iso;
  }
};

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
  const [statusFilter, setStatusFilter] = useState("All");
  const [customStart, setCustomStart] = useState(daysAgoStr(7));
  const [customEnd, setCustomEnd] = useState(todayStr());
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(20);

  const apiUrl = merchantActivityUrl(
    currentPage,
    pageSize,
    period,
    statusFilter,
    { startDate: customStart, endDate: customEnd }
  );
  const { data, isLoading } = useFetchData(
    [
      "fetchMerchantActivity",
      apiUrl,
      currentPage,
      period,
      statusFilter,
      customStart,
      customEnd,
    ],
    apiUrl
  );

  const summary = data?.summary || {};
  const rows = useMemo(() => {
    return Array.isArray(data?.results) ? data.results : [];
  }, [data]);

  const totalPages =
    data?.pagination?.total_pages ||
    Math.max(
      1,
      Math.ceil((data?.pagination?.total_count || rows.length) / pageSize)
    );

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
              Active = at least 1 transaction in period. Dormant = 30–90d quiet.
              Churned = 90+d quiet or subscription expired.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {PERIODS.map((p) => {
              const on = period === p.key;
              return (
                <button
                  key={p.key}
                  onClick={() => {
                    setPeriod(p.key);
                    setCurrentPage(1);
                  }}
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
              onChange={(e) => {
                setCustomStart(e.target.value);
                setCurrentPage(1);
              }}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              type="date"
              size="small"
              label="End"
              value={customEnd}
              onChange={(e) => {
                setCustomEnd(e.target.value);
                setCurrentPage(1);
              }}
              InputLabelProps={{ shrink: true }}
            />
          </div>
        )}

        {/* Server-driven stat tiles */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={6} md={2.4}>
            <StatTile
              icon={<PeopleIcon fontSize="small" />}
              color="#3949AB"
              bg="#EEF2FF"
              label="Total"
              value={Number(summary.total_count || 0).toLocaleString()}
              sub="All businesses"
            />
          </Grid>
          <Grid item xs={6} md={2.4}>
            <StatTile
              icon={<ActiveIcon fontSize="small" />}
              color="#02981D"
              bg="#E6F7EA"
              label="Active"
              value={Number(summary.active_count || 0).toLocaleString()}
              sub="≥ 1 transaction in period"
            />
          </Grid>
          <Grid item xs={6} md={2.4}>
            <StatTile
              icon={<InactiveIcon fontSize="small" />}
              color="#5E5E5E"
              bg="#F5F5F5"
              label="Inactive"
              value={Number(summary.inactive_count || 0).toLocaleString()}
              sub="No transaction"
            />
          </Grid>
          <Grid item xs={6} md={2.4}>
            <StatTile
              icon={<DormantIcon fontSize="small" />}
              color="#B26A00"
              bg="#FFF7E8"
              label="Dormant"
              value={Number(summary.dormant_count || 0).toLocaleString()}
              sub="30–90 days quiet"
            />
          </Grid>
          <Grid item xs={12} md={2.4}>
            <StatTile
              icon={<ChurnedIcon fontSize="small" />}
              color="#DC3545"
              bg="#FDECEC"
              label="Churned"
              value={Number(summary.churned_count || 0).toLocaleString()}
              sub="90+d quiet or expired"
            />
          </Grid>
        </Grid>

        {/* Status filter chips */}
        <div className="flex flex-wrap gap-2 mb-3">
          {STATUS_FILTERS.map((f) => {
            const on = statusFilter === f.key;
            return (
              <Chip
                key={f.key}
                label={f.label}
                onClick={() => {
                  setStatusFilter(f.key);
                  setCurrentPage(1);
                }}
                sx={{
                  borderRadius: "8px",
                  px: 1,
                  fontWeight: 500,
                  background: on ? "#F6FFF8" : "#fff",
                  border: on ? "1px solid #02981D" : "1px solid #E3E3E3",
                  color: on ? "#02981D" : "#5E5E5E",
                  "&:hover": { background: on ? "#F6FFF8" : "#F5F5F5" },
                }}
              />
            );
          })}
        </div>

        {/* Results table */}
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[12px] uppercase tracking-wide text-primary_grey_2 border-b border-[#EFEFEF]">
                <th className="py-3 px-3">Business</th>
                <th className="py-3 px-3">Email</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Last Activity</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="py-10 text-center">
                    <CircularProgress sx={{ color: "#02981D" }} />
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="py-10 text-center text-primary_grey_2"
                  >
                    No businesses match this period / status.
                  </td>
                </tr>
              ) : (
                rows.map((r) => {
                  const pill =
                    STATUS_PILL[r.status] || {
                      bg: "#F5F5F5",
                      color: "#5E5E5E",
                    };
                  return (
                    <tr
                      key={r.id}
                      className="border-b border-[#F5F5F5] hover:bg-[#FAFAFA]"
                    >
                      <td className="py-3 px-3 text-[13px] font-medium text-general truncate max-w-[260px]">
                        {r.business_name || "—"}
                      </td>
                      <td className="py-3 px-3 text-[12px] text-primary_grey_2 truncate max-w-[280px]">
                        {r.email || "—"}
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className="text-[12px] font-medium px-3 py-1 rounded-full"
                          style={{ background: pill.bg, color: pill.color }}
                        >
                          {r.status || "—"}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-[12px] text-primary_grey_2 whitespace-nowrap">
                        {fmtDate(r.last_activity)}
                      </td>
                    </tr>
                  );
                })
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
      </CardContent>
    </Card>
  );
};

export default UserActivityMonitor;
