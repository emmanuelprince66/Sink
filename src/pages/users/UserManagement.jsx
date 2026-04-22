import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  Chip,
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
  HourglassEmpty as PendingIcon,
  ChevronRightRounded as ChevronRightIcon,
} from "@mui/icons-material";
import FormattedPrice from "../../utils/FormattedPrice";
import { SAMPLE_USERS, findPlan } from "./userData";

const STATUS_STYLE = {
  active: { bg: "#E6F7EA", color: "#02981D", label: "Active" },
  suspended: { bg: "#FDECEC", color: "#DC3545", label: "Suspended" },
  pending: { bg: "#FFF7E8", color: "#B26A00", label: "Pending" },
};

const StatusPill = ({ status }) => {
  const s = STATUS_STYLE[status] || {
    bg: "#F5F5F5",
    color: "#5E5E5E",
    label: status,
  };
  return (
    <span
      className="text-[12px] font-medium px-3 py-1 rounded-full whitespace-nowrap"
      style={{ background: s.bg, color: s.color }}
    >
      {s.label}
    </span>
  );
};

const PlanBadge = ({ plan }) => {
  const p = findPlan(plan);
  if (!p) return <span className="text-[12px] text-primary_grey_2">—</span>;
  return (
    <span
      className="text-[12px] font-semibold px-2 py-1 rounded-md whitespace-nowrap"
      style={{ background: p.bg, color: p.color }}
    >
      {p.name}
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

const UserManagement = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [planFilter, setPlanFilter] = useState("all");
  const [tierFilter, setTierFilter] = useState("all");

  const filtered = useMemo(() => {
    return SAMPLE_USERS.filter((u) => {
      const matchSearch = search
        ? [u.id, u.name, u.email, u.phone, u.businessName]
            .filter(Boolean)
            .join(" ")
            .toLowerCase()
            .includes(search.toLowerCase())
        : true;
      const matchStatus =
        statusFilter === "all" ? true : u.status === statusFilter;
      const matchPlan = planFilter === "all" ? true : u.plan === planFilter;
      const matchTier = tierFilter === "all" ? true : u.tier === tierFilter;
      return matchSearch && matchStatus && matchPlan && matchTier;
    });
  }, [search, statusFilter, planFilter, tierFilter]);

  const counts = useMemo(() => {
    return {
      total: SAMPLE_USERS.length,
      active: SAMPLE_USERS.filter((u) => u.status === "active").length,
      suspended: SAMPLE_USERS.filter((u) => u.status === "suspended").length,
      pending: SAMPLE_USERS.filter((u) => u.status === "pending").length,
    };
  }, []);

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-[20px] md:text-[22px] font-semibold text-general">
            User Management
          </h1>
          <p className="text-[13px] text-primary_grey_2 mt-1">
            Search, filter, and dive into individual users and businesses.
          </p>
        </div>
      </div>

      {/* Stats */}
      <Grid container spacing={2}>
        <Grid item xs={6} md={3}>
          <StatCard
            icon={<PeopleIcon fontSize="small" />}
            color="#3949AB"
            bg="#EEF2FF"
            label="Total Users"
            value={counts.total.toLocaleString()}
            subtitle="All accounts"
          />
        </Grid>
        <Grid item xs={6} md={3}>
          <StatCard
            icon={<ActiveIcon fontSize="small" />}
            color="#02981D"
            bg="#E6F7EA"
            label="Active"
            value={counts.active.toLocaleString()}
            subtitle="In good standing"
          />
        </Grid>
        <Grid item xs={6} md={3}>
          <StatCard
            icon={<SuspendedIcon fontSize="small" />}
            color="#DC3545"
            bg="#FDECEC"
            label="Suspended"
            value={counts.suspended.toLocaleString()}
            subtitle="Access revoked"
          />
        </Grid>
        <Grid item xs={6} md={3}>
          <StatCard
            icon={<PendingIcon fontSize="small" />}
            color="#B26A00"
            bg="#FFF7E8"
            label="Pending"
            value={counts.pending.toLocaleString()}
            subtitle="Awaiting activation"
          />
        </Grid>
      </Grid>

      {/* Main */}
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
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search ID, name, email or phone"
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

            <div className="flex flex-wrap gap-2">
              <Select
                size="small"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                sx={{ minWidth: 140 }}
              >
                <MenuItem value="all">All Status</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="suspended">Suspended</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
              </Select>
              <Select
                size="small"
                value={planFilter}
                onChange={(e) => setPlanFilter(e.target.value)}
                sx={{ minWidth: 140 }}
              >
                <MenuItem value="all">All Plans</MenuItem>
                <MenuItem value="syncpro">Syncpro</MenuItem>
                <MenuItem value="syncplus">Syncplus</MenuItem>
                <MenuItem value="trial">Trial</MenuItem>
              </Select>
              <Select
                size="small"
                value={tierFilter}
                onChange={(e) => setTierFilter(e.target.value)}
                sx={{ minWidth: 130 }}
              >
                <MenuItem value="all">All Tiers</MenuItem>
                <MenuItem value="Tier 1">Tier 1</MenuItem>
                <MenuItem value="Tier 2">Tier 2</MenuItem>
                <MenuItem value="Tier 3">Tier 3</MenuItem>
              </Select>
            </div>
          </div>

          {/* Desktop table */}
          <div className="hidden md:block w-full overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[12px] uppercase tracking-wide text-primary_grey_2 border-b border-[#EFEFEF]">
                  <th className="py-3 px-3">User ID</th>
                  <th className="py-3 px-3">Name</th>
                  <th className="py-3 px-3">Contact</th>
                  <th className="py-3 px-3">Plan</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Tier</th>
                  <th className="py-3 px-3 text-right">Total Trx</th>
                  <th className="py-3 px-3">Joined</th>
                  <th className="py-3 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td
                      colSpan={9}
                      className="py-10 text-center text-primary_grey_2"
                    >
                      No users match the current filter.
                    </td>
                  </tr>
                ) : (
                  filtered.map((u) => (
                    <tr
                      key={u.id}
                      onClick={() => navigate(`/users/${u.id}`)}
                      className="border-b border-[#F5F5F5] hover:bg-[#FAFAFA] cursor-pointer"
                    >
                      <td className="py-4 px-3 text-[12px] font-medium text-general">
                        {u.id}
                      </td>
                      <td className="py-4 px-3">
                        <p className="text-[13px] font-medium text-general">
                          {u.name}
                        </p>
                        <p className="text-[12px] text-primary_grey_2">
                          {u.type}
                        </p>
                      </td>
                      <td className="py-4 px-3 text-[12px] text-general">
                        <p>{u.email}</p>
                        <p className="text-primary_grey_2">{u.phone}</p>
                      </td>
                      <td className="py-4 px-3">
                        <PlanBadge plan={u.plan} />
                      </td>
                      <td className="py-4 px-3">
                        <StatusPill status={u.status} />
                      </td>
                      <td className="py-4 px-3 text-[12px] text-general">
                        {u.tier}
                      </td>
                      <td className="py-4 px-3 text-[13px] text-general text-right">
                        <FormattedPrice amount={u.inflow + u.outflow} />
                      </td>
                      <td className="py-4 px-3 text-[12px] text-primary_grey_2">
                        {u.joined}
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

          {/* Mobile cards */}
          <div className="md:hidden flex flex-col gap-3">
            {filtered.map((u) => (
              <div
                key={u.id}
                onClick={() => navigate(`/users/${u.id}`)}
                className="border border-[#EFEFEF] rounded-xl p-4 active:bg-[#FAFAFA]"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-[14px] font-medium text-general truncate">
                      {u.name}
                    </p>
                    <p className="text-[11px] text-primary_grey_2">
                      {u.id} · {u.type}
                    </p>
                  </div>
                  <StatusPill status={u.status} />
                </div>
                <div className="mt-2 flex items-center gap-2 flex-wrap">
                  <PlanBadge plan={u.plan} />
                  <Chip
                    size="small"
                    label={u.tier}
                    sx={{
                      background: "#F5F5F5",
                      color: "#5E5E5E",
                      fontWeight: 600,
                    }}
                  />
                </div>
                <div className="mt-3 flex items-center justify-between text-[12px] text-primary_grey_2">
                  <span>{u.email}</span>
                  <span className="text-general font-medium">
                    <FormattedPrice amount={u.inflow + u.outflow} />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserManagement;
