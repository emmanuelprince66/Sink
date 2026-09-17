import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ToastContainer, toast } from "react-toastify";
import {
  Button,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  Grid,
  TextField,
  Tooltip,
} from "@mui/material";
import {
  ArrowBackRounded as BackIcon,
  CheckCircleOutline as CheckIcon,
  CancelOutlined as RejectIcon,
  AutorenewOutlined as RetryIcon,
  VerifiedOutlined as VerifiedIcon,
  ZoomOutMapRounded as ZoomIcon,
  DownloadRounded as DownloadIcon,
  PictureAsPdfOutlined as PdfIcon,
  ImageOutlined as ImageIcon,
  InsertDriveFileOutlined as FileIcon,
} from "@mui/icons-material";
import useFetchData from "../../hooks/useFetchData";
import { AuthAxios } from "../../helpers/axiosInstance";
import {
  kycApproveUrl,
  kycDetailUrl,
  kycRejectUrl,
  kycRequestReuploadUrl,
} from "../../api/endpoint";
import {
  StatusPill,
  formatDateTime,
  formatSubmitted,
  kycErrorMessage,
} from "./kycShared";

const ACTION_COPY = {
  approve: {
    title: "Approval Note (optional)",
    placeholder: "e.g. All documents verified and compliant.",
    cta: "Confirm Approval",
    color: "#02981D",
    hover: "#017a17",
    requiresText: false,
  },
  reject: {
    title: "Reason for Rejection",
    placeholder: "Tell the merchant exactly why the submission failed...",
    cta: "Confirm Rejection",
    color: "#DC3545",
    hover: "#c12d3c",
    requiresText: true,
  },
  reupload: {
    title: "Re-upload Instructions",
    placeholder: "Tell the merchant which documents to replace and why...",
    cta: "Send Request",
    color: "#3949AB",
    hover: "#2f3e95",
    requiresText: true,
  },
};

const DEFAULT_APPROVAL_NOTE = "All documents verified and compliant.";

const Field = ({ label, value, verified }) => (
  <div className="flex justify-between items-center py-2 gap-3">
    <span className="text-[13px] text-primary_grey_2 flex-none">{label}</span>
    <span className="text-[13px] text-general font-medium flex items-center gap-1 text-right break-words">
      {value || "—"}
      {verified && (
        <Tooltip title="Verified by the provider API">
          <VerifiedIcon sx={{ color: "#02981D", fontSize: 16 }} />
        </Tooltip>
      )}
    </span>
  </div>
);

const SectionCard = ({ title, children }) => (
  <Card
    sx={{
      borderRadius: "14px",
      boxShadow: "0 1px 3px rgba(16,24,40,.06)",
      border: "1px solid #EFEFEF",
    }}
  >
    <CardContent sx={{ p: 3 }}>
      <p className="text-[12px] uppercase tracking-wide text-primary_grey_2 mb-2">
        {title}
      </p>
      <Divider />
      {children}
    </CardContent>
  </Card>
);

const docIcon = (type) => {
  if (type === "IMAGE") return <ImageIcon fontSize="small" />;
  if (type === "PDF") return <PdfIcon fontSize="small" />;
  return <FileIcon fontSize="small" />;
};

