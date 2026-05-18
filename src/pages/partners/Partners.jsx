import { useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ToastContainer, toast } from "react-toastify";
import {
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Grid,
  InputAdornment,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";
import {
  SearchOutlined as SearchIcon,
  PeopleAltOutlined as PeopleIcon,
  CheckCircleOutline as ActiveIcon,
  PauseCircleOutline as SuspendedIcon,
  PauseCircleFilled as SuspendIcon,
  CheckCircle as ApproveIcon,
  ChevronRightRounded as ChevronRightIcon,
} from "@mui/icons-material";
import {
  partnersUrl,
  suspendPartnerUrl,
  approvePartnerUrl,
} from "../../api/endpoint";
import useFetchData from "../../hooks/useFetchData";
import { AuthAxios } from "../../helpers/axiosInstance";
import CustomPagination from "../../components/CustomPagination";

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

const STATUS_PILL = {
  active: { bg: "#E6F7EA", color: "#02981D", label: "Active" },
  suspended: { bg: "#FDECEC", color: "#DC3545", label: "Suspended" },
  pending: { bg: "#FFF7E8", color: "#B26A00", label: "Pending" },
};

// API list response has no defined schema — read keys defensively
const mapPartner = (p) => {
  const fullName =
    p?.full_name ||
    [p?.firstname, p?.lastname].filter(Boolean).join(" ") ||
    p?.name ||
    "—";
  const status = p?.is_suspended
    ? "suspended"
    : p?.is_active === false
    ? "pending"
    : "active";
  return {
    id: p?.id || "—",
    name: fullName,
    email: p?.email || "—",
    phone: p?.phone || "—",
    plan: p?.plan || p?.subscription || "—",
    status,
    joined: p?.created_at ? p.created_at.slice(0, 10) : "—",
    raw: p,
  };
};

const Partners = () => {
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage] = useState(50);
  const [search, setSearch] = useState("");
  const [planFilter, setPlanFilter] = useState("all");

  const apiUrl = partnersUrl(
    currentPage,
    rowsPerPage,
    planFilter === "all" ? null : planFilter,
    search
  );
  const { data, isLoading } = useFetchData(
    ["fetchPartners", apiUrl, currentPage, planFilter, search],
    apiUrl
  );

  const partners = useMemo(() => {
    const raw = Array.isArray(data?.data)
      ? data.data
      : Array.isArray(data?.results)
      ? data.results
      : Array.isArray(data)
      ? data
      : [];
    return raw.map(mapPartner);
  }, [data]);

  const counts = useMemo(
    () => ({
      total: data?.total ?? partners.length,
      active: partners.filter((p) => p.status === "active").length,
      suspended: partners.filter((p) => p.status === "suspended").length,
    }),
    [partners, data]
  );

  const suspendMutation = useMutation({
    mutationFn: ({ id, suspend }) =>
      AuthAxios.post(suspendPartnerUrl(id), { status: suspend }),
    onSuccess: (_, vars) => {
      toast.success(vars.suspend ? "Partner suspended" : "Partner unsuspended");
      queryClient.invalidateQueries({ queryKey: ["fetchPartners"] });
    },
    onError: (err) =>
      toast.error(err?.response?.data?.message || "Failed to update partner"),
  });

  const approveMutation = useMutation({
    mutationFn: (id) => AuthAxios.get(approvePartnerUrl(id)),
    onSuccess: () => {
      toast.success("Partner approved");
      queryClient.invalidateQueries({ queryKey: ["fetchPartners"] });
    },
    onError: (err) =>
      toast.error(err?.response?.data?.message || "Failed to approve partner"),
  });

  const totalPages =
    data?.total_pages ||
    data?.pages ||
    Math.max(1, Math.ceil((data?.total || partners.length) / rowsPerPage));

  return (
    <div className="w-full flex flex-col gap-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-[20px] md:text-[22px] font-semibold text-general">
            Partners
          </h1>
          <p className="text-[13px] text-primary_grey_2 mt-1">
            Approve, suspend, and manage partner accounts.
          </p>
        </div>
      </div>

      {/* Stats */}
      <Grid container spacing={2}>
        <Grid item xs={6} md={4}>
          <StatCard
            icon={<PeopleIcon fontSize="small" />}
            color="#3949AB"
            bg="#EEF2FF"
            label="Total Partners"
            value={counts.total.toLocaleString()}
            subtitle="All partner accounts"
          />
        </Grid>
        <Grid item xs={6} md={4}>
          <StatCard
            icon={<ActiveIcon fontSize="small" />}
            color="#02981D"
            bg="#E6F7EA"
            label="Active"
            value={counts.active.toLocaleString()}
            subtitle="Currently approved"
          />
        </Grid>
        <Grid item xs={6} md={4}>
          <StatCard
            icon={<SuspendedIcon fontSize="small" />}
            color="#DC3545"
            bg="#FDECEC"
            label="Suspended"
            value={counts.suspended.toLocaleString()}
            subtitle="Access revoked"
          />
        </Grid>
      </Grid>

      <Card
        sx={{
          borderRadius: "14px",
          boxShadow: "0 1px 3px rgba(16,24,40,.06)",
          border: "1px solid #EFEFEF",
        }}
      >
        <CardContent sx={{ p: { xs: 2, md: 3 } }}>
          {/* Filters */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 mb-4">
            <TextField
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by name or email"
              size="small"
              fullWidth
              sx={{ maxWidth: { lg: 400 } }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: "#757575" }} />
                  </InputAdornment>
                ),
              }}
            />
            <Select
              size="small"
              value={planFilter}
              onChange={(e) => {
                setPlanFilter(e.target.value);
                setCurrentPage(1);
              }}
              sx={{ minWidth: 160 }}
            >
              <MenuItem value="all">All Plans</MenuItem>
              <MenuItem value="FREE">Free</MenuItem>
              <MenuItem value="STARTER">Starter</MenuItem>
              <MenuItem value="SYNC-PLUS">Sync-Plus</MenuItem>
              <MenuItem value="SYNC-PRO">Sync-Pro</MenuItem>
            </Select>
          </div>

          {/* Table */}
          <div className="hidden md:block w-full overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[12px] uppercase tracking-wide text-primary_grey_2 border-b border-[#EFEFEF]">
                  <th className="py-3 px-3">Partner</th>
                  <th className="py-3 px-3">Contact</th>
                  <th className="py-3 px-3">Plan</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Joined</th>
                  <th className="py-3 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="py-10 text-center">
                      <CircularProgress sx={{ color: "#02981D" }} />
                    </td>
                  </tr>
                ) : partners.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="py-10 text-center text-primary_grey_2"
                    >
                      No partners match the current filter.
                    </td>
                  </tr>
                ) : (
                  partners.map((p) => {
                    const s = STATUS_PILL[p.status] || STATUS_PILL.pending;
                    return (
                      <tr
                        key={p.id}
                        className="border-b border-[#F5F5F5] hover:bg-[#FAFAFA]"
                      >
                        <td className="py-4 px-3">
                          <p className="text-[13px] font-medium text-general">
                            {p.name}
                          </p>
                          <p className="text-[11px] text-primary_grey_2">
                            {p.id}
                          </p>
                        </td>
                        <td className="py-4 px-3 text-[12px] text-general">
                          <p>{p.email}</p>
                          <p className="text-primary_grey_2">{p.phone}</p>
                        </td>
                        <td className="py-4 px-3">
                          <Chip
                            size="small"
                            label={p.plan}
                            sx={{
                              background: "#F6FFF8",
                              color: "#02981D",
                              fontWeight: 600,
                            }}
                          />
                        </td>
                        <td className="py-4 px-3">
                          <span
                            className="text-[12px] font-medium px-3 py-1 rounded-full"
                            style={{ background: s.bg, color: s.color }}
                          >
                            {s.label}
                          </span>
                        </td>
                        <td className="py-4 px-3 text-[12px] text-primary_grey_2">
                          {p.joined}
                        </td>
                        <td className="py-4 px-3 text-right">
                          <div className="inline-flex items-center gap-1">
                            {p.status === "suspended" ? (
                              <button
                                title="Approve"
                                onClick={() =>
                                  approveMutation.mutate(p.id)
                                }
                                className="px-2 py-1 rounded-md text-[11px] font-semibold text-[#02981D] border border-[#02981D]/30 bg-[#F6FFF8] hover:bg-[#E6F7EA]"
                              >
                                <ApproveIcon
                                  sx={{ fontSize: 14, mr: 0.5, mb: "-2px" }}
                                />
                                Approve
                              </button>
                            ) : (
                              <button
                                title="Suspend"
                                onClick={() =>
                                  suspendMutation.mutate({
                                    id: p.id,
                                    suspend: true,
                                  })
                                }
                                className="px-2 py-1 rounded-md text-[11px] font-semibold text-[#DC3545] border border-[#DC3545]/30 bg-[#FDECEC] hover:bg-[#FBDADC]"
                              >
                                <SuspendIcon
                                  sx={{ fontSize: 14, mr: 0.5, mb: "-2px" }}
                                />
                                Suspend
                              </button>
                            )}
                            <ChevronRightIcon sx={{ color: "#5E5E5E" }} />
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {!isLoading && partners.length > 0 && (
            <CustomPagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          )}
        </CardContent>
      </Card>

      <ToastContainer position="top-right" autoClose={4000} />
    </div>
  );
};

export default Partners;
