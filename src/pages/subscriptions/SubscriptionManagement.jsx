import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  FormControl,
  Grid,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  Switch,
  Tab,
  Tabs,
  TextField,
} from "@mui/material";
import {
  AddRounded as AddIcon,
  EditOutlined as EditIcon,
  DeleteOutline as DeleteIcon,
  PaidOutlined as PaidIcon,
  PeopleAltOutlined as PeopleIcon,
  CardMembershipOutlined as PlanIcon,
  StarBorderRounded as StarIcon,
  ClearRounded as ClearIcon,
  ChevronRightRounded as ChevronRightIcon,
  CheckCircleRounded as CheckIcon,
  CancelRounded as XIcon,
  AllInclusiveRounded as InfinityIcon,
  TrendingUpOutlined as MrrIcon,
  ReportProblemOutlined as FailedIcon,
} from "@mui/icons-material";
import CustomModal from "../../components/CustomModal";
import FormattedPrice from "../../utils/FormattedPrice";
import {
  SUBSCRIPTION_PLANS,
  SAMPLE_USERS,
  findPlan,
  PLAN_LIMIT_FIELDS,
  PLAN_FEATURE_FIELDS,
  formatLimit,
} from "../users/userData";

const BILLING_CYCLES = [
  "Monthly",
  "Quarterly",
  "Bi-Annual",
  "Annual",
  "14-day Trial",
  "Custom",
];

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