const KYCDetailPage = () => {
  const { segment, id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [activeDoc, setActiveDoc] = useState(0);
  const [action, setAction] = useState(null);
  const [note, setNote] = useState("");

  const apiUrl = kycDetailUrl(id);
  const {
    data: row,
    error,
    isLoading,
  } = useFetchData(["fetchKycDetail", apiUrl], apiUrl, { enabled: !!id });

  const isCorporate =
    String(row?.account_type || segment).toUpperCase() === "CORPORATE";

  // Director IDs / passports live outside `documents` — fold them into the
  // same viewer list so every file is previewable from one place.
  const documents = useMemo(() => {
    const base = (row?.documents || []).map((d) => ({
      name: d.name,
      type: String(d.type || "").toUpperCase(),
      size: d.size,
      url: d.url,
      extension: d.file_extension,
    }));

    const directorDocs = (row?.directors || []).flatMap((d) =>
      [
        { label: "Government ID", url: d.identification_url },
        { label: "Passport Photo", url: d.passport_url },
      ]
        .filter((f) => f.url)
        .map((f) => ({
          name: `${d.fullname} — ${f.label}`,
          type: String(f.url).toLowerCase().endsWith(".pdf") ? "PDF" : "IMAGE",
          size: null,
          url: f.url,
          extension: null,
        })),
    );

    return [...base, ...directorDocs];
  }, [row]);

  const doc = documents[activeDoc];

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["fetchKycList"] });
    queryClient.invalidateQueries({ queryKey: ["fetchKycDetail"] });
  };

  const closePanel = () => {
    setAction(null);
    setNote("");
  };

  const approve = useMutation({
    mutationFn: (approvalNote) =>
      AuthAxios.post(kycApproveUrl(id), {
        note: approvalNote || DEFAULT_APPROVAL_NOTE,
      }),
    onSuccess: () => {
      toast.success("KYC approved. Merchant upgraded to Tier 3.");
      closePanel();
      invalidate();
    },
    onError: (err) =>
      toast.error(kycErrorMessage(err, "Failed to approve this verification.")),
  });

  const reject = useMutation({
    mutationFn: (reason) => AuthAxios.post(kycRejectUrl(id), { reason }),
    onSuccess: () => {
      toast.error("KYC rejected. The merchant wallet has been deactivated.");
      closePanel();
      invalidate();
    },
    onError: (err) =>
      toast.error(kycErrorMessage(err, "Failed to reject this verification.")),
  });

  const requestReupload = useMutation({
    mutationFn: (reason) =>
      AuthAxios.post(kycRequestReuploadUrl(id), { reason }),
    onSuccess: () => {
      toast.info("Re-upload requested. The merchant has been notified.");
      closePanel();
      invalidate();
    },
    onError: (err) =>
      toast.error(kycErrorMessage(err, "Failed to request a re-upload.")),
  });

  const submitting =
    approve.isPending || reject.isPending || requestReupload.isPending;

  const handleConfirm = () => {
    const copy = ACTION_COPY[action];
    const text = note.trim();
    if (copy.requiresText && !text) {
      toast.error(
        action === "reject"
          ? "A rejection reason is required."
          : "Please say what the merchant needs to re-upload.",
      );
      return;
    }
    if (action === "approve") approve.mutate(text);
    if (action === "reject") reject.mutate(text);
    if (action === "reupload") requestReupload.mutate(text);
  };

  if (isLoading) {
    return (
      <div className="w-full flex items-center justify-center min-h-[60vh]">
        <CircularProgress sx={{ color: "#02981D" }} />
      </div>
    );
  }

  if (error || !row) {
    return (
      <div className="w-full flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <p className="text-[16px] font-semibold text-general">
          KYC submission unavailable
        </p>
        <p className="text-[13px] text-primary_grey_2">
          {kycErrorMessage(
            error,
            "This KYC record could not be found or has been removed.",
          )}
        </p>
        <Button
          onClick={() => navigate("/kyc")}
          variant="contained"
          startIcon={<BackIcon />}
          sx={{
            textTransform: "none",
            background: "#02981D",
            boxShadow: "none",
            "&:hover": { background: "#017a17" },
          }}
        >
          Back to KYC Management
        </Button>
      </div>
    );
  }

  const copy = action ? ACTION_COPY[action] : null;

  return (
    <div className="w-full flex flex-col gap-6">
      <ToastContainer position="top-right" autoClose={4000} />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
        <div className="flex items-start gap-3">
          <button
            onClick={() => navigate("/kyc")}
            className="h-10 w-10 rounded-full bg-white border border-[#E3E3E3] flex items-center justify-center hover:bg-[#F5F5F5]"
          >
            <BackIcon sx={{ color: "#5E5E5E", fontSize: 20 }} />
          </button>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-[20px] md:text-[22px] font-semibold text-general">
                {row.business_name || row.full_name || "—"}
              </h1>
              <StatusPill status={row.status} />
            </div>
            <p className="text-[13px] text-primary_grey_2 mt-1">
              {isCorporate ? "Corporate KYC" : "Individual KYC"} · {row.tier} ·
              Submitted {formatSubmitted(row.submitted_at)}
            </p>
            {row.approved_by && (
              <p className="text-[12px] text-primary_grey_2 mt-0.5">
                Approved by {row.approved_by} on{" "}
                {formatDateTime(row.approved_at)}
              </p>
            )}
          </div>
        </div>

        {!action && (
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => setAction("reupload")}
              startIcon={<RetryIcon />}
              sx={{
                textTransform: "none",
                color: "#3949AB",
                border: "1px solid #C7CEFF",
                background: "#EEF2FF",
                "&:hover": { background: "#E0E7FF" },
              }}
            >
              Request Re-upload
            </Button>
            <Button
              onClick={() => setAction("reject")}
              startIcon={<RejectIcon />}
              sx={{
                textTransform: "none",
                color: "#DC3545",
                border: "1px solid #F7C8CC",
                background: "#FDECEC",
                "&:hover": { background: "#FBDADC" },
              }}
            >
              Reject
            </Button>
            <Button
              onClick={() => setAction("approve")}
              startIcon={<CheckIcon />}
              variant="contained"
              sx={{
                textTransform: "none",
                background: "#02981D",
                boxShadow: "none",
                "&:hover": { background: "#017a17" },
              }}
            >
              Approve
            </Button>
          </div>
        )}
      </div>

      {/* Action confirmation panel */}
      {copy && (
        <Card
          sx={{
            borderRadius: "14px",
            boxShadow: "0 1px 3px rgba(16,24,40,.06)",
            border: "1px solid #EFEFEF",
          }}
        >
          <CardContent sx={{ p: { xs: 2, md: 3 } }}>
            <p className="text-[14px] font-semibold text-general mb-2">
              {copy.title}
            </p>
            {action === "reject" && (
              <p className="text-[12px] text-[#DC3545] mb-2">
                Rejecting deactivates the merchant wallet and emails them this
                reason.
              </p>
            )}
            {action === "reupload" && (
              <p className="text-[12px] text-[#3949AB] mb-2">
                The wallet stays active — the merchant can log in and replace
                the documents you name here.
              </p>
            )}
            {action === "approve" && (
              <p className="text-[12px] text-[#02981D] mb-2">
                Approving upgrades the merchant to Tier 3 and activates the
                wallet.
              </p>
            )}
            <TextField
              value={note}
              onChange={(e) => setNote(e.target.value)}
              multiline
              minRows={3}
              placeholder={copy.placeholder}
              fullWidth
            />
            <div className="flex justify-end gap-2 mt-3">
              <Button
                onClick={closePanel}
                disabled={submitting}
                sx={{
                  textTransform: "none",
                  color: "#5E5E5E",
                  "&:hover": { background: "#F5F5F5" },
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirm}
                variant="contained"
                disabled={submitting || (copy.requiresText && !note.trim())}
                startIcon={
                  submitting ? (
                    <CircularProgress size={16} sx={{ color: "#fff" }} />
                  ) : null
                }
                sx={{
                  textTransform: "none",
                  background: copy.color,
                  "&:hover": { background: copy.hover },
                  boxShadow: "none",
                }}
              >
                {copy.cta}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Body grid: preview + sidebar */}
      <Grid container spacing={3}>
        {/* Document preview area */}
        <Grid item xs={12} lg={8}>
          <Card
            sx={{
              borderRadius: "14px",
              boxShadow: "0 1px 3px rgba(16,24,40,.06)",
              border: "1px solid #EFEFEF",
            }}
          >
            <CardContent sx={{ p: { xs: 2, md: 3 } }}>
              <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                <div>
                  <p className="text-[12px] uppercase tracking-wide text-primary_grey_2">
                    Document Preview
                  </p>
                  <p className="text-[15px] font-semibold text-general mt-0.5">
                    {doc?.name || "No document"}
                  </p>
                  <p className="text-[12px] text-primary_grey_2">
                    {[doc?.extension?.toUpperCase() || doc?.type, doc?.size]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Tooltip title="Open full size">
                    <Button
                      disabled={!doc?.url}
                      onClick={() =>
                        window.open(doc.url, "_blank", "noopener,noreferrer")
                      }
                      sx={{
                        minWidth: 0,
                        textTransform: "none",
                        color: "#5E5E5E",
                        border: "1px solid #E3E3E3",
                        background: "#fff",
                        "&:hover": { background: "#F5F5F5" },
                      }}
                    >
                      <ZoomIcon fontSize="small" />
                    </Button>
                  </Tooltip>
                  <Tooltip title="Download">
                    <Button
                      component="a"
                      href={doc?.url || undefined}
                      download
                      target="_blank"
                      rel="noopener noreferrer"
                      disabled={!doc?.url}
                      sx={{
                        minWidth: 0,
                        textTransform: "none",
                        color: "#5E5E5E",
                        border: "1px solid #E3E3E3",
                        background: "#fff",
                        "&:hover": { background: "#F5F5F5" },
                      }}
                    >
                      <DownloadIcon fontSize="small" />
                    </Button>
                  </Tooltip>
                </div>
              </div>

              {/* Preview canvas */}
              <div className="w-full bg-[#F8F9FB] border border-[#EFEFEF] rounded-xl overflow-hidden flex items-center justify-center min-h-[320px] md:min-h-[480px]">
                {!doc?.url ? (
                  <p className="text-[13px] text-primary_grey_2 p-8 text-center">
                    {documents.length === 0
                      ? "No documents have been uploaded for this submission."
                      : "This document was not provided."}
                  </p>
                ) : doc.type === "IMAGE" ? (
                  <img
                    src={doc.url}
                    alt={doc.name}
                    className="max-h-[480px] w-full object-contain"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-3 p-8 text-center">
                    <div className="h-16 w-16 rounded-2xl bg-[#FDECEC] text-[#DC3545] flex items-center justify-center">
                      <PdfIcon sx={{ fontSize: 36 }} />
                    </div>
                    <p className="text-[14px] font-medium text-general">
                      {doc.name}
                    </p>
                    <p className="text-[12px] text-primary_grey_2">
                      Preview not available here — open or download to view
                    </p>
                    <Button
                      onClick={() =>
                        window.open(doc.url, "_blank", "noopener,noreferrer")
                      }
                      variant="contained"
                      sx={{
                        textTransform: "none",
                        background: "#02981D",
                        boxShadow: "none",
                        "&:hover": { background: "#017a17" },
                      }}
                    >
                      Open Document
                    </Button>
                  </div>
                )}
              </div>

              {/* Doc thumbnails */}
              {documents.length > 0 && (
                <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {documents.map((d, i) => {
                    const active = i === activeDoc;
                    return (
                      <button
                        key={`${d.name}-${i}`}
                        onClick={() => setActiveDoc(i)}
                        className={`relative text-left border rounded-xl overflow-hidden bg-white transition ${
                          active
                            ? "border-[#02981D] ring-2 ring-[#02981D]/20"
                            : "border-[#EFEFEF] hover:border-[#02981D]"
                        }`}
                      >
                        <div className="h-24 w-full bg-[#F8F9FB] flex items-center justify-center">
                          {d.type === "IMAGE" && d.url ? (
                            <img
                              src={d.url}
                              alt={d.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <span className="text-[#DC3545]">
                              {docIcon(d.type)}
                            </span>
                          )}
                        </div>
                        <div className="p-2">
                          <p className="text-[12px] font-medium text-general truncate">
                            {d.name}
                          </p>
                          <p className="text-[11px] text-primary_grey_2">
                            {d.url
                              ? [d.extension?.toUpperCase() || d.type, d.size]
                                  .filter(Boolean)
                                  .join(" · ")
                              : "Not Provided"}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Right sidebar: details */}
        <Grid item xs={12} lg={4}>
          <div className="flex flex-col gap-3">
            <SectionCard title="Merchant & Account Overview">
              <Field label="Full Name" value={row.full_name} />
              <Divider />
              <Field label="Email" value={row.email} />
              <Divider />
              <Field label="Phone" value={row.phone} />
              <Divider />
              {!isCorporate && (
                <>
                  <Field
                    label="Date of Birth"
                    value={formatSubmitted(row.date_of_birth)}
                  />
                  <Divider />
                  <Field label="Gender" value={row.gender} />
                  <Divider />
                </>
              )}
              <Field label="Role" value={row.role} />
              <Divider />
              <Field label="Address" value={row.address} />
              <Divider />
              <Field label="Account Number" value={row.account_number} />
              <Divider />
              <Field label="Account Name" value={row.account_name} />
              <Divider />
              <Field label="Bank" value={row.bank_name} />
              <Divider />
              <Field label="Account Type" value={row.account_type} />
              <Divider />
              <Field label="Tier" value={row.tier} />
              <Divider />
              <Field label="BVN" value={row.bvn} verified={row.bvn_verified} />
              <Divider />
              <Field label="NIN" value={row.nin} verified={row.nin_verified} />
              <Divider />
              <Field
                label="Consent"
                value={row.consent_given ? "Given" : "Not given"}
              />
              {row.consent_ref && (
                <>
                  <Divider />
                  <Field label="Consent Ref" value={row.consent_ref} />
                </>
              )}
            </SectionCard>

            {isCorporate && (
              <SectionCard title="Business & Tax Info">
                <Field label="Business Name" value={row.business_name} />
                <Divider />
                <Field label="Business Type" value={row.business_type} />
                <Divider />
                <Field label="Business Address" value={row.business_address} />
                <Divider />
                <Field label="TIN" value={row.tin} />
                <Divider />
                <Field
                  label="Verification Status"
                  value={row.verification_status}
                />
              </SectionCard>
            )}

            {isCorporate && (
              <SectionCard title={`Directors (${row.directors?.length || 0})`}>
                {!row.directors?.length ? (
                  <p className="text-[13px] text-primary_grey_2 py-3">
                    No directors were submitted.
                  </p>
                ) : (
                  <div className="flex flex-col gap-2 pt-3">
                    {row.directors.map((d) => (
                      <div
                        key={d.id}
                        className="border border-[#EFEFEF] rounded-lg p-3"
                      >
                        <p className="text-[13px] font-medium text-general">
                          {d.fullname || "—"}
                        </p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {[
                            { label: "Government ID", url: d.identification_url },
                            { label: "Passport Photo", url: d.passport_url },
                          ].map((f) => {
                            const index = documents.findIndex(
                              (x) => x.url && x.url === f.url,
                            );
                            return f.url && index > -1 ? (
                              <Button
                                key={f.label}
                                size="small"
                                onClick={() => setActiveDoc(index)}
                                sx={{
                                  textTransform: "none",
                                  fontSize: 12,
                                  color: "#02981D",
                                  border: "1px solid #BFE7C7",
                                  background: "#F6FFF8",
                                  "&:hover": { background: "#ECFBF0" },
                                }}
                              >
                                Preview {f.label}
                              </Button>
                            ) : (
                              <span
                                key={f.label}
                                className="text-[11px] px-2 py-1 rounded-md bg-[#F5F5F5] text-[#5E5E5E]"
                              >
                                {f.label}: Not Provided
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </SectionCard>
            )}

            <SectionCard title={`Documents (${documents.length})`}>
              {documents.length === 0 ? (
                <p className="text-[13px] text-primary_grey_2 py-3">
                  No documents uploaded.
                </p>
              ) : (
                <div className="flex flex-col gap-2 pt-3">
                  {documents.map((d, i) => (
                    <button
                      key={`${d.name}-list-${i}`}
                      onClick={() => setActiveDoc(i)}
                      className={`flex items-center gap-3 w-full text-left border rounded-lg p-2.5 transition ${
                        i === activeDoc
                          ? "border-[#02981D] bg-[#F6FFF8]"
                          : "border-[#EFEFEF] hover:border-[#02981D]"
                      }`}
                    >
                      <div
                        className={`h-9 w-9 rounded-md flex items-center justify-center flex-none ${
                          d.type === "IMAGE"
                            ? "bg-[#EEF2FF] text-[#3949AB]"
                            : "bg-[#FDECEC] text-[#DC3545]"
                        }`}
                      >
                        {docIcon(d.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] text-general truncate font-medium">
                          {d.name}
                        </p>
                        <p className="text-[11px] text-primary_grey_2">
                          {d.url
                            ? [d.extension?.toUpperCase() || d.type, d.size]
                                .filter(Boolean)
                                .join(" · ")
                            : "Not Provided"}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </SectionCard>
          </div>
        </Grid>
      </Grid>
    </div>
  );
};

export default KYCDetailPage;
