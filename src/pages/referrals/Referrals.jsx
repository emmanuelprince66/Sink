import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  Divider,
  Grid,
  InputAdornment,
  TextField,
} from "@mui/material";
import {
  GroupAddOutlined as ReferralsIcon,
  HourglassEmpty as PendingIcon,
  LockOpenRounded as UnlockedIcon,
  PaidOutlined as PaidIcon,
  ScheduleSendOutlined as ExpiringIcon,
  PeopleAltOutlined as PeopleIcon,
  SearchOutlined as SearchIcon,
  ChevronRightRounded as ChevronRightIcon,
  ShieldOutlined as ShieldIcon,
} from "@mui/icons-material";
import FormattedPrice from "../../utils/FormattedPrice";
import { PLATFORM, REFERRERS } from "./referralData";

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

const initials = (name) =>
  (name || "")
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

const Referrals = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search) return REFERRERS;
    const q = search.toLowerCase();
    return REFERRERS.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.email.toLowerCase().includes(q) ||
        r.code.toLowerCase().includes(q)
    );
  }, [search]);

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShieldIcon sx={{ color: "#02981D", fontSize: 20 }} />
            <h1 className="text-[20px] md:text-[22px] font-semibold text-general">
              Referrals — Admin Dashboard
            </h1>
          </div>
          <p className="text-[13px] text-primary_grey_2">
            Fraud protection, referral ROI, and reward lifecycle monitoring.
          </p>
        </div>
      </div>

      {/* Executive Overview — 6 cards */}
      <Grid container spacing={2}>
        <Grid item xs={6} md={4} lg={2}>
          <StatCard
            icon={<ReferralsIcon fontSize="small" />}
            color="#3949AB"
            bg="#EEF2FF"
            label="Total Referrals"
            value={PLATFORM.totalReferrals.toLocaleString()}
            subtitle="All-time"
          />
        </Grid>
        <Grid item xs={6} md={4} lg={2}>
          <StatCard
            icon={<PeopleIcon fontSize="small" />}
            color="#02981D"
            bg="#E6F7EA"
            label="Active Referrers"
            value={PLATFORM.activeReferrers.toLocaleString()}
            subtitle="≥ 1 referral"
          />
        </Grid>
        <Grid item xs={6} md={4} lg={2}>
          <StatCard
            icon={<PendingIcon fontSize="small" />}
            color="#B26A00"
            bg="#FFF7E8"
            label="Pending Rewards"
            value={<FormattedPrice amount={PLATFORM.pendingRewards} />}
            subtitle="Locked liability"
          />
        </Grid>
        <Grid item xs={6} md={4} lg={2}>
          <StatCard
            icon={<UnlockedIcon fontSize="small" />}
            color="#0369A1"
            bg="#E0F2FE"
            label="Unlocked Rewards"
            value={<FormattedPrice amount={PLATFORM.unlockedRewards} />}
            subtitle="Withdrawable"
          />
        </Grid>
        <Grid item xs={6} md={4} lg={2}>
          <StatCard
            icon={<PaidIcon fontSize="small" />}
            color="#02981D"
            bg="#E6F7EA"
            label="Paid Out"
            value={<FormattedPrice amount={PLATFORM.paidOut} />}
            subtitle="All-time payouts"
          />
        </Grid>
        <Grid item xs={6} md={4} lg={2}>
          <StatCard
            icon={<ExpiringIcon fontSize="small" />}
            color="#DC3545"
            bg="#FDECEC"
            label="Expiring Rewards"
            value={<FormattedPrice amount={PLATFORM.expiringRewards} />}
            subtitle="Next 30 days"
          />
        </Grid>
      </Grid>

      {/* Referrer Monitoring */}
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
                Referrer Monitoring
              </p>
              <p className="text-[12px] text-primary_grey_2 mt-0.5">
                Click a referrer to view their referred businesses.
              </p>
            </div>
            <TextField
              size="small"
              placeholder="Search by name, email, or code"
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
                  <th className="py-3 px-3">Referrer</th>
                  <th className="py-3 px-3 text-right">Referrals</th>
                  <th className="py-3 px-3 text-right">Pending</th>
                  <th className="py-3 px-3 text-right">Unlocked</th>
                  <th className="py-3 px-3 text-right">Withdrawn</th>
                  <th className="py-3 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="py-10 text-center text-primary_grey_2"
                    >
                      No referrers match your search.
                    </td>
                  </tr>
                ) : (
                  filtered.map((r) => (
                    <tr
                      key={r.id}
                      onClick={() => navigate(`/referrals/${r.id}`)}
                      className="border-b border-[#F5F5F5] hover:bg-[#FAFAFA] cursor-pointer"
                    >
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-[#F6FFF8] text-[#02981D] flex items-center justify-center font-semibold text-[12px] flex-none">
                            {initials(r.name)}
                          </div>
                          <div className="min-w-0">
                            <p className="text-[13px] font-medium text-general truncate">
                              {r.name}
                            </p>
                            <p className="text-[11px] text-primary_grey_2 truncate">
                              {r.email} ·{" "}
                              <span className="font-mono">{r.code}</span>
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-[13px] text-general text-right">
                        {r.referrals.toLocaleString()}
                      </td>
                      <td className="py-3 px-3 text-[13px] text-[#B26A00] text-right">
                        <FormattedPrice amount={r.pending} />
                      </td>
                      <td className="py-3 px-3 text-[13px] text-[#02981D] text-right font-semibold">
                        <FormattedPrice amount={r.unlocked} />
                      </td>
                      <td className="py-3 px-3 text-[13px] text-general text-right">
                        <FormattedPrice amount={r.withdrawn} />
                      </td>
                      <td className="py-3 px-3 text-right">
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
            {filtered.map((r) => (
              <div
                key={r.id}
                onClick={() => navigate(`/referrals/${r.id}`)}
                className="border border-[#EFEFEF] rounded-xl p-4 active:bg-[#FAFAFA]"
              >
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-[#F6FFF8] text-[#02981D] flex items-center justify-center font-semibold text-[12px] flex-none">
                    {initials(r.name)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[14px] font-medium text-general truncate">
                      {r.name}
                    </p>
                    <p className="text-[11px] text-primary_grey_2 truncate">
                      {r.email}
                    </p>
                  </div>
                </div>
                <Divider sx={{ my: 1.5 }} />
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-[11px] text-primary_grey_2">Referrals</p>
                    <p className="text-[13px] font-medium text-general">
                      {r.referrals}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[11px] text-primary_grey_2">Withdrawn</p>
                    <p className="text-[13px] font-medium text-general">
                      <FormattedPrice amount={r.withdrawn} />
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] text-primary_grey_2">Pending</p>
                    <p className="text-[13px] text-[#B26A00] font-medium">
                      <FormattedPrice amount={r.pending} />
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[11px] text-primary_grey_2">Unlocked</p>
                    <p className="text-[13px] text-[#02981D] font-semibold">
                      <FormattedPrice amount={r.unlocked} />
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Referrals;
