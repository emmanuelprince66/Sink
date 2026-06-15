import { useEffect, useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ToastContainer, toast } from "react-toastify";
import { format, parseISO } from "date-fns";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Tab,
  Tabs,
  TextField,
} from "@mui/material";
import {
  AddRounded as AddIcon,
  EditOutlined as EditIcon,
  DeleteOutline as DeleteIcon,
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
  ClearRounded as ClearIcon,
} from "@mui/icons-material";
import CustomPagination from "../../components/CustomPagination";
import {
  engagementTemplatesUrl,
  engagementTemplateUrl,
  engagementMetricsUrl,
  engagementCampaignsUrl,
  engagementAudienceEstimateUrl,
  engagementBroadcastUrl,
} from "../../api/endpoint";
import useFetchData from "../../hooks/useFetchData";
import { AuthAxios } from "../../helpers/axiosInstance";

// ── API enum values ──
const TEMPLATE_TYPES = ["Transactional", "Promotional", "Reminder"];
const CHANNEL_TYPES = ["EMAIL", "SMS", "PUSH"];

const AUDIENCE_TYPES = [
  { key: "ALL_USERS", label: "All Users", needsValue: false },
  { key: "BY_TIER", label: "By Tier", needsValue: true },
  { key: "BY_SUBSCRIPTION", label: "By Subscription", needsValue: true },
  { key: "BY_ACTIVITY", label: "By Activity", needsValue: true },
];

// Allowed audience_value for each audience_type
const AUDIENCE_VALUES = {
  BY_TIER: ["Tier 1", "Tier 2", "Tier 3"],
  BY_SUBSCRIPTION: ["ACTIVE", "EXPIRING"],
  BY_ACTIVITY: ["ACTIVE", "INACTIVE"],
};

