import { useMemo, useState } from "react";
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
  Tab,
  Tabs,
  TextField,
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
} from "@mui/icons-material";
import CustomModal from "../../components/CustomModal";
import KYCAuditLog from "./KYCAuditLog";
import { SAMPLE_DATA } from "./kycData";

const STATUS_FILTERS = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "approved", label: "Approved" },
  { key: "rejected", label: "Rejected" },
  { key: "re-upload", label: "Re-upload Requested" },
];

const StatusPill = ({ status }) => {
  const style = {
    pending: { bg: "#FFF7E8", color: "#B26A00", label: "Pending" },
    approved: { bg: "#E6F7EA", color: "#02981D", label: "Approved" },
    rejected: { bg: "#FDECEC", color: "#DC3545", label: "Rejected" },
    "re-upload": { bg: "#EEF2FF", color: "#3949AB", label: "Re-upload" },
  }[status] || { bg: "#F5F5F5", color: "#5E5E5E", label: status };

  return (
    <span
      className="text-[12px] font-medium px-3 py-1 rounded-full"
      style={{ background: style.bg, color: style.color }}
    >
      {style.label}
    </span>
  );
};

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

const KYCManagement = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState(0);
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [auditOpen, setAuditOpen] = useState(false);
  const [loading] = useState(false);

  const segment = tab === 0 ? "individual" : "business";
  const data = SAMPLE_DATA[segment];

  const filtered = useMemo(() => {
    return data.filter((row) => {
      const matchesStatus =
        statusFilter === "all" ? true : row.status === statusFilter;
      const matchesSearch = search
        ? row.name.toLowerCase().includes(search.toLowerCase()) ||
          row.email?.toLowerCase().includes(search.toLowerCase())
        : true;
      return matchesStatus && matchesSearch;
    });
  }, [data, statusFilter, search]);

  const counts = useMemo(() => {
    const all = [...SAMPLE_DATA.individual, ...SAMPLE_DATA.business];
    return {
      pending: all.filter((r) => r.status === "pending").length,
      approved: all.filter((r) => r.status === "approved").length,
      rejected: all.filter((r) => r.status === "rejected").length,
      reupload: all.filter((r) => r.status === "re-upload").length,
    };
  }, []);

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-[20px] md:text-[22px] font-semibold text-general">
            KYC Management
          </h1>
          <p className="text-[13px] text-primary_grey_2 mt-1">
            Review, approve, and audit user identity verifications.
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

      {/* Stats */}
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<PendingIcon fontSize="small" />}
            color="#B26A00"
            bg="#FFF7E8"
            label="Pending Verifications"
            value={counts.pending}
            subtitle="Awaiting review"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<VerifiedIcon fontSize="small" />}
            color="#02981D"
            bg="#E6F7EA"
            label="Approved"
            value={counts.approved}
            subtitle="Verified accounts"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<CancelIcon fontSize="small" />}
            color="#DC3545"
            bg="#FDECEC"
            label="Rejected"
            value={counts.rejected}
            subtitle="Failed verification"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<RetryIcon fontSize="small" />}
            color="#3949AB"
            bg="#EEF2FF"
            label="Re-upload Requested"
            value={counts.reupload}
            subtitle="Awaiting user action"
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
          {/* Tabs */}
          <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
            <Tabs
              value={tab}
              onChange={(_, v) => {
                setTab(v);
                setStatusFilter("all");
                setSearch("");
              }}
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
              <Tab label="Individual" />
              <Tab label="Business" />
            </Tabs>
          </Box>

          {/* Search + filters */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 mb-4">
            <TextField
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={
                segment === "individual"
                  ? "Search by name or email"
                  : "Search by business name or email"
              }
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

            <div className="flex flex-wrap gap-2">
              {STATUS_FILTERS.map((f) => {
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
            </div>
          </div>

          {/* Table — desktop */}
          <div className="hidden md:block w-full overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[12px] uppercase tracking-wide text-primary_grey_2 border-b border-[#EFEFEF]">
                  <th className="py-3 px-3">User</th>
                  <th className="py-3 px-3">
                    {segment === "individual" ? "BVN / NIN" : "RC / TIN"}
                  </th>
                  <th className="py-3 px-3">Submitted</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} className="py-10 text-center">
                      <CircularProgress sx={{ color: "#02981D" }} />
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="py-10 text-center text-primary_grey_2"
                    >
                      No verifications match the current filter.
                    </td>
                  </tr>
                ) : (
                  filtered.map((row) => (
                    <tr
                      key={row.id}
                      className="border-b border-[#F5F5F5] hover:bg-[#FAFAFA] cursor-pointer"
                      onClick={() => navigate(`/kyc/${segment}/${row.id}`)}
                    >
                      <td className="py-4 px-3">
                        <p className="text-[14px] font-medium text-general">
                          {row.name}
                        </p>
                        <p className="text-[12px] text-primary_grey_2">
                          {row.email}
                        </p>
                      </td>
                      <td className="py-4 px-3 text-[13px] text-general">
                        {segment === "individual" ? (
                          <div className="flex flex-col">
                            <span>BVN: {row.bvn}</span>
                            <span className="text-primary_grey_2">
                              NIN: {row.nin}
                            </span>
                          </div>
                        ) : (
                          <div className="flex flex-col">
                            <span>RC: {row.rcNumber}</span>
                            <span className="text-primary_grey_2">
                              TIN: {row.tin}
                            </span>
                          </div>
                        )}
                      </td>
                      <td className="py-4 px-3 text-[13px] text-general">
                        {row.submitted}
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
            {filtered.map((row) => (
              <div
                key={row.id}
                onClick={() => setSelected(row)}
                className="border border-[#EFEFEF] rounded-xl p-4 active:bg-[#FAFAFA]"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[14px] font-medium text-general">
                      {row.name}
                    </p>
                    <p className="text-[12px] text-primary_grey_2">
                      {row.email}
                    </p>
                  </div>
                  <StatusPill status={row.status} />
                </div>
                <Divider sx={{ my: 1.5 }} />
                <div className="flex items-center justify-between text-[12px] text-primary_grey_2">
                  <span>
                    {segment === "individual"
                      ? `BVN: ${row.bvn}`
                      : `RC: ${row.rcNumber}`}
                  </span>
                  <span>Submitted {row.submitted}</span>
                </div>
              </div>
            ))}
          </div>
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
