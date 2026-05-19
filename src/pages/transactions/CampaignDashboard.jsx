import { useMemo, useState } from "react";
import { format, parseISO } from "date-fns";
import {
  Card,
  CardContent,
  CircularProgress,
  Grid,
  InputAdornment,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";
import {
  SearchOutlined as SearchIcon,
  PaidOutlined as PaidIcon,
  AccountBalanceWalletOutlined as WalletIcon,
} from "@mui/icons-material";
import CustomPagination from "../../components/CustomPagination";
import FormattedPrice from "../../utils/FormattedPrice";
import { transactionsCampaignUnitDataUrl } from "../../api/endpoint";
import useFetchData from "../../hooks/useFetchData";
import { useDateContext } from "../../utils/DateContext";

const fmtDate = (iso) => {
  if (!iso) return "—";
  try {
    return format(parseISO(iso), "dd MMM yyyy · HH:mm");
  } catch {
    return iso;
  }
};

const StatCard = ({ icon, color, bg, label, value, sub }) => (
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
          {sub && (
            <p className="text-[11px] text-[#9CA3AF] mt-0.5">{sub}</p>
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

const UNIT_TYPES = [
  { key: "All", label: "All Units" },
  { key: "SMS", label: "SMS" },
  { key: "EMAIL", label: "Email" },
];

const CampaignDashboard = () => {
  const { selectedDates } = useDateContext();
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage] = useState(50);
  const [search, setSearch] = useState("");
  const [unitType, setUnitType] = useState("All");

  const apiUrl = transactionsCampaignUnitDataUrl(
    currentPage,
    rowsPerPage,
    search,
    unitType,
    selectedDates
  );
  const { data, isLoading } = useFetchData(
    [
      "fetchCampaignOverview",
      apiUrl,
      currentPage,
      search,
      unitType,
      selectedDates?.startDate,
      selectedDates?.endDate,
    ],
    apiUrl
  );

  const rows = useMemo(() => {
    const raw =
      data?.results ||
      data?.data ||
      (Array.isArray(data) ? data : []);
    return Array.isArray(raw) ? raw : [];
  }, [data]);

  const summary = data?.summary || {};
  const totalPages =
    data?.pagination?.total_pages ||
    data?.total_pages ||
    Math.max(
      1,
      Math.ceil(
        (data?.pagination?.total_count || data?.total || rows.length) /
          rowsPerPage
      )
    );

  return (
    <div className="w-full flex flex-col gap-6">
      <p className="text-[13px] text-primary_grey_2">
        Funding inflow and outstanding credit liability across all campaigns.
      </p>

      {/* Summary cards (driven by API) */}
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <StatCard
            icon={<PaidIcon fontSize="small" />}
            color="#02981D"
            bg="#E6F7EA"
            label="Total Funding"
            value={<FormattedPrice amount={Number(summary.total_funding || 0)} />}
            sub="Inflow in selected range"
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <StatCard
            icon={<WalletIcon fontSize="small" />}
            color="#7C3AED"
            bg="#F3E8FF"
            label="Credits Liability"
            value={
              <FormattedPrice amount={Number(summary.credits_liability || 0)} />
            }
            sub="Unspent platform credits"
          />
        </Grid>
      </Grid>

      {/* Filters + table */}
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
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by merchant name"
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
            <Select
              size="small"
              value={unitType}
              onChange={(e) => {
                setUnitType(e.target.value);
                setCurrentPage(1);
              }}
              sx={{ minWidth: 160 }}
            >
              {UNIT_TYPES.map((u) => (
                <MenuItem key={u.key} value={u.key}>
                  {u.label}
                </MenuItem>
              ))}
            </Select>
          </div>

          <div className="w-full overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[12px] uppercase tracking-wide text-primary_grey_2 border-b border-[#EFEFEF]">
                  <th className="py-3 px-3">Merchant</th>
                  <th className="py-3 px-3">Unit Type</th>
                  <th className="py-3 px-3 text-right">Funding</th>
                  <th className="py-3 px-3 text-right">Credits Used</th>
                  <th className="py-3 px-3 text-right">Credits Left</th>
                  <th className="py-3 px-3">Last Activity</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="py-10 text-center">
                      <CircularProgress sx={{ color: "#02981D" }} />
                    </td>
                  </tr>
                ) : rows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="py-10 text-center text-primary_grey_2"
                    >
                      No campaign activity in this range.
                    </td>
                  </tr>
                ) : (
                  rows.map((r, i) => (
                    <tr
                      key={r?.id || i}
                      className="border-b border-[#F5F5F5] hover:bg-[#FAFAFA]"
                    >
                      <td className="py-4 px-3 text-[13px] font-medium text-general">
                        {r?.merchant_name || r?.merchant || r?.name || "—"}
                      </td>
                      <td className="py-4 px-3 text-[12px]">
                        <span
                          className="text-[12px] font-semibold px-2 py-1 rounded-md"
                          style={{
                            background:
                              (r?.unit_type || "").toUpperCase() === "EMAIL"
                                ? "#EEF2FF"
                                : "#E6F7EA",
                            color:
                              (r?.unit_type || "").toUpperCase() === "EMAIL"
                                ? "#3949AB"
                                : "#02981D",
                          }}
                        >
                          {r?.unit_type || "—"}
                        </span>
                      </td>
                      <td className="py-4 px-3 text-[13px] text-general text-right">
                        <FormattedPrice
                          amount={Number(r?.funding || r?.total_funding || 0)}
                        />
                      </td>
                      <td className="py-4 px-3 text-[13px] text-general text-right">
                        {Number(
                          r?.credits_used || r?.used || 0
                        ).toLocaleString()}
                      </td>
                      <td className="py-4 px-3 text-[13px] text-general text-right">
                        {Number(
                          r?.credits_left || r?.balance || 0
                        ).toLocaleString()}
                      </td>
                      <td className="py-4 px-3 text-[12px] text-primary_grey_2">
                        {fmtDate(r?.last_activity || r?.updated_at)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {!isLoading && rows.length > 0 && (
            <CustomPagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CampaignDashboard;
