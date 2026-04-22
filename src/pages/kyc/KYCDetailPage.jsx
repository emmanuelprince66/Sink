import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Button,
  Card,
  CardContent,
  Chip,
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
  DescriptionOutlined as DocIcon,
  VerifiedOutlined as VerifiedIcon,
  ZoomOutMapRounded as ZoomIcon,
  DownloadRounded as DownloadIcon,
  PictureAsPdfOutlined as PdfIcon,
  ImageOutlined as ImageIcon,
} from "@mui/icons-material";
import { findKyc } from "./kycData";

const STATUS_STYLE = {
  pending: { bg: "#FFF7E8", color: "#B26A00", label: "Pending" },
  approved: { bg: "#E6F7EA", color: "#02981D", label: "Approved" },
  rejected: { bg: "#FDECEC", color: "#DC3545", label: "Rejected" },
  "re-upload": { bg: "#EEF2FF", color: "#3949AB", label: "Re-upload" },
};

const StatusPill = ({ status }) => {
  const s = STATUS_STYLE[status] || {
    bg: "#F5F5F5",
    color: "#5E5E5E",
    label: status,
  };
  return (
    <span
      className="text-[12px] font-medium px-3 py-1 rounded-full"
      style={{ background: s.bg, color: s.color }}
    >
      {s.label}
    </span>
  );
};

const Field = ({ label, value, verified }) => (
  <div className="flex justify-between items-center py-2 gap-3">
    <span className="text-[13px] text-primary_grey_2">{label}</span>
    <span className="text-[13px] text-general font-medium flex items-center gap-1 text-right">
      {value}
      {verified && (
        <Tooltip title="Auto-verified by API">
          <VerifiedIcon sx={{ color: "#02981D", fontSize: 16 }} />
        </Tooltip>
      )}
    </span>
  </div>
);

