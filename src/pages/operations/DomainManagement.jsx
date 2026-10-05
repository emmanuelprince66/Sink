import { useEffect, useState } from "react";
import {
  Alert,
  Avatar,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  InputAdornment,
  TextField,
} from "@mui/material";
import {
  CheckCircleOutline as ApprovedIcon,
  CloseRounded as CloseIcon,
  DeleteOutlineRounded as DisconnectIcon,
  ErrorOutline as RejectedIcon,
  LanguageOutlined as DomainIcon,
  OpenInNewRounded as ExternalIcon,
  RefreshRounded as VerifyIcon,
  SearchOutlined as SearchIcon,
  TaskAltRounded as ReviewIcon,
} from "@mui/icons-material";
import { useQueryClient } from "@tanstack/react-query";
import PropTypes from "prop-types";
import { notiSuccess } from "../../utils/noti";
import { AuthAxios } from "../../helpers/axiosInstance";
import useFetchData from "../../hooks/useFetchData";
import CustomPagination from "../../components/CustomPagination";
import {
  customDomainApproveUrl,
  customDomainDetailUrl,
  customDomainDisconnectUrl,
  customDomainListUrl,
  customDomainRejectUrl,
  customDomainVerifyDnsUrl,
} from "../../api/endpoint";

const PAGE_SIZE = 10;

const TABS = [
  { key: "ALL", label: "All domains", metric: "businesses_with_domain" },
  { key: "PENDING", label: "Pending review", metric: "pending_review" },
  { key: "APPROVED", label: "Approved", metric: "approved" },
  { key: "REJECTED", label: "Rejected", metric: "rejected" },
];

const normalizeStatus = (status, approved) => {
  const value = String(status || "").trim().toLowerCase();
  if (value.includes("approv") || (approved && !value.includes("reject"))) {
    return "approved";
  }
  if (value.includes("reject")) return "rejected";
  return "pending";
};

const apiErrorMessage = (error, fallback) =>
  error?.response?.data?.detail ||
  error?.response?.data?.message ||
  error?.response?.data?.error ||
  error?.message ||
  fallback;

const StatCard = ({ icon, color, bg, label, value, caption }) => (
  <Card
    sx={{
      height: "100%",
      border: "1px solid #EFEFEF",
      borderRadius: "14px",
      boxShadow: "0 1px 3px rgba(16,24,40,.06)",
    }}
  >
    <CardContent sx={{ p: 3 }}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[13px] text-primary_grey_2 font-medium">{label}</p>
          <p className="text-[24px] font-semibold text-general mt-2">{value}</p>
          <p className="text-[12px] text-[#9CA3AF] mt-1">{caption}</p>
        </div>
        <div
          className="h-10 w-10 rounded-full flex items-center justify-center flex-none"
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
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  caption: PropTypes.string.isRequired,
};

const DomainStatus = ({ status, approved }) => {
  const normalized = normalizeStatus(status, approved);
  const styles = {
    pending: { label: "Pending review", bg: "#FFF7E8", color: "#B26A00" },
    approved: { label: "Approved", bg: "#E6F7EA", color: "#02981D" },
    rejected: { label: "Rejected", bg: "#FDECEC", color: "#DC3545" },
  }[normalized];

  return (
    <Chip
      size="small"
      label={styles.label}
      sx={{
        color: styles.color,
        backgroundColor: styles.bg,
        borderRadius: "7px",
        fontSize: "12px",
        fontWeight: 600,
      }}
    />
  );
};

DomainStatus.propTypes = {
  status: PropTypes.string,
  approved: PropTypes.bool,
};

const Detail = ({ label, value }) => (
  <div className="min-w-0">
    <p className="text-[11px] text-primary_grey_2">{label}</p>
    <p className="break-words text-[13px] font-medium text-general">
      {value || "—"}
    </p>
  </div>
);

Detail.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.string,
};

