import { useMemo, useState } from "react";
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
} from "@mui/icons-material";
import CustomModal from "../../components/CustomModal";
import FormattedPrice from "../../utils/FormattedPrice";
import { SUBSCRIPTION_PLANS, SAMPLE_USERS, findPlan } from "../users/userData";

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

const PlanCard = ({ plan, onEdit }) => (
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

      <div className="mt-4 flex flex-col gap-1.5">
        {plan.features.slice(0, 4).map((f, i) => (
          <div key={i} className="flex items-start gap-2">
            <StarIcon sx={{ color: plan.color, fontSize: 14, mt: "2px" }} />
            <span className="text-[12px] text-general">{f}</span>
          </div>
        ))}
      </div>

      <Divider sx={{ my: 2 }} />
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[11px] text-primary_grey_2">Active subscribers</p>
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

const PLAN_PAYMENT_LOG = [
  {
    id: "SP-2241",
    user: "Adaeze Okoro",
    plan: "syncpro",
    amount: 25000,
    date: "2026-04-12 09:00",
    status: "Successful",
    cycle: "Monthly",
  },
  {
    id: "SP-2240",
    user: "Sunde Logistics Ltd",
    plan: "syncpro",
    amount: 25000,
    date: "2026-04-11 14:22",
    status: "Successful",
    cycle: "Monthly",
  },
  {
    id: "SP-2239",
    user: "Ifeanyi Johnson",
    plan: "syncplus",
    amount: 9500,
    date: "2026-04-10 11:11",
    status: "Successful",
    cycle: "Monthly",
  },
  {
    id: "SP-2238",
    user: "Bola Salami",
    plan: "trial",
    amount: 0,
    date: "2026-04-10 09:00",
    status: "Successful",
    cycle: "Trial Activation",
  },
  {
    id: "SP-2237",
    user: "Chinedu Eze",
    plan: "syncplus",
    amount: 9500,
    date: "2026-04-01 09:00",
    status: "Failed",
    cycle: "Monthly",
  },
];

const emptyPlan = {
  id: "",
  name: "",
  cycle: "Monthly",
  price: "",
  description: "",
  features: "",
  color: "#02981D",
  bg: "#E6F7EA",
};

const SubscriptionManagement = () => {
  const [tab, setTab] = useState(0);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyPlan);

  const totals = useMemo(() => {
    return {
      plans: SUBSCRIPTION_PLANS.length,
      subscribers: SUBSCRIPTION_PLANS.reduce(
        (a, p) => a + p.activeSubscribers,
        0
      ),
      revenueMTD: SUBSCRIPTION_PLANS.reduce((a, p) => a + p.revenueMTD, 0),
      paid: SAMPLE_USERS.filter(
        (u) => u.planStatus === "active" && u.plan !== "trial"
      ).length,
    };
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyPlan);
    setOpen(true);
  };

  const openEdit = (plan) => {
    setEditing(plan);
    setForm({
      ...plan,
      features: plan.features.join("\n"),
    });
    setOpen(true);
  };

  const close = () => {
    setOpen(false);
    setEditing(null);
    setForm(emptyPlan);
  };

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
            Create plans, track active subscribers, and monitor billing.
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
            icon={<PlanIcon fontSize="small" />}
            color="#02981D"
            bg="#E6F7EA"
            label="Total Plans"
            value={totals.plans}
            subtitle="Including trial"
          />
        </Grid>
        <Grid item xs={6} md={3}>
          <StatCard
            icon={<PeopleIcon fontSize="small" />}
            color="#3949AB"
            bg="#EEF2FF"
            label="Active Subscribers"
            value={totals.subscribers.toLocaleString()}
            subtitle="Across all plans"
          />
        </Grid>
        <Grid item xs={6} md={3}>
          <StatCard
            icon={<PaidIcon fontSize="small" />}
            color="#B26A00"
            bg="#FFF7E8"
            label="Revenue MTD"
            value={<FormattedPrice amount={totals.revenueMTD} />}
            subtitle="Recurring revenue"
          />
        </Grid>
        <Grid item xs={6} md={3}>
          <StatCard
            icon={<StarIcon fontSize="small" />}
            color="#0369A1"
            bg="#E0F2FE"
            label="Paid Subscribers"
            value={totals.paid}
            subtitle="Excluding trial"
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
              <Tab label="Subscription Payments" />
            </Tabs>
          </Box>

          {tab === 0 && (
            <Grid container spacing={2}>
              {SUBSCRIPTION_PLANS.map((p) => (
                <Grid item xs={12} sm={6} lg={4} key={p.id}>
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
                        onClick={() =>
                          (window.location.href = `/users/${u.id}`)
                        }
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
            <div className="w-full overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[12px] uppercase tracking-wide text-primary_grey_2 border-b border-[#EFEFEF]">
                    <th className="py-3 px-3">Reference</th>
                    <th className="py-3 px-3">User</th>
                    <th className="py-3 px-3">Plan</th>
                    <th className="py-3 px-3">Cycle</th>
                    <th className="py-3 px-3">Amount</th>
                    <th className="py-3 px-3">Date</th>
                    <th className="py-3 px-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {PLAN_PAYMENT_LOG.map((p) => {
                    const plan = findPlan(p.plan);
                    return (
                      <tr
                        key={p.id}
                        className="border-b border-[#F5F5F5] hover:bg-[#FAFAFA]"
                      >
                        <td className="py-4 px-3 text-[13px] font-medium text-general">
                          {p.id}
                        </td>
                        <td className="py-4 px-3 text-[13px] text-general">
                          {p.user}
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
                        <td className="py-4 px-3 text-[12px] text-primary_grey_2">
                          {p.cycle}
                        </td>
                        <td className="py-4 px-3 text-[13px] text-general">
                          <FormattedPrice amount={p.amount} />
                        </td>
                        <td className="py-4 px-3 text-[12px] text-primary_grey_2">
                          {p.date}
                        </td>
                        <td className="py-4 px-3">
                          <span
                            className="text-[12px] font-medium px-3 py-1 rounded-full"
                            style={{
                              background:
                                p.status === "Successful"
                                  ? "#E6F7EA"
                                  : "#FDECEC",
                              color:
                                p.status === "Successful"
                                  ? "#02981D"
                                  : "#DC3545",
                            }}
                          >
                            {p.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create / edit plan modal */}
      <CustomModal open={open} closeModal={close} style="w-[95%] md:w-1/2">
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
                <InputLabel>Cycle</InputLabel>
                <Select
                  label="Cycle"
                  value={form.cycle}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, cycle: e.target.value }))
                  }
                >
                  <MenuItem value="Monthly">Monthly</MenuItem>
                  <MenuItem value="Quarterly">Quarterly</MenuItem>
                  <MenuItem value="Yearly">Yearly</MenuItem>
                  <MenuItem value="14-day Trial">14-day Trial</MenuItem>
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
                    id: e.target.value.toLowerCase().replace(/\s+/g, "-"),
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

            <Grid item xs={12}>
              <TextField
                fullWidth
                size="small"
                label="Features (one per line)"
                multiline
                minRows={4}
                value={form.features}
                onChange={(e) =>
                  setForm((f) => ({ ...f, features: e.target.value }))
                }
              />
            </Grid>
          </Grid>

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
