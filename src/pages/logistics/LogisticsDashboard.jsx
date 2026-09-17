import { useMemo, useState } from "react";
import {
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  InputAdornment,
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
import SelectDate from "../../components/SelectDate";
import useFetchData from "../../hooks/useFetchData";
import {
  logisticsDeliveryDetailUrl,
  logisticsDeliveriesUrl,
  logisticsOverviewUrl,
} from "../../api/endpoint";
import { useDateContext } from "../../utils/DateContext";

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

const normalizeStatus = (status) => {
  const value = String(status || "").toUpperCase();
  return {
    PENDING: "pending",
    "RIDER-ASSIGNED": "assigned",
    RIDER_ASSIGNED: "assigned",
    "PICKED-UP": "picked_up",
    PICKED_UP: "picked_up",
    "OUT-FOR-DELIVERY": "in_transit",
    OUT_FOR_DELIVERY: "in_transit",
    SHIPPED: "in_transit",
    DELIVERED: "delivered",
    "CREATION-FAILED": "failed",
    CREATION_FAILED: "failed",
    RETURNED: "failed",
  }[value] || String(status || "pending").toLowerCase();
};

const mapDelivery = (item) => ({
  id: item?.order_id || item?.id || "—",
  saleId: item?.id || item?.sale_id,
  sender: item?.vendor_name || item?.sender_name || "—",
  receiver: item?.receiver_name || "—",
  rider: item?.rider_name || "Unassigned",
  pickup: item?.origin_address || item?.pickup_address || "—",
  dropoff: item?.destination_address || item?.dropoff_address || "—",
  amount: Number(item?.amount || item?.shipping_fee || 0),
  status: normalizeStatus(item?.status),
  created: item?.created_at || "—",
  timeline: item?.timeline || [],
});

const mapDeliveryDetail = (data, fallback) => {
  const parties = data?.parties || {};
  const route = data?.route || {};
  const timeline = Array.isArray(data?.timeline)
    ? data.timeline.map((event) => ({
        label: event?.event || event?.label || "Delivery update",
        time: event?.timestamp || event?.time || "—",
        done: Boolean(event?.timestamp || event?.done),
      }))
    : fallback.timeline;

  return {
    ...fallback,
    id: data?.order_id || fallback.id,
    sender: parties.vendor_name || fallback.sender,
    receiver: parties.receiver_name || fallback.receiver,
    rider: parties.rider_name || fallback.rider,
    pickup: route.pickup_address || fallback.pickup,
    dropoff: route.dropoff_address || fallback.dropoff,
    amount: Number(data?.amount ?? fallback.amount),
    status: normalizeStatus(data?.current_status || fallback.status),
    created: data?.created_at || fallback.created,
    timeline,
  };
};

const LogisticsDashboard = () => {
  const { selectedDates } = useDateContext();
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);

  const overviewUrl = logisticsOverviewUrl(selectedDates);
  const deliveriesUrl = logisticsDeliveriesUrl(
    statusFilter,
    selectedDates,
    1,
    100,
  );
  const { data: overviewData, isLoading: overviewLoading } = useFetchData(
    ["logisticsOverview", overviewUrl],
    overviewUrl,
  );
  const { data: deliveriesData, isLoading: deliveriesLoading } = useFetchData(
    ["logisticsDeliveries", deliveriesUrl],
    deliveriesUrl,
  );
  const detailUrl = selected?.saleId
    ? logisticsDeliveryDetailUrl(selected.saleId)
    : "";
  const { data: detailData } = useFetchData(
    ["logisticsDeliveryDetail", detailUrl],
    detailUrl,
    { enabled: Boolean(detailUrl) },
  );
  const selectedDetail = selected
    ? mapDeliveryDetail(detailData, selected)
    : null;

  const deliveries = useMemo(() => {
    const raw =
      deliveriesData?.data ||
      deliveriesData?.results ||
      (Array.isArray(deliveriesData) ? deliveriesData : []);
    return Array.isArray(raw) ? raw.map(mapDelivery) : [];
  }, [deliveriesData]);

  const filtered = useMemo(() => {
    return deliveries.filter((row) => {
      const matchSearch = search
        ? [row.id, row.sender, row.receiver, row.rider]
            .join(" ")
            .toLowerCase()
            .includes(search.toLowerCase())
        : true;
      return matchSearch;
    });
  }, [deliveries, search]);

  const counts = useMemo(() => {
    const metrics = overviewData?.metrics || {};
    const active = deliveries.filter((d) =>
      ["assigned", "picked_up", "in_transit"].includes(d.status)
    ).length;
    const completed = deliveries.filter(
      (d) => d.status === "delivered"
    ).length;
    const failed = deliveries.filter(
      (d) => d.status === "failed"
    ).length;
    const revenue = deliveries.filter(
      (d) => d.status === "delivered"
    ).reduce((acc, d) => acc + d.amount, 0);
    return {
      total: metrics.total_deliveries ?? deliveriesData?.total_count ?? deliveries.length,
      active: metrics.active_deliveries ?? active,
      completed: metrics.completed_deliveries ?? completed,
      failed: metrics.failed_deliveries ?? failed,
      revenue: metrics.revenue ?? revenue,
    };
  }, [deliveries, deliveriesData, overviewData]);

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
        <div className="flex items-center gap-2">
          <SelectDate />
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
            subtitle="Selected date range"
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
                {deliveriesLoading || overviewLoading ? (
                  <tr>
                    <td colSpan={7} className="py-10 text-center">
                      <CircularProgress size={24} sx={{ color: "#02981D" }} />
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
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
          <DeliveryDetail
            row={selectedDetail}
            loading={!detailData}
            close={() => setSelected(null)}
          />
        )}
      </CustomModal>
    </div>
  );
};

const DeliveryDetail = ({ row, loading, close }) => (
  <div className="flex flex-col gap-4">
    {loading ? (
      <div className="flex justify-center py-10">
        <CircularProgress size={28} sx={{ color: "#02981D" }} />
      </div>
    ) : (
      <>
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
      </>
    )}
  </div>
);

export default LogisticsDashboard;
