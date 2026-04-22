import { useState } from "react";
import {
  Button,
  Divider,
  TextField,
  Chip,
  Tooltip,
} from "@mui/material";
import {
  ClearRounded as ClearIcon,
  CheckCircleOutline as CheckIcon,
  CancelOutlined as RejectIcon,
  AutorenewOutlined as RetryIcon,
  DescriptionOutlined as DocIcon,
  VerifiedOutlined as VerifiedIcon,
} from "@mui/icons-material";

const Field = ({ label, value, verified }) => (
  <div className="flex justify-between items-center py-2">
    <span className="text-[13px] text-primary_grey_2">{label}</span>
    <span className="text-[13px] text-general font-medium flex items-center gap-1">
      {value}
      {verified && (
        <Tooltip title="Auto-verified by API">
          <VerifiedIcon sx={{ color: "#02981D", fontSize: 16 }} />
        </Tooltip>
      )}
    </span>
  </div>
);

const KYCDetail = ({ row, segment, close }) => {
  const [action, setAction] = useState(null); // 'reject' | 're-upload' | null
  const [reason, setReason] = useState("");

  const handleApprove = () => {
    close();
  };

  const handleConfirm = () => {
    if (!reason.trim()) return;
    setReason("");
    setAction(null);
    close();
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[18px] font-semibold text-general">{row.name}</p>
          <p className="text-[12px] text-primary_grey_2">
            {segment === "individual" ? "Individual KYC" : "Business KYC"} ·
            Submitted {row.submitted}
          </p>
        </div>
        <ClearIcon
          onClick={close}
          sx={{ color: "#1E1E1E", cursor: "pointer" }}
        />
      </div>

      {/* Identity panel */}
      <div className="border border-[#EFEFEF] rounded-xl p-4">
        <p className="text-[13px] font-semibold text-general uppercase tracking-wide mb-2">
          {segment === "individual" ? "Identity Details" : "Business Details"}
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
            <Field label="BVN" value={row.bvn} verified={row.auto?.bvn} />
            <Divider />
            <Field label="NIN" value={row.nin} verified={row.auto?.nin} />
          </>
        ) : (
          <>
            <Field label="Business Name" value={row.name} />
            <Divider />
            <Field label="Email" value={row.email} />
            <Divider />
            <Field label="Phone" value={row.phone} />
            <Divider />
            <Field label="RC Number" value={row.rcNumber} />
            <Divider />
            <Field label="TIN" value={row.tin} />
          </>
        )}
      </div>

      {/* Documents */}
      <div className="border border-[#EFEFEF] rounded-xl p-4">
        <p className="text-[13px] font-semibold text-general uppercase tracking-wide mb-3">
          Uploaded Documents
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {(segment === "individual" ? [row.utility] : row.docs).map((d, i) => (
            <div
              key={i}
              className="flex items-center gap-3 border border-[#EFEFEF] rounded-lg p-3 hover:border-[#02981D] cursor-pointer"
            >
              <div className="h-9 w-9 rounded-md bg-[#F6FFF8] text-[#02981D] flex items-center justify-center">
                <DocIcon fontSize="small" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] text-general truncate">{d}</p>
                <p className="text-[11px] text-primary_grey_2">PDF · 1.2 MB</p>
              </div>
              <Chip
                label="View"
                size="small"
                sx={{
                  background: "#fff",
                  border: "1px solid #E3E3E3",
                  color: "#02981D",
                  fontWeight: 600,
                }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Action area */}
      {action === "reject" || action === "re-upload" ? (
        <div className="border border-[#EFEFEF] rounded-xl p-4 flex flex-col gap-3">
          <p className="text-[13px] font-semibold text-general">
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
          <div className="flex justify-end gap-2">
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
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row gap-2 justify-end">
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
  );
};

export default KYCDetail;
