import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Grid,
  InputAdornment,
  LinearProgress,
  TextField,
} from "@mui/material";
import {
  ArrowBackRounded as BackIcon,
  SearchOutlined as SearchIcon,
  AccessTimeOutlined as ClockIcon,
  CheckCircleRounded as CheckIcon,
  ClearRounded as ClearIcon,
  HourglassEmpty as PendingIcon,
  LockOpenRounded as UnlockedIcon,
  PaidOutlined as PaidIcon,
  GroupAddOutlined as ReferralsIcon,
  ContentCopyRounded as CopyIcon,
} from "@mui/icons-material";
import FormattedPrice from "../../utils/FormattedPrice";
import CustomModal from "../../components/CustomModal";
import { findReferrer } from "./referralData";

const StatusPill = ({ status }) => {
  const map = {
    Active: { bg: "#E6F7EA", color: "#02981D" },
    "Not Subscribed": { bg: "#FFF7E8", color: "#B26A00" },
    Expired: { bg: "#FDECEC", color: "#DC3545" },
  };
  const s = map[status] || { bg: "#F5F5F5", color: "#5E5E5E" };
  return (
    <span
      className="inline-flex items-center gap-1 text-[12px] font-medium px-3 py-1 rounded-full whitespace-nowrap"
      style={{ background: s.bg, color: s.color }}
    >
      {status === "Active" && <CheckIcon sx={{ fontSize: 12 }} />}
      {status}
    </span>
  );
};