const PlanCard = ({ plan, onEdit }) => {
  const enabledFeatures = PLAN_FEATURE_FIELDS.filter(
    (f) => plan.features?.[f.key]
  );
  return (
    <Card
      sx={{
        borderRadius: "14px",
        boxShadow: "0 1px 3px rgba(16,24,40,.06)",
        border: "1px solid #EFEFEF",
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <CardContent sx={{ p: 3, flex: 1, display: "flex", flexDirection: "column" }}>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div
              className="h-9 w-9 rounded-md flex items-center justify-center"
              style={{ background: plan.bg, color: plan.color }}
            >
              <PlanIcon fontSize="small" />
            </div>
            <div>
              <p className="text-[16px] font-semibold text-general">
                {plan.name}
              </p>
              <p className="text-[12px] text-primary_grey_2">{plan.cycle}</p>
            </div>
          </div>
          <button
            onClick={() => onEdit(plan)}
            className="text-[#5E5E5E] hover:text-[#02981D]"
          >
            <EditIcon fontSize="small" />
          </button>
        </div>

        <p className="text-[28px] font-bold text-general mt-3">
          <FormattedPrice amount={plan.price} />
        </p>
        <p className="text-[12px] text-primary_grey_2 mt-1 leading-relaxed">
          {plan.description}
        </p>

        <Divider sx={{ my: 2 }} />

        {/* Limits grid */}
        <p className="text-[11px] uppercase tracking-wide text-primary_grey_2 mb-2">
          Usage Limits
        </p>
        <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
          {PLAN_LIMIT_FIELDS.map((f) => (
            <div
              key={f.key}
              className="flex items-center justify-between text-[12px]"
            >
              <span className="text-primary_grey_2 truncate pr-2">
                {f.label}
              </span>
              <span className="text-general font-semibold flex items-center gap-1">
                {plan.limits?.[f.key] === null ? (
                  <InfinityIcon
                    sx={{ fontSize: 14, color: plan.color }}
                  />
                ) : (
                  formatLimit(plan.limits?.[f.key] ?? 0)
                )}
              </span>
            </div>
          ))}
        </div>

        <Divider sx={{ my: 2 }} />

        <p className="text-[11px] uppercase tracking-wide text-primary_grey_2 mb-2">
          Features ({enabledFeatures.length}/{PLAN_FEATURE_FIELDS.length})
        </p>
        <div className="flex flex-wrap gap-1.5">
          {PLAN_FEATURE_FIELDS.map((f) => {
            const on = plan.features?.[f.key];
            return (
              <span
                key={f.key}
                className="inline-flex items-center gap-1 text-[11px] px-2 py-1 rounded-md"
                style={{
                  background: on ? plan.bg : "#F5F5F5",
                  color: on ? plan.color : "#9CA3AF",
                  fontWeight: on ? 600 : 500,
                }}
              >
                {on ? (
                  <CheckIcon sx={{ fontSize: 12 }} />
                ) : (
                  <XIcon sx={{ fontSize: 12 }} />
                )}
                {f.label}
              </span>
            );
          })}
        </div>

        <Divider sx={{ my: 2 }} />
        <div className="mt-auto flex items-center justify-between">
          <div>
            <p className="text-[11px] text-primary_grey_2">
              Active subscribers
            </p>
            <p className="text-[14px] font-semibold text-general">
              {plan.activeSubscribers.toLocaleString()}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[11px] text-primary_grey_2">Revenue MTD</p>
            <p className="text-[14px] font-semibold text-general">
              <FormattedPrice amount={plan.revenueMTD} />
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Sample subscription transactions with full lifecycle metadata
const SUB_TRANSACTIONS = [
  {
    id: "ST-2241",
    user: "Adaeze Beauty Hub",
    plan: "syncpro",
    type: "Renewal",
    amount: 25000,
    cycle: "Monthly",
    start: "2026-04-12",
    end: "2026-05-12",
    nextBilling: "2026-05-12",
    method: "Card",
    status: "Successful",
  },
  {
    id: "ST-2240",
    user: "Sunde Logistics Ltd",
    plan: "syncpro",
    type: "Renewal",
    amount: 25000,
    cycle: "Monthly",
    start: "2026-04-04",
    end: "2026-05-04",
    nextBilling: "2026-05-04",
    method: "Bank Transfer",
    status: "Successful",
  },
  {
    id: "ST-2239",
    user: "Ifeanyi Johnson",
    plan: "syncplus",
    type: "Upgrade",
    amount: 9500,
    cycle: "Monthly",
    start: "2026-04-10",
    end: "2026-05-10",
    nextBilling: "2026-05-10",
    method: "Card",
    status: "Successful",
  },
  {
    id: "ST-2238",
    user: "Bola Salami",
    plan: "trial",
    type: "New",
    amount: 0,
    cycle: "14-day Trial",
    start: "2026-04-10",
    end: "2026-04-24",
    nextBilling: "2026-04-24",
    method: "—",
    status: "Successful",
  },
  {
    id: "ST-2237",
    user: "Chinedu Eze",
    plan: "syncplus",
    type: "Renewal",
    amount: 9500,
    cycle: "Monthly",
    start: "2026-04-01",
    end: "2026-05-01",
    nextBilling: "—",
    method: "Card",
    status: "Failed",
  },
  {
    id: "ST-2236",
    user: "Kano Foods Co.",
    plan: "syncpro",
    type: "Renewal",
    amount: 25000,
    cycle: "Monthly",
    start: "2026-04-01",
    end: "2026-05-01",
    nextBilling: "2026-05-01",
    method: "Bank Transfer",
    status: "Successful",
  },
  {
    id: "ST-2235",
    user: "Lagos Mart Ventures",
    plan: "syncplus",
    type: "Downgrade",
    amount: 9500,
    cycle: "Monthly",
    start: "2026-04-09",
    end: "2026-05-09",
    nextBilling: "2026-05-09",
    method: "Card",
    status: "Successful",
  },
  {
    id: "ST-2234",
    user: "Adaeze Beauty Hub",
    plan: "syncpro",
    type: "New",
    amount: 25000,
    cycle: "Monthly",
    start: "2025-09-12",
    end: "2025-10-12",
    nextBilling: "2025-10-12",
    method: "Card",
    status: "Successful",
  },
];

const TYPE_BADGE = {
  New: { bg: "#E0F2FE", color: "#0369A1" },
  Renewal: { bg: "#E6F7EA", color: "#02981D" },
  Upgrade: { bg: "#EEF2FF", color: "#3949AB" },
  Downgrade: { bg: "#FFF7E8", color: "#B26A00" },
};

const emptyPlan = () => ({
  id: "",
  name: "",
  cycle: "Monthly",
  price: "",
  description: "",
  color: "#02981D",
  bg: "#E6F7EA",
  limits: PLAN_LIMIT_FIELDS.reduce(
    (acc, f) => ({ ...acc, [f.key]: 0 }),
    {}
  ),
  unlimited: PLAN_LIMIT_FIELDS.reduce(
    (acc, f) => ({ ...acc, [f.key]: false }),
    {}
  ),
  features: PLAN_FEATURE_FIELDS.reduce(
    (acc, f) => ({ ...acc, [f.key]: false }),
    {}
  ),
});

const SubscriptionManagement = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState(0);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyPlan());

  // Subscription transaction filters
  const [statusFilter, setStatusFilter] = useState("all");
  const [cycleFilter, setCycleFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  const totals = useMemo(() => {
    const subRevenue = SUBSCRIPTION_PLANS.reduce(
      (a, p) => a + p.revenueMTD,
      0
    );
    return {
      plans: SUBSCRIPTION_PLANS.length,
      subscribers: SUBSCRIPTION_PLANS.reduce(
        (a, p) => a + p.activeSubscribers,
        0
      ),
      revenueMTD: subRevenue,
      mrr: subRevenue,
      failedRenewals: SUB_TRANSACTIONS.filter(
        (t) => t.type === "Renewal" && t.status === "Failed"
      ).reduce((a, t) => a + t.amount, 0),
      failedCount: SUB_TRANSACTIONS.filter(
        (t) => t.type === "Renewal" && t.status === "Failed"
      ).length,
    };
  }, []);

  const filteredSubTrx = useMemo(() => {
    return SUB_TRANSACTIONS.filter((t) => {
      const matchStatus =
        statusFilter === "all" ? true : t.status === statusFilter;
      const matchCycle =
        cycleFilter === "all" ? true : t.cycle === cycleFilter;
      const matchType = typeFilter === "all" ? true : t.type === typeFilter;
      return matchStatus && matchCycle && matchType;
    });
  }, [statusFilter, cycleFilter, typeFilter]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyPlan());
    setOpen(true);
  };

  const openEdit = (plan) => {
    setEditing(plan);
    setForm({
      ...emptyPlan(),
      ...plan,
      limits: { ...plan.limits },
      unlimited: PLAN_LIMIT_FIELDS.reduce(
        (acc, f) => ({ ...acc, [f.key]: plan.limits[f.key] === null }),
        {}
      ),
      features: { ...plan.features },
    });
    setOpen(true);
  };

  const close = () => {
    setOpen(false);
    setEditing(null);
    setForm(emptyPlan());
  };

  const setLimit = (key, value) =>
    setForm((f) => ({ ...f, limits: { ...f.limits, [key]: value } }));

  const setUnlimited = (key, on) =>
    setForm((f) => ({
      ...f,
      unlimited: { ...f.unlimited, [key]: on },
      limits: { ...f.limits, [key]: on ? null : 0 },
    }));

  const toggleFeature = (key) =>
    setForm((f) => ({
      ...f,
      features: { ...f.features, [key]: !f.features[key] },
    }));

  const handleSubmit = (e) => {
    e.preventDefault();
    close();
  };

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-[20px] md:text-[22px] font-semibold text-general">
            Subscription Management
          </h1>
          <p className="text-[13px] text-primary_grey_2 mt-1">
            Create plans, control limits and features, and monitor recurring
            revenue.
          </p>
        </div>
        <Button
          onClick={openCreate}
          variant="contained"
          startIcon={<AddIcon />}
          sx={{
            textTransform: "none",
            background: "#02981D",
            boxShadow: "none",
            "&:hover": { background: "#017a17" },
          }}
        >
          Create Plan
        </Button>
      </div>

      {/* Stats */}
      <Grid container spacing={2}>
        <Grid item xs={6} md={3}>
          <StatCard
            icon={<MrrIcon fontSize="small" />}
            color="#02981D"
            bg="#E6F7EA"
            label="Monthly Recurring Revenue"
            value={<FormattedPrice amount={totals.mrr} />}
            subtitle="MRR (current month)"
          />
        </Grid>
        <Grid item xs={6} md={3}>
          <StatCard
            icon={<PeopleIcon fontSize="small" />}
            color="#3949AB"
            bg="#EEF2FF"
            label="Active Subscriptions"
            value={totals.subscribers.toLocaleString()}
            subtitle="Across all plans"
          />
        </Grid>
        <Grid item xs={6} md={3}>
          <StatCard
            icon={<PaidIcon fontSize="small" />}
            color="#B26A00"
            bg="#FFF7E8"
            label="Total Subscription Revenue"
            value={<FormattedPrice amount={totals.revenueMTD} />}
            subtitle="MTD"
          />
        </Grid>
        <Grid item xs={6} md={3}>
          <StatCard
            icon={<FailedIcon fontSize="small" />}
            color="#DC3545"
            bg="#FDECEC"
            label="Failed Renewals"
            value={
              <span>
                <FormattedPrice amount={totals.failedRenewals} />
                <span className="text-[12px] text-primary_grey_2 font-normal ml-1">
                  · {totals.failedCount}
                </span>
              </span>
            }
            subtitle="Needs follow-up"
          />
        </Grid>
      </Grid>

      {/* Tabs */}
      <Card
        sx={{
          borderRadius: "14px",
          boxShadow: "0 1px 3px rgba(16,24,40,.06)",
          border: "1px solid #EFEFEF",
        }}
      >
        <CardContent sx={{ p: { xs: 2, md: 3 } }}>
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
              <Tab label="Plans" />
              <Tab label="Subscribers" />
              <Tab label="Subscription Transactions" />
            </Tabs>
          </Box>

          {tab === 0 && (
            <Grid container spacing={2}>
              {SUBSCRIPTION_PLANS.map((p) => (
                <Grid item xs={12} sm={6} lg={3} key={p.id}>
                  <PlanCard plan={p} onEdit={openEdit} />
                </Grid>
              ))}
            </Grid>
          )}

          {tab === 1 && (
            <div className="w-full overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[12px] uppercase tracking-wide text-primary_grey_2 border-b border-[#EFEFEF]">
                    <th className="py-3 px-3">User</th>
                    <th className="py-3 px-3">Plan</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3">Started</th>
                    <th className="py-3 px-3">Next Billing</th>
                    <th className="py-3 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {SAMPLE_USERS.map((u) => {
                    const plan = findPlan(u.plan);
                    const statusMap = {
                      active: { bg: "#E6F7EA", color: "#02981D" },
                      trial: { bg: "#FFF7E8", color: "#B26A00" },
                      expired: { bg: "#FDECEC", color: "#DC3545" },
                    };
                    const s = statusMap[u.planStatus] || {
                      bg: "#F5F5F5",
                      color: "#5E5E5E",
                    };
                    return (
                      <tr
                        key={u.id}
                        className="border-b border-[#F5F5F5] hover:bg-[#FAFAFA] cursor-pointer"
                        onClick={() => navigate(`/users/${u.id}`)}
                      >
                        <td className="py-4 px-3">
                          <p className="text-[13px] font-medium text-general">
                            {u.name}
                          </p>
                          <p className="text-[12px] text-primary_grey_2">
                            {u.email}
                          </p>
                        </td>
                        <td className="py-4 px-3">
                          <span
                            className="text-[12px] font-semibold px-2 py-1 rounded-md"
                            style={{
                              background: plan?.bg,
                              color: plan?.color,
                            }}
                          >
                            {plan?.name}
                          </span>
                        </td>
                        <td className="py-4 px-3">
                          <span
                            className="text-[12px] font-medium px-3 py-1 rounded-full capitalize"
                            style={{ background: s.bg, color: s.color }}
                          >
                            {u.planStatus}
                          </span>
                        </td>
                        <td className="py-4 px-3 text-[12px] text-primary_grey_2">
                          {u.startDate}
                        </td>
                        <td className="py-4 px-3 text-[12px] text-general">
                          {u.nextBilling}
                        </td>
                        <td className="py-4 px-3 text-right">
                          <ChevronRightIcon sx={{ color: "#5E5E5E" }} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {tab === 2 && (
            <>
              {/* Filters */}
              <div className="flex flex-wrap gap-2 mb-4">
                <Select
                  size="small"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  sx={{ minWidth: 140 }}
                >
                  <MenuItem value="all">All Status</MenuItem>
                  <MenuItem value="Successful">Successful</MenuItem>
                  <MenuItem value="Failed">Failed</MenuItem>
                  <MenuItem value="Pending">Pending</MenuItem>
                </Select>
                <Select
                  size="small"
                  value={cycleFilter}
                  onChange={(e) => setCycleFilter(e.target.value)}
                  sx={{ minWidth: 150 }}
                >
                  <MenuItem value="all">All Cycles</MenuItem>
                  <MenuItem value="Monthly">Monthly</MenuItem>
                  <MenuItem value="Quarterly">Quarterly</MenuItem>
                  <MenuItem value="Bi-Annual">Bi-Annual</MenuItem>
                  <MenuItem value="Annual">Annual</MenuItem>
                  <MenuItem value="14-day Trial">14-day Trial</MenuItem>
                </Select>
                <Select
                  size="small"
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  sx={{ minWidth: 150 }}
                >
                  <MenuItem value="all">All Types</MenuItem>
                  <MenuItem value="New">New Subscription</MenuItem>
                  <MenuItem value="Renewal">Renewal</MenuItem>
                  <MenuItem value="Upgrade">Upgrade</MenuItem>
                  <MenuItem value="Downgrade">Downgrade</MenuItem>
                </Select>
              </div>

              <div className="w-full overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-[12px] uppercase tracking-wide text-primary_grey_2 border-b border-[#EFEFEF]">
                      <th className="py-3 px-3">Reference</th>
                      <th className="py-3 px-3">User / Business</th>
                      <th className="py-3 px-3">Plan</th>
                      <th className="py-3 px-3">Type</th>
                      <th className="py-3 px-3">Amount</th>
                      <th className="py-3 px-3">Cycle</th>
                      <th className="py-3 px-3">Start</th>
                      <th className="py-3 px-3">End</th>
                      <th className="py-3 px-3">Next Billing</th>
                      <th className="py-3 px-3">Method</th>
                      <th className="py-3 px-3">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSubTrx.length === 0 ? (
                      <tr>
                        <td
                          colSpan={11}
                          className="py-10 text-center text-primary_grey_2"
                        >
                          No subscription transactions match the filters.
                        </td>
                      </tr>
                    ) : (
                      filteredSubTrx.map((t) => {
                        const plan = findPlan(t.plan);
                        const typeBadge = TYPE_BADGE[t.type] || {
                          bg: "#F5F5F5",
                          color: "#5E5E5E",
                        };
                        return (
                          <tr
                            key={t.id}
                            className="border-b border-[#F5F5F5] hover:bg-[#FAFAFA]"
                          >
                            <td className="py-4 px-3 text-[13px] font-medium text-general">
                              {t.id}
                            </td>
                            <td className="py-4 px-3 text-[13px] text-general">
                              {t.user}
                            </td>
                            <td className="py-4 px-3">
                              <span
                                className="text-[12px] font-semibold px-2 py-1 rounded-md"
                                style={{
                                  background: plan?.bg,
                                  color: plan?.color,
                                }}
                              >
                                {plan?.name}
                              </span>
                            </td>
                            <td className="py-4 px-3">
                              <span
                                className="text-[12px] font-medium px-2 py-1 rounded-md"
                                style={{
                                  background: typeBadge.bg,
                                  color: typeBadge.color,
                                }}
                              >
                                {t.type}
                              </span>
                            </td>
                            <td className="py-4 px-3 text-[13px] text-general">
                              <FormattedPrice amount={t.amount} />
                            </td>
                            <td className="py-4 px-3 text-[12px] text-primary_grey_2">
                              {t.cycle}
                            </td>
                            <td className="py-4 px-3 text-[12px] text-primary_grey_2">
                              {t.start}
                            </td>
                            <td className="py-4 px-3 text-[12px] text-primary_grey_2">
                              {t.end}
                            </td>
                            <td className="py-4 px-3 text-[12px] text-general">
                              {t.nextBilling}
                            </td>
                            <td className="py-4 px-3 text-[12px] text-general">
                              {t.method}
                            </td>
                            <td className="py-4 px-3">
                              <span
                                className="text-[12px] font-medium px-3 py-1 rounded-full"
                                style={{
                                  background:
                                    t.status === "Successful"
                                      ? "#E6F7EA"
                                      : t.status === "Failed"
                                      ? "#FDECEC"
                                      : "#FFF7E8",
                                  color:
                                    t.status === "Successful"
                                      ? "#02981D"
                                      : t.status === "Failed"
                                      ? "#DC3545"
                                      : "#B26A00",
                                }}
                              >
                                {t.status}
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Create / edit plan modal */}
      <CustomModal open={open} closeModal={close} style="w-[95%] md:w-3/5 lg:w-1/2">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <p className="text-[18px] font-semibold text-general">
              {editing ? `Edit ${editing.name} Plan` : "Create New Plan"}
            </p>
            <ClearIcon
              onClick={close}
              sx={{ color: "#1E1E1E", cursor: "pointer" }}
            />
          </div>

          {/* Basic */}
          <div className="border border-[#EFEFEF] rounded-xl p-4">
            <p className="text-[12px] uppercase tracking-wide text-primary_grey_2 mb-3">
              Plan Setup
            </p>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={8}>
                <TextField
                  fullWidth
                  size="small"
                  label="Plan Name"
                  value={form.name}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, name: e.target.value }))
                  }
                  required
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth size="small">
                  <InputLabel>Billing Cycle</InputLabel>
                  <Select
                    label="Billing Cycle"
                    value={form.cycle}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, cycle: e.target.value }))
                    }
                  >
                    {BILLING_CYCLES.map((c) => (
                      <MenuItem key={c} value={c}>
                        {c}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Price"
                  type="number"
                  value={form.price}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, price: e.target.value }))
                  }
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">₦</InputAdornment>
                    ),
                  }}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Plan ID (slug)"
                  placeholder="e.g. syncpro"
                  value={form.id}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      id: e.target.value
                        .toLowerCase()
                        .replace(/\s+/g, "-"),
                    }))
                  }
                  required
                  disabled={!!editing}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  size="small"
                  label="Description"
                  multiline
                  minRows={2}
                  value={form.description}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, description: e.target.value }))
                  }
                />
              </Grid>
            </Grid>
          </div>

          {/* Limits */}
          <div className="border border-[#EFEFEF] rounded-xl p-4">
            <p className="text-[12px] uppercase tracking-wide text-primary_grey_2 mb-3">
              Usage Limits
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {PLAN_LIMIT_FIELDS.map((f) => (
                <div
                  key={f.key}
                  className="border border-[#EFEFEF] rounded-lg p-3"
                >
                  <p className="text-[13px] font-medium text-general mb-2">
                    {f.label}
                  </p>
                  <div className="flex items-center gap-2">
                    <TextField
                      type="number"
                      size="small"
                      fullWidth
                      value={
                        form.unlimited?.[f.key]
                          ? ""
                          : form.limits?.[f.key] ?? 0
                      }
                      onChange={(e) =>
                        setLimit(f.key, Number(e.target.value))
                      }
                      disabled={form.unlimited?.[f.key]}
                      placeholder={form.unlimited?.[f.key] ? "Unlimited" : ""}
                    />
                    <label className="flex items-center gap-1 text-[12px] text-primary_grey_2 whitespace-nowrap select-none">
                      <Switch
                        size="small"
                        checked={!!form.unlimited?.[f.key]}
                        onChange={(e) =>
                          setUnlimited(f.key, e.target.checked)
                        }
                        sx={{
                          "& .MuiSwitch-switchBase.Mui-checked": {
                            color: "#02981D",
                          },
                          "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track":
                            { backgroundColor: "#02981D" },
                        }}
                      />
                      <InfinityIcon sx={{ fontSize: 14 }} />
                      Unlimited
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Features */}
          <div className="border border-[#EFEFEF] rounded-xl p-4">
            <p className="text-[12px] uppercase tracking-wide text-primary_grey_2 mb-3">
              Features / Access Control
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-1">
              {PLAN_FEATURE_FIELDS.map((f) => (
                <label
                  key={f.key}
                  className="flex items-center justify-between py-1.5 pr-3 cursor-pointer"
                >
                  <span className="text-[13px] text-general">{f.label}</span>
                  <Switch
                    checked={!!form.features?.[f.key]}
                    onChange={() => toggleFeature(f.key)}
                    sx={{
                      "& .MuiSwitch-switchBase.Mui-checked": {
                        color: "#02981D",
                      },
                      "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track":
                        { backgroundColor: "#02981D" },
                    }}
                  />
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-2">
            {editing && (
              <Button
                type="button"
                startIcon={<DeleteIcon />}
                sx={{
                  textTransform: "none",
                  color: "#DC3545",
                  mr: "auto",
                  "&:hover": { background: "#FDECEC" },
                }}
              >
                Delete Plan
              </Button>
            )}
            <Button
              type="button"
              onClick={close}
              sx={{
                textTransform: "none",
                color: "#5E5E5E",
                "&:hover": { background: "#F5F5F5" },
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              sx={{
                textTransform: "none",
                background: "#02981D",
                boxShadow: "none",
                "&:hover": { background: "#017a17" },
              }}
            >
              {editing ? "Save Changes" : "Create Plan"}
            </Button>
          </div>
        </form>
      </CustomModal>
    </div>
  );
};

export default SubscriptionManagement;
