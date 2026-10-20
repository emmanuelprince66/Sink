import { useMemo, useState } from "react";
import {
  Button,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  Grid,
  InputAdornment,
  TextField,
} from "@mui/material";
import {
  AutorenewRounded as RefreshIcon,
  SearchOutlined as SearchIcon,
  LocalShippingOutlined as ShippingIcon,
  PaidOutlined as PaidIcon,
  StorefrontOutlined as StoreIcon,
  AccountBalanceWalletOutlined as WalletIcon,
} from "@mui/icons-material";
import { useQueryClient } from "@tanstack/react-query";
import PropTypes from "prop-types";
import FormattedPrice from "../../utils/FormattedPrice";
import useFetchData from "../../hooks/useFetchData";
import {
  logisticsDeliveriesUrl,
  logisticsDeliveryRefreshUrl,
  logisticsOverviewUrl,
} from "../../api/endpoint";
import { useDateContext } from "../../utils/DateContext";
import { AuthAxios } from "../../helpers/axiosInstance";
import { notiError, notiSuccess } from "../../utils/noti";
import { mapFinance, mapFinancialTotals } from "../logistics/logisticsFinance";

// `vendor` / `merchant` may come back as an object or a plain string.
const nameOf = (v) => {
  if (!v) return "";
  if (typeof v === "string") return v;
  return v.business || v.business_name || v.name || "";
};

const mapTransaction = (item) => {
  const finance = mapFinance(item);
  return {
    id: item?.order_id || item?.id,
    saleId: item?.id,
    merchant:
      nameOf(item?.merchant) ||
      item?.merchant_name ||
      nameOf(item?.vendor) ||
      item?.vendor_name ||
      item?.business_name ||
      "—",
    rate: finance.customerShippingFee,
    company: item?.shipping_company || "—",
    commission: finance.sync360Retained,
    finance,
    status: item?.status || "—",
  };
};

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

StatCard.propTypes = {
  icon: PropTypes.node.isRequired,
  color: PropTypes.string.isRequired,
  bg: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  value: PropTypes.number.isRequired,
  loading: PropTypes.bool.isRequired,
};

const LogisticsTransactions = () => {
  const queryClient = useQueryClient();
  const { selectedDates } = useDateContext();
  const [search, setSearch] = useState("");
  const [refreshingSaleId, setRefreshingSaleId] = useState(null);

  const overviewUrl = logisticsOverviewUrl(selectedDates);
  const deliveriesUrl = logisticsDeliveriesUrl("all", selectedDates, 1, 100);
  const { data: overviewData, isLoading: overviewLoading } = useFetchData(
    ["logisticsOverview", overviewUrl],
    overviewUrl,
  );
  const {
    data: deliveriesData,
    isLoading: deliveriesLoading,
    refetch: refetchDeliveries,
  } = useFetchData(
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

  const totals = useMemo(
    () => mapFinancialTotals(overviewData, transactions),
    [overviewData, transactions],
  );

  const loading = deliveriesLoading || overviewLoading;

  const refreshStatus = async (row) => {
    if (!row.saleId || refreshingSaleId) return;
    setRefreshingSaleId(row.saleId);
    try {
      const response = await AuthAxios.post(
        logisticsDeliveryRefreshUrl(row.saleId),
      );
      await Promise.all([
        refetchDeliveries(),
        queryClient.invalidateQueries({ queryKey: ["logisticsOverview"] }),
      ]);
      notiSuccess(
        response.data?.message || `Shipment ${row.id} status refreshed.`,
      );
    } catch (error) {
      notiError(
        error?.response?.data?.detail ||
          error?.response?.data?.message ||
          `Could not refresh shipment ${row.id}.`,
      );
    } finally {
      setRefreshingSaleId(null);
    }
  };

  return (
    <div className="w-full flex flex-col gap-6">
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<WalletIcon fontSize="small" />}
            color="#3949AB"
            bg="#EEF2FF"
            label="Total Customer Paid"
            value={totals.customerPaid}
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<StoreIcon fontSize="small" />}
            color="#B26A00"
            bg="#FFF7E8"
            label="Paid to Merchants"
            value={totals.paidToMerchants}
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<ShippingIcon fontSize="small" />}
            color="#0369A1"
            bg="#E0F2FE"
            label="Paid to Shipbubble"
            value={totals.paidToShipbubble}
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<PaidIcon fontSize="small" />}
            color="#02981D"
            bg="#E6F7EA"
            label="Total Commission Earned"
            value={totals.sync360Retained}
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
              <th className="py-3 px-3">Status</th>
              <th className="py-3 px-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="py-10 text-center">
                  <CircularProgress size={24} sx={{ color: "#02981D" }} />
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
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
                  <td className="py-4 px-3 text-[13px] text-general">
                    {row.status}
                  </td>
                  <td className="py-4 px-3 text-right">
                    <Button
                      size="small"
                      onClick={() => refreshStatus(row)}
                      disabled={!row.saleId || Boolean(refreshingSaleId)}
                      startIcon={
                        refreshingSaleId === row.saleId ? (
                          <CircularProgress size={14} />
                        ) : (
                          <RefreshIcon fontSize="small" />
                        )
                      }
                      sx={{
                        color: "#02981D",
                        textTransform: "none",
                        whiteSpace: "nowrap",
                      }}
                    >
                      Refresh status
                    </Button>
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
              <div className="flex items-center justify-between mt-3">
                <span className="text-[12px] text-primary_grey_2">
                  Status: {row.status}
                </span>
                <Button
                  size="small"
                  onClick={() => refreshStatus(row)}
                  disabled={!row.saleId || Boolean(refreshingSaleId)}
                  startIcon={
                    refreshingSaleId === row.saleId ? (
                      <CircularProgress size={14} />
                    ) : (
                      <RefreshIcon fontSize="small" />
                    )
                  }
                  sx={{
                    color: "#02981D",
                    textTransform: "none",
                    whiteSpace: "nowrap",
                  }}
                >
                  Refresh status
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default LogisticsTransactions;
