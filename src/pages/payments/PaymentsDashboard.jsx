import { useMemo, useState } from "react";
import { format, parseISO } from "date-fns";
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
  Select,
  Tab,
  Tabs,
  TextField,
} from "@mui/material";
import {
  SearchOutlined as SearchIcon,
  TrendingUpOutlined as InflowIcon,
  TrendingDownOutlined as OutflowIcon,
  AccountBalanceWalletOutlined as BalanceIcon,
  PaidOutlined as CommissionIcon,
  ChevronRightRounded as ChevronRightIcon,
  ClearRounded as ClearIcon,
} from "@mui/icons-material";
import CustomModal from "../../components/CustomModal";
import CustomPagination from "../../components/CustomPagination";
import SelectDate from "../../components/SelectDate";
import FormattedPrice from "../../utils/FormattedPrice";
import { transactionsPaymentDataUrl } from "../../api/endpoint";
import useFetchData from "../../hooks/useFetchData";
import { useDateContext } from "../../utils/DateContext";

// ── helpers ──
const fmtDate = (iso) => {
  if (!iso) return "—";
  try {
    return format(parseISO(iso), "dd MMM yyyy · HH:mm");
  } catch {
    return iso;
  }
};

const TYPE_STYLE = {
  CREDIT: { bg: "#E6F7EA", color: "#02981D" },
  DEBIT: { bg: "#FDECEC", color: "#DC3545" },
  BNPL: { bg: "#EEF2FF", color: "#3949AB" },
  SUBSCRIPTION: { bg: "#F3E8FF", color: "#7C3AED" },
  TRANSFER: { bg: "#E0F2FE", color: "#0369A1" },
  WITHDRAWAL: { bg: "#FFF1E0", color: "#C2410C" },
  REFUND: { bg: "#FFF7E8", color: "#B26A00" },
};
const typeStyle = (t) =>
  TYPE_STYLE[(t || "").toString().toUpperCase()] || {
    bg: "#F5F5F5",
    color: "#5E5E5E",
  };

const STATUS_STYLE = {
  SUCCESS: { bg: "#E6F7EA", color: "#02981D", label: "Success" },
  SUCCESSFUL: { bg: "#E6F7EA", color: "#02981D", label: "Successful" },
  FAILED: { bg: "#FDECEC", color: "#DC3545", label: "Failed" },
  PENDING: { bg: "#FFF7E8", color: "#B26A00", label: "Pending" },
};
const statusStyle = (s) =>
  STATUS_STYLE[(s || "").toString().toUpperCase()] || {
    bg: "#F5F5F5",
    color: "#5E5E5E",
    label: s,
  };