const StatTile = ({ icon, color, bg, label, value, sub }) => (
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

const initials = (name) =>
  (name || "")
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

const ReferrerDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const referrer = useMemo(() => findReferrer(id), [id]);
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [search, setSearch] = useState("");
  const [copied, setCopied] = useState(false);

  if (!referrer) {
    return (
      <div className="w-full flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <p className="text-[16px] font-semibold text-general">
          Referrer not found
        </p>
        <Button
          onClick={() => navigate("/referrals")}
          variant="contained"
          startIcon={<BackIcon />}
          sx={{
            textTransform: "none",
            background: "#02981D",
            boxShadow: "none",
            "&:hover": { background: "#017a17" },
          }}
        >
          Back to Referrals
        </Button>
      </div>
    );
  }

  const businesses = referrer.businesses || [];
  const filteredBiz = useMemo(() => {
    if (!search) return businesses;
    const q = search.toLowerCase();
    return businesses.filter(
      (b) =>
        b.name.toLowerCase().includes(q) ||
        b.plan.toLowerCase().includes(q) ||
        b.status.toLowerCase().includes(q)
    );
  }, [search, businesses]);

  const copyCode = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(referrer.code);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
        <div className="flex items-start gap-3">
          <button
            onClick={() => navigate("/referrals")}
            className="h-10 w-10 rounded-full bg-white border border-[#E3E3E3] flex items-center justify-center hover:bg-[#F5F5F5] flex-none"
          >
            <BackIcon sx={{ color: "#5E5E5E", fontSize: 20 }} />
          </button>
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-[#F6FFF8] text-[#02981D] flex items-center justify-center font-semibold text-[16px] flex-none">
              {initials(referrer.name)}
            </div>
            <div>
              <h1 className="text-[20px] md:text-[22px] font-semibold text-general">
                {referrer.name}
              </h1>
              <p className="text-[12px] text-primary_grey_2 mt-0.5">
                {referrer.email} · Joined {referrer.joined}
              </p>
              <div className="flex items-center gap-2 mt-1.5">
                <Chip
                  size="small"
                  label={referrer.code}
                  onClick={copyCode}
                  icon={
                    copied ? (
                      <CheckIcon sx={{ fontSize: 14, color: "#02981D" }} />
                    ) : (
                      <CopyIcon sx={{ fontSize: 14, color: "#02981D" }} />
                    )
                  }
                  sx={{
                    background: "#F6FFF8",
                    color: "#02981D",
                    fontWeight: 700,
                    fontFamily: "monospace",
                    cursor: "pointer",
                  }}
                />
                {copied && (
                  <span className="text-[11px] text-[#02981D]">Copied!</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Wallet snapshot — 4 tiles */}
      <Grid container spacing={2}>
        <Grid item xs={6} md={3}>
          <StatTile
            icon={<ReferralsIcon fontSize="small" />}
            color="#3949AB"
            bg="#EEF2FF"
            label="Total Referrals"
            value={referrer.referrals.toLocaleString()}
            sub="Businesses referred"
          />
        </Grid>
        <Grid item xs={6} md={3}>
          <StatTile
            icon={<PendingIcon fontSize="small" />}
            color="#B26A00"
            bg="#FFF7E8"
            label="Pending"
            value={<FormattedPrice amount={referrer.pending} />}
            sub="Locked rewards"
          />
        </Grid>
        <Grid item xs={6} md={3}>
          <StatTile
            icon={<UnlockedIcon fontSize="small" />}
            color="#02981D"
            bg="#E6F7EA"
            label="Unlocked"
            value={<FormattedPrice amount={referrer.unlocked} />}
            sub="Ready to withdraw"
          />
        </Grid>
        <Grid item xs={6} md={3}>
          <StatTile
            icon={<PaidIcon fontSize="small" />}
            color="#0369A1"
            bg="#E0F2FE"
            label="Withdrawn"
            value={<FormattedPrice amount={referrer.withdrawn} />}
            sub="All-time payouts"
          />
        </Grid>
      </Grid>

      {/* Businesses table */}
      <Card
        sx={{
          borderRadius: "14px",
          boxShadow: "0 1px 3px rgba(16,24,40,.06)",
          border: "1px solid #EFEFEF",
        }}
      >
        <CardContent sx={{ p: { xs: 2, md: 3 } }}>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 mb-4">
            <div>
              <p className="text-[15px] font-semibold text-general">
                Referred Businesses
              </p>
              <p className="text-[12px] text-primary_grey_2 mt-0.5">
                {businesses.length} business
                {businesses.length === 1 ? "" : "es"} linked to this referrer.
              </p>
            </div>
            <TextField
              size="small"
              placeholder="Search business name, plan, or status"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              sx={{ minWidth: { lg: 320 } }}
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
                  <th className="py-3 px-3">Business</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Plan</th>
                  <th className="py-3 px-3 text-right">Pending</th>
                  <th className="py-3 px-3 text-right">Unlocked</th>
                  <th className="py-3 px-3">Expires</th>
                </tr>
              </thead>
              <tbody>
                {filteredBiz.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="py-10 text-center text-primary_grey_2"
                    >
                      {businesses.length === 0
                        ? "No businesses linked to this referrer yet."
                        : "No matches for your search."}
                    </td>
                  </tr>
                ) : (
                  filteredBiz.map((b) => (
                    <tr
                      key={b.id}
                      onClick={() => setSelectedBusiness(b)}
                      className="border-b border-[#F5F5F5] hover:bg-[#FAFAFA] cursor-pointer"
                    >
                      <td className="py-3 px-3 text-[13px] font-medium text-general">
                        {b.name}
                      </td>
                      <td className="py-3 px-3">
                        <StatusPill status={b.status} />
                      </td>
                      <td className="py-3 px-3">
                        {b.plan !== "—" ? (
                          <Chip
                            size="small"
                            label={b.plan}
                            sx={{
                              background: "#F6FFF8",
                              color: "#02981D",
                              fontWeight: 600,
                            }}
                          />
                        ) : (
                          <span className="text-[12px] text-primary_grey_2">
                            —
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-[13px] text-[#B26A00] text-right">
                        <FormattedPrice amount={b.pending} />
                      </td>
                      <td className="py-3 px-3 text-[13px] text-[#02981D] text-right font-semibold">
                        <FormattedPrice amount={b.unlocked} />
                      </td>
                      <td className="py-3 px-3 text-[12px] text-primary_grey_2">
                        <span className="inline-flex items-center gap-1">
                          <ClockIcon sx={{ fontSize: 14 }} />
                          {b.expiresInDays} days
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden flex flex-col gap-3">
            {filteredBiz.length === 0 ? (
              <p className="py-6 text-center text-primary_grey_2 text-[13px]">
                {businesses.length === 0
                  ? "No businesses yet."
                  : "No matches."}
              </p>
            ) : (
              filteredBiz.map((b) => (
                <div
                  key={b.id}
                  onClick={() => setSelectedBusiness(b)}
                  className="border border-[#EFEFEF] rounded-xl p-4 active:bg-[#FAFAFA]"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-[14px] font-medium text-general truncate">
                        {b.name}
                      </p>
                      {b.plan !== "—" && (
                        <p className="text-[11px] text-primary_grey_2 truncate">
                          {b.plan}
                        </p>
                      )}
                    </div>
                    <StatusPill status={b.status} />
                  </div>
                  <Divider sx={{ my: 1.5 }} />
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-[11px] text-primary_grey_2">
                        Pending
                      </p>
                      <p className="text-[13px] text-[#B26A00] font-medium">
                        <FormattedPrice amount={b.pending} />
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[11px] text-primary_grey_2">
                        Unlocked
                      </p>
                      <p className="text-[13px] text-[#02981D] font-semibold">
                        <FormattedPrice amount={b.unlocked} />
                      </p>
                    </div>
                  </div>
                  <div className="mt-2 text-[11px] text-primary_grey_2 inline-flex items-center gap-1">
                    <ClockIcon sx={{ fontSize: 14 }} />
                    Expires in {b.expiresInDays} days
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Business detail modal */}
      <CustomModal
        open={!!selectedBusiness}
        closeModal={() => setSelectedBusiness(null)}
        style="w-[95%] md:w-3/5 lg:w-1/2"
      >
        {selectedBusiness && (
          <BusinessDetail
            business={selectedBusiness}
            referrer={referrer}
            close={() => setSelectedBusiness(null)}
          />
        )}
      </CustomModal>
    </div>
  );
};

const BusinessDetail = ({ business, referrer, close }) => {
  const pct = useMemo(() => {
    if (!business.totalReward) return 0;
    return Math.min(
      100,
      Math.round((business.unlocked / business.totalReward) * 100)
    );
  }, [business]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[18px] font-semibold text-general">
            {business.name}
          </p>
          <p className="text-[12px] text-primary_grey_2 mt-0.5">
            Referred by{" "}
            <span className="font-medium text-general">{referrer?.name}</span>
          </p>
        </div>
        <div className="flex items-start gap-2">
          <StatusPill status={business.status} />
          <ClearIcon
            onClick={close}
            sx={{ color: "#1E1E1E", cursor: "pointer" }}
          />
        </div>
      </div>

      <div className="border border-[#EFEFEF] rounded-xl p-4">
        <p className="text-[12px] uppercase tracking-wide text-primary_grey_2 mb-3">
          Reward Allocation
        </p>
        <Grid container spacing={2}>
          <Grid item xs={4}>
            <p className="text-[11px] text-primary_grey_2">Total Reward</p>
            <p className="text-[16px] font-semibold text-general mt-0.5">
              <FormattedPrice amount={business.totalReward} />
            </p>
          </Grid>
          <Grid item xs={4}>
            <p className="text-[11px] text-primary_grey_2">Unlocked</p>
            <p className="text-[16px] font-semibold text-[#02981D] mt-0.5">
              <FormattedPrice amount={business.unlocked} />
            </p>
          </Grid>
          <Grid item xs={4}>
            <p className="text-[11px] text-primary_grey_2">Remaining</p>
            <p className="text-[16px] font-semibold text-[#B26A00] mt-0.5">
              <FormattedPrice amount={business.pending} />
            </p>
          </Grid>
        </Grid>
        <div className="mt-4">
          <div className="flex items-center justify-between mb-1.5">
            <p className="text-[12px] text-primary_grey_2">Progress</p>
            <p className="text-[12px] text-general font-semibold">{pct}%</p>
          </div>
          <LinearProgress
            variant="determinate"
            value={pct}
            sx={{
              height: 8,
              borderRadius: 4,
              backgroundColor: "#F5F5F5",
              "& .MuiLinearProgress-bar": { backgroundColor: "#02981D" },
            }}
          />
        </div>
      </div>

      <div className="border border-[#EFEFEF] rounded-xl p-4">
        <p className="text-[12px] uppercase tracking-wide text-primary_grey_2 mb-2">
          Plan & Subscription
        </p>
        <Divider />
        {[
          ["Plan", business.plan],
          [
            "Current Subscription",
            <FormattedPrice key="c" amount={business.currentSubscription} />,
          ],
          [
            "Total Subscription Value",
            <FormattedPrice
              key="t"
              amount={business.totalSubscriptionValue}
            />,
          ],
          [
            "Unlocked Reward",
            <FormattedPrice key="u" amount={business.unlocked} />,
          ],
          [
            "Remaining Reward",
            <FormattedPrice key="r" amount={business.pending} />,
          ],
          ["Expiry", `${business.expiresInDays} Days`],
        ].map(([label, value], i, arr) => (
          <div key={label}>
            <div className="flex items-center justify-between py-2 gap-3">
              <span className="text-[13px] text-primary_grey_2">{label}</span>
              <span className="text-[13px] text-general font-medium text-right">
                {value}
              </span>
            </div>
            {i !== arr.length - 1 && <Divider />}
          </div>
        ))}
      </div>

      <div className="border border-[#EFEFEF] rounded-xl p-4">
        <p className="text-[12px] uppercase tracking-wide text-primary_grey_2 mb-3">
          Recent Subscription Activity
        </p>
        {business.activity.length === 0 ? (
          <p className="text-[13px] text-primary_grey_2 text-center py-4">
            No subscription activity yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[11px] uppercase tracking-wide text-primary_grey_2 border-b border-[#EFEFEF]">
                  <th className="py-2 px-2">Date</th>
                  <th className="py-2 px-2 text-right">Subscription</th>
                  <th className="py-2 px-2 text-right">Reward Unlocked</th>
                </tr>
              </thead>
              <tbody>
                {business.activity.map((a, i) => (
                  <tr
                    key={i}
                    className="border-b border-[#F5F5F5] last:border-0"
                  >
                    <td className="py-2 px-2 text-[12px] text-general">
                      {a.date}
                    </td>
                    <td className="py-2 px-2 text-[12px] text-general text-right">
                      <FormattedPrice amount={a.subscription} />
                    </td>
                    <td className="py-2 px-2 text-[12px] text-[#02981D] font-semibold text-right">
                      <FormattedPrice amount={a.reward} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
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
          Close
        </Button>
      </div>
    </div>
  );
};

export default ReferrerDetailPage;
