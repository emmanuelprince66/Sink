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
  TrendingUpOutlined as InflowIcon,
  TrendingDownOutlined as OutflowIcon,
  AccountBalanceWalletOutlined as BalanceIcon,
  PaidOutlined as CommissionIcon,
  ReceiptOutlined as VatIcon,
  ScheduleOutlined as BnplIcon,
  ChevronRightRounded as ChevronRightIcon,
  ClearRounded as ClearIcon,
} from "@mui/icons-material";
import CustomModal from "../../components/CustomModal";
import FormattedPrice from "../../utils/FormattedPrice";
import { PAYMENT_TRANSACTIONS } from "./paymentsData";

const StatCard = ({ icon, color, bg, label, value, subtitle }) => (
  <Card
    sx={{
      borderRadius: "14px",
      boxShadow: "0 1px 3px rgba(16,24,40,.06)",
      border: "1px solid #EFEFEF",
      height: "100%",
    }}
  >
    <CardContent sx={{ p: 2.5 }}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[12px] text-primary_grey_2 font-medium">{label}</p>
          <p className="text-[20px] font-semibold text-general mt-1.5">
            {value}
          </p>
          {subtitle && (
            <p className="text-[11px] text-[#9CA3AF] mt-0.5">{subtitle}</p>
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

const STATUS_STYLE = {
  Successful: { bg: "#E6F7EA", color: "#02981D" },
  Failed: { bg: "#FDECEC", color: "#DC3545" },
  Pending: { bg: "#FFF7E8", color: "#B26A00" },
};

const TYPE_STYLE = {
  Credit: { bg: "#E6F7EA", color: "#02981D" },
  Debit: { bg: "#FDECEC", color: "#DC3545" },
  BNPL: { bg: "#EEF2FF", color: "#3949AB" },
};

const METHOD_OPTIONS = [
  "Bank Transfer",
  "Card Payment",
  "Online Payment",
  "Buy Now Pay Later",
];

const PaymentsDashboard = () => {
  const [tab, setTab] = useState(0); // All / Inflow / Outflow / BNPL
  const [methodFilter, setMethodFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);

  const totals = useMemo(() => {
    const inflow = PAYMENT_TRANSACTIONS.filter(
      (t) => t.type === "Credit" && t.status === "Successful"
    ).reduce((a, t) => a + t.amount, 0);
    const outflow = PAYMENT_TRANSACTIONS.filter(
      (t) => t.type === "Debit" && t.status === "Successful"
    ).reduce((a, t) => a + t.amount, 0);
    const commission = PAYMENT_TRANSACTIONS.filter(
      (t) => t.status === "Successful"
    ).reduce((a, t) => a + (t.commission || 0), 0);
    const vat = PAYMENT_TRANSACTIONS.filter(
      (t) => t.status === "Successful"
    ).reduce((a, t) => a + (t.vat || 0), 0);
    const bnpl = PAYMENT_TRANSACTIONS.filter(
      (t) => t.type === "BNPL" && t.status === "Successful"
    ).reduce((a, t) => a + t.amount, 0);
    return {
      inflow,
      outflow,
      net: inflow - outflow,
      commission,
      vat,
      bnpl,
    };
  }, []);

  const filtered = useMemo(() => {
    return PAYMENT_TRANSACTIONS.filter((t) => {
      const matchTab =
        tab === 0
          ? true
          : tab === 1
          ? t.type === "Credit"
          : tab === 2
          ? t.type === "Debit"
          : tab === 3
          ? t.type === "BNPL"
          : true;
      const matchMethod =
        methodFilter === "all" ? true : t.method === methodFilter;
      const matchStatus =
        statusFilter === "all" ? true : t.status === statusFilter;
      const matchSearch = search
        ? [t.id, t.merchant, t.customer]
            .join(" ")
            .toLowerCase()
            .includes(search.toLowerCase())
        : true;
      return matchTab && matchMethod && matchStatus && matchSearch;
    });
  }, [tab, methodFilter, statusFilter, search]);

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-[20px] md:text-[22px] font-semibold text-general">
            Payments & Transactions
          </h1>
          <p className="text-[13px] text-primary_grey_2 mt-1">
            Standardized financial dashboard with full BNPL, VAT, and
            commission visibility.
          </p>
        </div>
      </div>

      {/* Top summary cards */}
      <Grid container spacing={2}>
        <Grid item xs={6} md={4} lg={2}>
          <StatCard
            icon={<InflowIcon fontSize="small" />}
            color="#02981D"
            bg="#E6F7EA"
            label="Total Inflow"
            value={<FormattedPrice amount={totals.inflow} />}
            subtitle="Money in"
          />
        </Grid>
        <Grid item xs={6} md={4} lg={2}>
          <StatCard
            icon={<OutflowIcon fontSize="small" />}
            color="#DC3545"
            bg="#FDECEC"
            label="Total Outflow"
            value={<FormattedPrice amount={totals.outflow} />}
            subtitle="Money out"
          />
        </Grid>
        <Grid item xs={6} md={4} lg={2}>
          <StatCard
            icon={<BalanceIcon fontSize="small" />}
            color="#0369A1"
            bg="#E0F2FE"
            label="Net Balance"
            value={<FormattedPrice amount={totals.net} />}
            subtitle="Inflow − Outflow"
          />
        </Grid>
        <Grid item xs={6} md={4} lg={2}>
          <StatCard
            icon={<CommissionIcon fontSize="small" />}
            color="#B26A00"
            bg="#FFF7E8"
            label="Total Commission"
            value={<FormattedPrice amount={totals.commission} />}
            subtitle="Platform revenue"
          />
        </Grid>
        <Grid item xs={6} md={4} lg={2}>
          <StatCard
            icon={<VatIcon fontSize="small" />}
            color="#7C3AED"
            bg="#F3E8FF"
            label="VAT Collected"
            value={<FormattedPrice amount={totals.vat} />}
            subtitle="Withheld for tax"
          />
        </Grid>
        <Grid item xs={6} md={4} lg={2}>
          <StatCard
            icon={<BnplIcon fontSize="small" />}
            color="#3949AB"
            bg="#EEF2FF"
            label="Buy Now Pay Later"
            value={<FormattedPrice amount={totals.bnpl} />}
            subtitle="Outstanding BNPL"
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
              onChange={(e) => setSearch(e.target.value)}
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
                onChange={(e) => setMethodFilter(e.target.value)}
                sx={{ minWidth: 170 }}
              >
                <MenuItem value="all">All Methods</MenuItem>
                {METHOD_OPTIONS.map((m) => (
                  <MenuItem key={m} value={m}>
                    {m}
                  </MenuItem>
                ))}
              </Select>
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
                {filtered.length === 0 ? (
                  <tr>
                    <td
                      colSpan={10}
                      className="py-10 text-center text-primary_grey_2"
                    >
                      No transactions match the current filters.
                    </td>
                  </tr>
                ) : (
                  filtered.map((t) => (
                    <tr
                      key={t.id}
                      onClick={() => setSelected(t)}
                      className="border-b border-[#F5F5F5] hover:bg-[#FAFAFA] cursor-pointer"
                    >
                      <td className="py-4 px-3 text-[13px] font-medium text-general">
                        {t.id}
                      </td>
                      <td className="py-4 px-3 text-[12px] text-primary_grey_2">
                        {t.date}
                      </td>
                      <td className="py-4 px-3">
                        <span
                          className="text-[12px] font-medium px-2 py-1 rounded-md"
                          style={{
                            background: TYPE_STYLE[t.type]?.bg,
                            color: TYPE_STYLE[t.type]?.color,
                          }}
                        >
                          {t.type}
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
                          style={{
                            background: STATUS_STYLE[t.status]?.bg,
                            color: STATUS_STYLE[t.status]?.color,
                          }}
                        >
                          {t.status}
                        </span>
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
            {filtered.map((t) => (
              <div
                key={t.id}
                onClick={() => setSelected(t)}
                className="border border-[#EFEFEF] rounded-xl p-4 active:bg-[#FAFAFA]"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-[13px] font-medium text-general">
                      {t.id}
                    </p>
                    <p className="text-[11px] text-primary_grey_2 mt-0.5">
                      {t.date}
                    </p>
                  </div>
                  <span
                    className="text-[12px] font-medium px-3 py-1 rounded-full"
                    style={{
                      background: STATUS_STYLE[t.status]?.bg,
                      color: STATUS_STYLE[t.status]?.color,
                    }}
                  >
                    {t.status}
                  </span>
                </div>
                <Divider sx={{ my: 1.5 }} />
                <div className="flex items-center justify-between">
                  <span
                    className="text-[12px] font-medium px-2 py-1 rounded-md"
                    style={{
                      background: TYPE_STYLE[t.type]?.bg,
                      color: TYPE_STYLE[t.type]?.color,
                    }}
                  >
                    {t.type}
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
            ))}
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
                ["Date & Time", selected.date],
                ["Type", selected.type],
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
                  "VAT",
                  selected.vat ? (
                    <FormattedPrice key="v" amount={selected.vat} />
                  ) : (
                    "—"
                  ),
                ],
                ["Status", selected.status],
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
