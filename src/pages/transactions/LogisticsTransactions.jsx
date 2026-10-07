import { useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CircularProgress,
  Divider,
  Grid,
  InputAdornment,
  TextField,
} from "@mui/material";
import {
  SearchOutlined as SearchIcon,
  LocalShippingOutlined as ShippingIcon,
  PaidOutlined as PaidIcon,
} from "@mui/icons-material";
import FormattedPrice from "../../utils/FormattedPrice";
import useFetchData from "../../hooks/useFetchData";
import {
  logisticsDeliveriesUrl,
  logisticsOverviewUrl,
} from "../../api/endpoint";
import { useDateContext } from "../../utils/DateContext";

// `vendor` / `merchant` may come back as an object or a plain string.
const nameOf = (v) => {
  if (!v) return "";
  if (typeof v === "string") return v;
  return v.business || v.business_name || v.name || "";
};

const mapTransaction = (item) => ({
  id: item?.id || item?.order_id,
  merchant:
    nameOf(item?.merchant) ||
    item?.merchant_name ||
    nameOf(item?.vendor) ||
    item?.vendor_name ||
    item?.business_name ||
    "—",
  rate: Number(item?.shipping_rate ?? item?.shipping_fee ?? item?.amount ?? 0),
  company:
    item?.shipping_company ||
    item?.courier_name ||
    item?.courier ||
    item?.carrier ||
    item?.logistics_partner ||
    "—",
  commission: Number(item?.commission ?? item?.commission_amount ?? 0),
});

const StatCard = ({ icon, color, bg, label, value, loading }) => (
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
          <div className="text-[24px] font-semibold text-general mt-2">
            {loading ? (
              <CircularProgress size={20} sx={{ color }} />
            ) : (
              <FormattedPrice amount={value} />
            )}
          </div>
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

const LogisticsTransactions = () => {
  const { selectedDates } = useDateContext();
  const [search, setSearch] = useState("");

  const overviewUrl = logisticsOverviewUrl(selectedDates);
  const deliveriesUrl = logisticsDeliveriesUrl("all", selectedDates, 1, 100);
  const { data: overviewData, isLoading: overviewLoading } = useFetchData(
    ["logisticsOverview", overviewUrl],
    overviewUrl,
  );
  const { data: deliveriesData, isLoading: deliveriesLoading } = useFetchData(
    ["logisticsDeliveries", deliveriesUrl],
    deliveriesUrl,
  );

  const transactions = useMemo(() => {
    const raw =
      deliveriesData?.data ||
      deliveriesData?.results ||
      (Array.isArray(deliveriesData) ? deliveriesData : []);
    return Array.isArray(raw) ? raw.map(mapTransaction) : [];
  }, [deliveriesData]);

  const filtered = useMemo(() => {
    if (!search) return transactions;
    const q = search.toLowerCase();
    return transactions.filter((row) =>
      [row.merchant, row.company].join(" ").toLowerCase().includes(q),
    );
  }, [transactions, search]);

  // Prefer backend totals; fall back to summing the loaded rows.
  const totals = useMemo(() => {
    const metrics = overviewData?.metrics || {};
    return {
      shipping:
        metrics.total_shipping_amount ??
        transactions.reduce((acc, t) => acc + t.rate, 0),
      commission:
        metrics.total_commission ??
        transactions.reduce((acc, t) => acc + t.commission, 0),
    };
  }, [overviewData, transactions]);

  const loading = deliveriesLoading || overviewLoading;

  return (
    <div className="w-full flex flex-col gap-6">
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <StatCard
            icon={<ShippingIcon fontSize="small" />}
            color="#0369A1"
            bg="#E0F2FE"
            label="Total Shipping Amount"
            value={totals.shipping}
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <StatCard
            icon={<PaidIcon fontSize="small" />}
            color="#02981D"
            bg="#E6F7EA"
            label="Total Commission Earned"
            value={totals.commission}
            loading={loading}
          />
        </Grid>
      </Grid>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <p className="text-[16px] font-semibold text-general">
          Recent Transactions
        </p>
        <TextField
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search merchant or shipping company"
          size="small"
          fullWidth
          sx={{ maxWidth: { md: 360 } }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: "#757575" }} />
              </InputAdornment>
            ),
          }}
        />
      </div>

      {/* Desktop table */}
      <div className="hidden md:block w-full overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="text-[12px] uppercase tracking-wide text-primary_grey_2 border-b border-[#EFEFEF]">
              <th className="py-3 px-3">Merchant Name</th>
              <th className="py-3 px-3">Shipping Rate</th>
              <th className="py-3 px-3">Shipping Company</th>
              <th className="py-3 px-3">Commission</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} className="py-10 text-center">
                  <CircularProgress size={24} sx={{ color: "#02981D" }} />
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="py-10 text-center text-primary_grey_2"
                >
                  No logistics transactions for the selected period.
                </td>
              </tr>
            ) : (
              filtered.map((row, i) => (
                <tr
                  key={row.id ?? i}
                  className="border-b border-[#F5F5F5] hover:bg-[#FAFAFA]"
                >
                  <td className="py-4 px-3 text-[13px] font-medium text-general">
                    {row.merchant}
                  </td>
                  <td className="py-4 px-3 text-[13px] text-general">
                    <FormattedPrice amount={row.rate} />
                  </td>
                  <td className="py-4 px-3 text-[13px] text-general">
                    {row.company}
                  </td>
                  <td className="py-4 px-3 text-[13px] font-medium text-[#02981D]">
                    <FormattedPrice amount={row.commission} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden flex flex-col gap-3">
        {loading ? (
          <div className="flex justify-center py-10">
            <CircularProgress size={24} sx={{ color: "#02981D" }} />
          </div>
        ) : filtered.length === 0 ? (
          <p className="py-10 text-center text-primary_grey_2 text-[13px]">
            No logistics transactions for the selected period.
          </p>
        ) : (
          filtered.map((row, i) => (
            <div
              key={row.id ?? i}
              className="border border-[#EFEFEF] rounded-xl p-4"
            >
              <div className="flex items-start justify-between">
                <p className="text-[13px] font-medium text-general">
                  {row.merchant}
                </p>
                <span className="text-[12px] text-primary_grey_2">
                  {row.company}
                </span>
              </div>
              <Divider sx={{ my: 1.5 }} />
              <div className="flex items-center justify-between text-[12px] text-primary_grey_2">
                <span className="flex gap-1">
                  Rate: <FormattedPrice amount={row.rate} />
                </span>
                <span className="flex gap-1 text-[#02981D] font-medium">
                  Commission: <FormattedPrice amount={row.commission} />
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default LogisticsTransactions;
