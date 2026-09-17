import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  InputAdornment,
  MenuItem,
  Tab,
  Tabs,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  SearchOutlined as SearchOutlinedIcon,
  VerifiedUserOutlined as VerifiedIcon,
  PendingActionsOutlined as PendingIcon,
  CancelOutlined as CancelIcon,
  AutorenewOutlined as RetryIcon,
  ChevronRightRounded as ChevronRightIcon,
  HistoryOutlined as HistoryIcon,
  VerifiedOutlined as CheckBadgeIcon,
} from "@mui/icons-material";
import CustomModal from "../../components/CustomModal";
import { CustomPagination } from "../../components/CustomPagination";
import useFetchData from "../../hooks/useFetchData";
import { kycListUrl } from "../../api/endpoint";
import KYCAuditLog from "./KYCAuditLog";
import {
  KYC_STATUS_FILTERS,
  KYC_TYPE_TABS,
  StatusPill,
  formatSubmitted,
  kycErrorMessage,
  segmentOf,
} from "./kycShared";

const PAGE_SIZE_OPTIONS = [10, 25, 50];

const StatCard = ({ icon, color, bg, label, value, subtitle }) => (
  <Card
    sx={{
      borderRadius: "14px",
      boxShadow: "0 1px 3px rgba(16,24,40,.06)",
      border: "1px solid #EFEFEF",
      height: "100%",
    }}
  >
    <CardContent sx={{ p: 3 }}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[13px] text-primary_grey_2 font-medium">{label}</p>
          <p className="text-[24px] font-semibold text-general mt-2">{value}</p>
          {subtitle && (
            <p className="text-[12px] text-[#9CA3AF] mt-1">{subtitle}</p>
          )}
        </div>
        <div
          className="h-10 w-10 rounded-full flex items-center justify-center"
          style={{ background: bg, color }}
        >
          {icon}
        </div>
      </div>
    </CardContent>
  </Card>
);

// BVN / NIN arrive already masked ("222****5678") or as "Verified" /
// "Not Provided" strings, so they are rendered verbatim next to the badge.
const IdentityCell = ({ label, value, verified }) => (
  <span className="flex items-center gap-1">
    <span className={verified ? "text-general" : "text-primary_grey_2"}>
      {label}: {value || "Not Provided"}
    </span>
    {verified && (
      <Tooltip title={`${label} verified`}>
        <CheckBadgeIcon sx={{ color: "#02981D", fontSize: 15 }} />
      </Tooltip>
    )}
  </span>
);