const DomainManagement = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("ALL");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedBusinessId, setSelectedBusinessId] = useState(null);
  const [decision, setDecision] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [dnsLoading, setDnsLoading] = useState(false);
  const [dnsResult, setDnsResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search.trim()), 350);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, debouncedSearch]);

  useEffect(() => {
    setDnsResult(null);
  }, [selectedBusinessId]);

  const listUrl = customDomainListUrl(
    activeTab,
    debouncedSearch,
    currentPage,
    PAGE_SIZE,
  );
  const {
    data: listData,
    error: listError,
    isLoading: listLoading,
    refetch: refetchList,
  } = useFetchData(["customDomainList", listUrl], listUrl);

  const detailUrl = selectedBusinessId
    ? customDomainDetailUrl(selectedBusinessId)
    : "";
  const {
    data: detailData,
    error: detailError,
    isLoading: detailLoading,
  } = useFetchData(
    ["customDomainDetail", selectedBusinessId],
    detailUrl,
    { enabled: Boolean(selectedBusinessId) },
  );

  const rows = Array.isArray(listData?.data) ? listData.data : [];
  const metrics = listData?.metrics || {};
  const totalPages = Math.max(
    1,
    Number(listData?.pages) ||
      Math.ceil(Number(listData?.total || 0) / PAGE_SIZE),
  );
  const detail = detailData;
  const detailStatus = normalizeStatus(
    detail?.status,
    detail?.custom_domain_approved,
  );

  const runDnsCheck = async () => {
    if (!selectedBusinessId) return;
    setDnsLoading(true);
    setErrorMessage("");
    try {
      const response = await AuthAxios.get(
        customDomainVerifyDnsUrl(selectedBusinessId),
      );
      setDnsResult(response.data);
    } catch (error) {
      setErrorMessage(
        apiErrorMessage(error, "Could not verify the domain DNS records."),
      );
    } finally {
      setDnsLoading(false);
    }
  };

  const runAction = async () => {
    if (!selectedBusinessId || !decision) return;
    if (decision === "reject" && !rejectionReason.trim()) return;

    setActionLoading(true);
    setErrorMessage("");
    try {
      let response;
      if (decision === "approve") {
        response = await AuthAxios.post(
          customDomainApproveUrl(selectedBusinessId),
          {},
        );
      } else if (decision === "reject") {
        response = await AuthAxios.post(
          customDomainRejectUrl(selectedBusinessId),
          { reason: rejectionReason.trim() },
        );
      } else {
        response = await AuthAxios.post(
          customDomainDisconnectUrl(selectedBusinessId),
          {},
        );
      }

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["customDomainList"] }),
        queryClient.invalidateQueries({
          queryKey: ["customDomainDetail", selectedBusinessId],
        }),
      ]);
      setDecision(null);
      notiSuccess(
        response.data?.message ||
          `Domain ${decision === "approve" ? "approved" : decision === "reject" ? "rejected" : "disconnected"} successfully.`,
      );
      if (decision === "approve" || decision === "disconnect") {
        setSelectedBusinessId(null);
      }
    } catch (error) {
      setErrorMessage(
        apiErrorMessage(error, `Could not ${decision} this custom domain.`),
      );
    } finally {
      setActionLoading(false);
    }
  };

  const closeReview = () => {
    if (actionLoading) return;
    setSelectedBusinessId(null);
    setErrorMessage("");
    setDecision(null);
  };

  const openReview = (businessId) => {
    setErrorMessage("");
    setSelectedBusinessId(businessId);
  };

  const openDecision = (nextDecision) => {
    setErrorMessage("");
    setRejectionReason("");
    setDecision(nextDecision);
  };

  return (
    <div className="w-full flex flex-col gap-6">
      <div>
        <h1 className="text-[20px] md:text-[22px] font-semibold text-general">
          Domain Management
        </h1>
        <p className="text-[13px] text-primary_grey_2 mt-1">
          Review custom domains submitted by businesses and manage their approval.
        </p>
      </div>

      {listError && (
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={() => refetchList()}>
              Retry
            </Button>
          }
        >
          {apiErrorMessage(listError, "Could not load custom domains.")}
        </Alert>
      )}

      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<DomainIcon fontSize="small" />}
            color="#0369A1"
            bg="#E0F2FE"
            label="Custom domains"
            value={metrics.businesses_with_domain ?? "—"}
            caption="Businesses with a domain"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<ReviewIcon fontSize="small" />}
            color="#B26A00"
            bg="#FFF7E8"
            label="Pending review"
            value={metrics.pending_review ?? "—"}
            caption="Awaiting admin decision"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<ApprovedIcon fontSize="small" />}
            color="#02981D"
            bg="#E6F7EA"
            label="Approved"
            value={metrics.approved ?? "—"}
            caption="Ready to use"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<RejectedIcon fontSize="small" />}
            color="#DC3545"
            bg="#FDECEC"
            label="Rejected"
            value={metrics.rejected ?? "—"}
            caption="Needs business follow-up"
          />
        </Grid>
      </Grid>

      <Card
        sx={{
          border: "1px solid #EFEFEF",
          borderRadius: "14px",
          boxShadow: "0 1px 3px rgba(16,24,40,.06)",
        }}
      >
        <CardContent sx={{ p: { xs: 2, md: 3 } }}>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 mb-5">
            <TextField
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search business, domain, owner or email"
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
            <div className="flex flex-wrap gap-2" aria-label="Domain status filters">
              {TABS.map((tab) => {
                const active = activeTab === tab.key;
                const count = metrics[tab.metric];
                return (
                  <Button
                    key={tab.key}
                    aria-pressed={active}
                    onClick={() => setActiveTab(tab.key)}
                    sx={{
                      textTransform: "none",
                      fontWeight: 600,
                      border: active ? "1px solid #02981D" : "1px solid #E3E3E3",
                      color: active ? "#02981D" : "#5E5E5E",
                      background: active ? "#F6FFF8" : "#fff",
                      "&:hover": {
                        background: active ? "#F6FFF8" : "#F5F5F5",
                      },
                    }}
                  >
                    {tab.label}
                    {count !== undefined && ` (${count})`}
                  </Button>
                );
              })}
            </div>
          </div>

          <div className="hidden md:block w-full overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[12px] uppercase tracking-wide text-primary_grey_2 border-b border-[#EFEFEF]">
                  <th className="py-3 px-3">Business</th>
                  <th className="py-3 px-3">Custom domain</th>
                  <th className="py-3 px-3">Owner</th>
                  <th className="py-3 px-3">Submitted</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {listLoading ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center">
                      <CircularProgress size={26} sx={{ color: "#02981D" }} />
                    </td>
                  </tr>
                ) : rows.length ? (
                  rows.map((business) => (
                    <tr
                      key={business.business_id}
                      className="border-b border-[#F5F5F5] hover:bg-[#FAFAFA]"
                    >
                      <td className="py-4 px-3">
                        <button
                          className="flex items-center gap-3 text-left"
                          onClick={() => openReview(business.business_id)}
                        >
                          <Avatar
                            src={business.business_logo || undefined}
                            alt=""
                            sx={{
                              width: 36,
                              height: 36,
                              bgcolor: "#E6F7EA",
                              color: "#02981D",
                              fontSize: 14,
                            }}
                          >
                            {business.business_name?.slice(0, 1).toUpperCase()}
                          </Avatar>
                          <span>
                            <span className="block text-[13px] font-semibold text-general">
                              {business.business_name || "—"}
                            </span>
                            <span className="block text-[12px] text-primary_grey_2">
                              {business.store_url || "Business"}
                            </span>
                          </span>
                        </button>
                      </td>
                      <td className="py-4 px-3 text-[13px] text-general">
                        {business.custom_domain || "—"}
                      </td>
                      <td className="py-4 px-3">
                        <span className="block text-[13px] text-general">
                          {business.owner_name || "—"}
                        </span>
                        <span className="block text-[12px] text-primary_grey_2">
                          {business.owner_email || "—"}
                        </span>
                      </td>
                      <td className="py-4 px-3 text-[13px] text-primary_grey_2">
                        {business.submitted || "—"}
                      </td>
                      <td className="py-4 px-3">
                        <DomainStatus
                          status={business.status}
                          approved={business.custom_domain_approved}
                        />
                      </td>
                      <td className="py-4 px-3 text-right">
                        <Button
                          onClick={() => openReview(business.business_id)}
                          sx={{
                            color: "#02981D",
                            textTransform: "none",
                            fontWeight: 600,
                          }}
                        >
                          View details
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={6}
                      className="py-12 text-center text-[13px] text-primary_grey_2"
                    >
                      No custom domains match your search or selected status.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="md:hidden flex flex-col gap-3">
            {listLoading ? (
              <div className="flex justify-center py-10">
                <CircularProgress size={26} sx={{ color: "#02981D" }} />
              </div>
            ) : rows.length ? (
              rows.map((business) => (
                <button
                  key={business.business_id}
                  onClick={() => openReview(business.business_id)}
                  className="w-full border border-[#EFEFEF] rounded-xl p-4 text-left"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar
                        src={business.business_logo || undefined}
                        alt=""
                        sx={{
                          width: 36,
                          height: 36,
                          bgcolor: "#E6F7EA",
                          color: "#02981D",
                          fontSize: 14,
                        }}
                      >
                        {business.business_name?.slice(0, 1).toUpperCase()}
                      </Avatar>
                      <span className="min-w-0">
                        <span className="block text-[13px] font-semibold text-general">
                          {business.business_name || "—"}
                        </span>
                        <span className="block truncate text-[12px] text-primary_grey_2">
                          {business.custom_domain || "—"}
                        </span>
                      </span>
                    </div>
                    <DomainStatus
                      status={business.status}
                      approved={business.custom_domain_approved}
                    />
                  </div>
                  <span className="block text-[12px] text-primary_grey_2 mt-3">
                    Owner: {business.owner_name || "—"} ·{" "}
                    {business.owner_email || "—"}
                  </span>
                  <span className="block text-[12px] text-primary_grey_2 mt-1">
                    Submitted: {business.submitted || "—"}
                  </span>
                </button>
              ))
            ) : (
              <p className="py-10 text-center text-[13px] text-primary_grey_2">
                No custom domains match your search or selected status.
              </p>
            )}
          </div>

          {!listLoading && Number(listData?.pages) > 1 && (
            <CustomPagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          )}
        </CardContent>
      </Card>

      <Dialog
        open={Boolean(selectedBusinessId)}
        onClose={closeReview}
        fullWidth
        maxWidth="sm"
      >
        {selectedBusinessId && (
          <>
            <DialogTitle sx={{ pb: 1 }}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Avatar
                    src={detail?.business_logo || undefined}
                    alt=""
                    sx={{
                      width: 44,
                      height: 44,
                      bgcolor: "#E6F7EA",
                      color: "#02981D",
                    }}
                  >
                    {detail?.business_name?.slice(0, 1).toUpperCase()}
                  </Avatar>
                  <div>
                    <p className="text-[18px] font-semibold text-general">
                      {detail?.business_name || "Business domain review"}
                    </p>
                    <p className="text-[12px] text-primary_grey_2">
                      Custom domain verification
                    </p>
                  </div>
                </div>
                <Button
                  aria-label="Close business details"
                  onClick={closeReview}
                  disabled={actionLoading}
                  sx={{ minWidth: 36, color: "#667085" }}
                >
                  <CloseIcon />
                </Button>
              </div>
            </DialogTitle>
            <DialogContent dividers>
              {detailError && (
                <Alert
                  severity="error"
                  action={
                    <Button
                      color="inherit"
                      size="small"
                      onClick={() =>
                        queryClient.invalidateQueries({
                          queryKey: ["customDomainDetail", selectedBusinessId],
                        })
                      }
                    >
                      Retry
                    </Button>
                  }
                  sx={{ mb: 2 }}
                >
                  {apiErrorMessage(detailError, "Could not load domain details.")}
                </Alert>
              )}
              {errorMessage && (
                <Alert
                  severity="error"
                  onClose={() => setErrorMessage("")}
                  sx={{ mb: 2 }}
                >
                  {errorMessage}
                </Alert>
              )}
              {detailLoading ? (
                <div className="flex justify-center py-12">
                  <CircularProgress size={28} sx={{ color: "#02981D" }} />
                </div>
              ) : detail ? (
                <div className="flex flex-col gap-5 py-1">
                  <div className="rounded-xl border border-[#E5E7EB] bg-[#FAFAFA] p-4">
                    <p className="text-[12px] text-primary_grey_2 mb-1">
                      Requested custom domain
                    </p>
                    <div className="flex items-center justify-between gap-2">
                      <p className="break-all text-[15px] font-semibold text-general">
                        {detail.custom_domain || "—"}
                      </p>
                      <ExternalIcon sx={{ color: "#667085", flex: "none" }} />
                    </div>
                    <div className="mt-3">
                      <DomainStatus
                        status={detail.status}
                        approved={detail.custom_domain_approved}
                      />
                    </div>
                  </div>

                  <div>
                    <p className="text-[12px] uppercase tracking-wide text-primary_grey_2 mb-3">
                      Business details
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                      <Detail label="Store URL" value={detail.store_url} />
                      <Detail label="Business ID" value={detail.business_id} />
                      <Detail label="Owner" value={detail.owner_name} />
                      <Detail label="Email" value={detail.owner_email} />
                      <Detail label="Phone" value={detail.owner_phone} />
                      <Detail label="Submitted" value={detail.submitted} />
                    </div>
                  </div>

                  <div className="rounded-xl border border-[#EFEFEF] p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div>
                        <p className="text-[13px] font-semibold text-general">
                          DNS verification
                        </p>
                        <p className="text-[12px] text-primary_grey_2 mt-1">
                          Check that this domain points to Sync360 before approval.
                        </p>
                      </div>
                      <Button
                        onClick={runDnsCheck}
                        disabled={dnsLoading}
                        variant="outlined"
                        startIcon={
                          dnsLoading ? (
                            <CircularProgress size={16} />
                          ) : (
                            <VerifyIcon />
                          )
                        }
                        sx={{
                          textTransform: "none",
                          color: "#02981D",
                          borderColor: "#02981D",
                          flex: "none",
                        }}
                      >
                        {dnsLoading ? "Checking..." : "Verify DNS"}
                      </Button>
                    </div>
                    {(dnsResult || detail.dns_verification) && (
                      <DnsResult
                        result={dnsResult || detail.dns_verification}
                      />
                    )}
                  </div>
                </div>
              ) : null}
            </DialogContent>
            <DialogActions
              sx={{
                p: 2,
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: 1,
              }}
            >
              <Button
                onClick={() => openDecision("disconnect")}
                disabled={
                  !detail?.custom_domain ||
                  actionLoading ||
                  detailLoading
                }
                startIcon={<DisconnectIcon />}
                sx={{ color: "#667085", textTransform: "none" }}
              >
                Disconnect
              </Button>
              <div className="flex gap-2">
                <Button
                  onClick={() => openDecision("reject")}
                  disabled={
                    !detail ||
                    detailStatus === "rejected" ||
                    actionLoading ||
                    detailLoading
                  }
                  startIcon={<RejectedIcon />}
                  sx={{ color: "#DC3545", textTransform: "none" }}
                >
                  Reject
                </Button>
                <Button
                  onClick={() => openDecision("approve")}
                  disabled={
                    !detail ||
                    detailStatus === "approved" ||
                    actionLoading ||
                    detailLoading
                  }
                  variant="contained"
                  startIcon={<ApprovedIcon />}
                  sx={{
                    background: "#02981D",
                    textTransform: "none",
                    boxShadow: "none",
                    "&:hover": { background: "#017A17", boxShadow: "none" },
                  }}
                >
                  Approve
                </Button>
              </div>
            </DialogActions>
          </>
        )}
      </Dialog>

      <Dialog
        open={Boolean(decision)}
        onClose={() => !actionLoading && setDecision(null)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>
          {decision === "approve"
            ? "Approve custom domain?"
            : decision === "reject"
              ? "Reject custom domain?"
              : "Disconnect custom domain?"}
        </DialogTitle>
        <DialogContent>
          <p className="text-[13px] text-primary_grey_2 mb-4">
            {decision === "approve"
              ? `Approve ${detail?.custom_domain}? This will trigger domain setup and notify the business.`
              : decision === "reject"
                ? `Reject ${detail?.custom_domain}? A reason will be sent to the business.`
                : `Remove ${detail?.custom_domain} from this business and disconnect its domain alias?`}
          </p>
          {decision === "reject" && (
            <TextField
              value={rejectionReason}
              onChange={(event) => setRejectionReason(event.target.value)}
              label="Rejection reason"
              placeholder="Explain what needs to be corrected"
              multiline
              minRows={3}
              fullWidth
              required
            />
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => setDecision(null)}
            disabled={actionLoading}
            sx={{ textTransform: "none", color: "#5E5E5E" }}
          >
            Cancel
          </Button>
          <Button
            onClick={runAction}
            disabled={
              actionLoading ||
              (decision === "reject" && !rejectionReason.trim())
            }
            variant="contained"
            sx={{
              textTransform: "none",
              background:
                decision === "reject" || decision === "disconnect"
                  ? "#DC3545"
                  : "#02981D",
              boxShadow: "none",
              "&:hover": {
                background:
                  decision === "reject" || decision === "disconnect"
                    ? "#B42318"
                    : "#017A17",
                boxShadow: "none",
              },
            }}
          >
            {actionLoading ? (
              <CircularProgress size={20} color="inherit" />
            ) : decision === "approve" ? (
              "Confirm approval"
            ) : decision === "reject" ? (
              "Confirm rejection"
            ) : (
              "Confirm disconnect"
            )}
          </Button>
        </DialogActions>
      </Dialog>

    </div>
  );
};

const DnsResult = ({ result }) => (
  <Alert
    severity={result.is_pointed_correctly ? "success" : "warning"}
    sx={{ mt: 2 }}
  >
    <p className="font-semibold">
      {result.is_pointed_correctly
        ? "Domain is pointed correctly"
        : "DNS not pointed correctly yet"}
    </p>
    {result.message && <p>{result.message}</p>}
    <p className="mt-1 text-[12px]">
      A records: {(result.a_records || []).join(", ") || "None"} · CNAME:{" "}
      {(result.cname_records || []).join(", ") || "None"}
    </p>
    {result.checked_at && (
      <p className="text-[11px] mt-1">
        Checked {new Date(result.checked_at).toLocaleString()}
      </p>
    )}
  </Alert>
);

DnsResult.propTypes = {
  result: PropTypes.shape({
    is_pointed_correctly: PropTypes.bool,
    message: PropTypes.string,
    a_records: PropTypes.arrayOf(PropTypes.string),
    cname_records: PropTypes.arrayOf(PropTypes.string),
    checked_at: PropTypes.string,
  }).isRequired,
};

export default DomainManagement;