// Card with All-time + By Filter values stacked (Overview-style)
const StatCard = ({ icon, color, bg, label, value, filteredValue, subtitle }) => (
  <Card
    sx={{
      borderRadius: "14px",
      boxShadow: "0 1px 3px rgba(16,24,40,.06)",
      border: "1px solid #EFEFEF",
      height: "100%",
    }}
  >
    <CardContent sx={{ p: 2.5 }}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-[12px] text-primary_grey_2 font-medium">{label}</p>
          <div className="mt-2">
            <p className="text-[11px] text-primary_grey_2">All-time:</p>
            <p className="text-[18px] font-semibold text-general">{value}</p>
          </div>
          {filteredValue !== undefined && (
            <div className="mt-2">
              <p className="text-[11px] text-primary_grey_2">By Filter:</p>
              <p className="text-[16px] font-semibold text-general">
                {filteredValue}
              </p>
            </div>
          )}
          {subtitle && (
            <p className="text-[11px] text-[#9CA3AF] mt-1.5">{subtitle}</p>
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

const mapApiPayment = (t) => ({
  id: t?.id || "—",
  date: t?.date_time || t?.created_at || t?.date || null,
  type: t?.type || "—",
  amount: Number(t?.amount || 0),
  method: t?.payment_method || t?.method || "—",
  merchant: t?.merchant || t?.merchant_name || t?.origin || "—",
  customer:
    t?.customer || t?.customer_name || t?.recipient || t?.account_name || "—",
  status: t?.status || "—",
  commission: Number(t?.commission || 0),
});

const PaymentsDashboard = () => {
  const { selectedDates } = useDateContext();
  const [tab, setTab] = useState(0);
  const [methodFilter, setMethodFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage] = useState(50);

  // GET /transaction/payments/ — server params: page, limit, search, account_name, start_date, end_date
  const apiUrl = transactionsPaymentDataUrl(
    currentPage,
    rowsPerPage,
    search,
    "",
    selectedDates
  );
  const { data, isLoading } = useFetchData(
    [
      "fetchPayments",
      apiUrl,
      currentPage,
      search,
      selectedDates?.startDate,
      selectedDates?.endDate,
    ],
    apiUrl
  );

  const rows = useMemo(() => {
    const raw =
      data?.results ||
      data?.data ||
      data?.transactions?.data ||
      (Array.isArray(data) ? data : []);
    return (Array.isArray(raw) ? raw : []).map(mapApiPayment);
  }, [data]);

  const totalPages =
    data?.pagination?.total_pages ||
    data?.total_pages ||
    data?.pages ||
    Math.max(1, Math.ceil((data?.pagination?.total_count || data?.total || rows.length) / rowsPerPage));

  // Prefer server-side summary (new API shape); compute from rows as a fallback
  const totals = useMemo(() => {
    const s = data?.summary || {};
    const inflow = Number(
      s.total_inflow ??
        rows
          .filter((r) => /credit/i.test(r.type) && /success/i.test(r.status))
          .reduce((a, r) => a + r.amount, 0)
    );
    const outflow = Number(
      s.total_outflow ??
        rows
          .filter((r) => /debit/i.test(r.type) && /success/i.test(r.status))
          .reduce((a, r) => a + r.amount, 0)
    );
    const commission = Number(
      s.total_commission ??
        rows
          .filter((r) => /success/i.test(r.status))
          .reduce((a, r) => a + r.commission, 0)
    );
    const net = Number(s.net_balance ?? inflow - outflow);
    return {
      inflow,
      outflow,
      commission,
      net,
      // Server-side "By Filter" values (date-range filtered)
      filteredInflow: Number(s.filtered_inflow ?? 0),
      filteredOutflow: Number(s.filtered_outflow ?? 0),
      filteredCommission: Number(s.filtered_commission ?? 0),
      filteredNet: Number(
        s.filtered_net_balance ??
          (Number(s.filtered_inflow ?? 0) - Number(s.filtered_outflow ?? 0))
      ),
    };
  }, [data, rows]);

  // Apply method / status / tab filters CLIENT-SIDE over the current page
  // (the API doesn't expose these as query params)
  const TAB_TYPE = ["", "CREDIT", "DEBIT", "BNPL"];
  const filtered = useMemo(() => {
    const tabType = TAB_TYPE[tab];
    return rows.filter((r) => {
      const matchTab = tabType
        ? (r.type || "").toString().toUpperCase() === tabType
        : true;
      const matchMethod =
        methodFilter === "all" ? true : r.method === methodFilter;
      const matchStatus =
        statusFilter === "all"
          ? true
          : (r.status || "").toString().toUpperCase() ===
            statusFilter.toUpperCase();
      return matchTab && matchMethod && matchStatus;
    });
  }, [rows, tab, methodFilter, statusFilter]);

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Header with date range filter */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-[20px] md:text-[22px] font-semibold text-general">
            Payments & Transactions
          </h1>
          <p className="text-[13px] text-primary_grey_2 mt-1">
            Inflow, outflow, commission and BNPL — filter by date range.
          </p>
        </div>
        <SelectDate />
      </div>

      {/* Summary cards — All-time + By Filter */}
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<InflowIcon fontSize="small" />}
            color="#02981D"
            bg="#E6F7EA"
            label="Total Inflow"
            value={<FormattedPrice amount={totals.inflow} />}
            filteredValue={<FormattedPrice amount={totals.filteredInflow} />}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<OutflowIcon fontSize="small" />}
            color="#DC3545"
            bg="#FDECEC"
            label="Total Outflow"
            value={<FormattedPrice amount={totals.outflow} />}
            filteredValue={<FormattedPrice amount={totals.filteredOutflow} />}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<BalanceIcon fontSize="small" />}
            color="#0369A1"
            bg="#E0F2FE"
            label="Net Balance"
            value={<FormattedPrice amount={totals.net} />}
            filteredValue={<FormattedPrice amount={totals.filteredNet} />}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<CommissionIcon fontSize="small" />}
            color="#B26A00"
            bg="#FFF7E8"
            label="Total Commission"
            value={<FormattedPrice amount={totals.commission} />}
            filteredValue={
              <FormattedPrice amount={totals.filteredCommission} />
            }
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
          <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
            <Tabs
              value={tab}
              onChange={(_, v) => {
                setTab(v);
                setCurrentPage(1);
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
              <Tab label="All" />
              <Tab label="Inflow (Credit)" />
              <Tab label="Outflow (Debit)" />
              <Tab label="Buy Now Pay Later" />
            </Tabs>
          </Box>

          {/* Filters */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 mb-4">
            <TextField
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by transaction ID, merchant, or customer"
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
              <Select
                size="small"
                value={methodFilter}
                onChange={(e) => {
                  setMethodFilter(e.target.value);
                  setCurrentPage(1);
                }}
                sx={{ minWidth: 170 }}
              >
                <MenuItem value="all">All Methods</MenuItem>
                <MenuItem value="Bank Transfer">Bank Transfer</MenuItem>
                <MenuItem value="Card Payment">Card Payment</MenuItem>
                <MenuItem value="Online Payment">Online Payment</MenuItem>
                <MenuItem value="Buy Now Pay Later">Buy Now Pay Later</MenuItem>
              </Select>
              <Select
                size="small"
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                sx={{ minWidth: 140 }}
              >
                <MenuItem value="all">All Status</MenuItem>
                <MenuItem value="SUCCESS">Success</MenuItem>
                <MenuItem value="FAILED">Failed</MenuItem>
                <MenuItem value="PENDING">Pending</MenuItem>
              </Select>
            </div>
          </div>

          {/* Desktop table */}
          <div className="hidden md:block w-full overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[12px] uppercase tracking-wide text-primary_grey_2 border-b border-[#EFEFEF]">
                  <th className="py-3 px-3">Transaction ID</th>
                  <th className="py-3 px-3">Date & Time</th>
                  <th className="py-3 px-3">Type</th>
                  <th className="py-3 px-3 text-right">Amount</th>
                  <th className="py-3 px-3">Payment Method</th>
                  <th className="py-3 px-3">Merchant</th>
                  <th className="py-3 px-3">Customer</th>
                  <th className="py-3 px-3 text-right">Commission</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={10} className="py-10 text-center">
                      <CircularProgress sx={{ color: "#02981D" }} />
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td
                      colSpan={10}
                      className="py-10 text-center text-primary_grey_2"
                    >
                      No transactions match the current filters.
                    </td>
                  </tr>
                ) : (
                  filtered.map((t) => {
                    const ts = typeStyle(t.type);
                    const ss = statusStyle(t.status);
                    return (
                      <tr
                        key={t.id}
                        onClick={() => setSelected(t)}
                        className="border-b border-[#F5F5F5] hover:bg-[#FAFAFA] cursor-pointer"
                      >
                        <td className="py-4 px-3 text-[13px] font-medium text-general font-mono">
                          {t.id}
                        </td>
                        <td className="py-4 px-3 text-[12px] text-primary_grey_2 whitespace-nowrap">
                          {fmtDate(t.date)}
                        </td>
                        <td className="py-4 px-3">
                          <span
                            className="text-[12px] font-semibold px-2 py-1 rounded-md capitalize"
                            style={{ background: ts.bg, color: ts.color }}
                          >
                            {t.type.toString().toLowerCase()}
                          </span>
                        </td>
                        <td className="py-4 px-3 text-[13px] text-general text-right font-medium">
                          <FormattedPrice amount={t.amount} />
                        </td>
                        <td className="py-4 px-3 text-[12px] text-general">
                          {t.method}
                        </td>
                        <td className="py-4 px-3 text-[13px] text-general">
                          {t.merchant}
                        </td>
                        <td className="py-4 px-3 text-[13px] text-general">
                          {t.customer}
                        </td>
                        <td className="py-4 px-3 text-[12px] text-general text-right">
                          {t.commission ? (
                            <FormattedPrice amount={t.commission} />
                          ) : (
                            "—"
                          )}
                        </td>
                        <td className="py-4 px-3">
                          <span
                            className="text-[12px] font-medium px-3 py-1 rounded-full"
                            style={{ background: ss.bg, color: ss.color }}
                          >
                            {ss.label}
                          </span>
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
          </div>

          {/* Pagination */}
          {!isLoading && filtered.length > 0 && (
            <CustomPagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          )}

          {/* Mobile cards */}
          <div className="md:hidden flex flex-col gap-3">
            {filtered.map((t) => {
              const ts = typeStyle(t.type);
              const ss = statusStyle(t.status);
              return (
                <div
                  key={t.id}
                  onClick={() => setSelected(t)}
                  className="border border-[#EFEFEF] rounded-xl p-4 active:bg-[#FAFAFA]"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-[13px] font-medium text-general font-mono">
                        {t.id}
                      </p>
                      <p className="text-[11px] text-primary_grey_2 mt-0.5">
                        {fmtDate(t.date)}
                      </p>
                    </div>
                    <span
                      className="text-[12px] font-medium px-3 py-1 rounded-full"
                      style={{ background: ss.bg, color: ss.color }}
                    >
                      {ss.label}
                    </span>
                  </div>
                  <Divider sx={{ my: 1.5 }} />
                  <div className="flex items-center justify-between">
                    <span
                      className="text-[12px] font-semibold px-2 py-1 rounded-md capitalize"
                      style={{ background: ts.bg, color: ts.color }}
                    >
                      {t.type.toString().toLowerCase()}
                    </span>
                    <span className="text-[14px] font-semibold text-general">
                      <FormattedPrice amount={t.amount} />
                    </span>
                  </div>
                  <div className="mt-2 text-[12px] text-primary_grey_2">
                    {t.merchant} → {t.customer}
                  </div>
                  <div className="mt-1 text-[12px] text-primary_grey_2">
                    {t.method}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Detail modal */}
      <CustomModal
        open={!!selected}
        closeModal={() => setSelected(null)}
        style="w-[95%] md:w-1/2"
      >
        {selected && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <p className="text-[18px] font-semibold text-general">
                Transaction Details
              </p>
              <ClearIcon
                onClick={() => setSelected(null)}
                sx={{ color: "#1E1E1E", cursor: "pointer" }}
              />
            </div>
            <div className="border border-[#EFEFEF] rounded-xl p-4">
              {[
                ["Transaction ID", selected.id],
                ["Date & Time", fmtDate(selected.date)],
                [
                  "Type",
                  <span
                    key="t"
                    className="text-[12px] font-semibold px-2 py-1 rounded-md capitalize"
                    style={{
                      background: typeStyle(selected.type).bg,
                      color: typeStyle(selected.type).color,
                    }}
                  >
                    {selected.type.toString().toLowerCase()}
                  </span>,
                ],
                [
                  "Amount",
                  <FormattedPrice key="a" amount={selected.amount} />,
                ],
                ["Payment Method", selected.method],
                ["Merchant", selected.merchant],
                ["Customer", selected.customer],
                [
                  "Commission",
                  selected.commission ? (
                    <FormattedPrice key="c" amount={selected.commission} />
                  ) : (
                    "—"
                  ),
                ],
                [
                  "Status",
                  <span
                    key="s"
                    className="text-[12px] font-medium px-3 py-1 rounded-full"
                    style={{
                      background: statusStyle(selected.status).bg,
                      color: statusStyle(selected.status).color,
                    }}
                  >
                    {statusStyle(selected.status).label}
                  </span>,
                ],
              ].map(([label, value], i, arr) => (
                <div key={label}>
                  <div className="flex items-center justify-between py-2 gap-3">
                    <span className="text-[13px] text-primary_grey_2">
                      {label}
                    </span>
                    <span className="text-[13px] text-general font-medium text-right">
                      {value}
                    </span>
                  </div>
                  {i !== arr.length - 1 && <Divider />}
                </div>
              ))}
            </div>
            <div className="flex justify-end">
              <Button
                onClick={() => setSelected(null)}
                variant="contained"
                sx={{
                  textTransform: "none",
                  background: "#02981D",
                  boxShadow: "none",
                  "&:hover": { background: "#017a17" },
                }}
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </CustomModal>
    </div>
  );
};

export default PaymentsDashboard;