const KYCManagement = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState(0);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [auditOpen, setAuditOpen] = useState(false);

  const typeFilter = KYC_TYPE_TABS[tab].key;

  // Debounce the search box so typing does not fire a request per keystroke.
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search.trim()), 500);
    return () => clearTimeout(timer);
  }, [search]);

  // Any filter change goes back to page 1 — a narrower filter can otherwise
  // leave us parked on a page that no longer exists.
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, typeFilter, debouncedSearch, pageSize]);

  const apiUrl = kycListUrl(
    currentPage,
    pageSize,
    statusFilter,
    typeFilter,
    debouncedSearch,
  );

  const { data, error, isLoading } = useFetchData(
    ["fetchKycList", apiUrl],
    apiUrl,
  );

  const rows = useMemo(() => data?.data || [], [data]);
  const metrics = data?.metrics || {};
  const totalPages = Math.max(
    1,
    data?.pages || Math.ceil((data?.total || rows.length) / pageSize) || 1,
  );

  const openDetail = (row) =>
    navigate(`/kyc/${segmentOf(row.account_type)}/${row.id}`);

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-[20px] md:text-[22px] font-semibold text-general">
            KYC Management
          </h1>
          <p className="text-[13px] text-primary_grey_2 mt-1">
            Review, approve, and audit merchant identity verifications.
          </p>
        </div>
        <Button
          onClick={() => setAuditOpen(true)}
          variant="outlined"
          startIcon={<HistoryIcon />}
          sx={{
            textTransform: "none",
            borderColor: "#C8C8C8",
            color: "#02981D",
            background: "#fff",
            fontWeight: 600,
            "&:hover": { borderColor: "#02981D", background: "#F6FFF8" },
          }}
        >
          View Audit Log
        </Button>
      </div>

      {/* Metrics — server-side counts, unaffected by the active filter */}
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<PendingIcon fontSize="small" />}
            color="#B26A00"
            bg="#FFF7E8"
            label="Pending Verifications"
            value={metrics.pending_count ?? "—"}
            subtitle="Awaiting review"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<VerifiedIcon fontSize="small" />}
            color="#02981D"
            bg="#E6F7EA"
            label="Approved"
            value={metrics.approved_count ?? "—"}
            subtitle="Live on Tier 3"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<CancelIcon fontSize="small" />}
            color="#DC3545"
            bg="#FDECEC"
            label="Rejected"
            value={metrics.rejected_count ?? "—"}
            subtitle="Failed verification"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<RetryIcon fontSize="small" />}
            color="#3949AB"
            bg="#EEF2FF"
            label="Re-upload Requested"
            value={metrics.reupload_count ?? "—"}
            subtitle="Awaiting merchant action"
          />
        </Grid>
      </Grid>

      {/* Main card */}
      <Card
        sx={{
          borderRadius: "14px",
          boxShadow: "0 1px 3px rgba(16,24,40,.06)",
          border: "1px solid #EFEFEF",
        }}
      >
        <CardContent sx={{ p: { xs: 2, md: 3 } }}>
          {/* Account-type tabs */}
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
              {KYC_TYPE_TABS.map((t) => (
                <Tab key={t.key} label={t.label} />
              ))}
            </Tabs>
          </Box>

          {/* Search + filters */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 mb-4">
            <TextField
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email, phone or account number"
              size="small"
              fullWidth
              sx={{ maxWidth: { lg: 380 } }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchOutlinedIcon sx={{ color: "#757575" }} />
                  </InputAdornment>
                ),
              }}
            />

            <div className="flex flex-wrap items-center gap-2">
              {KYC_STATUS_FILTERS.map((f) => {
                const active = statusFilter === f.key;
                return (
                  <Chip
                    key={f.key}
                    label={f.label}
                    onClick={() => setStatusFilter(f.key)}
                    sx={{
                      borderRadius: "8px",
                      px: 1,
                      fontWeight: 500,
                      background: active ? "#F6FFF8" : "#fff",
                      border: active
                        ? "1px solid #02981D"
                        : "1px solid #E3E3E3",
                      color: active ? "#02981D" : "#5E5E5E",
                      "&:hover": { background: active ? "#F6FFF8" : "#F5F5F5" },
                    }}
                  />
                );
              })}
              <TextField
                select
                size="small"
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                sx={{ width: 110 }}
              >
                {PAGE_SIZE_OPTIONS.map((n) => (
                  <MenuItem key={n} value={n}>
                    {n} / page
                  </MenuItem>
                ))}
              </TextField>
            </div>
          </div>

          {error && (
            <Typography sx={{ color: "#DC3545", fontSize: 13, mb: 2 }}>
              {kycErrorMessage(error, "Unable to load KYC verifications.")}
            </Typography>
          )}

          {/* Table — desktop */}
          <div className="hidden md:block w-full overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[12px] uppercase tracking-wide text-primary_grey_2 border-b border-[#EFEFEF]">
                  <th className="py-3 px-3">Merchant</th>
                  <th className="py-3 px-3">Account</th>
                  <th className="py-3 px-3">BVN / NIN</th>
                  <th className="py-3 px-3">Tier</th>
                  <th className="py-3 px-3">Submitted</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="py-10 text-center">
                      <CircularProgress sx={{ color: "#02981D" }} />
                    </td>
                  </tr>
                ) : rows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="py-10 text-center text-primary_grey_2"
                    >
                      No verifications match the current filter.
                    </td>
                  </tr>
                ) : (
                  rows.map((row) => (
                    <tr
                      key={row.id}
                      className="border-b border-[#F5F5F5] hover:bg-[#FAFAFA] cursor-pointer"
                      onClick={() => openDetail(row)}
                    >
                      <td className="py-4 px-3">
                        <p className="text-[14px] font-medium text-general">
                          {row.full_name || "—"}
                        </p>
                        <p className="text-[12px] text-primary_grey_2">
                          {row.email || row.phone || "—"}
                        </p>
                      </td>
                      <td className="py-4 px-3 text-[13px] text-general">
                        <div className="flex flex-col">
                          <span>{row.account_number || "—"}</span>
                          <span className="text-primary_grey_2">
                            {row.account_name || row.account_type}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-3 text-[13px]">
                        <div className="flex flex-col gap-0.5">
                          <IdentityCell
                            label="BVN"
                            value={row.bvn}
                            verified={row.bvn_verified}
                          />
                          <IdentityCell
                            label="NIN"
                            value={row.nin}
                            verified={row.nin_verified}
                          />
                        </div>
                      </td>
                      <td className="py-4 px-3 text-[13px] text-general">
                        {row.tier || "—"}
                      </td>
                      <td className="py-4 px-3 text-[13px] text-general">
                        {formatSubmitted(row.submitted_at)}
                      </td>
                      <td className="py-4 px-3">
                        <StatusPill status={row.status} />
                      </td>
                      <td className="py-4 px-3 text-right">
                        <ChevronRightIcon sx={{ color: "#5E5E5E" }} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Card list — mobile */}
          <div className="md:hidden flex flex-col gap-3">
            {isLoading ? (
              <div className="py-10 flex justify-center">
                <CircularProgress sx={{ color: "#02981D" }} />
              </div>
            ) : rows.length === 0 ? (
              <p className="py-10 text-center text-[13px] text-primary_grey_2">
                No verifications match the current filter.
              </p>
            ) : (
              rows.map((row) => (
                <div
                  key={row.id}
                  onClick={() => openDetail(row)}
                  className="border border-[#EFEFEF] rounded-xl p-4 active:bg-[#FAFAFA]"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-[14px] font-medium text-general">
                        {row.full_name || "—"}
                      </p>
                      <p className="text-[12px] text-primary_grey_2">
                        {row.email || row.phone || "—"}
                      </p>
                    </div>
                    <StatusPill status={row.status} />
                  </div>
                  <Divider sx={{ my: 1.5 }} />
                  <div className="flex items-center justify-between text-[12px] text-primary_grey_2">
                    <span>{row.account_number || row.account_type}</span>
                    <span>Submitted {formatSubmitted(row.submitted_at)}</span>
                  </div>
                </div>
              ))
            )}
          </div>

          {!isLoading && rows.length > 0 && totalPages > 1 && (
            <CustomPagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          )}
        </CardContent>
      </Card>

      {/* Audit log modal */}
      <CustomModal
        open={auditOpen}
        closeModal={() => setAuditOpen(false)}
        style="w-[95%] md:w-3/5"
      >
        <KYCAuditLog close={() => setAuditOpen(false)} />
      </CustomModal>
    </div>
  );
};

export default KYCManagement;