const KYCDetailPage = () => {
  const { segment, id } = useParams();
  const navigate = useNavigate();
  const row = useMemo(() => findKyc(segment, id), [segment, id]);

  const [activeDoc, setActiveDoc] = useState(0);
  const [action, setAction] = useState(null);
  const [reason, setReason] = useState("");

  if (!row) {
    return (
      <div className="w-full flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <p className="text-[16px] font-semibold text-general">
          KYC submission not found
        </p>
        <p className="text-[13px] text-primary_grey_2">
          The link may be outdated or the record was removed.
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

  const doc = row.documents[activeDoc];

  const handleApprove = () => {
    navigate("/kyc");
  };

  const handleConfirm = () => {
    if (!reason.trim()) return;
    setReason("");
    setAction(null);
    navigate("/kyc");
  };

  return (
    <div className="w-full flex flex-col gap-6">
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
                {row.name}
              </h1>
              <StatusPill status={row.status} />
            </div>
            <p className="text-[13px] text-primary_grey_2 mt-1">
              {segment === "individual" ? "Individual KYC" : "Business KYC"} ·
              ID {row.id} · Submitted {row.submitted}
            </p>
          </div>
        </div>

        {!action && (
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => setAction("re-upload")}
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
              onClick={handleApprove}
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
      {action && (
        <Card
          sx={{
            borderRadius: "14px",
            boxShadow: "0 1px 3px rgba(16,24,40,.06)",
            border: "1px solid #EFEFEF",
          }}
        >
          <CardContent sx={{ p: { xs: 2, md: 3 } }}>
            <p className="text-[14px] font-semibold text-general mb-2">
              {action === "reject"
                ? "Reason for Rejection"
                : "Reason for Re-upload Request"}
            </p>
            <TextField
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              multiline
              minRows={3}
              placeholder="Provide a clear, user-facing reason..."
              fullWidth
            />
            <div className="flex justify-end gap-2 mt-3">
              <Button
                onClick={() => {
                  setAction(null);
                  setReason("");
                }}
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
                disabled={!reason.trim()}
                sx={{
                  textTransform: "none",
                  background: action === "reject" ? "#DC3545" : "#3949AB",
                  "&:hover": {
                    background: action === "reject" ? "#c12d3c" : "#2f3e95",
                  },
                  boxShadow: "none",
                }}
              >
                {action === "reject" ? "Confirm Rejection" : "Send Request"}
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
                    {doc?.type?.toUpperCase()} · {doc?.size}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Tooltip title="Open full size">
                    <Button
                      onClick={() => doc && window.open(doc.url, "_blank")}
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
                {doc?.type === "image" ? (
                  <img
                    src={doc.url}
                    alt={doc.name}
                    className="max-h-[480px] w-full object-contain"
                  />
                ) : doc?.type === "pdf" ? (
                  <div className="flex flex-col items-center gap-3 p-8 text-center">
                    <div className="h-16 w-16 rounded-2xl bg-[#FDECEC] text-[#DC3545] flex items-center justify-center">
                      <PdfIcon sx={{ fontSize: 36 }} />
                    </div>
                    <p className="text-[14px] font-medium text-general">
                      {doc.name}
                    </p>
                    <p className="text-[12px] text-primary_grey_2">
                      PDF preview not available — open or download to view
                    </p>
                    <Button
                      onClick={() => window.open(doc.url, "_blank")}
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
                ) : (
                  <p className="text-[13px] text-primary_grey_2 p-8">
                    No documents have been uploaded for this submission.
                  </p>
                )}
              </div>

              {/* Doc thumbnails */}
              {row.documents.length > 0 && (
                <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {row.documents.map((d, i) => {
                    const active = i === activeDoc;
                    return (
                      <button
                        key={i}
                        onClick={() => setActiveDoc(i)}
                        className={`relative text-left border rounded-xl overflow-hidden bg-white transition ${
                          active
                            ? "border-[#02981D] ring-2 ring-[#02981D]/20"
                            : "border-[#EFEFEF] hover:border-[#02981D]"
                        }`}
                      >
                        <div className="h-24 w-full bg-[#F8F9FB] flex items-center justify-center">
                          {d.type === "image" ? (
                            <img
                              src={d.url}
                              alt={d.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <PdfIcon
                              sx={{ color: "#DC3545", fontSize: 32 }}
                            />
                          )}
                        </div>
                        <div className="p-2">
                          <p className="text-[12px] font-medium text-general truncate">
                            {d.name}
                          </p>
                          <p className="text-[11px] text-primary_grey_2">
                            {d.type.toUpperCase()} · {d.size}
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
            <Card
              sx={{
                borderRadius: "14px",
                boxShadow: "0 1px 3px rgba(16,24,40,.06)",
                border: "1px solid #EFEFEF",
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <p className="text-[12px] uppercase tracking-wide text-primary_grey_2 mb-2">
                  {segment === "individual"
                    ? "Identity Details"
                    : "Business Details"}
                </p>
                <Divider />
                {segment === "individual" ? (
                  <>
                    <Field label="Full Name" value={row.name} />
                    <Divider />
                    <Field label="Email" value={row.email} />
                    <Divider />
                    <Field label="Phone" value={row.phone} />
                    <Divider />
                    <Field label="Date of Birth" value={row.dob} />
                    <Divider />
                    <Field label="Gender" value={row.gender} />
                    <Divider />
                    <Field label="Address" value={row.address} />
                    <Divider />
                    <Field
                      label="BVN"
                      value={row.bvn}
                      verified={row.auto?.bvn}
                    />
                    <Divider />
                    <Field
                      label="NIN"
                      value={row.nin}
                      verified={row.auto?.nin}
                    />
                  </>
                ) : (
                  <>
                    <Field label="Business Name" value={row.name} />
                    <Divider />
                    <Field label="Email" value={row.email} />
                    <Divider />
                    <Field label="Phone" value={row.phone} />
                    <Divider />
                    <Field label="Industry" value={row.industry} />
                    <Divider />
                    <Field label="Address" value={row.address} />
                    <Divider />
                    <Field label="RC Number" value={row.rcNumber} />
                    <Divider />
                    <Field label="TIN" value={row.tin} />
                    <Divider />
                    <div className="py-2">
                      <p className="text-[13px] text-primary_grey_2 mb-1">
                        Directors
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {row.directors.map((d) => (
                          <Chip
                            key={d}
                            size="small"
                            label={d}
                            sx={{
                              background: "#F6FFF8",
                              color: "#02981D",
                              fontWeight: 500,
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            <Card
              sx={{
                borderRadius: "14px",
                boxShadow: "0 1px 3px rgba(16,24,40,.06)",
                border: "1px solid #EFEFEF",
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <p className="text-[12px] uppercase tracking-wide text-primary_grey_2 mb-3">
                  Documents ({row.documents.length})
                </p>
                <div className="flex flex-col gap-2">
                  {row.documents.map((d, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveDoc(i)}
                      className={`flex items-center gap-3 w-full text-left border rounded-lg p-2.5 transition ${
                        i === activeDoc
                          ? "border-[#02981D] bg-[#F6FFF8]"
                          : "border-[#EFEFEF] hover:border-[#02981D]"
                      }`}
                    >
                      <div
                        className={`h-9 w-9 rounded-md flex items-center justify-center flex-none ${
                          d.type === "image"
                            ? "bg-[#EEF2FF] text-[#3949AB]"
                            : "bg-[#FDECEC] text-[#DC3545]"
                        }`}
                      >
                        {d.type === "image" ? (
                          <ImageIcon fontSize="small" />
                        ) : (
                          <PdfIcon fontSize="small" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] text-general truncate font-medium">
                          {d.name}
                        </p>
                        <p className="text-[11px] text-primary_grey_2">
                          {d.type.toUpperCase()} · {d.size}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </Grid>
      </Grid>
    </div>
  );
};

export default KYCDetailPage;
