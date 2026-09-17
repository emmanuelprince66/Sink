// Shared bits for the KYC Management screens (list + detail).
// Status values / filter keys mirror the admin API exactly — don't lowercase them.

export const KYC_STATUS_META = {
  PENDING: { bg: "#FFF7E8", color: "#B26A00", label: "Pending Review" },
  APPROVED: { bg: "#E6F7EA", color: "#02981D", label: "Approved (Tier 3)" },
  REJECTED: { bg: "#FDECEC", color: "#DC3545", label: "Rejected" },
  REUPLOAD_REQUESTED: {
    bg: "#EEF2FF",
    color: "#3949AB",
    label: "Re-upload Requested",
  },
};

export const KYC_STATUS_FILTERS = [
  { key: "ALL", label: "All" },
  { key: "PENDING", label: "Pending" },
  { key: "APPROVED", label: "Approved" },
  { key: "REJECTED", label: "Rejected" },
  { key: "REUPLOAD_REQUESTED", label: "Re-upload Requested" },
];

export const KYC_TYPE_TABS = [
  { key: "ALL", label: "All" },
  { key: "INDIVIDUAL", label: "Individual" },
  { key: "CORPORATE", label: "Corporate" },
];

export const StatusPill = ({ status }) => {
  const s = KYC_STATUS_META[status] || {
    bg: "#F5F5F5",
    color: "#5E5E5E",
    label: status || "—",
  };
  return (
    <span
      className="text-[12px] font-medium px-3 py-1 rounded-full whitespace-nowrap"
      style={{ background: s.bg, color: s.color }}
    >
      {s.label}
    </span>
  );
};

// "individual" | "corporate" — only used to keep the /kyc/:segment/:id route
// readable; the detail endpoint is addressed by id alone.
export const segmentOf = (accountType) =>
  String(accountType).toUpperCase() === "CORPORATE"
    ? "corporate"
    : "individual";

export const formatSubmitted = (iso) => {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export const formatDateTime = (iso) => {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return `${formatSubmitted(iso)} · ${d.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  })}`;
};

// Pull something user-facing out of an axios error (FastAPI sends `detail`,
// either a string or a list of validation objects).
export const kycErrorMessage = (error, fallback) => {
  const status = error?.response?.status;
  const detail = error?.response?.data?.detail;

  if (status === 401)
    return "Session expired or you do not have permission as a Compliance Manager.";
  if (status === 404)
    return "This KYC record could not be found or has been removed.";

  if (typeof detail === "string" && detail) return detail;
  if (Array.isArray(detail) && detail[0]?.msg) return detail[0].msg;
  if (status === 422) return "Some of the submitted values were rejected.";

  return fallback || "Something went wrong. Please try again.";
};
