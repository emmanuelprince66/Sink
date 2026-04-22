import { useMemo, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Grid,
  MenuItem,
  Select,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import {
  CampaignOutlined as CampaignIcon,
  NotificationsActiveOutlined as PushIcon,
  EmailOutlined as EmailIcon,
  SmsOutlined as SmsIcon,
  PeopleAltOutlined as PeopleIcon,
  TrendingUpOutlined as TrendingIcon,
  SendRounded as SendIcon,
  CheckCircleOutline as CheckIcon,
  CancelOutlined as CancelIcon,
  HourglassEmpty as PendingIcon,
} from "@mui/icons-material";

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

const ChannelToggle = ({ icon, label, active, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`flex-1 min-w-[120px] flex items-center justify-center gap-2 py-3 px-4 rounded-xl border transition ${
      active
        ? "bg-[#F6FFF8] border-[#02981D] text-[#02981D]"
        : "bg-white border-[#E3E3E3] text-[#5E5E5E] hover:border-[#02981D]"
    }`}
  >
    {icon}
    <span className="text-[14px] font-medium">{label}</span>
  </button>
);

const TEMPLATES = [
  {
    id: "subscription-reminder",
    title: "Subscription Reminder",
    description: "Nudge users whose subscription is about to lapse.",
    body: "Hi {{name}}, your subscription expires in 3 days. Renew now to avoid service interruption.",
    tag: "Reminder",
  },
  {
    id: "kyc-approved",
    title: "KYC Approved",
    description: "Sent automatically once a KYC submission is approved.",
    body: "Congratulations {{name}}, your KYC has been approved. You now have full access to all features.",
    tag: "Transactional",
  },
  {
    id: "kyc-rejected",
    title: "KYC Rejected",
    description: "Sent when KYC is rejected, requires reason.",
    body: "Hi {{name}}, your KYC was not approved. Reason: {{reason}}. Please re-upload to continue.",
    tag: "Transactional",
  },
  {
    id: "promotion-easter",
    title: "Promotional — Q2 Promo",
    description: "Marketing push for the spring promotion.",
    body: "Limited time! Get 25% off your next subscription. Use code SPRING25 at checkout.",
    tag: "Promotion",
  },
];

const LOGS = [
  {
    id: 1,
    title: "April Subscription Reminder",
    channel: "Email",
    audience: "By Subscription Status — Expiring",
    sent: "2026-04-21 09:00",
    delivered: 12480,
    opened: 8214,
    failed: 36,
    status: "delivered",
  },
  {
    id: 2,
    title: "Welcome Push — New Tier 2 Users",
    channel: "Push",
    audience: "By Tier — Tier 2",
    sent: "2026-04-20 14:12",
    delivered: 3220,
    opened: 2104,
    failed: 12,
    status: "delivered",
  },
  {
    id: 3,
    title: "Promo SMS — SPRING25",
    channel: "SMS",
    audience: "All Users",
    sent: "2026-04-19 10:30",
    delivered: 49210,
    opened: null,
    failed: 142,
    status: "delivered",
  },
  {
    id: 4,
    title: "Inactive User Re-engagement",
    channel: "Email",
    audience: "By Activity — Inactive 30d",
    sent: "2026-04-22 08:00",
    delivered: 0,
    opened: null,
    failed: 0,
    status: "scheduled",
  },
];

const StatusPill = ({ status }) => {
  const map = {
    delivered: {
      bg: "#E6F7EA",
      color: "#02981D",
      label: "Delivered",
      icon: <CheckIcon sx={{ fontSize: 14 }} />,
    },
    failed: {
      bg: "#FDECEC",
      color: "#DC3545",
      label: "Failed",
      icon: <CancelIcon sx={{ fontSize: 14 }} />,
    },
    scheduled: {
      bg: "#FFF7E8",
      color: "#B26A00",
      label: "Scheduled",
      icon: <PendingIcon sx={{ fontSize: 14 }} />,
    },
  }[status];
  return (
    <span
      className="inline-flex items-center gap-1 text-[12px] font-medium px-2 py-1 rounded-full"
      style={{ background: map.bg, color: map.color }}
    >
      {map.icon}
      {map.label}
    </span>
  );
};

const EngagementHub = () => {
  const [tab, setTab] = useState(0);
  const [channels, setChannels] = useState({
    push: true,
    email: true,
    sms: false,
  });
  const [audience, setAudience] = useState("all");
  const [template, setTemplate] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");

  const stats = useMemo(
    () => ({
      sent: LOGS.reduce((acc, l) => acc + l.delivered, 0),
      open:
        Math.round(
          (LOGS.filter((l) => l.opened !== null).reduce(
            (acc, l) => acc + l.opened,
            0
          ) /
            Math.max(
              LOGS.filter((l) => l.opened !== null).reduce(
                (acc, l) => acc + l.delivered,
                0
              ),
              1
            )) *
            100
        ) + "%",
      failed: LOGS.reduce((acc, l) => acc + l.failed, 0),
      scheduled: LOGS.filter((l) => l.status === "scheduled").length,
    }),
    []
  );

  const onPickTemplate = (id) => {
    const tpl = TEMPLATES.find((t) => t.id === id);
    setTemplate(id);
    if (tpl) {
      setSubject(tpl.title);
      setBody(tpl.body);
    }
  };

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-[20px] md:text-[22px] font-semibold text-general">
            Engagement Hub
          </h1>
          <p className="text-[13px] text-primary_grey_2 mt-1">
            Reach users across push, email, and SMS — with templates and
            delivery insights.
          </p>
        </div>
      </div>

      {/* Stats */}
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<CampaignIcon fontSize="small" />}
            color="#02981D"
            bg="#E6F7EA"
            label="Total Delivered"
            value={stats.sent.toLocaleString()}
            subtitle="Across all channels"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<TrendingIcon fontSize="small" />}
            color="#3949AB"
            bg="#EEF2FF"
            label="Avg. Open Rate"
            value={stats.open}
            subtitle="Email / Push only"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<CancelIcon fontSize="small" />}
            color="#DC3545"
            bg="#FDECEC"
            label="Failed"
            value={stats.failed.toLocaleString()}
            subtitle="Retry available"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<PendingIcon fontSize="small" />}
            color="#B26A00"
            bg="#FFF7E8"
            label="Scheduled"
            value={stats.scheduled}
            subtitle="Awaiting send window"
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
              <Tab label="Compose" />
              <Tab label="Templates" />
              <Tab label="Delivery Logs" />
            </Tabs>
          </Box>

          {tab === 0 && (
            <Grid container spacing={3}>
              <Grid item xs={12} lg={7}>
                <div className="flex flex-col gap-5">
                  <div>
                    <p className="text-[13px] font-semibold text-general mb-2">
                      Channels
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <ChannelToggle
                        icon={<PushIcon fontSize="small" />}
                        label="Push"
                        active={channels.push}
                        onClick={() =>
                          setChannels((c) => ({ ...c, push: !c.push }))
                        }
                      />
                      <ChannelToggle
                        icon={<EmailIcon fontSize="small" />}
                        label="Email"
                        active={channels.email}
                        onClick={() =>
                          setChannels((c) => ({ ...c, email: !c.email }))
                        }
                      />
                      <ChannelToggle
                        icon={<SmsIcon fontSize="small" />}
                        label="SMS"
                        active={channels.sms}
                        onClick={() =>
                          setChannels((c) => ({ ...c, sms: !c.sms }))
                        }
                      />
                    </div>
                  </div>

                  <div>
                    <p className="text-[13px] font-semibold text-general mb-2">
                      Audience
                    </p>
                    <Select
                      fullWidth
                      size="small"
                      value={audience}
                      onChange={(e) => setAudience(e.target.value)}
                    >
                      <MenuItem value="all">All Users</MenuItem>
                      <MenuItem value="tier-1">By Tier — Tier 1</MenuItem>
                      <MenuItem value="tier-2">By Tier — Tier 2</MenuItem>
                      <MenuItem value="tier-3">By Tier — Tier 3</MenuItem>
                      <MenuItem value="sub-active">
                        By Subscription Status — Active
                      </MenuItem>
                      <MenuItem value="sub-expiring">
                        By Subscription Status — Expiring
                      </MenuItem>
                      <MenuItem value="active-30">
                        By Activity — Active (last 30d)
                      </MenuItem>
                      <MenuItem value="inactive-30">
                        By Activity — Inactive 30d
                      </MenuItem>
                    </Select>
                  </div>

                  <div>
                    <p className="text-[13px] font-semibold text-general mb-2">
                      Template (optional)
                    </p>
                    <Select
                      fullWidth
                      size="small"
                      displayEmpty
                      value={template}
                      onChange={(e) => onPickTemplate(e.target.value)}
                    >
                      <MenuItem value="">— Start from scratch —</MenuItem>
                      {TEMPLATES.map((t) => (
                        <MenuItem key={t.id} value={t.id}>
                          {t.title}
                        </MenuItem>
                      ))}
                    </Select>
                  </div>

                  <div>
                    <p className="text-[13px] font-semibold text-general mb-2">
                      Subject / Title
                    </p>
                    <TextField
                      fullWidth
                      size="small"
                      placeholder="e.g. Renew your subscription before Friday"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                    />
                  </div>

                  <div>
                    <p className="text-[13px] font-semibold text-general mb-2">
                      Message Body
                    </p>
                    <TextField
                      fullWidth
                      multiline
                      minRows={6}
                      placeholder="Write your message. Use {{name}} for personalization."
                      value={body}
                      onChange={(e) => setBody(e.target.value)}
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2 justify-end">
                    <Button
                      sx={{
                        textTransform: "none",
                        color: "#5E5E5E",
                        border: "1px solid #E3E3E3",
                        background: "#fff",
                        "&:hover": { background: "#F5F5F5" },
                      }}
                    >
                      Save as Draft
                    </Button>
                    <Button
                      variant="contained"
                      startIcon={<SendIcon />}
                      sx={{
                        textTransform: "none",
                        background: "#02981D",
                        boxShadow: "none",
                        "&:hover": { background: "#017a17" },
                      }}
                    >
                      Send Now
                    </Button>
                  </div>
                </div>
              </Grid>

              <Grid item xs={12} lg={5}>
                <div className="bg-[#FAFAFA] border border-[#EFEFEF] rounded-xl p-5 sticky top-2">
                  <p className="text-[12px] uppercase tracking-wide text-primary_grey_2 mb-3">
                    Live Preview
                  </p>
                  <div className="bg-white rounded-xl border border-[#EFEFEF] p-4 min-h-[200px]">
                    <div className="flex items-center justify-between mb-2">
                      <Chip
                        size="small"
                        label={
                          channels.push && channels.email && channels.sms
                            ? "Multi-channel"
                            : channels.push
                            ? "Push"
                            : channels.email
                            ? "Email"
                            : channels.sms
                            ? "SMS"
                            : "No channel"
                        }
                        sx={{
                          background: "#F6FFF8",
                          color: "#02981D",
                          fontWeight: 600,
                        }}
                      />
                      <span className="text-[11px] text-primary_grey_2">
                        Preview
                      </span>
                    </div>
                    <p className="text-[15px] font-semibold text-general">
                      {subject || "Your message subject"}
                    </p>
                    <Divider sx={{ my: 1.5 }} />
                    <p className="text-[13px] text-general whitespace-pre-wrap leading-relaxed">
                      {body || "Your message body will appear here..."}
                    </p>
                  </div>
                  <div className="mt-3 text-[12px] text-primary_grey_2">
                    Estimated reach:{" "}
                    <span className="text-general font-medium">
                      {audience === "all"
                        ? "~ 142,000 users"
                        : "~ 24,300 users"}
                    </span>
                  </div>
                </div>
              </Grid>
            </Grid>
          )}

          {tab === 1 && (
            <Grid container spacing={2}>
              {TEMPLATES.map((t) => (
                <Grid item xs={12} sm={6} lg={4} key={t.id}>
                  <div className="border border-[#EFEFEF] rounded-xl p-4 h-full flex flex-col gap-2 hover:border-[#02981D]">
                    <div className="flex items-center justify-between">
                      <p className="text-[14px] font-semibold text-general">
                        {t.title}
                      </p>
                      <Chip
                        size="small"
                        label={t.tag}
                        sx={{
                          background: "#F5F5F5",
                          color: "#5E5E5E",
                          fontWeight: 600,
                        }}
                      />
                    </div>
                    <p className="text-[12px] text-primary_grey_2">
                      {t.description}
                    </p>
                    <p className="text-[12px] text-general mt-2 line-clamp-3">
                      {t.body}
                    </p>
                    <div className="mt-auto pt-3 flex justify-end gap-2">
                      <Button
                        size="small"
                        sx={{
                          textTransform: "none",
                          color: "#5E5E5E",
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        size="small"
                        variant="contained"
                        onClick={() => {
                          setTab(0);
                          onPickTemplate(t.id);
                        }}
                        sx={{
                          textTransform: "none",
                          background: "#02981D",
                          boxShadow: "none",
                          "&:hover": { background: "#017a17" },
                        }}
                      >
                        Use Template
                      </Button>
                    </div>
                  </div>
                </Grid>
              ))}
            </Grid>
          )}

          {tab === 2 && (
            <>
              <div className="hidden md:block w-full overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-[12px] uppercase tracking-wide text-primary_grey_2 border-b border-[#EFEFEF]">
                      <th className="py-3 px-3">Campaign</th>
                      <th className="py-3 px-3">Channel</th>
                      <th className="py-3 px-3">Audience</th>
                      <th className="py-3 px-3">Sent At</th>
                      <th className="py-3 px-3">Delivered</th>
                      <th className="py-3 px-3">Open Rate</th>
                      <th className="py-3 px-3">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {LOGS.map((l) => (
                      <tr
                        key={l.id}
                        className="border-b border-[#F5F5F5] hover:bg-[#FAFAFA]"
                      >
                        <td className="py-4 px-3 text-[13px] text-general font-medium">
                          {l.title}
                        </td>
                        <td className="py-4 px-3 text-[13px]">
                          <Chip
                            size="small"
                            label={l.channel}
                            sx={{
                              background: "#F5F5F5",
                              color: "#5E5E5E",
                              fontWeight: 600,
                            }}
                          />
                        </td>
                        <td className="py-4 px-3 text-[13px] text-general">
                          {l.audience}
                        </td>
                        <td className="py-4 px-3 text-[13px] text-primary_grey_2">
                          {l.sent}
                        </td>
                        <td className="py-4 px-3 text-[13px] text-general">
                          {l.delivered.toLocaleString()}
                        </td>
                        <td className="py-4 px-3 text-[13px] text-general">
                          {l.opened === null
                            ? "—"
                            : `${Math.round(
                                (l.opened / Math.max(l.delivered, 1)) * 100
                              )}%`}
                        </td>
                        <td className="py-4 px-3">
                          <StatusPill status={l.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="md:hidden flex flex-col gap-3">
                {LOGS.map((l) => (
                  <div
                    key={l.id}
                    className="border border-[#EFEFEF] rounded-xl p-4"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-[14px] font-medium text-general">
                          {l.title}
                        </p>
                        <p className="text-[12px] text-primary_grey_2 mt-0.5">
                          {l.audience}
                        </p>
                      </div>
                      <StatusPill status={l.status} />
                    </div>
                    <Divider sx={{ my: 1.5 }} />
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div>
                        <p className="text-[11px] text-primary_grey_2">
                          Channel
                        </p>
                        <p className="text-[12px] text-general font-medium">
                          {l.channel}
                        </p>
                      </div>
                      <div>
                        <p className="text-[11px] text-primary_grey_2">
                          Delivered
                        </p>
                        <p className="text-[12px] text-general font-medium">
                          {l.delivered.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-[11px] text-primary_grey_2">
                          Open Rate
                        </p>
                        <p className="text-[12px] text-general font-medium">
                          {l.opened === null
                            ? "—"
                            : `${Math.round(
                                (l.opened / Math.max(l.delivered, 1)) * 100
                              )}%`}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EngagementHub;
