import { useMemo, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Grid,
  InputAdornment,
  MenuItem,
  Select,
  Tab,
  Tabs,
  TextField,
} from "@mui/material";
import {
  SearchOutlined as SearchIcon,
  LocalShippingOutlined as ShippingIcon,
  DoneAllOutlined as DoneIcon,
  CancelOutlined as CancelIcon,
  PendingActionsOutlined as PendingIcon,
  PaidOutlined as PaidIcon,
  ChevronRightRounded as ChevronRightIcon,
  ClearRounded as ClearIcon,
  PlaceOutlined as PlaceIcon,
  PersonOutlineOutlined as PersonIcon,
  TwoWheelerOutlined as RiderIcon,
  TimelineOutlined as TimelineIcon,
} from "@mui/icons-material";
import CustomModal from "../../components/CustomModal";
import FormattedPrice from "../../utils/FormattedPrice";

const STATUS_FILTERS = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "assigned", label: "Assigned" },
  { key: "picked_up", label: "Picked Up" },
  { key: "in_transit", label: "In Transit" },
  { key: "delivered", label: "Delivered" },
  { key: "failed", label: "Failed" },
];

const STATUS_STYLE = {
  pending: { bg: "#FFF7E8", color: "#B26A00", label: "Pending" },
  assigned: { bg: "#EEF2FF", color: "#3949AB", label: "Assigned" },
  picked_up: { bg: "#FFF1E0", color: "#C2410C", label: "Picked Up" },
  in_transit: { bg: "#E0F2FE", color: "#0369A1", label: "In Transit" },
  delivered: { bg: "#E6F7EA", color: "#02981D", label: "Delivered" },
  failed: { bg: "#FDECEC", color: "#DC3545", label: "Failed" },
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

const SAMPLE_DELIVERIES = [
  {
    id: "ORD-10298",
    sender: "Sunde Logistics Ltd",
    receiver: "Adaeze Okoro",
    rider: "Musa Ibrahim",
    pickup: "12 Allen Ave, Ikeja, Lagos",
    dropoff: "44 Bode Thomas, Surulere, Lagos",
    amount: 4500,
    status: "in_transit",
    created: "2026-04-22 08:14",
    timeline: [
      { label: "Order placed", time: "2026-04-22 08:14", done: true },
      { label: "Assigned to rider", time: "2026-04-22 08:22", done: true },
      { label: "Picked up", time: "2026-04-22 09:01", done: true },
      { label: "In transit", time: "2026-04-22 09:30", done: true },
      { label: "Delivered", time: "—", done: false },
    ],
  },
  {
    id: "ORD-10299",
    sender: "Kano Foods Co.",
    receiver: "Bola Salami",
    rider: "Unassigned",
    pickup: "8 Ahmadu Bello Way, Kano",
    dropoff: "120 Murtala Muhammed Way, Kano",
    amount: 3200,
    status: "pending",
    created: "2026-04-22 08:42",
    timeline: [
      { label: "Order placed", time: "2026-04-22 08:42", done: true },
      { label: "Awaiting assignment", time: "—", done: false },
    ],
  },
  {
    id: "ORD-10300",
    sender: "Lagos Mart Ventures",
    receiver: "Chinedu Eze",
    rider: "Tunde Ade",
    pickup: "5 Awolowo Rd, Ikoyi, Lagos",
    dropoff: "27 Lekki Phase 1, Lagos",
    amount: 6800,
    status: "delivered",
    created: "2026-04-21 14:02",
    timeline: [
      { label: "Order placed", time: "2026-04-21 14:02", done: true },
      { label: "Assigned to rider", time: "2026-04-21 14:07", done: true },
      { label: "Picked up", time: "2026-04-21 14:35", done: true },
      { label: "In transit", time: "2026-04-21 14:40", done: true },
      { label: "Delivered", time: "2026-04-21 15:21", done: true },
    ],
  },
  {
    id: "ORD-10301",
    sender: "Sunde Logistics Ltd",
    receiver: "Ifeanyi Johnson",
    rider: "Sani Garba",
    pickup: "Mile 2, Apapa, Lagos",
    dropoff: "Agege, Lagos",
    amount: 5500,
    status: "failed",
    created: "2026-04-21 09:11",
    timeline: [
      { label: "Order placed", time: "2026-04-21 09:11", done: true },
      { label: "Assigned to rider", time: "2026-04-21 09:25", done: true },
      { label: "Picked up", time: "2026-04-21 09:58", done: true },
      {
        label: "Delivery failed — receiver unreachable",
        time: "2026-04-21 12:42",
        done: true,
      },
    ],
  },
  {
    id: "ORD-10302",
    sender: "Kano Foods Co.",
    receiver: "Faith Adekunle",
    rider: "Ibrahim Yusuf",
    pickup: "Sabon Gari, Kano",
    dropoff: "Tudun Wada, Kano",
    amount: 2800,
    status: "assigned",
    created: "2026-04-22 09:01",
    timeline: [
      { label: "Order placed", time: "2026-04-22 09:01", done: true },
      { label: "Assigned to rider", time: "2026-04-22 09:11", done: true },
      { label: "Awaiting pickup", time: "—", done: false },
    ],
  },
  {
    id: "ORD-10303",
    sender: "Lagos Mart Ventures",
    receiver: "Tobi Olarinde",
    rider: "Emeka Onuoha",
    pickup: "Yaba, Lagos",
    dropoff: "Lekki Phase 2, Lagos",
    amount: 7200,
    status: "picked_up",
    created: "2026-04-22 07:50",
    timeline: [
      { label: "Order placed", time: "2026-04-22 07:50", done: true },
      { label: "Assigned to rider", time: "2026-04-22 08:00", done: true },
      { label: "Picked up", time: "2026-04-22 08:31", done: true },
      { label: "In transit", time: "—", done: false },
    ],
  },
];

const RANGES = [
  { key: "daily", label: "Today" },
  { key: "weekly", label: "This Week" },
  { key: "monthly", label: "This Month" },
];

const LogisticsDashboard = () => {
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [range, setRange] = useState("daily");
  const [selected, setSelected] = useState(null);

  const filtered = useMemo(() => {
    return SAMPLE_DELIVERIES.filter((row) => {
      const matchStatus =
        statusFilter === "all" ? true : row.status === statusFilter;
      const matchSearch = search
        ? [row.id, row.sender, row.receiver, row.rider]
            .join(" ")
            .toLowerCase()
            .includes(search.toLowerCase())
        : true;
      return matchStatus && matchSearch;
    });
  }, [statusFilter, search]);

  const counts = useMemo(() => {
    const total = SAMPLE_DELIVERIES.length;
    const active = SAMPLE_DELIVERIES.filter((d) =>
      ["assigned", "picked_up", "in_transit"].includes(d.status)
    ).length;
    const completed = SAMPLE_DELIVERIES.filter(
      (d) => d.status === "delivered"
    ).length;
    const failed = SAMPLE_DELIVERIES.filter(
      (d) => d.status === "failed"
    ).length;
    const revenue = SAMPLE_DELIVERIES.filter(
      (d) => d.status === "delivered"
    ).reduce((acc, d) => acc + d.amount, 0);
    return { total, active, completed, failed, revenue };
  }, []);

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-[20px] md:text-[22px] font-semibold text-general">
            Logistics Overview
          </h1>
          <p className="text-[13px] text-primary_grey_2 mt-1">
            Track deliveries from order placement to drop-off in real time.
          </p>
        </div>
        <div className="flex gap-2">
          {RANGES.map((r) => {
            const active = range === r.key;
            return (
              <Button
                key={r.key}
                onClick={() => setRange(r.key)}
                sx={{
                  textTransform: "none",
                  fontWeight: 600,
                  border: active ? "1px solid #02981D" : "1px solid #E3E3E3",
                  color: active ? "#02981D" : "#5E5E5E",
                  background: active ? "#F6FFF8" : "#fff",
                  "&:hover": {
                    background: active ? "#F6FFF8" : "#F5F5F5",
                  },
                }}
              >
                {r.label}
              </Button>
            );
          })}
        </div>
      </div>

      {/* Stats */}
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={2.4}>
          <StatCard
            icon={<ShippingIcon fontSize="small" />}
            color="#02981D"
            bg="#E6F7EA"
            label="Total Deliveries"
            value={counts.total}
            subtitle={`This ${
              range === "daily" ? "day" : range === "weekly" ? "week" : "month"
            }`}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <StatCard
            icon={<TimelineIcon fontSize="small" />}
            color="#0369A1"
            bg="#E0F2FE"
            label="Active Deliveries"
            value={counts.active}
            subtitle="In progress"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <StatCard
            icon={<DoneIcon fontSize="small" />}
            color="#02981D"
            bg="#E6F7EA"
            label="Completed"
            value={counts.completed}
            subtitle="Successfully delivered"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <StatCard
            icon={<CancelIcon fontSize="small" />}
            color="#DC3545"
            bg="#FDECEC"
            label="Failed / Cancelled"
            value={counts.failed}
            subtitle="Needs review"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <StatCard
            icon={<PaidIcon fontSize="small" />}
            color="#B26A00"
            bg="#FFF7E8"
            label="Revenue"
            value={<FormattedPrice amount={counts.revenue} />}
            subtitle="From delivered orders"
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
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 mb-4">
            <TextField
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search Order ID, vendor, receiver or rider"
              size="small"
              fullWidth
              sx={{ maxWidth: { lg: 420 } }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: "#757575" }} />
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
                      "&:hover": {
                        background: active ? "#F6FFF8" : "#F5F5F5",
                      },
                    }}
                  />
                );
              })}
            </div>
          </div>

          {/* Desktop table */}
          <div className="hidden md:block w-full overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[12px] uppercase tracking-wide text-primary_grey_2 border-b border-[#EFEFEF]">
                  <th className="py-3 px-3">Order ID</th>
                  <th className="py-3 px-3">Vendor → Receiver</th>
                  <th className="py-3 px-3">Rider</th>
                  <th className="py-3 px-3">Route</th>
                  <th className="py-3 px-3">Amount</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="py-10 text-center text-primary_grey_2"
                    >
                      No deliveries match the current filter.
                    </td>
                  </tr>
                ) : (
                  filtered.map((row) => (
                    <tr
                      key={row.id}
                      className="border-b border-[#F5F5F5] hover:bg-[#FAFAFA] cursor-pointer"
                      onClick={() => setSelected(row)}
                    >
                      <td className="py-4 px-3 text-[13px] font-medium text-general">
                        {row.id}
                      </td>
                      <td className="py-4 px-3 text-[13px] text-general">
                        <div className="flex flex-col">
                          <span>{row.sender}</span>
                          <span className="text-primary_grey_2 text-[12px]">
                            → {row.receiver}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-3 text-[13px] text-general">
                        {row.rider}
                      </td>
                      <td className="py-4 px-3 text-[12px] text-primary_grey_2 max-w-[260px]">
                        <div className="truncate">{row.pickup}</div>
                        <div className="truncate">→ {row.dropoff}</div>
                      </td>
                      <td className="py-4 px-3 text-[13px] text-general">
                        <FormattedPrice amount={row.amount} />
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

          {/* Mobile cards */}
          <div className="md:hidden flex flex-col gap-3">
            {filtered.map((row) => (
              <div
                key={row.id}
                onClick={() => setSelected(row)}
                className="border border-[#EFEFEF] rounded-xl p-4 active:bg-[#FAFAFA]"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[13px] font-medium text-general">
                      {row.id}
                    </p>
                    <p className="text-[12px] text-primary_grey_2 mt-0.5">
                      {row.sender} → {row.receiver}
                    </p>
                  </div>
                  <StatusPill status={row.status} />
                </div>
                <Divider sx={{ my: 1.5 }} />
                <div className="flex items-center justify-between text-[12px] text-primary_grey_2">
                  <span>Rider: {row.rider}</span>
                  <span className="text-general font-medium">
                    <FormattedPrice amount={row.amount} />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Detail modal */}
      <CustomModal
        open={!!selected}
        closeModal={() => setSelected(null)}
        style="w-[95%] md:w-3/5 lg:w-1/2"
      >
        {selected && (
          <DeliveryDetail row={selected} close={() => setSelected(null)} />
        )}
      </CustomModal>
    </div>
  );
};

const DeliveryDetail = ({ row, close }) => (
  <div className="flex flex-col gap-4">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-[18px] font-semibold text-general">{row.id}</p>
        <p className="text-[12px] text-primary_grey_2">
          Created {row.created}
        </p>
      </div>
      <ClearIcon
        onClick={close}
        sx={{ color: "#1E1E1E", cursor: "pointer" }}
      />
    </div>

    <Grid container spacing={2}>
      <Grid item xs={12} md={6}>
        <div className="border border-[#EFEFEF] rounded-xl p-4 h-full">
          <p className="text-[12px] uppercase tracking-wide text-primary_grey_2 mb-2">
            Parties
          </p>
          <Divider />
          <div className="flex items-center gap-2 py-2">
            <PersonIcon sx={{ color: "#5E5E5E", fontSize: 18 }} />
            <div className="flex-1">
              <p className="text-[12px] text-primary_grey_2">Vendor</p>
              <p className="text-[13px] text-general font-medium">
                {row.sender}
              </p>
            </div>
          </div>
          <Divider />
          <div className="flex items-center gap-2 py-2">
            <PersonIcon sx={{ color: "#5E5E5E", fontSize: 18 }} />
            <div className="flex-1">
              <p className="text-[12px] text-primary_grey_2">Receiver</p>
              <p className="text-[13px] text-general font-medium">
                {row.receiver}
              </p>
            </div>
          </div>
          <Divider />
          <div className="flex items-center gap-2 py-2">
            <RiderIcon sx={{ color: "#5E5E5E", fontSize: 18 }} />
            <div className="flex-1">
              <p className="text-[12px] text-primary_grey_2">Rider</p>
              <p className="text-[13px] text-general font-medium">
                {row.rider}
              </p>
            </div>
          </div>
        </div>
      </Grid>

      <Grid item xs={12} md={6}>
        <div className="border border-[#EFEFEF] rounded-xl p-4 h-full">
          <p className="text-[12px] uppercase tracking-wide text-primary_grey_2 mb-2">
            Route
          </p>
          <Divider />
          <div className="flex items-start gap-2 py-2">
            <PlaceIcon sx={{ color: "#02981D", fontSize: 18, mt: "2px" }} />
            <div className="flex-1">
              <p className="text-[12px] text-primary_grey_2">Pickup</p>
              <p className="text-[13px] text-general">{row.pickup}</p>
            </div>
          </div>
          <Divider />
          <div className="flex items-start gap-2 py-2">
            <PlaceIcon sx={{ color: "#DC3545", fontSize: 18, mt: "2px" }} />
            <div className="flex-1">
              <p className="text-[12px] text-primary_grey_2">Drop-off</p>
              <p className="text-[13px] text-general">{row.dropoff}</p>
            </div>
          </div>
          <Divider />
          <div className="flex items-center justify-between py-2">
            <p className="text-[12px] text-primary_grey_2">Amount</p>
            <p className="text-[14px] text-general font-semibold">
              <FormattedPrice amount={row.amount} />
            </p>
          </div>
        </div>
      </Grid>
    </Grid>

    <div className="border border-[#EFEFEF] rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-[12px] uppercase tracking-wide text-primary_grey_2">
          Timeline
        </p>
        <StatusPill status={row.status} />
      </div>
      <ol className="relative border-l border-[#E3E3E3] ml-2">
        {row.timeline.map((t, i) => (
          <li key={i} className="ml-4 mb-4 last:mb-0">
            <span
              className={`absolute -left-[7px] w-3 h-3 rounded-full border-2 border-white ${
                t.done ? "bg-[#02981D]" : "bg-[#C8C8C8]"
              }`}
            />
            <p
              className={`text-[13px] ${
                t.done ? "text-general font-medium" : "text-primary_grey_2"
              }`}
            >
              {t.label}
            </p>
            <p className="text-[12px] text-primary_grey_2">{t.time}</p>
          </li>
        ))}
      </ol>
    </div>

    <div className="flex justify-end">
      <Button
        onClick={close}
        variant="contained"
        sx={{
          textTransform: "none",
          background: "#02981D",
          boxShadow: "none",
          "&:hover": { background: "#017a17" },
        }}
      >
        Done
      </Button>
    </div>
  </div>
);

export default LogisticsDashboard;