// ── UI helpers ──
const fmtDate = (iso) => {
  if (!iso) return "—";
  try {
    return format(parseISO(iso), "dd MMM yyyy · HH:mm");
  } catch {
    return iso;
  }
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

const StatusPill = ({ status }) => {
  const map = {
    delivered: {
      bg: "#E6F7EA",
      color: "#02981D",
      label: "Delivered",
      icon: <CheckIcon sx={{ fontSize: 14 }} />,
    },
    sent: {
      bg: "#E6F7EA",
      color: "#02981D",
      label: "Sent",
      icon: <CheckIcon sx={{ fontSize: 14 }} />,
    },
    failed: {
      bg: "#FDECEC",
      color: "#DC3545",
      label: "Failed",
      icon: <CancelIcon sx={{ fontSize: 14 }} />,
    },
    pending: {
      bg: "#FFF7E8",
      color: "#B26A00",
      label: "Pending",
      icon: <PendingIcon sx={{ fontSize: 14 }} />,
    },
    scheduled: {
      bg: "#FFF7E8",
      color: "#B26A00",
      label: "Scheduled",
      icon: <PendingIcon sx={{ fontSize: 14 }} />,
    },
  };
  const key = (status || "").toString().toLowerCase();
  const s = map[key] || {
    bg: "#F5F5F5",
    color: "#5E5E5E",
    label: status || "—",
    icon: null,
  };
  return (
    <span
      className="inline-flex items-center gap-1 text-[12px] font-medium px-2 py-1 rounded-full"
      style={{ background: s.bg, color: s.color }}
    >
      {s.icon}
      {s.label}
    </span>
  );
};

// ── Template form ──
const emptyTemplate = () => ({
  name: "",
  template_type: "Transactional",
  channel_type: "EMAIL",
  subject: "",
  body: "",
});

const EngagementHub = () => {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState(0);

  // ── Compose state ──
  const [channels, setChannels] = useState({
    PUSH: false,
    EMAIL: true,
    SMS: false,
  });
  const [audienceType, setAudienceType] = useState("ALL_USERS");
  const [audienceValue, setAudienceValue] = useState("");
  const [templateId, setTemplateId] = useState("");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [audienceCount, setAudienceCount] = useState(null);
  const [audienceLoading, setAudienceLoading] = useState(false);

  // ── Template-modal state ──
  const [tplOpen, setTplOpen] = useState(false);
  const [tplEditing, setTplEditing] = useState(null);
  const [tplForm, setTplForm] = useState(emptyTemplate());

  // ── Campaigns pagination ──
  const [campaignsPage, setCampaignsPage] = useState(1);
  const [campaignsPageSize] = useState(20);

  // ── Live fetches ──
  const templatesApi = engagementTemplatesUrl();
  const { data: templatesData, isLoading: templatesLoading } = useFetchData(
    ["fetchEngagementTemplates", templatesApi],
    templatesApi
  );

  const metricsApi = engagementMetricsUrl();
  const { data: metricsData } = useFetchData(
    ["fetchEngagementMetrics", metricsApi],
    metricsApi
  );

  const campaignsApi = engagementCampaignsUrl(
    campaignsPage,
    campaignsPageSize
  );
  const { data: campaignsData, isLoading: campaignsLoading } = useFetchData(
    ["fetchEngagementCampaigns", campaignsApi, campaignsPage],
    campaignsApi,
    { enabled: tab === 2 } // only fetch when Delivery Logs tab active
  );

  const templates = useMemo(() => {
    const raw = Array.isArray(templatesData?.data)
      ? templatesData.data
      : Array.isArray(templatesData?.results)
      ? templatesData.results
      : Array.isArray(templatesData)
      ? templatesData
      : [];
    return raw;
  }, [templatesData]);

  const campaigns = useMemo(() => {
    const raw = Array.isArray(campaignsData?.data)
      ? campaignsData.data
      : Array.isArray(campaignsData?.results)
      ? campaignsData.results
      : Array.isArray(campaignsData)
      ? campaignsData
      : [];
    return raw;
  }, [campaignsData]);

  const campaignsTotalPages =
    campaignsData?.pagination?.total_pages ||
    campaignsData?.total_pages ||
    Math.max(
      1,
      Math.ceil(
        (campaignsData?.pagination?.total_count ||
          campaignsData?.total_records ||
          campaigns.length) / campaignsPageSize
      )
    );

  // Metrics summary — backend returns plain object (may be JSON-encoded string)
  const metricsSummary = useMemo(() => {
    if (!metricsData) return {};
    if (typeof metricsData === "string") {
      try {
        return JSON.parse(metricsData);
      } catch {
        return {};
      }
    }
    return metricsData;
  }, [metricsData]);

  // ── Audience estimate (debounced) ──
  useEffect(() => {
    const at = audienceType;
    const av = AUDIENCE_VALUES[at] ? audienceValue : null;
    // Skip if a sub-typed audience still has no value picked
    if (AUDIENCE_VALUES[at] && !audienceValue) {
      setAudienceCount(null);
      return;
    }
    let cancelled = false;
    setAudienceLoading(true);
    const t = setTimeout(async () => {
      try {
        const res = await AuthAxios.post(engagementAudienceEstimateUrl(), {
          audience_type: at,
          audience_value: av,
        });
        if (cancelled) return;
        const payload = res?.data;
        const count =
          typeof payload === "number"
            ? payload
            : payload?.count ?? payload?.estimate ?? payload?.total ?? null;
        setAudienceCount(count);
      } catch {
        if (!cancelled) setAudienceCount(null);
      } finally {
        if (!cancelled) setAudienceLoading(false);
      }
    }, 350);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [audienceType, audienceValue]);

  // ── Mutations ──
  const createTemplate = useMutation({
    mutationFn: (payload) =>
      AuthAxios.post(engagementTemplatesUrl(), payload),
    onSuccess: () => {
      toast.success("Template created");
      queryClient.invalidateQueries({ queryKey: ["fetchEngagementTemplates"] });
      closeTplModal();
    },
    onError: (err) =>
      toast.error(err?.response?.data?.detail?.[0]?.msg || "Failed to create"),
  });

  const updateTemplate = useMutation({
    mutationFn: ({ id, payload }) =>
      AuthAxios.put(engagementTemplateUrl(id), payload),
    onSuccess: () => {
      toast.success("Template updated");
      queryClient.invalidateQueries({ queryKey: ["fetchEngagementTemplates"] });
      closeTplModal();
    },
    onError: (err) =>
      toast.error(err?.response?.data?.detail?.[0]?.msg || "Failed to update"),
  });

  const deleteTemplate = useMutation({
    mutationFn: (id) => AuthAxios.delete(engagementTemplateUrl(id)),
    onSuccess: () => {
      toast.success("Template deleted");
      queryClient.invalidateQueries({ queryKey: ["fetchEngagementTemplates"] });
    },
    onError: (err) =>
      toast.error(err?.response?.data?.detail?.[0]?.msg || "Failed to delete"),
  });

  const broadcast = useMutation({
    mutationFn: (payload) => AuthAxios.post(engagementBroadcastUrl(), payload),
    onSuccess: () => {
      toast.success("Broadcast queued");
      // Reset compose form
      setTitle("");
      setBody("");
      setTemplateId("");
      queryClient.invalidateQueries({ queryKey: ["fetchEngagementCampaigns"] });
    },
    onError: (err) =>
      toast.error(
        err?.response?.data?.detail?.[0]?.msg || "Failed to send broadcast"
      ),
  });

  const isMutating =
    createTemplate.isPending ||
    updateTemplate.isPending ||
    deleteTemplate.isPending;

  // ── Template modal handlers ──
  const openCreateTpl = () => {
    setTplEditing(null);
    setTplForm(emptyTemplate());
    setTplOpen(true);
  };

  const openEditTpl = (tpl) => {
    setTplEditing(tpl);
    setTplForm({
      name: tpl?.name || "",
      template_type: tpl?.template_type || "Transactional",
      channel_type: tpl?.channel_type || "EMAIL",
      subject: tpl?.subject || "",
      body: tpl?.body || "",
    });
    setTplOpen(true);
  };

  const closeTplModal = () => {
    setTplOpen(false);
    setTplEditing(null);
  };

  const handleTplSubmit = (e) => {
    e.preventDefault();
    const payload = {
      name: tplForm.name,
      template_type: tplForm.template_type,
      channel_type: tplForm.channel_type,
      subject: tplForm.subject,
      body: tplForm.body,
    };
    if (tplEditing?.id) {
      updateTemplate.mutate({ id: tplEditing.id, payload });
    } else {
      createTemplate.mutate(payload);
    }
  };

  const handleTplDelete = () => {
    if (!tplEditing?.id) return;
    if (
      window.confirm(
        `Delete template "${tplEditing.name}"? This cannot be undone.`
      )
    ) {
      deleteTemplate.mutate(tplEditing.id);
      closeTplModal();
    }
  };

  // ── Compose: pick template ──
  const onPickTemplate = (id) => {
    setTemplateId(id);
    const tpl = templates.find((t) => t.id === id);
    if (tpl) {
      setTitle(tpl.subject || tpl.name || "");
      setBody(""); // body is taken from template_id on the server
      // Auto-tick the channel matching the template
      const ch = (tpl.channel_type || "").toUpperCase();
      if (CHANNEL_TYPES.includes(ch)) {
        setChannels((c) => ({ ...c, [ch]: true }));
      }
    }
  };

  // ── Send broadcast ──
  const handleSendNow = () => {
    const channel = CHANNEL_TYPES.filter((c) => channels[c]);
    if (channel.length === 0) {
      toast.error("Pick at least one channel");
      return;
    }
    if (!title.trim()) {
      toast.error("Subject / title is required");
      return;
    }
    const needsValue = AUDIENCE_VALUES[audienceType];
    if (needsValue && !audienceValue) {
      toast.error("Pick an audience value");
      return;
    }
    if (!templateId && !body.trim()) {
      toast.error("Either pick a template or enter a message body");
      return;
    }
    const payload = {
      title: title.trim(),
      channel,
      audience_type: audienceType,
      audience_value: needsValue ? audienceValue : null,
      template_id: templateId || null,
      // Per spec: if template_id is set, message_body must be null
      message_body: templateId ? null : body.trim(),
    };
    broadcast.mutate(payload);
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
            value={Number(
              metricsSummary.total_delivered ??
                metricsSummary.delivered ??
                0
            ).toLocaleString()}
            subtitle="Across all channels"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<TrendingIcon fontSize="small" />}
            color="#3949AB"
            bg="#EEF2FF"
            label="Avg. Open Rate"
            value={
              metricsSummary.open_rate
                ? `${Math.round(Number(metricsSummary.open_rate) * 100)}%`
                : "—"
            }
            subtitle="Email / Push only"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<CancelIcon fontSize="small" />}
            color="#DC3545"
            bg="#FDECEC"
            label="Failed"
            value={Number(
              metricsSummary.failed ?? metricsSummary.total_failed ?? 0
            ).toLocaleString()}
            subtitle="Retry available"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<PendingIcon fontSize="small" />}
            color="#B26A00"
            bg="#FFF7E8"
            label="Scheduled"
            value={Number(
              metricsSummary.scheduled ?? metricsSummary.total_scheduled ?? 0
            ).toLocaleString()}
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

          {/* ─────────── COMPOSE TAB ─────────── */}
          {tab === 0 && (
            <Grid container spacing={3}>
              <Grid item xs={12} lg={7}>
                <div className="flex flex-col gap-5">
                  {/* Channels */}
                  <div>
                    <p className="text-[13px] font-semibold text-general mb-2">
                      Channels
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <ChannelToggle
                        icon={<PushIcon fontSize="small" />}
                        label="Push"
                        active={channels.PUSH}
                        onClick={() =>
                          setChannels((c) => ({ ...c, PUSH: !c.PUSH }))
                        }
                      />
                      <ChannelToggle
                        icon={<EmailIcon fontSize="small" />}
                        label="Email"
                        active={channels.EMAIL}
                        onClick={() =>
                          setChannels((c) => ({ ...c, EMAIL: !c.EMAIL }))
                        }
                      />
                      <ChannelToggle
                        icon={<SmsIcon fontSize="small" />}
                        label="SMS"
                        active={channels.SMS}
                        onClick={() =>
                          setChannels((c) => ({ ...c, SMS: !c.SMS }))
                        }
                      />
                    </div>
                  </div>

                  {/* Audience */}
                  <div>
                    <p className="text-[13px] font-semibold text-general mb-2">
                      Audience
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <FormControl size="small" sx={{ minWidth: 200 }}>
                        <InputLabel>Audience Type</InputLabel>
                        <Select
                          label="Audience Type"
                          value={audienceType}
                          onChange={(e) => {
                            setAudienceType(e.target.value);
                            setAudienceValue("");
                          }}
                        >
                          {AUDIENCE_TYPES.map((a) => (
                            <MenuItem key={a.key} value={a.key}>
                              {a.label}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                      {AUDIENCE_VALUES[audienceType] && (
                        <FormControl size="small" sx={{ minWidth: 200 }}>
                          <InputLabel>Audience Value</InputLabel>
                          <Select
                            label="Audience Value"
                            value={audienceValue}
                            onChange={(e) => setAudienceValue(e.target.value)}
                          >
                            {AUDIENCE_VALUES[audienceType].map((v) => (
                              <MenuItem key={v} value={v}>
                                {v}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      )}
                    </div>
                  </div>

                  {/* Template */}
                  <div>
                    <p className="text-[13px] font-semibold text-general mb-2">
                      Template (optional — overrides Body)
                    </p>
                    <Select
                      fullWidth
                      size="small"
                      displayEmpty
                      value={templateId}
                      onChange={(e) => onPickTemplate(e.target.value)}
                    >
                      <MenuItem value="">
                        — Start from scratch (use Body below) —
                      </MenuItem>
                      {templates.map((t) => (
                        <MenuItem key={t.id} value={t.id}>
                          {t.name} ({t.channel_type})
                        </MenuItem>
                      ))}
                    </Select>
                  </div>

                  {/* Subject / Title */}
                  <div>
                    <p className="text-[13px] font-semibold text-general mb-2">
                      Subject / Title
                    </p>
                    <TextField
                      fullWidth
                      size="small"
                      placeholder="e.g. Renew your subscription before Friday"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                  </div>

                  {/* Message Body — disabled when template picked */}
                  <div>
                    <p className="text-[13px] font-semibold text-general mb-2">
                      Message Body{" "}
                      {templateId && (
                        <span className="text-[12px] text-primary_grey_2 font-normal">
                          (ignored — template will be used)
                        </span>
                      )}
                    </p>
                    <TextField
                      fullWidth
                      multiline
                      minRows={6}
                      disabled={!!templateId}
                      placeholder={
                        templateId
                          ? "Body comes from the picked template"
                          : "Write your message. Use {{name}} for personalization."
                      }
                      value={body}
                      onChange={(e) => setBody(e.target.value)}
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2 justify-end">
                    <Button
                      variant="contained"
                      onClick={handleSendNow}
                      disabled={broadcast.isPending}
                      startIcon={<SendIcon />}
                      sx={{
                        textTransform: "none",
                        background: "#02981D",
                        boxShadow: "none",
                        "&:hover": { background: "#017a17" },
                      }}
                    >
                      {broadcast.isPending ? (
                        <CircularProgress
                          size="1.2rem"
                          sx={{ color: "#fff" }}
                        />
                      ) : (
                        "Send Now"
                      )}
                    </Button>
                  </div>
                </div>
              </Grid>

              {/* Preview + reach */}
              <Grid item xs={12} lg={5}>
                <div className="bg-[#FAFAFA] border border-[#EFEFEF] rounded-xl p-5 sticky top-2">
                  <p className="text-[12px] uppercase tracking-wide text-primary_grey_2 mb-3">
                    Live Preview
                  </p>
                  <div className="bg-white rounded-xl border border-[#EFEFEF] p-4 min-h-[200px]">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex gap-1 flex-wrap">
                        {CHANNEL_TYPES.filter((c) => channels[c]).map((c) => (
                          <Chip
                            key={c}
                            size="small"
                            label={c}
                            sx={{
                              background: "#F6FFF8",
                              color: "#02981D",
                              fontWeight: 600,
                            }}
                          />
                        ))}
                        {CHANNEL_TYPES.every((c) => !channels[c]) && (
                          <span className="text-[11px] text-[#DC3545]">
                            No channel selected
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-primary_grey_2">
                        Preview
                      </span>
                    </div>
                    <p className="text-[15px] font-semibold text-general">
                      {title || "Your message subject"}
                    </p>
                    <Divider sx={{ my: 1.5 }} />
                    <p className="text-[13px] text-general whitespace-pre-wrap leading-relaxed">
                      {templateId
                        ? templates.find((t) => t.id === templateId)?.body ||
                          "(template body will be inserted server-side)"
                        : body || "Your message body will appear here..."}
                    </p>
                  </div>
                  <div className="mt-3 text-[12px] text-primary_grey_2 flex items-center gap-2">
                    Estimated reach:{" "}
                    {audienceLoading ? (
                      <CircularProgress size="0.9rem" sx={{ color: "#02981D" }} />
                    ) : audienceCount !== null ? (
                      <span className="text-general font-medium">
                        ~ {Number(audienceCount).toLocaleString()} users
                      </span>
                    ) : (
                      <span className="text-[#9CA3AF]">—</span>
                    )}
                  </div>
                </div>
              </Grid>
            </Grid>
          )}

          {/* ─────────── TEMPLATES TAB ─────────── */}
          {tab === 1 && (
            <>
              <div className="flex items-center justify-between mb-4">
                <p className="text-[13px] text-primary_grey_2">
                  {templates.length} template
                  {templates.length === 1 ? "" : "s"}
                </p>
                <Button
                  onClick={openCreateTpl}
                  startIcon={<AddIcon />}
                  variant="contained"
                  sx={{
                    textTransform: "none",
                    background: "#02981D",
                    boxShadow: "none",
                    "&:hover": { background: "#017a17" },
                  }}
                >
                  New Template
                </Button>
              </div>

              {templatesLoading ? (
                <div className="py-10 flex justify-center">
                  <CircularProgress sx={{ color: "#02981D" }} />
                </div>
              ) : templates.length === 0 ? (
                <p className="py-10 text-center text-primary_grey_2 text-[13px]">
                  No templates yet. Click "New Template" to create the first.
                </p>
              ) : (
                <Grid container spacing={2}>
                  {templates.map((t) => (
                    <Grid item xs={12} sm={6} lg={4} key={t.id}>
                      <div className="border border-[#EFEFEF] rounded-xl p-4 h-full flex flex-col gap-2 hover:border-[#02981D]">
                        <div className="flex items-center justify-between">
                          <p className="text-[14px] font-semibold text-general truncate">
                            {t.name}
                          </p>
                          <Chip
                            size="small"
                            label={t.template_type}
                            sx={{
                              background: "#F5F5F5",
                              color: "#5E5E5E",
                              fontWeight: 600,
                            }}
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <Chip
                            size="small"
                            label={t.channel_type}
                            sx={{
                              background:
                                t.channel_type === "EMAIL"
                                  ? "#EEF2FF"
                                  : t.channel_type === "SMS"
                                  ? "#E6F7EA"
                                  : "#FFF7E8",
                              color:
                                t.channel_type === "EMAIL"
                                  ? "#3949AB"
                                  : t.channel_type === "SMS"
                                  ? "#02981D"
                                  : "#B26A00",
                              fontWeight: 600,
                            }}
                          />
                          <span className="text-[11px] text-primary_grey_2">
                            {fmtDate(t.created_at)}
                          </span>
                        </div>
                        {t.subject && (
                          <p className="text-[12px] text-general font-medium truncate">
                            {t.subject}
                          </p>
                        )}
                        <p className="text-[12px] text-primary_grey_2 line-clamp-3">
                          {t.body}
                        </p>
                        <div className="mt-auto pt-3 flex justify-end gap-2">
                          <Button
                            size="small"
                            startIcon={<EditIcon fontSize="small" />}
                            onClick={() => openEditTpl(t)}
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
            </>
          )}

          {/* ─────────── DELIVERY LOGS TAB ─────────── */}
          {tab === 2 && (
            <>
              <div className="w-full overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-[12px] uppercase tracking-wide text-primary_grey_2 border-b border-[#EFEFEF]">
                      <th className="py-3 px-3">Title</th>
                      <th className="py-3 px-3">Channel</th>
                      <th className="py-3 px-3">Audience</th>
                      <th className="py-3 px-3">Sent At</th>
                      <th className="py-3 px-3 text-right">Delivered</th>
                      <th className="py-3 px-3">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {campaignsLoading ? (
                      <tr>
                        <td colSpan={6} className="py-10 text-center">
                          <CircularProgress sx={{ color: "#02981D" }} />
                        </td>
                      </tr>
                    ) : campaigns.length === 0 ? (
                      <tr>
                        <td
                          colSpan={6}
                          className="py-10 text-center text-primary_grey_2"
                        >
                          No campaigns sent yet.
                        </td>
                      </tr>
                    ) : (
                      campaigns.map((c, i) => {
                        const channel = Array.isArray(c?.channel)
                          ? c.channel.join(", ")
                          : c?.channel || c?.channel_type || "—";
                        const audience =
                          c?.audience_value
                            ? `${c.audience_type} · ${c.audience_value}`
                            : c?.audience_type || "—";
                        return (
                          <tr
                            key={c?.id || i}
                            className="border-b border-[#F5F5F5] hover:bg-[#FAFAFA]"
                          >
                            <td className="py-4 px-3 text-[13px] text-general font-medium">
                              {c?.title || c?.subject || "—"}
                            </td>
                            <td className="py-4 px-3">
                              <Chip
                                size="small"
                                label={channel}
                                sx={{
                                  background: "#F5F5F5",
                                  color: "#5E5E5E",
                                  fontWeight: 600,
                                }}
                              />
                            </td>
                            <td className="py-4 px-3 text-[12px] text-general">
                              {audience}
                            </td>
                            <td className="py-4 px-3 text-[12px] text-primary_grey_2">
                              {fmtDate(c?.created_at || c?.sent_at)}
                            </td>
                            <td className="py-4 px-3 text-[13px] text-general text-right">
                              {Number(
                                c?.delivered ?? c?.delivered_count ?? 0
                              ).toLocaleString()}
                            </td>
                            <td className="py-4 px-3">
                              <StatusPill status={c?.status} />
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {!campaignsLoading && campaigns.length > 0 && (
                <CustomPagination
                  currentPage={campaignsPage}
                  totalPages={campaignsTotalPages}
                  onPageChange={setCampaignsPage}
                />
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Template Create / Edit modal */}
      {tplOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-50 flex items-start justify-center p-4 overflow-y-auto"
          onClick={closeTplModal}
        >
          <form
            onSubmit={handleTplSubmit}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl w-full max-w-2xl mt-12 p-5 flex flex-col gap-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between">
              <p className="text-[18px] font-semibold text-general">
                {tplEditing ? "Edit Template" : "New Template"}
              </p>
              <ClearIcon
                onClick={closeTplModal}
                sx={{ color: "#1E1E1E", cursor: "pointer" }}
              />
            </div>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Template Name"
                  value={tplForm.name}
                  onChange={(e) =>
                    setTplForm((f) => ({ ...f, name: e.target.value }))
                  }
                  required
                />
              </Grid>
              <Grid item xs={6} sm={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Type</InputLabel>
                  <Select
                    label="Type"
                    value={tplForm.template_type}
                    onChange={(e) =>
                      setTplForm((f) => ({
                        ...f,
                        template_type: e.target.value,
                      }))
                    }
                  >
                    {TEMPLATE_TYPES.map((t) => (
                      <MenuItem key={t} value={t}>
                        {t}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6} sm={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Channel</InputLabel>
                  <Select
                    label="Channel"
                    value={tplForm.channel_type}
                    onChange={(e) =>
                      setTplForm((f) => ({
                        ...f,
                        channel_type: e.target.value,
                      }))
                    }
                  >
                    {CHANNEL_TYPES.map((c) => (
                      <MenuItem key={c} value={c}>
                        {c}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  size="small"
                  label="Subject"
                  value={tplForm.subject}
                  onChange={(e) =>
                    setTplForm((f) => ({ ...f, subject: e.target.value }))
                  }
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  minRows={6}
                  label="Body"
                  value={tplForm.body}
                  onChange={(e) =>
                    setTplForm((f) => ({ ...f, body: e.target.value }))
                  }
                  required
                />
              </Grid>
            </Grid>

            <div className="flex justify-end gap-2 mt-2">
              {tplEditing && (
                <Button
                  type="button"
                  onClick={handleTplDelete}
                  startIcon={<DeleteIcon />}
                  disabled={isMutating}
                  sx={{
                    textTransform: "none",
                    color: "#DC3545",
                    mr: "auto",
                    "&:hover": { background: "#FDECEC" },
                  }}
                >
                  Delete
                </Button>
              )}
              <Button
                type="button"
                onClick={closeTplModal}
                disabled={isMutating}
                sx={{
                  textTransform: "none",
                  color: "#5E5E5E",
                  "&:hover": { background: "#F5F5F5" },
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={isMutating}
                sx={{
                  textTransform: "none",
                  background: "#02981D",
                  boxShadow: "none",
                  "&:hover": { background: "#017a17" },
                }}
              >
                {createTemplate.isPending || updateTemplate.isPending ? (
                  <CircularProgress size="1.2rem" sx={{ color: "#fff" }} />
                ) : tplEditing ? (
                  "Save Changes"
                ) : (
                  "Create Template"
                )}
              </Button>
            </div>
          </form>
        </div>
      )}

      <ToastContainer position="top-right" autoClose={4000} />
    </div>
  );
};

export default EngagementHub;
