import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ToastContainer, toast } from "react-toastify";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
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
  TrendingUpOutlined as MrrIcon,
  ReportProblemOutlined as FailedIcon,
} from "@mui/icons-material";
import CustomModal from "../../components/CustomModal";
import FormattedPrice from "../../utils/FormattedPrice";
import {
  PLAN_LIMIT_FIELDS,
  PLAN_FEATURE_FIELDS,
  PLAN_PRICE_FIELDS,
} from "../users/userData";
import {
  plansUrl,
  singlePlanUrl,
  merchantSubscriptionsUrl,
  transactionsSubscriptionDataUrl,
} from "../../api/endpoint";
import useFetchData from "../../hooks/useFetchData";
import { AuthAxios } from "../../helpers/axiosInstance";
import CustomPagination from "../../components/CustomPagination";
import { useDateContext } from "../../utils/DateContext";

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
  const enabledFeatures = PLAN_FEATURE_FIELDS.filter((f) => plan?.[f.key]);
  // Pick a display price: prefer monthly, fall back to first non-zero
  const displayPrice =
    plan?.monthly || plan?.quarterly || plan?.biannually || plan?.annually || 0;
  const displayCycle = plan?.monthly
    ? "/ month"
    : plan?.quarterly
    ? "/ quarter"
    : plan?.biannually
    ? "/ bi-annual"
    : plan?.annually
    ? "/ annual"
    : "";
  return (
    <Card
      sx={{
        borderRadius: "14px",
        boxShadow: "0 1px 3px rgba(16,24,40,.06)",
        border: "1px solid #EFEFEF",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        opacity: plan?.is_active === false ? 0.6 : 1,
      }}
    >
      <CardContent sx={{ p: 3, flex: 1, display: "flex", flexDirection: "column" }}>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-md flex items-center justify-center bg-[#F6FFF8] text-[#02981D]">
              <PlanIcon fontSize="small" />
            </div>
            <div>
              <p className="text-[16px] font-semibold text-general">
                {plan?.name || "—"}
              </p>
              {plan?.is_active === false && (
                <p className="text-[11px] text-[#DC3545] font-medium">
                  Inactive
                </p>
              )}
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
          <FormattedPrice amount={displayPrice} />
          <span className="text-[12px] text-primary_grey_2 font-normal ml-1">
            {displayCycle}
          </span>
        </p>
        {plan?.description && (
          <p className="text-[12px] text-primary_grey_2 mt-1 leading-relaxed">
            {plan.description}
          </p>
        )}

        {/* All 4 prices */}
        <div className="grid grid-cols-2 gap-x-3 gap-y-1 mt-3 text-[11px]">
          {PLAN_PRICE_FIELDS.map((p) => (
            <div key={p.key} className="flex justify-between">
              <span className="text-primary_grey_2">{p.label}</span>
              <span className="text-general font-medium">
                {plan?.[p.key] ? (
                  <FormattedPrice amount={plan[p.key]} />
                ) : (
                  "—"
                )}
              </span>
            </div>
          ))}
        </div>

        <Divider sx={{ my: 2 }} />

        {/* Limits */}
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
              <span className="text-general font-semibold">
                {Number(plan?.[f.key] || 0).toLocaleString()}
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
            const on = !!plan?.[f.key];
            return (
              <span
                key={f.key}
                className="inline-flex items-center gap-1 text-[11px] px-2 py-1 rounded-md"
                style={{
                  background: on ? "#E6F7EA" : "#F5F5F5",
                  color: on ? "#02981D" : "#9CA3AF",
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
      </CardContent>
    </Card>
  );
};


const TYPE_BADGE = {
  New: { bg: "#E0F2FE", color: "#0369A1" },
  Renewal: { bg: "#E6F7EA", color: "#02981D" },
  Upgrade: { bg: "#EEF2FF", color: "#3949AB" },
  Downgrade: { bg: "#FFF7E8", color: "#B26A00" },
};

// Empty plan matches API's PlanRequest shape exactly
const emptyPlan = () => ({
  id: null,
  name: "",
  description: "",
  ...PLAN_PRICE_FIELDS.reduce((acc, f) => ({ ...acc, [f.key]: 0 }), {}),
  ...PLAN_LIMIT_FIELDS.reduce((acc, f) => ({ ...acc, [f.key]: 0 }), {}),
  ...PLAN_FEATURE_FIELDS.reduce((acc, f) => ({ ...acc, [f.key]: false }), {}),
  is_active: true,
});

// Pass-through map — the API already uses snake_case field names we render
const mapApiPlan = (p) => {
  if (!p) return null;
  return { ...emptyPlan(), ...p, id: p?.id };
};

const mapApiSubTrx = (t) => ({
  id: t?.id || t?.reference || "—",
  user: t?.user_name || t?.merchant_name || t?.user || "—",
  plan: (t?.plan_name || t?.plan || "").toString(),
  type: t?.transaction_type || t?.type || "Renewal",
  amount: Number(t?.amount || 0),
  cycle: t?.billing_cycle || t?.cycle || "Monthly",
  start: t?.start_date || t?.created_at || "—",
  end: t?.end_date || "—",
  nextBilling: t?.next_billing_date || "—",
  method: t?.payment_method || t?.method || "—",
  status: t?.status || "Pending",
});

const SubscriptionManagement = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { selectedDates } = useDateContext();
  const [tab, setTab] = useState(0);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyPlan());

  // Subscription transaction filters
  const [statusFilter, setStatusFilter] = useState("all");
  const [cycleFilter, setCycleFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [subsPage, setSubsPage] = useState(1);
  const [subTrxPage, setSubTrxPage] = useState(1);
  const [subsSearch, setSubsSearch] = useState("");
  const [rowsPerPage] = useState(50);

  // ─── API fetches ───
  const plansApi = plansUrl();
  const { data: plansData, isLoading: plansLoading } = useFetchData(
    ["fetchPlans", plansApi],
    plansApi
  );

  const subsApi = merchantSubscriptionsUrl(
    subsPage,
    rowsPerPage,
    subsSearch,
    selectedDates
  );
  const { data: subsData, isLoading: subsLoading } = useFetchData(
    [
      "fetchMerchantSubs",
      subsApi,
      subsPage,
      subsSearch,
      selectedDates?.startDate,
      selectedDates?.endDate,
    ],
    subsApi
  );

  const subTrxApi = transactionsSubscriptionDataUrl(
    subTrxPage,
    rowsPerPage,
    "",
    typeFilter === "all" ? "" : typeFilter,
    selectedDates
  );
  const { data: subTrxData, isLoading: subTrxLoading } = useFetchData(
    [
      "fetchSubTrx",
      subTrxApi,
      typeFilter,
      subTrxPage,
      selectedDates?.startDate,
      selectedDates?.endDate,
    ],
    subTrxApi
  );

  const plans = useMemo(() => {
    const raw = Array.isArray(plansData?.data)
      ? plansData.data
      : Array.isArray(plansData?.results)
      ? plansData.results
      : Array.isArray(plansData)
      ? plansData
      : [];
    return raw.map(mapApiPlan).filter(Boolean);
  }, [plansData]);

  const subscribers = useMemo(() => {
    return Array.isArray(subsData?.data)
      ? subsData.data
      : Array.isArray(subsData?.results)
      ? subsData.results
      : Array.isArray(subsData)
      ? subsData
      : [];
  }, [subsData]);

  const subTrx = useMemo(() => {
    const raw = Array.isArray(subTrxData?.data)
      ? subTrxData.data
      : Array.isArray(subTrxData?.results)
      ? subTrxData.results
      : Array.isArray(subTrxData)
      ? subTrxData
      : [];
    return raw.map(mapApiSubTrx);
  }, [subTrxData]);

  // ─── Mutations ───
  const createPlan = useMutation({
    mutationFn: (payload) => AuthAxios.post(plansUrl(), payload),
    onSuccess: () => {
      toast.success("Plan created");
      queryClient.invalidateQueries({ queryKey: ["fetchPlans"] });
      close();
    },
    onError: (err) =>
      toast.error(err?.response?.data?.message || "Failed to create plan"),
  });

  const updatePlan = useMutation({
    mutationFn: ({ id, payload }) =>
      AuthAxios.patch(singlePlanUrl(id), payload),
    onSuccess: () => {
      toast.success("Plan updated");
      queryClient.invalidateQueries({ queryKey: ["fetchPlans"] });
      close();
    },
    onError: (err) =>
      toast.error(err?.response?.data?.message || "Failed to update plan"),
  });

  const deletePlan = useMutation({
    mutationFn: (id) => AuthAxios.delete(singlePlanUrl(id)),
    onSuccess: () => {
      toast.success("Plan deleted");
      queryClient.invalidateQueries({ queryKey: ["fetchPlans"] });
      close();
    },
    onError: (err) =>
      toast.error(err?.response?.data?.message || "Failed to delete plan"),
  });

  // Prefer the API's `summary` block; fall back to derivation from rows
  const totals = useMemo(() => {
    const s = subTrxData?.summary || {};
    const fallbackRevenue = subTrx
      .filter((t) => t.status === "Successful")
      .reduce((a, t) => a + (t.amount || 0), 0);
    const failedTrx = subTrx.filter(
      (t) => t.type === "Renewal" && t.status === "Failed"
    );
    return {
      plans: plans.length,
      subscribers: Number(
        s.active_subscriptions ??
          subsData?.total ??
          subsData?.count ??
          (Array.isArray(subscribers) ? subscribers.length : 0)
      ),
      revenueMTD: Number(s.total_revenue ?? fallbackRevenue),
      mrr: Number(s.mrr ?? fallbackRevenue),
      // API gives `failed_renewals` as a COUNT, not amount
      failedCount: Number(s.failed_renewals ?? failedTrx.length),
      failedRenewals:
        s.failed_renewals !== undefined
          ? null // API only gives count, no ₦ amount
          : failedTrx.reduce((a, t) => a + (t.amount || 0), 0),
    };
  }, [plans, subTrx, subTrxData, subsData, subscribers]);

  const filteredSubTrx = useMemo(() => {
    return subTrx.filter((t) => {
      const matchStatus =
        statusFilter === "all" ? true : t.status === statusFilter;
      const matchCycle =
        cycleFilter === "all" ? true : t.cycle === cycleFilter;
      const matchType = typeFilter === "all" ? true : t.type === typeFilter;
      return matchStatus && matchCycle && matchType;
    });
  }, [subTrx, statusFilter, cycleFilter, typeFilter]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyPlan());
    setOpen(true);
  };

  const openEdit = (plan) => {
    setEditing(plan);
    setForm({ ...emptyPlan(), ...plan });
    setOpen(true);
  };

  const close = () => {
    setOpen(false);
    setEditing(null);
    setForm(emptyPlan());
  };

  const setField = (key, value) =>
    setForm((f) => ({ ...f, [key]: value }));

  // Build the API payload — flat, matches PlanRequest exactly
  const buildPayload = () => {
    const payload = {
      name: form.name,
      description: form.description || "",
      is_active: !!form.is_active,
    };
    PLAN_PRICE_FIELDS.forEach((p) => {
      payload[p.key] = Number(form[p.key]) || 0;
    });
    PLAN_LIMIT_FIELDS.forEach((p) => {
      payload[p.key] = Number(form[p.key]) || 0;
    });
    PLAN_FEATURE_FIELDS.forEach((p) => {
      payload[p.key] = !!form[p.key];
    });
    return payload;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editing) {
      updatePlan.mutate({ id: editing.id, payload: buildPayload() });
    } else {
      createPlan.mutate(buildPayload());
    }
  };

  const handleDelete = () => {
    if (!editing) return;
    if (window.confirm(`Delete plan "${editing.name}"? This cannot be undone.`))
      deletePlan.mutate(editing.id);
  };

  const isMutating =
    createPlan.isPending || updatePlan.isPending || deletePlan.isPending;

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
              totals.failedRenewals !== null ? (
                <span>
                  <FormattedPrice amount={totals.failedRenewals} />
                  <span className="text-[12px] text-primary_grey_2 font-normal ml-1">
                    · {totals.failedCount}
                  </span>
                </span>
              ) : (
                totals.failedCount.toLocaleString()
              )
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
            <>
              {plansLoading ? (
                <div className="py-10 flex justify-center">
                  <CircularProgress sx={{ color: "#02981D" }} />
                </div>
              ) : plans.length === 0 ? (
                <p className="py-10 text-center text-primary_grey_2 text-[13px]">
                  No plans yet. Click "Create Plan" to add the first one.
                </p>
              ) : (
                <Grid container spacing={2}>
                  {plans.map((p) => (
                    <Grid item xs={12} sm={6} lg={3} key={p.id}>
                      <PlanCard plan={p} onEdit={openEdit} />
                    </Grid>
                  ))}
                </Grid>
              )}
            </>
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
                  {subsLoading ? (
                    <tr>
                      <td colSpan={6} className="py-10 text-center">
                        <CircularProgress sx={{ color: "#02981D" }} />
                      </td>
                    </tr>
                  ) : subscribers.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="py-10 text-center text-primary_grey_2"
                      >
                        No subscribers yet.
                      </td>
                    </tr>
                  ) : (
                    subscribers.map((u) => {
                      const planName =
                        u?.subscription || u?.plan || u?.subscription_plan ||
                        "—";
                      const planStatus =
                        u?.subscription_status ||
                        (u?.subscription_end_date &&
                        new Date(u.subscription_end_date) < new Date()
                          ? "expired"
                          : "active");
                      const statusMap = {
                        active: { bg: "#E6F7EA", color: "#02981D" },
                        trial: { bg: "#FFF7E8", color: "#B26A00" },
                        expired: { bg: "#FDECEC", color: "#DC3545" },
                      };
                      const s = statusMap[planStatus] || {
                        bg: "#F5F5F5",
                        color: "#5E5E5E",
                      };
                      const displayName =
                        u?.name ||
                        [u?.firstname, u?.lastname]
                          .filter(Boolean)
                          .join(" ") ||
                        u?.business?.[0]?.name ||
                        "—";
                      return (
                        <tr
                          key={u?.id}
                          className="border-b border-[#F5F5F5] hover:bg-[#FAFAFA] cursor-pointer"
                          onClick={() => navigate(`/users/${u?.id}`)}
                        >
                          <td className="py-4 px-3">
                            <p className="text-[13px] font-medium text-general">
                              {displayName}
                            </p>
                            <p className="text-[12px] text-primary_grey_2">
                              {u?.email}
                            </p>
                          </td>
                          <td className="py-4 px-3">
                            <span
                              className="text-[12px] font-semibold px-2 py-1 rounded-md"
                              style={{
                                background: "#F6FFF8",
                                color: "#02981D",
                              }}
                            >
                              {planName}
                            </span>
                          </td>
                          <td className="py-4 px-3">
                            <span
                              className="text-[12px] font-medium px-3 py-1 rounded-full capitalize"
                              style={{ background: s.bg, color: s.color }}
                            >
                              {planStatus}
                            </span>
                          </td>
                          <td className="py-4 px-3 text-[12px] text-primary_grey_2">
                            {u?.subscription_start_date || "—"}
                          </td>
                          <td className="py-4 px-3 text-[12px] text-general">
                            {u?.next_billing_date ||
                              u?.subscription_end_date ||
                              "—"}
                          </td>
                          <td className="py-4 px-3 text-right">
                            <ChevronRightIcon sx={{ color: "#5E5E5E" }} />
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>

              {/* Subscribers pagination */}
              {!subsLoading && subscribers.length > 0 && (
                <CustomPagination
                  currentPage={subsPage}
                  totalPages={
                    subsData?.total_pages ||
                    subsData?.pages ||
                    Math.max(
                      1,
                      Math.ceil(
                        (subsData?.total || subscribers.length) / rowsPerPage
                      )
                    )
                  }
                  onPageChange={setSubsPage}
                />
              )}
            </div>
          )}

          {tab === 2 && (
            <>
              {/* Filters */}
              <div className="flex flex-wrap gap-2 mb-4">
                <Select
                  size="small"
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setSubTrxPage(1);
                  }}
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
                  onChange={(e) => {
                    setCycleFilter(e.target.value);
                    setSubTrxPage(1);
                  }}
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
                  onChange={(e) => {
                    setTypeFilter(e.target.value);
                    setSubTrxPage(1);
                  }}
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
                    {subTrxLoading ? (
                      <tr>
                        <td colSpan={11} className="py-10 text-center">
                          <CircularProgress sx={{ color: "#02981D" }} />
                        </td>
                      </tr>
                    ) : filteredSubTrx.length === 0 ? (
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
                                  background: "#F6FFF8",
                                  color: "#02981D",
                                }}
                              >
                                {t.plan || "—"}
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

              {/* Sub-trx pagination */}
              {!subTrxLoading && filteredSubTrx.length > 0 && (
                <CustomPagination
                  currentPage={subTrxPage}
                  totalPages={
                    subTrxData?.total_pages ||
                    subTrxData?.pages ||
                    Math.max(
                      1,
                      Math.ceil(
                        (subTrxData?.total_records ||
                          subTrxData?.total ||
                          filteredSubTrx.length) / rowsPerPage
                      )
                    )
                  }
                  onPageChange={setSubTrxPage}
                />
              )}
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
                  onChange={(e) => setField("name", e.target.value)}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <label className="flex items-center gap-2 h-full pl-2 select-none cursor-pointer">
                  <Switch
                    checked={!!form.is_active}
                    onChange={(e) => setField("is_active", e.target.checked)}
                    sx={{
                      "& .MuiSwitch-switchBase.Mui-checked": {
                        color: "#02981D",
                      },
                      "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track":
                        { backgroundColor: "#02981D" },
                    }}
                  />
                  <span className="text-[13px] text-general">
                    Plan is active
                  </span>
                </label>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  size="small"
                  label="Description"
                  multiline
                  minRows={2}
                  value={form.description}
                  onChange={(e) => setField("description", e.target.value)}
                />
              </Grid>
            </Grid>
          </div>

          {/* Pricing per billing cycle */}
          <div className="border border-[#EFEFEF] rounded-xl p-4">
            <p className="text-[12px] uppercase tracking-wide text-primary_grey_2 mb-3">
              Pricing (₦)
            </p>
            <Grid container spacing={2}>
              {PLAN_PRICE_FIELDS.map((p) => (
                <Grid item xs={6} sm={3} key={p.key}>
                  <TextField
                    fullWidth
                    size="small"
                    type="number"
                    label={p.label}
                    value={form[p.key] ?? 0}
                    onChange={(e) =>
                      setField(p.key, Number(e.target.value) || 0)
                    }
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">₦</InputAdornment>
                      ),
                    }}
                  />
                </Grid>
              ))}
            </Grid>
            <p className="text-[11px] text-primary_grey_2 mt-2">
              Set a price for each cycle you want to offer — leave a cycle at 0
              to disable it for this plan.
            </p>
          </div>

          {/* Limits */}
          <div className="border border-[#EFEFEF] rounded-xl p-4">
            <p className="text-[12px] uppercase tracking-wide text-primary_grey_2 mb-3">
              Usage Limits
            </p>
            <Grid container spacing={2}>
              {PLAN_LIMIT_FIELDS.map((f) => (
                <Grid item xs={12} sm={6} key={f.key}>
                  <TextField
                    type="number"
                    size="small"
                    fullWidth
                    label={f.label}
                    value={form[f.key] ?? 0}
                    onChange={(e) =>
                      setField(f.key, Number(e.target.value) || 0)
                    }
                  />
                </Grid>
              ))}
            </Grid>
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
                    checked={!!form[f.key]}
                    onChange={(e) => setField(f.key, e.target.checked)}
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
                onClick={handleDelete}
                disabled={isMutating}
                startIcon={<DeleteIcon />}
                sx={{
                  textTransform: "none",
                  color: "#DC3545",
                  mr: "auto",
                  "&:hover": { background: "#FDECEC" },
                }}
              >
                {deletePlan.isPending ? "Deleting..." : "Delete Plan"}
              </Button>
            )}
            <Button
              type="button"
              onClick={close}
              disabled={isMutating}
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
              disabled={isMutating}
              sx={{
                textTransform: "none",
                background: "#02981D",
                boxShadow: "none",
                "&:hover": { background: "#017a17" },
              }}
            >
              {createPlan.isPending || updatePlan.isPending ? (
                <CircularProgress size="1.2rem" sx={{ color: "#fff" }} />
              ) : editing ? (
                "Save Changes"
              ) : (
                "Create Plan"
              )}
            </Button>
          </div>
        </form>
      </CustomModal>

      <ToastContainer position="top-right" autoClose={4000} />
    </div>
  );
};

export default SubscriptionManagement;
